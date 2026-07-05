import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

export const palette = {
  series: ["#2a78d6", "#1baf7a", "#eda100", "#008300", "#4a3aa7", "#e34948"],
  blueRamp: ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab"], // ordinal, light→dark
  accent: "#2a78d6",
  accentSoft: "#cde2fb",
  aqua: "#1baf7a",
  surface: "#fcfcfb",
  ink: "#0b0b0b",
  ink2: "#52514e",
  muted: "#898781",
  hairline: "#e1e0d9",
  baseline: "#c3c2b7",
  good: "#0ca30c",
  warning: "#fab219",
  critical: "#d03b3b",
};

ChartJS.defaults.font.family =
  'system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif';
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = palette.muted;

ChartJS.defaults.plugins.legend.position = "bottom";
ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
ChartJS.defaults.plugins.legend.labels.boxWidth = 8;
ChartJS.defaults.plugins.legend.labels.boxHeight = 8;
ChartJS.defaults.plugins.legend.labels.color = palette.ink2;
ChartJS.defaults.plugins.legend.labels.padding = 16;

ChartJS.defaults.plugins.tooltip.backgroundColor = palette.ink;
ChartJS.defaults.plugins.tooltip.titleColor = "#ffffff";
ChartJS.defaults.plugins.tooltip.bodyColor = "#e5e5e0";
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.boxPadding = 4;

// Bars: thin, rounded at the data end, square at the baseline
export const barSpec = {
  maxBarThickness: 24,
  borderRadius: 4,
  borderSkipped: "start",
};

// Shared cartesian options: hairline grid, recessive axes
export const cartesian = ({ legend = true, yMax, integerTicks = false } = {}) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: legend } },
  scales: {
    x: {
      grid: { display: false },
      border: { color: palette.baseline },
      ticks: { color: palette.muted },
    },
    y: {
      beginAtZero: true,
      ...(yMax !== undefined ? { max: yMax } : {}),
      grid: { color: palette.hairline },
      border: { display: false },
      ticks: {
        color: palette.muted,
        ...(integerTicks ? { precision: 0 } : {}),
      },
    },
  },
});
