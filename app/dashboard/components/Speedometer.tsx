"use client";

import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

export default function Speedometer({
  value,
  max = 100,
}: {
  value: number;
  max?: number;
}) {
  const percentage = Math.min(value / max, 1);

  const data = {
    datasets: [
      {
        data: [percentage * 100, 100 - percentage * 100],
        backgroundColor: ["#3B82F6", "#E5E7EB"],
        borderWidth: 0,
        cutout: "80%",
      },
    ],
  };

  const options: any = {
    rotation: -90,
    circumference: 180,
    plugins: {
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm flex flex-col items-center">
      <h2 className="text-sm text-gray-500 mb-2">Performance</h2>

      <div className="w-full max-w-[220px] relative">
        <Doughnut data={data} options={options} />

        {/* Center Value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-700">
            {Math.round(percentage * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
