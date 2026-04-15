import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Azelea Aircon System",
  description: "Professional aircon installation, repair and maintenance services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ErrorReporter />
        <Toaster position="top-center" richColors />
        {children}
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
