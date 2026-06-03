"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  name: string;
  onReset: () => void;
}

export default function SuccessScreen({ name, onReset }: Props) {
  const [countdown, setCountdown] = useState(5);
  const onResetRef = useRef(onReset);
  useEffect(() => { onResetRef.current = onReset; });

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          onResetRef.current();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {/* Animated checkmark */}
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
        <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <p className="font-mono text-xs text-green-400 uppercase tracking-widest mb-1">
          Attendance Marked
        </p>
        <h2 className="font-orbitron text-xl text-white">{name}</h2>
      </div>

      <div className="w-full bg-[#0d1117] border border-gray-800 rounded p-4 font-mono text-xs text-gray-400 flex flex-col gap-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Date</span>
          <span className="text-white">{dateStr}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Time</span>
          <span className="text-white">{timeStr}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Event</span>
          <span className="text-[#FF6B00]">Town Sabha</span>
        </div>
      </div>

      <p className="font-mono text-xs text-gray-600">
        Resetting in {countdown}s...
      </p>
    </div>
  );
}
