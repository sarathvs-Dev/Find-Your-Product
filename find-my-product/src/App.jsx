import React, { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import ProductCard from "./components/ProductCard";
import CategoryList from "./components/CategoryList";
import AisleMap from "./components/AisleMap";
import QRScanner from "./components/QRScanner";
import { supermarketData } from "./data/supermarketData"; // Mock data source

const App = () => {
  const [supermarketId, setSupermarketId] = useState(null);
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [highlightedAisle, setHighlightedAisle] = useState(null);

  const handleQRScan = (data) => {
    // Example QR format: "supermarket:123"
    const id = data.replace("supermarket:", "").trim();
    const matchedData = supermarketData.find((market) => market.id === id);
    if (matchedData) {
      setSupermarketId(id);
      setProducts(matchedData.products);
      setFiltered(matchedData.products);
    } else {
      alert("Invalid or unknown supermarket QR code.");
    }
  };

  const handleSearch = (query) => {
    const result = products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(result);
  };

  const handleCategorySelect = (category) => {
    const result = products.filter((p) => p.category === category);
    setFiltered(result);
  };

  useEffect(() => {
    if (filtered.length === 1) {
      setHighlightedAisle(filtered[0].aisle);
    } else {
      setHighlightedAisle(null);
    }
  }, [filtered]);

  // Show scanner first if no supermarket is loaded
  if (!supermarketId) {
    return <QRScanner onScanSuccess={handleQRScan} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-center">
      <h1 className="text-3xl font-bold py-6">Supermarket Product Locator</h1>
      <SearchBar onSearch={handleSearch} />
      <CategoryList products={products} onSelect={handleCategorySelect} />
      <AisleMap highlightedAisle={highlightedAisle} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {filtered.length > 0 ? (
          filtered.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))
        ) : (
          <p className="col-span-full text-red-500">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default App;
