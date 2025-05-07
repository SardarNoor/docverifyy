import React from "react";
import { QRCode } from "react-qrcode-logo";

interface Props {
  hash: string;
}

const DocumentQR: React.FC<Props> = ({ hash }) => {
  const url = `http://localhost:3000/verify?hash=${hash}`;

  return (
    <div className="text-center mt-4">
      <h3 className="text-lg font-bold mb-2">Scan QR to Verify</h3>
      <QRCode value={url} size={180} />
      <p className="mt-2 text-sm break-all text-gray-600">{url}</p>
    </div>
  );
};

export default DocumentQR;
