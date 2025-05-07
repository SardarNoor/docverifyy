"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileCheck, UploadCloud, ShieldCheck, SearchCheck, Sparkles, Globe2 } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-gradient-to-br from-blue-50 to-white">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl md:text-5xl font-bold mb-6 text-blue-600"
      >
        Welcome to DocVerify
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="text-lg text-gray-600 max-w-xl mb-8"
      >
        Securely upload, verify, and protect your important documents using blockchain
        technology. Trusted, tamper-proof, and instant verification.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="flex flex-col sm:flex-row gap-4 mb-10"
      >
        <Link href="/upload">
          <Button className="bg-blue-500 hover:bg-blue-700 text-white text-lg px-6 py-3">
            Upload Document
          </Button>
        </Link>
        <Link href="/manualverify">
          <Button variant="outline" className="text-lg px-6 py-3">
            Manual Verify
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl"
      >
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="bg-white p-6 rounded-2xl shadow-md text-center"
        >
          <UploadCloud className="mx-auto h-10 w-10 text-blue-500 mb-2" />
          <h3 className="font-semibold text-lg">Upload Securely</h3>
          <p className="text-sm text-gray-500">Store document hashes on blockchain with full integrity.</p>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="bg-white p-6 rounded-2xl shadow-md text-center"
        >
          <ShieldCheck className="mx-auto h-10 w-10 text-green-500 mb-2" />
          <h3 className="font-semibold text-lg">Tamper-Proof</h3>
          <p className="text-sm text-gray-500">Prevent forgery with cryptographic hashing & smart contracts.</p>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="bg-white p-6 rounded-2xl shadow-md text-center"
        >
          <SearchCheck className="mx-auto h-10 w-10 text-purple-500 mb-2" />
          <h3 className="font-semibold text-lg">Easy Verification</h3>
          <p className="text-sm text-gray-500">Verify authenticity using QR codes or manual upload.</p>
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-16 max-w-5xl text-left"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <Sparkles className="text-yellow-400" /> Why Choose DocVerify?
        </h2>
        <ul className="space-y-3 text-gray-600">
          <li><strong>✅ Blockchain-backed:</strong> Immutable records ensure documents can't be altered.</li>
          <li><strong>✅ Instant Verification:</strong> No manual checks, results within seconds.</li>
          <li><strong>✅ Public or Private Access:</strong> Set who can verify your documents.</li>
          <li><strong>✅ Trusted by Institutions:</strong> Ideal for universities, HR teams, and official authorities.</li>
        </ul>
      </motion.div>

      <motion.div
        className="mt-20 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Globe2 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <p className="text-xl font-medium text-gray-700">
          Start verifying the future. <span className="text-blue-500">Go Blockchain.</span>
        </p>
      </motion.div>
    </div>
  );
}
