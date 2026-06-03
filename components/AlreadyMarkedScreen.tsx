"use client";

import { useEffect, useState } from "react";

interface Props {
  name: string;
  onReset: () => void;
}

export default function AlreadyMarkedScreen({ name, onReset }: Props) {
  const [countdown, setCountdown] = useState(4);

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          onReset();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onReset]);

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {/* Info icon */}
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse" />
        <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z"
            />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <p className="font-mono text-xs text-blue-400 uppercase tracking-widest mb-1">
          Already Registered
        </p>
        <h2 className="font-orbitron text-xl text-white">{name}</h2>
      </div>

      <div className="w-full bg-[#0d1117] border border-gray-800 rounded p-4 font-mono text-xs text-gray-400">
        <p className="text-center leading-relaxed">
          Your attendance for{" "}
          <span className="text-white">{dateStr}</span>
          <br />
          has already been recorded.
          <br />
          <span className="text-blue-400 mt-2 block">
            Jai Swaminarayan! 🙏
          </span>
        </p>
      </div>

      <p className="font-mono text-xs text-gray-600">
        Resetting in {countdown}s...
      </p>
    </div>
  );
}
