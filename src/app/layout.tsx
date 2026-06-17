import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Financial Document Analyst",
  description: "Extract, compare, and explain financial statements the way an analyst would — in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
