import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BigBrotherIsWatching",
  description: "A non-confrontational, playful house ops notification system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
