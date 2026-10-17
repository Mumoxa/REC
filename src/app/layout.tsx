import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./shell.css";
import "./workspace.css";

export const metadata: Metadata = {
  title: "Talent Tree Recruitment Intelligence",
  description: "Vacancy intelligence and passive talent market mapping workspace",
  icons: { icon: "/favicon-32.png" },
};

export const viewport: Viewport = {
  themeColor: "#0f1e16",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
