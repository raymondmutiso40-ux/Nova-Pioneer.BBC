import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Nova Pioneer Girls Basketball Portfolio",
  description: "Player tracking and coaching system for Nova Pioneer Girls Basketball",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
