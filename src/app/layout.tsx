import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talent Tree Recruitment Intelligence",
  description: "Vacancy intelligence and passive talent market mapping workspace",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
