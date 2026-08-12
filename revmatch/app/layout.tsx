import type { Metadata } from "next";
import Background from "./components/Background";
import "./globals.css";

export const metadata: Metadata = {
  title: "Silent Co-Driver | RevMatch",
  description: "Reading driver stress from radio calls, correlated with lap performance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col text-zinc-100">
        <Background />
        {children}
      </body>
    </html>
  );
}
