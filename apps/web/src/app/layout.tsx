import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = { title: { default: "Turno", template: "%s · Turno" }, description: "Horarios, reloj checador y hojas de horas para tu equipo." };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-surface text-text antialiased">{children}</body>
    </html>
  );
}
