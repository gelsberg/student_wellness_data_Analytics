import { useState } from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import Dashboard from "./Dashboard";

const RECOMMENDED = {
  sleep: 7.5,
  activity: 1.5,
  study: 5,
  family: 2,
  water: 2.5,
  stress: 3,
  screenTime: 3,
};

const FIELDS = [
  { name: "stress", label: "Stress level", hint: "1 = calm, 10 = overwhelmed", icon: "😰", min: 1, max: 10, step: 1, placeholder: "1–10" },
  { name: "sleep", label: "Sleep", hint: "Hours last night", icon: "😴", min: 0, max: 24, step: 0.5, placeholder: "e.g. 7.5" },
  { name: "activity", label: "Physical activity", hint: "Hours of exercise or movement", icon: "🏃", min: 0, max: 24, step: 0.5, placeholder: "e.g. 1" },
  { name: "water", label: "Water intake", hint: "Liters today", icon: "💧", min: 0, max: 10, step: 0.1, placeholder: "e.g. 2.5" },
  { name: "studyHours", label: "Study time", hint: "Hours of focused study", icon: "📚", min: 0, max: 24, step: 0.5, placeholder: "e.g. 5" },
  { name: "familyInteraction", label: "Social time", hint: "Hours with friends or family", icon: "🫂", min: 0, max: 24, step: 0.5, placeholder: "e.g. 2" },
  { name: "screenTime", label: "Screen time", hint: "Non-study hours on screens", icon: "💻", min: 0, max: 24, step: 0.5, placeholder: "e.g. 3" },
];

const MOODS = [
  { value: "Happy", icon: "😊" },
  { value: "Neutral", icon: "😐" },
  { value: "Stressed", icon: "😣" },
  { value: "Sad", icon: "😔" },
];

const EMPTY_FORM = {
  stress: "",
  sleep: "",
  mood: "",
  activity: "",
  water: "",
  studyHours: "",
  familyInteraction: "",
  screenTime: "",
};

function Nav() {
  const linkClass = ({ isActive }) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
      isActive ? "bg-accent text-white" : "text-ink-2 hover:bg-ink/5"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-base text-white">
            🌿
          </span>
          Student Wellness
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Check-in
          </NavLink>
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function getSuggestions(data) {
  const s = [];

  if (data.stress > RECOMMENDED.stress)
    s.push({ ok: false, text: "High stress can lead to burnout, poor sleep, and reduced focus. Try meditation or short relaxation breaks." });
  else s.push({ ok: true, text: "Stress level looks healthy — keep your balance." });

  if (data.sleep < RECOMMENDED.sleep)
    s.push({ ok: false, text: "Insufficient sleep reduces alertness and concentration. Aim for 7–8 hours per night." });
  else s.push({ ok: true, text: "Sleep is on track — keep your routine consistent." });

  if (data.activity < RECOMMENDED.activity)
    s.push({ ok: false, text: "Low physical activity can drain energy levels. Fit in a walk or workout daily." });
  else s.push({ ok: true, text: "Great job staying physically active." });

  if (data.water < RECOMMENDED.water)
    s.push({ ok: false, text: "Hydration is a bit low. Aim for at least 2.5 liters of water daily." });
  else s.push({ ok: true, text: "Hydration is excellent — keep it up." });

  if (data.studyHours < RECOMMENDED.study - 2)
    s.push({ ok: false, text: "Study hours are on the low side. Consistent daily hours beat cramming." });
  else if (data.studyHours > RECOMMENDED.study + 3)
    s.push({ ok: false, text: "Long study stretches without breaks cause burnout. Schedule regular pauses." });
  else s.push({ ok: true, text: "Study hours are well balanced." });

  if (data.familyInteraction < RECOMMENDED.family)
    s.push({ ok: false, text: "Low social time can affect mental health. Make room for friends and family." });
  else s.push({ ok: true, text: "Social interactions look healthy." });

  if (data.screenTime > RECOMMENDED.screenTime)
    s.push({ ok: false, text: "Heavy screen time can harm sleep and eyes. Try the 20-20-20 rule." });
  else s.push({ ok: true, text: "Screen time is at a healthy level." });

  return s;
}

function SurveyPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [response, setResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.mood) {
      setError("Pick the mood that best matches your day.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = { ...form };
      for (const f of FIELDS) payload[f.name] = Number(payload[f.name]);
      const res = await fetch("http://localhost:8000/api/wellness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setResponse(data);
      setForm(EMPTY_FORM);
    } catch {
      setError("Couldn't save your check-in. Is the server running?");
    } finally {
      setSubmitting(false);
    }
  };

  const summary = response && [
    { icon: "😰", label: "Stress", value: `${response.data.stress}/10` },
    { icon: "😴", label: "Sleep", value: `${response.data.sleep} h` },
    { icon: "😊", label: "Mood", value: response.data.mood },
    { icon: "🏃", label: "Activity", value: `${response.data.activity} h` },
    { icon: "💧", label: "Water", value: `${response.data.water} L` },
    { icon: "📚", label: "Study", value: `${response.data.studyHours} h` },
    { icon: "🫂", label: "Social", value: `${response.data.familyInteraction} h` },
    { icon: "💻", label: "Screen", value: `${response.data.screenTime} h` },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_24rem_at_50%_-8rem,var(--color-accent-soft),transparent)] opacity-60"
        />
        <div className="relative mx-auto max-w-3xl px-6 pt-16 pb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 py-1 text-xs font-medium text-ink-2">
            <span className="h-1.5 w-1.5 rounded-full bg-good" />
            Daily check-in
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance md:text-5xl">
            How are you doing today?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-2">
            Log your day in under a minute and get personalized wellness
            recommendations — then watch the trends build on your dashboard.
          </p>
        </div>
      </section>

      {/* Survey form */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-hairline bg-surface p-6 shadow-sm sm:p-10"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.name}>
                <label
                  htmlFor={f.name}
                  className="mb-1.5 flex items-baseline justify-between text-sm font-medium"
                >
                  <span>
                    <span className="mr-1.5">{f.icon}</span>
                    {f.label}
                  </span>
                </label>
                <input
                  id={f.name}
                  type="number"
                  name={f.name}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-ink transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
                />
                <p className="mt-1 text-xs text-muted">{f.hint}</p>
              </div>
            ))}

            {/* Mood segmented control */}
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium">
                <span className="mr-1.5">🎭</span>Mood
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setForm({ ...form, mood: m.value })}
                    aria-pressed={form.mood === m.value}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                      form.mood === m.value
                        ? "border-accent bg-accent/10 text-accent-deep"
                        : "border-hairline bg-white text-ink-2 hover:border-baseline"
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    {m.value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-5 rounded-xl border border-critical/30 bg-critical/5 px-4 py-3 text-sm font-medium text-critical">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-7 w-full rounded-xl bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-deep disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Submit check-in"}
          </button>
        </form>

        {/* Results */}
        {response && (
          <div className="mt-8 rounded-3xl border border-hairline bg-surface p-6 shadow-sm sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold tracking-tight">
                Today's snapshot
              </h2>
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-accent hover:text-accent-deep"
              >
                View dashboard →
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {summary.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-hairline bg-white px-4 py-3"
                >
                  <p className="text-xs font-medium text-muted">
                    {item.icon} {item.label}
                  </p>
                  <p className="mt-0.5 text-lg font-semibold">{item.value}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-8 mb-4 text-sm font-semibold tracking-wide text-muted uppercase">
              Recommendations
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {getSuggestions(response.data).map((s, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-xl border p-4 ${
                    s.ok
                      ? "border-good/25 bg-good/5"
                      : "border-warning/40 bg-warning/10"
                  }`}
                >
                  <span
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ${
                      s.ok ? "bg-good" : "bg-serious"
                    }`}
                  >
                    {s.ok ? "✓" : "!"}
                  </span>
                  <p className="text-sm leading-relaxed text-ink-2">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Routes>
        <Route path="/" element={<SurveyPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <footer className="border-t border-hairline py-8 text-center text-sm text-muted">
        Student Wellness Analytics · Track daily, improve steadily
      </footer>
    </div>
  );
}
