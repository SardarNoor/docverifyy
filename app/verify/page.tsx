"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "@/artifacts/contracts/DocumentVerifier.sol/DocumentVerifier.json";
import { DocumentVerifierAddress as CONTRACT_ADDRESS } from "@/constants";
import { Card } from "@/components/ui/card";

export default function VerifyQRPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const hash = searchParams.get("hash");

  useEffect(() => {
    const verify = async () => {
      if (!hash) return setStatus("❌ No hash provided.");
      if (typeof window === "undefined" || !window.ethereum) {
        return setStatus("⚠️ MetaMask not detected.");
      }

      setLoading(true);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider);
        const result = await contract.getDocumentDetails(hash);

        if (result.owner !== ethers.constants.AddressZero) {
          setDetails(result);
          setStatus("✅ Document is VERIFIED");
        } else {
          setStatus("❌ Document NOT FOUND.");
        }
      } catch (error) {
        console.error(error);
        setStatus("⚠️ Error verifying hash.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [hash]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-purple-100 to-white">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">QR Document Verification</h1>

      <Card className="w-full max-w-md p-6 bg-white rounded-xl shadow-md text-center">
        {loading && <p className="mb-4 text-gray-500">🔄 Verifying on blockchain...</p>}

        {status && (
          <p className={`mb-4 text-lg ${status.includes("✅") ? "text-green-600" : "text-red-600"}`}>
            {status}
          </p>
        )}

        {details && (
          <div className="bg-gray-100 text-sm text-left rounded-md p-4 space-y-2">
            <p><strong>Title:</strong> {details[0]}</p>
            <p><strong>Description:</strong> {details[1]}</p>
            <p><strong>Owner:</strong> {details[2]}</p>
            <p><strong>Uploaded At:</strong> {new Date(Number(details[3]) * 1000).toLocaleString()}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
