"use client";

import React, { useState } from "react";
import { useAccount, useConnect, Connector } from "wagmi";
import { DocumentVerifierAddress } from "@/constants";
import { ethers } from "ethers";
import { DocumentVerifierABI } from "@/constants";

export default function Upload() {
  const { isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();

  const [fileHashes, setFileHashes] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleUpload = async () => {
    setSuccessMessage("");
    setErrorMessage("");

    if (!isConnected) {
      setErrorMessage("⚠️ Please connect your wallet first.");
      return;
    }

    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    const files = fileInput?.files;
    if (!files || files.length === 0) {
      setErrorMessage("⚠️ Please select one or more files.");
      return;
    }

    if (!title || !description) {
      setErrorMessage("⚠️ Please enter both title and description.");
      return;
    }

    try {
      setIsUploading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(DocumentVerifierAddress, DocumentVerifierABI, signer);

      const hashes: string[] = [];

      for (const file of Array.from(files)) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const fileHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        hashes.push(fileHash);
      }

      const tx = await contract.uploadDocuments(hashes, title, description);
      await tx.wait();

      setFileHashes(hashes);

      // ✅ Display correct message based on file count
      if (hashes.length === 1) {
        setSuccessMessage("✅ Document uploaded successfully!");
      } else {
        setSuccessMessage("✅ Documents uploaded successfully!\n✅ All files uploaded in one transaction!");
      }

    } catch (error) {
      console.error("Upload failed:", error);
      setErrorMessage("❌ Upload process failed. Please check the console for details.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Upload Documents</h1>

      {!isConnected ? (
        <div className="text-center">
          <p className="mb-4 text-red-600 font-semibold">
            ⚠️ Please connect your wallet to proceed with uploading documents.
          </p>
          <button
            onClick={async () => {
              try {
                await connectAsync({
                  connector: connectors[0] as Connector,
                });
              } catch (err) {
                console.error("Connection cancelled or failed:", err);
              }
            }}
            className="mb-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-10 items-start w-full justify-center">
          <div className="flex flex-col items-center w-full max-w-md">
            <input type="file" id="fileInput" multiple className="mb-4" />
            <input
              type="text"
              placeholder="Enter Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-4 px-4 py-2 border border-gray-300 rounded-md w-full"
            />
            <input
              type="text"
              placeholder="Enter Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mb-4 px-4 py-2 border border-gray-300 rounded-md w-full"
            />
            <button
              onClick={handleUpload}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>

            {errorMessage && (
              <p className="mt-4 text-red-600 font-semibold">{errorMessage}</p>
            )}

            {successMessage && successMessage.split('\n').map((line, idx) => (
              <p key={idx} className="mt-2 text-green-600 font-semibold">{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
