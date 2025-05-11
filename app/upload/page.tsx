"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { DocumentVerifierAddress } from "@/constants";
import { ethers } from "ethers";
import { DocumentVerifierABI } from "@/constants";

export default function Upload() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [fileHashes, setFileHashes] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first.");
      return;
    }

    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    const files = fileInput?.files;
    if (!files || files.length === 0) {
      alert("Please select one or more files.");
      return;
    }

    if (!title || !description) {
      alert("Please enter both title and description.");
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
        let fileHash = "";

        if (typeof window !== "undefined" && window.crypto?.subtle) {
          const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          fileHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        } else {
          const nodeCrypto = await import("crypto");
          fileHash = nodeCrypto.createHash("sha256").update(Buffer.from(buffer)).digest("hex");
        }

        const tx = await contract.uploadDocument(fileHash, title, description);
        await tx.wait();
        hashes.push(fileHash);
      }

      setFileHashes(hashes);
      setUploadSuccess(true);
      alert("All files uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload process failed. See console.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Upload Documents</h1>

      {!isConnected && (
        <button
          onClick={() => connect({ connector: connectors[0] })}
          className="mb-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Connect Wallet
        </button>
      )}

      <div className="flex flex-col md:flex-row gap-10 items-start w-full justify-center">
        {/* Upload Form */}
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
        </div>

        {/* Upload Success */}
        {uploadSuccess && (
          <div className="flex flex-col items-center justify-center mt-6 md:mt-0">
            <p className="mb-4 font-semibold text-green-600">Documents uploaded successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
}
