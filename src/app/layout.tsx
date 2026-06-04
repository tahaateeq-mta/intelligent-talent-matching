import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Intelligent Talent Matching Platform",
  description: "CSIT314 Architectural Engineering Prototype",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="font-sans bg-[#0b041a] text-slate-100 antialiased min-h-screen selection:bg-violet-500 selection:text-white"
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navbar />
          <div className="flex pt-16 bg-[#0b041a] w-full min-h-screen">
            <Sidebar />
            <main className="flex-1 min-h-[calc(100vh-4rem)] bg-[#0b041a] text-slate-100 transition-colors pl-76 pr-8 md:pr-16 py-6">
              <div className="w-full max-w-7xl">{children}</div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}