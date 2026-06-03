"use client";

import { useState } from "react";
import type { AttendResponse } from "@/types";

interface Props {
  onSuccess: (res: AttendResponse) => void;
}

export default function RegisterForm({ onSuccess }: Props) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/attend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), mobile }),
      });
      const data: AttendResponse = await res.json();
      if (data.status === "error") {
        setError(data.message ?? "Something went wrong. Please try again.");
      } else {
        onSuccess(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <div className="text-center mb-1">
        <h2 className="font-orbitron text-lg text-white tracking-wide">
          REGISTER
        </h2>
        <p className="font-mono text-xs text-gray-400 mt-1">
          First-time attendance registration
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-mono text-xs text-gray-400 uppercase tracking-widest">
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Raj Shah"
          disabled={loading}
          className="bg-[#0d1117] border border-gray-700 focus:border-[#FF6B00] outline-none rounded px-4 py-3 font-mono text-sm text-white placeholder-gray-600 transition disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-mono text-xs text-gray-400 uppercase tracking-widest">
          Mobile Number
        </label>
        <input
          type="tel"
          inputMode="numeric"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="10-digit mobile"
          disabled={loading}
          className="bg-[#0d1117] border border-gray-700 focus:border-[#FF6B00] outline-none rounded px-4 py-3 font-mono text-sm text-white placeholder-gray-600 transition disabled:opacity-50"
        />
      </div>

      {error && (
        <p className="font-mono text-xs text-red-400 text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="relative mt-1 py-3 rounded font-orbitron text-sm tracking-widest text-white bg-[#FF6B00] hover:bg-[#e06000] disabled:opacity-60 disabled:cursor-not-allowed transition shadow-[0_0_20px_#FF6B00aa]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            REGISTERING...
          </span>
        ) : (
          "MARK ATTENDANCE"
        )}
      </button>
    </form>
  );
}
