"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {
  value: number; // 0 → 250
};

export default function AngularGauge({ value }: Props) {
  const min = 0;
  const max = 250;

  const clamped = Math.max(min, Math.min(value, max));

  // Convert value → angle (-90 to 90)
  const targetAngle = useMemo(() => {
    return ((clamped - min) / (max - min)) * 180 - 90;
  }, [clamped]);

  // Animated needle angle
  const [animatedAngle, setAnimatedAngle] = useState(-90);

  useEffect(() => {
    let animationFrame: number;

    const startAngle = animatedAngle;
    const difference = targetAngle - startAngle;

    const duration = 1200;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const nextAngle = startAngle + difference * easeOut;

      setAnimatedAngle(nextAngle);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [targetAngle]);

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

      <svg
        width="300"
        height="180"
        viewBox="0 0 300 180"
        className="overflow-visible"
      >
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

          const label = polarToCartesian(centerX, centerY, 145, tickAngle);

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
                x={label.x}
                y={label.y}
                fontSize="10"
                textAnchor="middle"
                fill="#555"
                dominantBaseline="middle"
              >
                {Math.round(val)}
              </text>
            </g>
          );
        })}

        {/* NEEDLE */}
        <g transform={`rotate(${animatedAngle} ${centerX} ${centerY})`}>
          {/* Needle shadow */}
          <polygon
            points={`
              ${centerX - 4},${centerY}
              ${centerX + 4},${centerY}
              ${centerX},${centerY - 95}
            `}
            fill="rgba(0,0,0,0.15)"
          />

          {/* Needle */}
          <polygon
            points={`
              ${centerX - 3},${centerY}
              ${centerX + 3},${centerY}
              ${centerX},${centerY - 100}
            `}
            fill="#2563EB"
          />
        </g>

        {/* CENTER RINGS */}
        <circle
          cx={centerX}
          cy={centerY}
          r="10"
          fill="#fff"
          stroke="#2563EB"
          strokeWidth="4"
        />

        <circle cx={centerX} cy={centerY} r="4" fill="#111827" />

        {/* VALUE */}
        <text
          x={centerX}
          y={centerY - 20}
          textAnchor="middle"
          fontSize="22"
          fontWeight="bold"
          fill="#111827"
        >
          {clamped}
        </text>

        <text
          x={centerX}
          y={centerY + 30}
          textAnchor="middle"
          fontSize="12"
          fill="#6B7280"
        >
          Performance
        </text>
      </svg>
    </div>
  );
}
