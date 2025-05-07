"use client";

import { ShieldCheck, FileCheck2, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-sky-100 to-white">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-blue-700 text-center mb-6"
      >
        About DocVerify
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-3xl mx-auto text-center text-gray-700 text-lg mb-10"
      >
        DocVerify is a blockchain-based document verification platform designed for institutions, universities,
        and individuals who seek secure and transparent document authentication. Our goal is to eliminate
        forgery, provide fast verification, and ensure trust using decentralized smart contracts.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white p-6 rounded-xl shadow-md text-center"
        >
          <UploadCloud className="h-10 w-10 text-blue-500 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">Blockchain Uploads</h3>
          <p className="text-sm text-gray-500">
            Your document hashes are uploaded immutably to the blockchain ensuring no tampering is possible.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white p-6 rounded-xl shadow-md text-center"
        >
          <ShieldCheck className="h-10 w-10 text-green-500 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">Smart Contract Security</h3>
          <p className="text-sm text-gray-500">
            Each document is recorded using a smart contract with ownership, timestamps, and full traceability.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white p-6 rounded-xl shadow-md text-center"
        >
          <FileCheck2 className="h-10 w-10 text-purple-500 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">Simple Verification</h3>
          <p className="text-sm text-gray-500">
            Documents can be verified instantly using QR code or by manual file re-uploading for comparison.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
