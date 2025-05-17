import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const QRScanner = ({ onScanSuccess }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(
      (decodedText, decodedResult) => {
        onScanSuccess(decodedText);
        scanner.clear(); // Stop scanner after successful scan
      },
      (error) => {
        // console.warn("QR Scan error:", error);
      }
    );
  }, [onScanSuccess]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-xl font-semibold mb-4">Scan Supermarket QR</h2>
      <div id="qr-reader" />
    </div>
  );
};

export default QRScanner;
