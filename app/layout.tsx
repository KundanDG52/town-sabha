import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Town Sabha | Hariprabodham",
  description: "QR Attendance System for Town Sabha — Hariprabodham, South Bombay Sabha",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
