// app/dashboard/components/Chart.tsx
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface ChartProps {
  labels: string[];
  data: number[];
  title?: string;
}

export default function Chart({ labels, data, title }: ChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title || "Dataset",
        data,
        borderColor: "#1e3a8a", // navy blue
        backgroundColor: "rgba(30,58,138,0.2)", // semi-transparent navy
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: !!title, text: title },
    },
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <Line data={chartData} options={options} />
    </div>
  );
}
