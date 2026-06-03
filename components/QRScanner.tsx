"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onScan: (value: string) => void;
}

export default function QRScanner({ onScan }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<InstanceType<
    typeof import("html5-qrcode").Html5Qrcode
  > | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const calledRef = useRef(false);

  useEffect(() => {
    let stopped = false;

    async function start() {
      if (!divRef.current || calledRef.current) return;
      calledRef.current = true;

      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader", { verbose: false });
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            // No qrbox — removes the internal shaded overlay that caused the duplicate look
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (!stopped) {
              stopped = true;
              onScan(decodedText);
            }
          },
          undefined
        );
        setScanning(true);
      } catch {
        setPermissionDenied(true);
      }
    }

    start();

    return () => {
      stopped = true;
      scannerRef.current
        ?.stop()
        .catch(() => {})
        .finally(() => scannerRef.current?.clear());
    };
  }, [onScan]);

  if (permissionDenied) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="text-5xl">📷</div>
        <p className="font-mono text-sm text-red-400 text-center leading-relaxed">
          Camera access was denied.
          <br />
          Please allow camera permission and reload.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-6 py-2 rounded border border-[#FF6B00] text-[#FF6B00] font-mono text-sm hover:bg-[#FF6B00]/10 transition"
        >
          RELOAD
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-mono text-xs text-gray-400 uppercase tracking-widest">
        Point camera at QR code
      </p>

      {/* Scanner frame */}
      <div className="relative w-64 h-64 overflow-hidden rounded">
        {/* Corner brackets — sit above the video via z-index */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#FF6B00] z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#FF6B00] z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#FF6B00] z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FF6B00] z-10 pointer-events-none" />

        {/* Scanning beam */}
        {scanning && (
          <div className="absolute left-0 right-0 h-0.5 bg-[#FF6B00]/80 z-10 pointer-events-none animate-scan shadow-[0_0_8px_#FF6B00]" />
        )}

        {/* html5-qrcode mounts here; CSS below forces it to fill exactly */}
        <div id="qr-reader" ref={divRef} className="qr-container w-full h-full" />
      </div>

      {!scanning && !permissionDenied && (
        <p className="font-mono text-xs text-gray-500 animate-pulse">
          Initializing camera...
        </p>
      )}
    </div>
  );
}
