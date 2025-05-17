import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supermarkets } from "./data/supermarketData";

const QRScanner = ({ onResult }) => {
  React.useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", { 
      fps: 10, 
      qrbox: 250,
      aspectRatio: 1,
      showTorchButtonIfSupported: true
    });
    
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

  return (
    <div 
      id="qr-reader" 
      className="w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-lg border-2 border-blue-500"
    />
  );
};

const App = () => {
  const [storeData, setStoreData] = useState(null);
  const [scannedId, setScannedId] = useState("");
  const [inputId, setInputId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchMode, setSearchMode] = useState("product"); // 'store' or 'product'
  const [productSearchResults, setProductSearchResults] = useState([]);

  // Search products across all supermarkets
  const searchProductAcrossStores = (term) => {
    if (!term.trim()) {
      setProductSearchResults([]);
      return;
    }

    const results = [];
    const lowerTerm = term.toLowerCase();

    Object.entries(supermarkets).forEach(([storeId, store]) => {
      const matchingProducts = store.products
        .filter(product =>
          product.name.toLowerCase().includes(lowerTerm) ||
          product.category.toLowerCase().includes(lowerTerm)
        )
        .map(product => ({
          ...product,
          storeId,
          storeName: store.name
        }));
    
      if (matchingProducts.length > 0) {
        results.push(...matchingProducts);
      }
    });
    

    setProductSearchResults(results);
  };

  // Search products within current store
  useEffect(() => {
    if (storeData && searchTerm && searchMode === 'store') {
      const results = storeData.products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(results);
    } else if (storeData && searchMode === 'store') {
      setFilteredProducts(storeData.products);
    }
  }, [searchTerm, storeData, searchMode]);

  const handleQRResult = (text) => {
    setScannedId(text);
    setInputId(text);
    findSupermarket(text);
    setSearchMode('store');
  };

  const findSupermarket = (id) => {
    setIsLoading(true);
    setError("");
    setSearchTerm("");
    
    // Simulate API call delay
    setTimeout(() => {
      const data = supermarkets[id];
      if (data) {
        setStoreData(data);
        setFilteredProducts(data.products);
      } else {
        setStoreData(null);
        setError("Supermarket not found. Please check the ID and try again.");
      }
      setIsLoading(false);
    }, 800);
  };

  const handleInputSearch = (e) => {
    e.preventDefault();
    const trimmedId = inputId.trim();
    setScannedId(trimmedId);
    findSupermarket(trimmedId);
    setSearchMode('store');
  };

  const handleProductSearch = (e) => {
    e.preventDefault();
    if (searchMode === 'product') {
      searchProductAcrossStores(searchTerm);
    }
  };

  const toggleSearchMode = () => {
    setSearchMode(prev => prev === 'store' ? 'product' : 'store');
    setSearchTerm('');
    setProductSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
            {/* {searchMode === 'product' ? 'Find Product in Stores' : 'Find Your Product'} */}
            shelf<span className="text-yellow-500">Sense</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {storeData 
              ? `Search products in ${storeData.name}`
              : searchMode === 'product' 
                ? "Search for a product across all stores"
                : "Scan a supermarket QR code or enter the ID to begin"}
          </p>
        </header>

        {(!storeData || searchMode === 'product') && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {searchMode === 'product' 
                  ? "Search Product Across Stores"
                  : "Find a Store First"}
              </h2>
              <button
                onClick={toggleSearchMode}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                {searchMode === 'product' ? 'Search by Store' : 'Search Product First'}
              </button>
            </div>

            {searchMode === 'product' ? (
              <div>
                <form onSubmit={handleProductSearch} className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products across all stores (e.g. 'milk', 'bread')"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        searchProductAcrossStores(e.target.value);
                      }}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
                    />
                    <div className="absolute left-3 top-3 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </form>

                {productSearchResults.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Found {productSearchResults.length} {productSearchResults.length === 1 ? 'product' : 'products'} in {new Set(productSearchResults.map(p => p.storeId)).size} stores
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {productSearchResults.map((product, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg text-gray-800">{product.name}</h4>
                              <p className="text-gray-600 mb-2">Category: {product.category}</p>
                              <div className="flex items-center text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="font-medium">{product.storeName}</span>
                              </div>
                            </div>
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              Aisle {product.aisle || 'N/A'}, Row {product.row}
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setInputId(product.storeId);
                              findSupermarket(product.storeId);
                              setSearchMode('store');
                            }}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            View all products in {product.storeName}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : searchTerm ? (
                  <div className="text-center py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="mt-4 text-lg font-medium text-gray-700">No products found</h4>
                    <p className="mt-1 text-gray-500">Try a different search term</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h4 className="mt-4 text-lg font-medium text-gray-700">Search for products</h4>
                    <p className="mt-1 text-gray-500">Enter a product name to find which stores carry it</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 22V12h6v10" />
                    </svg>
                    Scan Supermarket QR Code
                  </h2>
                  <div className="mb-6">
                    <QRScanner onResult={handleQRResult} />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2 bg-white text-sm text-gray-500">OR</span>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold mb-4 text-gray-800 mt-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Enter Supermarket ID
                  </h2>
                  <form onSubmit={handleInputSearch} className="space-y-4">
                    <input
                      type="text"
                      placeholder="e.g. SM-12345"
                      value={inputId}
                      onChange={(e) => setInputId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} shadow-md hover:shadow-lg flex items-center justify-center`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Searching...
                        </>
                      ) : (
                        "Find Supermarket"
                      )}
                    </button>
                  </form>
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {storeData && searchMode === 'store' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-6xl mx-auto animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Welcome to {storeData.name}</h2>
                <p className="text-gray-600">ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{scannedId}</span></p>
              </div>
              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                <button
                  onClick={toggleSearchMode}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search All Stores
                </button>
                <button
                  onClick={() => {
                    setStoreData(null);
                    setScannedId("");
                    setInputId("");
                    setError("");
                    setSearchTerm("");
                  }}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Scan Another Store
                </button>
              </div>
            </div>

            <div className="mb-8">
              <form onSubmit={handleProductSearch} className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products (e.g. 'milk', 'bread')"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
                  />
                  <div className="absolute left-3 top-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </form>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {searchTerm ? "Search Results" : "All Products"}
                <span className="ml-2 text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
                </span>
              </h3>
              
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="mt-4 text-lg font-medium text-gray-700">No products found</h4>
                  <p className="mt-1 text-gray-500">Try a different search term</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((p, i) => (
                    <div
                      key={i}
                      className="p-5 border rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white group relative"
                    >
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-2 pr-6">{p.name}</h3>
                      <div className="flex items-center text-gray-600 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span>Category: {p.category}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span>Row: <span className="font-semibold">{p.row}</span></span>
                      </div>
                      {p.aisle && (
                        <div className="flex items-center text-gray-600 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                          <span>Aisle: <span className="font-semibold">{p.aisle}</span></span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        #{i+1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Add some global styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;