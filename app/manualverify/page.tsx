"use client";

import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ethers } from "ethers";
import contractABI from "@/artifacts/contracts/DocumentVerifier.sol/DocumentVerifier.json";
import { useDisconnect } from "wagmi";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

export default function ManualVerifyPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const { disconnect } = useDisconnect();

  useEffect(() => {
    disconnect();
  }, []);

  const generateFileHash = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setStatuses([]);
    }
  };

  const handleVerify = async () => {
    if (!files.length) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider);

    const newStatuses: any[] = [];

    for (const file of files) {
      try {
        const hash = await generateFileHash(file);
        const result = await contract.getDocumentDetails(hash);

        if (result.owner !== ethers.constants.AddressZero) {
          newStatuses.push({
            fileName: file.name,
            status: "✅ Document VERIFIED",
            details: result
          });
        } else {
          newStatuses.push({
            fileName: file.name,
            status: "❌ Document NOT FOUND"
          });
        }
      } catch (err) {
        newStatuses.push({
          fileName: file.name,
          status: "⚠️ Error verifying document"
        });
      }
    }

    setStatuses(newStatuses);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 bg-gradient-to-br from-blue-100 to-white">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Manual Document Verification</h1>

      <Card className="w-full max-w-xl p-6 space-y-4 bg-white rounded-xl shadow-xl">
        <div className="text-center">
          <Upload className="w-10 h-10 mx-auto text-blue-500 mb-2" />
          <p className="text-gray-600">Upload one or more documents to verify</p>
        </div>

        <Input type="file" multiple onChange={handleFileChange} />

        <Button onClick={handleVerify} className="w-full bg-blue-600 text-white">
          Verify Document(s)
        </Button>

        {statuses.length > 0 && (
          <div className="space-y-4">
            {statuses.map((s, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-md text-sm ${s.status.includes("✅") ? "bg-green-100 text-green-700" : s.status.includes("❌") ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
              >
                <p><strong>{s.fileName}</strong>: {s.status}</p>
                {s.details && (
                  <div className="mt-2 text-xs text-left space-y-1">
                    <p><strong>Title:</strong> {s.details[0]}</p>
                    <p><strong>Description:</strong> {s.details[1]}</p>
                    <p><strong>Owner:</strong> {s.details[2]}</p>
                    <p><strong>Timestamp:</strong> {new Date(Number(s.details[3]) * 1000).toLocaleString()}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
