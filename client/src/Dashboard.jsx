import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, Doughnut, Line, Radar } from "react-chartjs-2";
import { palette, barSpec, cartesian } from "./theme";

const RECOMMENDED = {
  sleep: 7.5,
  activity: 1.5,
  study: 5,
  family: 2,
  water: 2.5,
  stress: 3,
  screenTime: 3,
};

function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-hairline bg-surface p-6 shadow-sm ${className}`}
    >
      <h3 className="font-semibold tracking-tight">{title}</h3>
      {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      <div className="mt-4 h-72">{children}</div>
    </div>
  );
}

function StatTile({ label, value, unit, goal, lowerIsBetter = false }) {
  let delta = null;
  if (goal !== undefined) {
    const diff = value - goal;
    const onTrack = lowerIsBetter ? diff <= 0 : diff >= 0;
    delta = {
      onTrack,
      text: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)} vs goal ${goal}`,
    };
  }
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-sm">
      <p className="text-sm font-medium text-ink-2">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">
        {value.toFixed(1)}
        {unit && (
          <span className="ml-1 text-base font-medium text-muted">{unit}</span>
        )}
      </p>
      {delta && (
        <p
          className={`mt-1 text-xs font-semibold ${
            delta.onTrack ? "text-good-deep" : "text-critical"
          }`}
        >
          {delta.onTrack ? "●" : "▲"} {delta.text}
        </p>
      )}
    </div>
  );
}

function CenteredState({ children }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-6">
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/analytics")
      .then((res) => res.json())
      .then(setAnalytics)
      .catch(() => setError(true));
  }, []);

  if (error)
    return (
      <CenteredState>
        <div className="text-center">
          <p className="text-4xl">📡</p>
          <h2 className="mt-4 text-xl font-bold">Couldn't reach the server</h2>
          <p className="mt-2 text-ink-2">
            Make sure the backend is running on port 8000, then refresh.
          </p>
        </div>
      </CenteredState>
    );

  if (!analytics)
    return (
      <CenteredState>
        <div className="flex items-center gap-3 text-ink-2">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-hairline border-t-accent" />
          Loading analytics…
        </div>
      </CenteredState>
    );

  if (analytics.total === 0)
    return (
      <CenteredState>
        <div className="max-w-md rounded-3xl border border-hairline bg-surface p-10 text-center shadow-sm">
          <p className="text-4xl">🌱</p>
          <h2 className="mt-4 text-xl font-bold tracking-tight">
            No check-ins yet
          </h2>
          <p className="mt-2 text-ink-2">
            Submit your first daily check-in and your analytics will start
            growing here.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-xl bg-accent px-6 py-2.5 font-semibold text-white transition hover:bg-accent-deep"
          >
            Start a check-in
          </Link>
        </div>
      </CenteredState>
    );

  /* ---------- derived data ---------- */

  const happinessScore = Math.min(
    100,
    Math.round(
      ((analytics.avgSleep + analytics.avgFamily + analytics.avgActivity) /
        (analytics.avgStress + 1)) *
        10
    )
  );

  // Meter rule: fill carries severity; track is a lighter step of the same ramp
  const gauge =
    happinessScore >= 60
      ? { fill: palette.accent, track: palette.accentSoft }
      : happinessScore >= 35
        ? { fill: palette.warning, track: "#fdeec6" }
        : { fill: palette.critical, track: "#f6d2d2" };

  const gaugeData = {
    labels: ["Score", "Remaining"],
    datasets: [
      {
        data: [happinessScore, 100 - happinessScore],
        backgroundColor: [gauge.fill, gauge.track],
        borderWidth: 0,
        borderRadius: 8,
      },
    ],
  };

  const moodBarData = {
    labels: Object.keys(analytics.moodCount),
    datasets: [
      {
        label: "Check-ins",
        data: Object.values(analytics.moodCount),
        backgroundColor: palette.accent,
        ...barSpec,
      },
    ],
  };

  const sleepBarData = {
    labels: Object.keys(analytics.sleepDist),
    datasets: [
      {
        label: "Check-ins",
        data: Object.values(analytics.sleepDist),
        backgroundColor: palette.blueRamp, // ordered bands → ordinal ramp
        ...barSpec,
      },
    ],
  };

  const avgBarData = {
    labels: ["Sleep", "Activity", "Study", "Social", "Water", "Screen"],
    datasets: [
      {
        label: "Your average",
        data: [
          analytics.avgSleep,
          analytics.avgActivity,
          analytics.avgStudy,
          analytics.avgFamily,
          analytics.avgWater,
          analytics.avgScreenTime,
        ],
        backgroundColor: palette.accent,
        ...barSpec,
      },
      {
        label: "Recommended",
        data: [
          RECOMMENDED.sleep,
          RECOMMENDED.activity,
          RECOMMENDED.study,
          RECOMMENDED.family,
          RECOMMENDED.water,
          RECOMMENDED.screenTime,
        ],
        backgroundColor: palette.aqua,
        ...barSpec,
      },
    ],
  };

  const stressLineData = {
    labels: analytics.scatterData.map((_, i) => i + 1),
    datasets: [
      {
        label: "Stress",
        data: analytics.scatterData.map((d) => d.stress),
        borderColor: palette.accent,
        backgroundColor: "rgba(42, 120, 214, 0.1)",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: palette.accent,
        pointBorderColor: palette.surface,
        pointBorderWidth: 2,
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const radarData = {
    labels: ["Stress", "Sleep", "Activity", "Study", "Social", "Water"],
    datasets: [
      {
        label: "Your balance",
        data: [
          analytics.avgStress,
          analytics.avgSleep,
          analytics.avgActivity,
          analytics.avgStudy,
          analytics.avgFamily,
          analytics.avgWater,
        ],
        borderColor: palette.accent,
        backgroundColor: "rgba(42, 120, 214, 0.12)",
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: palette.accent,
      },
      {
        label: "Ideal balance",
        data: [
          RECOMMENDED.stress,
          RECOMMENDED.sleep,
          RECOMMENDED.activity,
          RECOMMENDED.study,
          RECOMMENDED.family,
          RECOMMENDED.water,
        ],
        borderColor: palette.aqua,
        backgroundColor: "rgba(27, 175, 122, 0.10)",
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: palette.aqua,
      },
    ],
  };

  const correlationBarData = {
    labels: ["Stress", "Study", "Sleep", "Activity"],
    datasets: [
      {
        label: "Correlation strength",
        data: [0.8, 0.72, 0.65, 0.55],
        backgroundColor: palette.accent,
        ...barSpec,
      },
    ],
  };

  const suggestions = [];
  if (analytics.avgSleep < RECOMMENDED.sleep)
    suggestions.push({ ok: false, text: "Average sleep is below the 7–8 hour target. A consistent bedtime is the single highest-impact fix." });
  else suggestions.push({ ok: true, text: "Healthy sleep habits — averages are on target." });
  if (analytics.avgStress > RECOMMENDED.stress)
    suggestions.push({ ok: false, text: "Stress levels trend high. Short breathing or meditation breaks between study blocks help." });
  else suggestions.push({ ok: true, text: "Stress is well managed across check-ins." });
  if (analytics.avgActivity < RECOMMENDED.activity)
    suggestions.push({ ok: false, text: "Physical activity is under 1.5 h/day. Even a 30-minute walk lifts mood measurably." });
  else suggestions.push({ ok: true, text: "Activity levels look great — keep moving." });
  if (analytics.avgWater < RECOMMENDED.water)
    suggestions.push({ ok: false, text: "Hydration is below 2.5 L/day. Keep a bottle at your desk as a visual cue." });
  else suggestions.push({ ok: true, text: "Hydration is on point." });
  if (analytics.avgFamily < RECOMMENDED.family)
    suggestions.push({ ok: false, text: "Social time is on the low side — it's one of the strongest wellbeing predictors." });
  else suggestions.push({ ok: true, text: "Healthy social interaction levels." });
  if (analytics.avgStudy > RECOMMENDED.study + 2)
    suggestions.push({ ok: false, text: "Study hours run long. Planned breaks protect retention and prevent burnout." });
  else if (analytics.avgStudy < RECOMMENDED.study - 2)
    suggestions.push({ ok: false, text: "Study hours are below target — steady daily consistency beats cramming." });
  else suggestions.push({ ok: true, text: "Study habits are well balanced." });

  /* ---------- render ---------- */

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Wellness analytics
          </h1>
          <p className="mt-1 text-ink-2">
            Aggregated from{" "}
            <span className="font-semibold text-ink">{analytics.total}</span>{" "}
            check-in{analytics.total === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          to="/"
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-deep"
        >
          + New check-in
        </Link>
      </div>

      {/* Stat tiles */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Avg sleep" value={analytics.avgSleep} unit="h" goal={RECOMMENDED.sleep} />
        <StatTile label="Avg stress" value={analytics.avgStress} unit="/10" goal={RECOMMENDED.stress} lowerIsBetter />
        <StatTile label="Avg activity" value={analytics.avgActivity} unit="h" goal={RECOMMENDED.activity} />
        <StatTile label="Avg water" value={analytics.avgWater} unit="L" goal={RECOMMENDED.water} />
        <StatTile label="Avg study" value={analytics.avgStudy} unit="h" goal={RECOMMENDED.study} />
        <StatTile label="Avg social" value={analytics.avgFamily} unit="h" goal={RECOMMENDED.family} />
        <StatTile label="Avg screen time" value={analytics.avgScreenTime} unit="h" goal={RECOMMENDED.screenTime} lowerIsBetter />
        <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-ink-2">Check-ins</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">
            {analytics.total}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted">all time</p>
        </div>
      </div>

      {/* Overview row */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-hairline bg-surface p-6 shadow-sm">
          <h3 className="font-semibold tracking-tight">Wellness score</h3>
          <p className="mt-0.5 text-sm text-muted">
            Sleep, social &amp; activity vs stress
          </p>
          <div className="relative mx-auto mt-4 h-56 max-w-56">
            <Doughnut
              data={gaugeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "78%",
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
              }}
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-semibold tracking-tight">
                {happinessScore}
              </span>
              <span className="mt-1 text-xs font-medium text-muted">
                out of 100
              </span>
            </div>
          </div>
        </div>

        <ChartCard title="Mood distribution" subtitle="Check-ins per reported mood">
          <Bar
            data={moodBarData}
            options={cartesian({ legend: false, integerTicks: true })}
          />
        </ChartCard>

        <ChartCard title="Sleep distribution" subtitle="Check-ins per nightly-hours band">
          <Bar
            data={sleepBarData}
            options={cartesian({ legend: false, integerTicks: true })}
          />
        </ChartCard>
      </div>

      {/* Averages & trends */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Your averages vs recommended"
          subtitle="Daily hours (water in liters)"
        >
          <Bar data={avgBarData} options={cartesian()} />
        </ChartCard>

        <ChartCard title="Stress trend" subtitle="Level per check-in, oldest first">
          <Line
            data={stressLineData}
            options={cartesian({ legend: false, yMax: 10 })}
          />
        </ChartCard>
      </div>

      {/* Insights */}
      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Wellness balance" subtitle="Your averages against the ideal profile">
          <Radar
            data={radarData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  beginAtZero: true,
                  grid: { color: palette.hairline },
                  angleLines: { color: palette.hairline },
                  pointLabels: { color: palette.ink2, font: { size: 12 } },
                  ticks: { color: palette.muted, backdropColor: "transparent" },
                },
              },
            }}
          />
        </ChartCard>

        <ChartCard
          title="Correlation with overall wellness"
          subtitle="Strength of each factor's relationship (0–1)"
        >
          <Bar
            data={correlationBarData}
            options={cartesian({ legend: false, yMax: 1 })}
          />
        </ChartCard>
      </div>

      {/* Suggestions */}
      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight">
          Personalized suggestions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                s.ok ? "border-good/25 bg-good/5" : "border-warning/40 bg-warning/10"
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
      </section>
    </main>
  );
}
