import "./globals.css";
import type { Metadata } from "next";
import { AccessGuard } from "@/components/auth/AccessGuard";

export const metadata: Metadata = {
  title: "TikTok Live Manager",
  description: "Panel interno para ventas por TikTok Live",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AccessGuard>{children}</AccessGuard>
      </body>
    </html>
  );
}