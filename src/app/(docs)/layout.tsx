import "../globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation | Zero English",
  description: "API documentation for the Zero English platform.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}