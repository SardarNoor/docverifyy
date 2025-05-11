'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { DocumentVerifierAddress as contractAddress, DocumentVerifierABI as contractABI } from '@/constants';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import QRImage from 'qrcode';

export default function HistoryPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);
          const address = await signer.getAddress();
          const data = await contract.getUploadsByAddress(address);

          setDocuments(Array.isArray(data) ? data : Object.values(data));
        } catch (error) {
          console.error("Error fetching documents:", error);
        }
      }
    };

    fetchData();
  }, []);

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.fileHash.toLowerCase().includes(search.toLowerCase())
  );

  const generatePDF = async (doc: any) => {
    const qrValue = `https://yourdomain.com/verify?hash=${doc.fileHash}`;
    const qrImage = await QRImage.toDataURL(qrValue);

    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text(`Document Verification Summary`, 10, 20);
    pdf.setFontSize(12);
    pdf.text(`Title: ${doc.title}`, 10, 35);
    pdf.text(`Description: ${doc.description}`, 10, 45);
    pdf.text(`File Hash:`, 10, 55);
    pdf.setFontSize(10);
    pdf.text(`${doc.fileHash}`, 10, 63);
    pdf.setFontSize(12);
    pdf.text(`Uploaded At: ${new Date(Number(doc.timestamp) * 1000).toLocaleString()}`, 10, 75);
    pdf.text(`QR Code:`, 10, 85);
    pdf.addImage(qrImage, 'PNG', 10, 90, 60, 60);

    pdf.save(`${doc.title}_summary.pdf`);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-center mb-4 text-blue-800">📄 Uploaded Document History</h2>

      <input
        type="text"
        placeholder="Search by title or file hash"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 w-full max-w-md mb-6 mx-auto block rounded"
      />

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

              <div id={`qr-${doc.fileHash}`} className="my-4">
                <QRCode value={`https://yourdomain.com/verify?hash=${doc.fileHash}`} size={128} />
              </div>

              <button
                onClick={() => generatePDF(doc)}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                📥 Download PDF with QR
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
