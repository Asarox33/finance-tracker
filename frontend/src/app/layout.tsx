import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Finance Tracker", template: "%s | Finance Tracker" },
  description: "Personal finance tracking — portfolio, performance, and analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
