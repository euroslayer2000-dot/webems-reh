"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const STOCK_STATE_COLORS: Record<string, string> = {
  normal: "#22c55e",
  low_stock: "#3b82f6",
  near_expiry: "#f59e0b",
  expired: "#ef4444",
};

const STOCK_STATE_LABELS: Record<string, string> = {
  normal: "ปกติ",
  low_stock: "สต๊อกต่ำ",
  near_expiry: "ใกล้หมดอายุ",
  expired: "หมดอายุแล้ว",
};

export function MedicineStockStateDoughnutChart({ byState }: { byState: Record<string, number> }) {
  const entries = Object.entries(byState).filter(([, count]) => count > 0);

  return (
    <Doughnut
      data={{
        labels: entries.map(([state]) => STOCK_STATE_LABELS[state] ?? state),
        datasets: [
          {
            data: entries.map(([, count]) => count),
            backgroundColor: entries.map(([state]) => STOCK_STATE_COLORS[state] ?? "#d1d5db"),
            borderWidth: 0,
          },
        ],
      }}
      options={{ plugins: { legend: { position: "bottom" } }, maintainAspectRatio: false }}
    />
  );
}

export function MedicineCategoryBarChart({ data }: { data: { category_name: string; c: number }[] }) {
  return (
    <Bar
      data={{
        labels: data.map((d) => d.category_name),
        datasets: [{ data: data.map((d) => d.c), backgroundColor: "#3b82f6", borderRadius: 4 }],
      }}
      options={{
        indexAxis: "y",
        plugins: { legend: { display: false } },
        maintainAspectRatio: false,
        scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
      }}
    />
  );
}
