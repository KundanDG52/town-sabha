"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function QRDisplay() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    // Build the URL that phones will land on after scanning
    const base = window.location.origin + window.location.pathname;
    setUrl(`${base}?attend=1`);
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="text-center">
        <p className="font-mono text-xs text-[#FF6B00] uppercase tracking-widest mb-1">
          Scan to Mark Attendance
        </p>
        <p className="font-mono text-[11px] text-gray-500">{today}</p>
      </div>

      {/* QR Code */}
      <div className="relative p-4 bg-white rounded-xl">
        {url ? (
          <QRCodeSVG
            value={url}
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
          />
        ) : (
          <div className="w-[200px] h-[200px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Corner accents over the white box */}
        <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-[#FF6B00]" />
        <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-[#FF6B00]" />
        <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-[#FF6B00]" />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-[#FF6B00]" />
      </div>

      <div className="text-center space-y-1">
        <p className="font-orbitron text-xs text-white tracking-wide">
          TOWN SABHA
        </p>
        <p className="font-mono text-[10px] text-gray-600">
          Open your camera app and scan
        </p>
      </div>

      {/* Manual link for testing */}
      <a
        href="?attend=1"
        className="font-mono text-[10px] text-gray-700 underline underline-offset-2 hover:text-[#FF6B00] transition"
      >
        Register manually →
      </a>
    </div>
  );
}
