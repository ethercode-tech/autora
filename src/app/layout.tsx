import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AUTORA",
  description: "SaaS de gestión para pequeños emprendimientos de fabricación y reventa."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
