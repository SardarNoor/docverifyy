"use client";

import Link from "next/link";
import { FileCheck, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { metaMask } from "wagmi/connectors";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold text-lg">
            <FileCheck className="w-6 h-6" /> DocVerify
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/upload" className="text-gray-700 hover:text-blue-600 font-medium">Upload</Link>
            <Link href="/manualverify" className="text-gray-700 hover:text-blue-600 font-medium">Manual Verify</Link>
            <Link href="/history" className="text-gray-700 hover:text-blue-600 font-medium">History</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">About</Link>

            <Button
              onClick={() => connect({ connector: metaMask() })}
              className="text-sm px-4 py-2"
            >
              {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect Wallet"}
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden px-4 pb-4">
          <div className="flex flex-col gap-4">
            <Link href="/upload" className="text-gray-700 hover:text-blue-600">Upload</Link>
            <Link href="/manualverify" className="text-gray-700 hover:text-blue-600">Manual Verify</Link>
            <Link href="/history" className="text-gray-700 hover:text-blue-600">History</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600">About</Link>
            <Button
              onClick={() => connect({ connector: metaMask() })}
              className="w-full"
            >
              {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect Wallet"}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
