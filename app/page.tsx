"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import RegisterForm from "@/components/RegisterForm";
import SuccessScreen from "@/components/SuccessScreen";
import AlreadyMarkedScreen from "@/components/AlreadyMarkedScreen";
import type { AppScreen, AttendResponse, StoredUser } from "@/types";

const QRDisplay = dynamic(() => import("@/components/QRDisplay"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center gap-3 py-12">
      <div className="w-6 h-6 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      <p className="font-mono text-xs text-gray-500">Loading...</p>
    </div>
  ),
});

const STORAGE_KEY = "town_sabha_user";

function AttendanceApp() {
  const [isAttendMode, setIsAttendMode] = useState<boolean | null>(null);
  const [screen, setScreen] = useState<AppScreen>("loading");
  const [attendResult, setAttendResult] = useState<AttendResponse | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("Checking attendance...");

  const autoMarkReturning = useCallback(async () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setScreen("register");
      return;
    }
    const user: StoredUser = JSON.parse(stored);
    setLoadingMsg(`Welcome back, ${user.name}!`);
    setScreen("loading");

    try {
      const res = await fetch("/api/attend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId }),
      });
      const data: AttendResponse = await res.json();
      setAttendResult(data);

      if (data.status === "duplicate") {
        setScreen("duplicate");
      } else if (data.status === "marked") {
        setScreen("success");
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setScreen("register");
      }
    } catch {
      setScreen("register");
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const attend = params.get("attend") === "1";
    setIsAttendMode(attend);
    if (attend) {
      autoMarkReturning();
    }
  }, [autoMarkReturning]);

  function handleRegistered(data: AttendResponse) {
    if (data.userId && data.name) {
      const user: StoredUser = { userId: data.userId, name: data.name };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
    setAttendResult(data);
    if (data.status === "duplicate") {
      setScreen("duplicate");
    } else {
      setScreen("success");
    }
  }

  function handleReset() {
    setAttendResult(null);
    setScreen("register");
  }

  const displayName = attendResult?.name ?? "";

  if (isAttendMode === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAttendMode) {
    return <QRDisplay />;
  }

  return (
    <>
      {screen === "loading" && (
        <div className="flex flex-col items-center gap-4 py-10">
          <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-sm text-gray-400">{loadingMsg}</p>
        </div>
      )}

      {screen === "register" && (
        <RegisterForm onSuccess={handleRegistered} />
      )}

      {screen === "success" && (
        <SuccessScreen name={displayName} onReset={handleReset} />
      )}

      {screen === "duplicate" && (
        <AlreadyMarkedScreen name={displayName} onReset={handleReset} />
      )}
    </>
  );
}

export default function Home() {
  return (
    <main className="hex-grid min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] flex flex-col gap-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-orbitron text-xl font-black text-white tracking-wider">
              TOWN SABHA
            </h1>
            <p className="font-mono text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest">
              Hariprabodham
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse" />
            <span className="font-mono text-[10px] text-green-400 uppercase tracking-wider">
              System Online
            </span>
          </div>
        </div>

        <div className="relative bg-[#0d1117] rounded-lg overflow-hidden border border-gray-800">
          <div className="h-1 w-full bg-gradient-to-r from-[#FF6B00] via-[#FF9500] to-[#FF6B00]" />
          <div className="p-6">
            <AttendanceApp />
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="font-mono text-[10px] text-gray-700 uppercase tracking-widest">
            Hariprabodham • South Bombay Sabha
          </p>
        </div>
      </div>
    </main>
  );
}
