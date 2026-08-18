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

const STATUS_COLORS: Record<string, string> = {
  available: "#22c55e",
  borrowed: "#f59e0b",
  damaged: "#ef4444",
  maintenance: "#3b82f6",
  disposed: "#9ca3af",
};

const STATUS_LABELS: Record<string, string> = {
  available: "พร้อมใช้งาน",
  borrowed: "ถูกยืม",
  damaged: "ชำรุด",
  maintenance: "ซ่อมบำรุง",
  disposed: "จำหน่ายแล้ว",
};

export function StatusDoughnutChart({ byStatus }: { byStatus: Record<string, number> }) {
  const entries = Object.entries(byStatus).filter(([, count]) => count > 0);

  return (
    <Doughnut
      data={{
        labels: entries.map(([status]) => STATUS_LABELS[status] ?? status),
        datasets: [
          {
            data: entries.map(([, count]) => count),
            backgroundColor: entries.map(([status]) => STATUS_COLORS[status] ?? "#d1d5db"),
            borderWidth: 0,
          },
        ],
      }}
      options={{ plugins: { legend: { position: "bottom" } }, maintainAspectRatio: false }}
    />
  );
}

export function CategoryBarChart({ data }: { data: { category_name: string; c: number }[] }) {
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
