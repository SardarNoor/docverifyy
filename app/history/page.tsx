"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { ethers } from "ethers";
import {
  DocumentVerifierAddress as contractAddress,
  DocumentVerifierABI as contractABI,
} from "@/constants";
import QRCode from "react-qr-code";
import { PDFDocument, rgb, StandardFonts, PDFName } from "pdf-lib";
import QRImage from "qrcode";

export default function HistoryPage() {
  const { address: userAddress, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | "">("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteTargetHash, setDeleteTargetHash] = useState("");

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", async (accounts: string[]) => {
        if (accounts.length > 0) {
          try {
            await connect({ connector: connectors[0] });
          } catch {
            setMessage("⚠️ Wallet reconnection failed.");
            setMessageType("error");
          }
        }
      });
    }
  }, [connect, connectors]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !userAddress) return;
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const data = await contract.getUploadsByAddress(userAddress);
        setDocuments(Array.isArray(data) ? data : Object.values(data));
      } catch (error) {
        setMessage("❌ Failed to fetch documents.");
        setMessageType("error");
      }
    };
    fetchData();
  }, [isConnected, userAddress]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const confirmDeletion = async () => {
    try {
      if (!isConnected) await connect({ connector: connectors[0] });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.deleteDocument(deleteTargetHash);
      await tx.wait();
      setDocuments((prev) => prev.filter((doc) => doc.fileHash !== deleteTargetHash));
      setMessage("✅ Document deleted successfully.");
      setMessageType("success");
    } catch (error) {
      setMessage("❌ Failed to delete document.");
      setMessageType("error");
    } finally {
      setDeleteTargetHash("");
      setShowConfirmModal(false);
    }
  };

  const confirmDeleteAll = async () => {
    try {
      if (!isConnected) await connect({ connector: connectors[0] });
      const fileHashes = documents
        .filter((doc) => doc.owner.toLowerCase() === userAddress?.toLowerCase())
        .map((doc) => doc.fileHash);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.deleteDocuments(fileHashes);
      await tx.wait();
      setDocuments([]);
      setMessage("✅ All documents deleted successfully.");
      setMessageType("success");
    } catch (error) {
      setMessage("❌ Failed to delete all documents.");
      setMessageType("error");
    } finally {
      setShowDeleteAllModal(false);
    }
  };

  const embedQRInPDF = async (doc: any) => {
  const qrValue = `http://localhost:3000/verify?hash=${doc.fileHash}`;
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "application/pdf";

  fileInput.onchange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const calculatedHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      if (calculatedHash.toLowerCase() !== doc.fileHash.toLowerCase()) {
        setMessage("❌ This file does not match the uploaded hash.");
        setMessageType("error");
        return;
      }

      const pdfDoc = await PDFDocument.load(buffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];

      const qrDataUrl = await QRImage.toDataURL(qrValue);
      const qrImageBytes = await fetch(qrDataUrl).then((res) => res.arrayBuffer());
      const qrImage = await pdfDoc.embedPng(qrImageBytes);
      const qrDims = qrImage.scale(0.3);

      // Center position on last page
      const qrX = (lastPage.getWidth() - qrDims.width) / 2;
      const qrY = 100;

      lastPage.drawImage(qrImage, {
        x: qrX,
        y: qrY,
        width: qrDims.width,
        height: qrDims.height,
      });

      const linkText = "Verify this document on blockchain";
      const noteText = "Verification powered by DocVerify (Blockchain)";
      const fullUrl = qrValue;

      const textSize = 10;
      const noteSize = 8;

      const linkTextWidth = font.widthOfTextAtSize(linkText, textSize);
      const noteTextWidth = font.widthOfTextAtSize(noteText, noteSize);

      const centerXLink = qrX + (qrDims.width / 2) - (linkTextWidth / 2);
      const centerXNote = qrX + (qrDims.width / 2) - (noteTextWidth / 2);

      lastPage.drawText(linkText, {
        x: centerXLink,
        y: qrY - 20,
        size: textSize,
        font,
        color: rgb(0, 0, 1),
      });

      lastPage.drawText(noteText, {
        x: centerXNote,
        y: qrY - 35,
        size: noteSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });

      // Add clickable hyperlink over the linkText
      const annotation = pdfDoc.context.obj({
        Type: "Annot",
        Subtype: "Link",
        Rect: [centerXLink, qrY - 20, centerXLink + linkTextWidth, qrY - 10],
        Border: [0, 0, 0],
        A: {
          Type: "Action",
          S: "URI",
          URI: fullUrl,
        },
      });

      const annots = lastPage.node.Annots();
      if (annots) {
        annots.push(annotation);
      } else {
        lastPage.node.set(PDFName.of("Annots"), pdfDoc.context.obj([annotation]));
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(".pdf", "")}_withQR.pdf`;
      link.click();

      setMessage("✅ QR code embedded successfully.");
      setMessageType("success");
    } catch (error) {
      console.error("❌ QR embedding failed:", error);
      setMessage("❌ QR embedding failed. See console for details.");
      setMessageType("error");
    }
  };

  fileInput.click();
};


  const getMessageStyle = () => {
    switch (messageType) {
      case "success": return "bg-green-100 text-green-800 border-green-300";
      case "error": return "bg-red-100 text-red-800 border-red-300";
      case "info": return "bg-blue-100 text-blue-800 border-blue-300";
      default: return "";
    }
  };

  const filteredDocs = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.fileHash.toLowerCase().includes(search.toLowerCase())
  );

  if (!window.ethereum || !userAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          ⚠️ Please connect your wallet to view your uploaded documents.
        </h2>
        <button
          onClick={async () => {
            try {
              await connect({ connector: connectors[0] });
            } catch {
              setMessage("⚠️ Wallet connection failed.");
              setMessageType("error");
            }
          }}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-center mb-4 text-blue-800">
        📄 Uploaded Document History
      </h2>

      <input
        type="text"
        placeholder="Search by title or file hash"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 w-full max-w-md mb-6 mx-auto block rounded"
      />

      {documents.length > 0 && (
        <div className="max-w-md mx-auto mb-6 text-center">
          <button
            onClick={() => setShowDeleteAllModal(true)}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🗑️ Delete All Documents
          </button>
        </div>
      )}

      {message && (
        <div className={`max-w-md mx-auto mb-4 p-3 border rounded ${getMessageStyle()}`}>
          {message}
        </div>
      )}

      {filteredDocs.length === 0 ? (
        <p className="text-center text-gray-500">No documents found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDocs.map((doc, index) => (
            <div key={index} className="bg-white p-4 shadow-md border border-gray-200 rounded">
              <p><strong>Title:</strong> {doc.title}</p>
              <p><strong>Description:</strong> {doc.description}</p>
              <p><strong>File Hash:</strong> {doc.fileHash}</p>
              <p><strong>Uploaded:</strong> {new Date(Number(doc.timestamp) * 1000).toLocaleString()}</p>

              <div className="my-4">
                <QRCode value={`http://localhost:3000/verify?hash=${doc.fileHash}`} size={128} />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => embedQRInPDF(doc)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  📥 Embed QR in PDF
                </button>
                <button
                  onClick={() => {
                    setDeleteTargetHash(doc.fileHash);
                    setShowConfirmModal(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Single Delete Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <p className="mb-4 text-gray-800">Are you sure you want to delete this document?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={confirmDeletion} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <p className="mb-4 text-gray-800">Are you sure you want to delete all your uploaded documents?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteAllModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={confirmDeleteAll} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Yes, Delete All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
