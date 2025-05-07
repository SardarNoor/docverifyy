// ❌ DO NOT ADD "use client"
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ClientWrapper from "./client-wrapper"; // ✅ new file we'll create

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DocVerify | Blockchain Document Verification",
  description: "Upload and verify documents securely using blockchain technology.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientWrapper> {/* ✅ wraps Providers inside client-safe file */}
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ClientWrapper>
      </body>
    </html>
  );
}
