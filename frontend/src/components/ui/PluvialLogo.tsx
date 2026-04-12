import React from "react";

export default function PluvialLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left leaf / cupped hand */}
      <path
        d="M8 32 Q3 20 13 13 Q20 21 17 33 Q13 38 8 32Z"
        fill="#4ade80"
      />
      {/* Right leaf / cupped hand */}
      <path
        d="M40 32 Q45 20 35 13 Q28 21 31 33 Q35 38 40 32Z"
        fill="#4ade80"
      />

      {/* Water pool — outer ring */}
      <ellipse cx="24" cy="33" rx="16" ry="9" fill="#7dd3fc" opacity="0.45" />
      {/* Water pool — mid ring */}
      <ellipse cx="24" cy="33" rx="11" ry="6" fill="#38bdf8" opacity="0.65" />
      {/* Water pool — inner */}
      <ellipse cx="24" cy="33" rx="6" ry="3.5" fill="#0ea5e9" opacity="0.9" />

      {/* Water drop */}
      <path
        d="M24 7 C24 7 17 16 17 21 C17 25.4 20.1 28 24 28 C27.9 28 31 25.4 31 21 C31 16 24 7 24 7Z"
        fill="#38bdf8"
      />
      {/* Drop highlight */}
      <path
        d="M21 13 C20 15 19 17.5 19 20"
        stroke="#bae6fd"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
