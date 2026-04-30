"use client";

import React from "react";

type Props = {
  value: number; // 0 → 250
};

export default function AngularGauge({ value }: Props) {
  const min = 0;
  const max = 250;

  const clamped = Math.max(min, Math.min(value, max));

  // Convert value → angle (-90 to 90)
  const angle = ((clamped - min) / (max - min)) * 180 - 90;

  const centerX = 150;
  const centerY = 150;

  // Helper functions
  const polarToCartesian = (
    cx: number,
    cy: number,
    r: number,
    angleDeg: number,
  ) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const describeArc = (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
  ) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 0 ${end.x} ${end.y}`;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-[320px]">
      <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
        Analytics
      </h2>

      <svg width="300" height="180" viewBox="0 0 300 180">
        {/* OUTER ARC */}
        <path
          d={describeArc(centerX, centerY, 120, -90, 90)}
          stroke="#5B8BD9"
          strokeWidth="25"
          fill="none"
          strokeLinecap="round"
        />

        {/* INNER ARC */}
        <path
          d={describeArc(centerX, centerY, 90, -90, 90)}
          stroke="#E5E7EB"
          strokeWidth="25"
          fill="none"
          strokeLinecap="round"
        />

        {/* TICKS */}
        {[...Array(6)].map((_, i) => {
          const val = (i * max) / 5;
          const tickAngle = (val / max) * 180 - 90;

          const inner = polarToCartesian(centerX, centerY, 110, tickAngle);
          const outer = polarToCartesian(centerX, centerY, 125, tickAngle);

          return (
            <g key={i}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="#666"
                strokeWidth="2"
              />

              <text
                x={centerX + 140 * Math.cos((tickAngle * Math.PI) / 180)}
                y={centerY + 140 * Math.sin((tickAngle * Math.PI) / 180)}
                fontSize="10"
                textAnchor="middle"
                fill="#555"
              >
                {Math.round(val)}
              </text>
            </g>
          );
        })}

        {/* NEEDLE (ROTATING GROUP) */}
        <g
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: `${centerX}px ${centerY}px`,
            transition: "transform 0.6s ease-in-out",
          }}
        >
          {/* Needle shape */}
          <polygon
            points={`${centerX - 3},${centerY} ${centerX + 3},${centerY} ${centerX},${centerY - 100}`}
            fill="#3B82F6"
          />
        </g>

        {/* CENTER DOT */}
        <circle cx={centerX} cy={centerY} r="6" fill="#111" />

        {/* VALUE TEXT */}
        <text
          x={centerX}
          y={centerY - 15}
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
        >
          {((clamped / max) * 100).toFixed(1)}%
        </text>
      </svg>
    </div>
  );
}
