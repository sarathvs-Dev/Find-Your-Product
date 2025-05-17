import React, { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supermarkets } from "./data/supermarketData";

const QRScanner = ({ onResult }) => {
  React.useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });
    scanner.render(
      (decodedText) => {
        onResult(decodedText.trim());
        scanner.clear();
      },
      (error) => {}
    );
    return () => {
      scanner.clear();
    };
  }, [onResult]);

  return <div id="qr-reader" style={{ width: "300px", margin: "auto" }} />;
};

const App = () => {
  const [storeData, setStoreData] = useState(null);
  const [scannedId, setScannedId] = useState("");
  const [inputId, setInputId] = useState("");
  const [error, setError] = useState("");

  const handleQRResult = (text) => {
    setScannedId(text);
    setInputId(text); // sync input field too
    findSupermarket(text);
  };

  const findSupermarket = (id) => {
    setError("");
    const data = supermarkets[id];
    if (data) {
      setStoreData(data);
    } else {
      setStoreData(null);
      setError("Supermarket not found");
    }
  };

  const handleInputSearch = () => {
    const trimmedId = inputId.trim();
    setScannedId(trimmedId);
    findSupermarket(trimmedId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-center">
      <h1 className="text-3xl font-bold mb-6">Find My Product</h1>

      {!storeData && (
        <>
          <h2 className="mb-2 font-semibold">Scan Supermarket QR Code</h2>
          <QRScanner onResult={handleQRResult} />

          <p className="my-4 font-semibold">OR</p>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Enter Supermarket ID"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              className="border rounded p-2 mr-2"
            />
            <button
              onClick={handleInputSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Search
            </button>
          </div>

          {error && <p className="text-red-600 font-semibold">{error}</p>}
        </>
      )}

      {storeData && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Welcome to {storeData.name}</h2>
          <p className="text-gray-600 mb-4">Supermarket ID: {scannedId}</p>

          <button
            onClick={() => {
              setStoreData(null);
              setScannedId("");
              setInputId("");
              setError("");
            }}
            className="mb-6 bg-gray-400 text-white px-4 py-2 rounded"
          >
            Reset
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {storeData.products.map((p, i) => (
              <div
                key={i}
                className="p-4 border rounded shadow bg-white text-left"
              >
                <h3 className="text-lg font-bold">{p.name}</h3>
                <p>Category: {p.category}</p>
                <p>Row: {p.row}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
