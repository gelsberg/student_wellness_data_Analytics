const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/wellnessDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Updated Schema for student wellness
const wellnessSchema = new mongoose.Schema({
  stress: Number,             // 1-10
  sleep: Number,              // hours
  mood: String,               // happy, sad, neutral, stressed
  activity: Number,           // hours of physical activity
  water: Number,              // liters of water intake
  studyHours: Number,         // hours studied
  familyInteraction: Number,  // hours with friends/family
  screenTime: Number,         // ✅ hours of screen time
  date: { type: Date, default: Date.now },
});

const Wellness = mongoose.model("Wellness", wellnessSchema);

// ✅ POST route to save survey data
app.post("/api/wellness", async (req, res) => {
  try {
    const entry = new Wellness(req.body);
    await entry.save();
    res.json({ message: "Data saved successfully", data: entry });
  } catch (err) {
    res.status(500).json({ message: "Error saving data", error: err.message });
  }
});

// ✅ GET route to fetch analytics
app.get("/api/analytics", async (req, res) => {
  try {
    const allData = await Wellness.find();

    const total = allData.length;

    const avg = (field) =>
      allData.reduce((acc, cur) => acc + (cur[field] || 0), 0) / total || 0;

    // Stress distribution (0-2,3-4,5-6,7-8,9-10)
    const stressDist = {};
    allData.forEach((d) => {
      const range = `${Math.floor(d.stress / 2) * 2}-${Math.floor(d.stress / 2) * 2 + 1}`;
      stressDist[range] = (stressDist[range] || 0) + 1;
    });

    // Sleep distribution (0-4,5-6,7-8,9+)
    const sleepDist = { "0-4": 0, "5-6": 0, "7-8": 0, "9+": 0 };
    allData.forEach((d) => {
      if (d.sleep <= 4) sleepDist["0-4"]++;
      else if (d.sleep <= 6) sleepDist["5-6"]++;
      else if (d.sleep <= 8) sleepDist["7-8"]++;
      else sleepDist["9+"]++;
    });

    // Mood distribution
    const moodCount = {};
    allData.forEach((d) => {
      moodCount[d.mood] = (moodCount[d.mood] || 0) + 1;
    });

    // Scatter data for correlations
    const scatterData = allData.map((d) => ({
      stress: d.stress,
      sleep: d.sleep,
      activity: d.activity,
      study: d.studyHours,
      family: d.familyInteraction,
      screenTime: d.screenTime, // ✅ Added screen time to scatter
    }));

    res.json({
      total,
      avgStress: avg("stress"),
      avgSleep: avg("sleep"),
      avgActivity: avg("activity"),
      avgStudy: avg("studyHours"),
      avgFamily: avg("familyInteraction"),
      avgWater: avg("water"),
      avgScreenTime: avg("screenTime"), // ✅ Return average screen time
      stressDist,
      sleepDist,
      moodCount,
      scatterData,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching analytics", error: err.message });
  }
});

// Start the server
const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
