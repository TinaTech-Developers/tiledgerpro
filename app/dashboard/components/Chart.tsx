"use client";

import React from "react";
import { Line, Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
);

export default function Chart({
  labels,
  data,
  type = "line",
}: {
  labels: string[];
  data: number[];
  type?: "line" | "bar";
}) {
  const dataset = {
    labels,
    datasets: [
      {
        data,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.4,
      },
    ],
  };

  const baseOptions = {
    responsive: true,
    animation: {
      duration: 1400,
      easing: "easeOutQuart" as const,
    },
    plugins: {
      legend: { display: false },
    },
  };

  if (type === "bar") {
    const barOptions = baseOptions as ChartOptions<"bar">;
    return <Bar data={dataset} options={barOptions} />;
  }

  const lineOptions = baseOptions as ChartOptions<"line">;
  return <Line data={dataset} options={lineOptions} />;
}
