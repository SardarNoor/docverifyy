"use client";

import { useState } from "react";
import { Upload, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ethers } from "ethers";
import contractABI from "@/artifacts/contracts/DocumentVerifier.sol/DocumentVerifier.json";

const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

export default function ManualVerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);

  const generateFileHash = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus(null);
      setDetails(null);
    }
  };

  const handleVerify = async () => {
    if (!file) return;

    try {
      const hash = await generateFileHash(file);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider);
      const result = await contract.getDocumentDetails(hash);

      if (result.owner !== ethers.constants.AddressZero) {
        setDetails(result);
        setStatus("✅ Document is VERIFIED");
      } else {
        setStatus("❌ Document NOT FOUND on blockchain.");
      }
    } catch (error) {
      console.error(error);
      setStatus("⚠️ Error verifying document.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 bg-gradient-to-br from-blue-100 to-white">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Manual Document Verification</h1>

      <Card className="w-full max-w-md p-6 space-y-4 bg-white rounded-xl shadow-xl">
        <div className="text-center">
          <Upload className="w-10 h-10 mx-auto text-blue-500 mb-2" />
          <p className="text-gray-600">Upload the document you want to verify</p>
        </div>

        <Input type="file" onChange={handleFileChange} />

        <Button onClick={handleVerify} className="w-full bg-blue-600 text-white">
          Verify Document
        </Button>

        {status && (
          <div
            className={`p-3 rounded-md text-sm ${status.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {status}
          </div>
        )}

        {details && (
          <div className="bg-gray-100 p-4 rounded-lg text-sm text-left space-y-2">
            <p><strong>Title:</strong> {details[0]}</p>
            <p><strong>Description:</strong> {details[1]}</p>
            <p><strong>Owner:</strong> {details[2]}</p>
            <p><strong>Timestamp:</strong> {new Date(Number(details[3]) * 1000).toLocaleString()}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
