"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { DocumentVerifierAddress } from "@/constants";
import { ethers } from "ethers";
import { DocumentVerifierABI } from "@/constants";
import QRCode from "react-qr-code";

export default function Upload() {
  const { address } = useAccount();
  const [fileHash, setFileHash] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUpload = async () => {
    try {
      // ✅ Step 1: Ensure Metamask is available and wallet is connected
      if (typeof window.ethereum === "undefined") {
        alert("Metamask not found. Please install it.");
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) {
        alert("Please connect your wallet.");
        return;
      }

      // ✅ Step 2: Get selected file
      const fileInput = document.getElementById("fileInput") as HTMLInputElement;
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert("Please select a file first.");
        return;
      }

      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const buffer = reader.result as ArrayBuffer;
          let fileHash = "";

          // ✅ Step 3: Generate file hash
          if (typeof window !== "undefined" && window.crypto?.subtle) {
            const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            fileHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
          } else {
            const nodeCrypto = await import("crypto");
            fileHash = nodeCrypto.createHash("sha256").update(Buffer.from(buffer)).digest("hex");
          }

          setFileHash(fileHash);

          // ✅ Step 4: Interact with smart contract
          const provider = new ethers.providers.Web3Provider(window.ethereum as any);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(DocumentVerifierAddress, DocumentVerifierABI, signer);

          console.log("Uploading to contract with hash:", fileHash);
          const tx = await contract.uploadDocument(fileHash, title, description);
          await tx.wait();

          setUploadSuccess(true);
          alert("Upload successful!");
        } catch (uploadError) {
          console.error("Error during upload:", uploadError);
          alert("Upload failed. Check console for details.");
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (outerError) {
      console.error("Upload failed:", outerError);
      alert("Upload process failed. See console.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Upload Document</h1>

      <input type="file" id="fileInput" className="mb-4" />

      <input
        type="text"
        placeholder="Enter Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4 px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
      />

      <input
        type="text"
        placeholder="Enter Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-4 px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
      />

      <button
        onClick={handleUpload}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Upload
      </button>

      {uploadSuccess && fileHash && (
        <div className="mt-8 text-center">
          <p className="mb-4 font-semibold">Document uploaded successfully!</p>
          <QRCode value={`http://44.211.78.74:3000/manualverify?hash=${fileHash}`} />
          <p className="mt-2 text-sm break-all">Hash: {fileHash}</p>
        </div>
      )}
    </div>
  );
}
