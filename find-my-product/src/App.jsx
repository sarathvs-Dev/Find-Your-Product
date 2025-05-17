import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supermarkets } from "./data/supermarketData";

const QRScanner = ({ onResult }) => {
  React.useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", { 
      fps: 10, 
      qrbox: {width: 250, height: 250},
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
      className="w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-lg border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50"
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
  const [searchMode, setSearchMode] = useState("product");
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isScannerActive, setIsScannerActive] = useState(false);

  // Extract all unique categories from products
  useEffect(() => {
    if (storeData && searchMode === 'store') {
      const categories = [...new Set(storeData.products.map(p => p.category))];
      setAvailableCategories(categories);
    } else if (searchMode === 'product') {
      const allCategories = new Set();
      Object.values(supermarkets).forEach(store => {
        store.products.forEach(product => {
          allCategories.add(product.category);
        });
      });
      setAvailableCategories(Array.from(allCategories));
    }
  }, [storeData, searchMode]);

  // Search products across all supermarkets with category filter
  const searchProductAcrossStores = (term, category = "all") => {
    if (!term.trim() && category === "all") {
      setProductSearchResults([]);
      return;
    }

    const results = [];
    const lowerTerm = term.toLowerCase();

    Object.entries(supermarkets).forEach(([storeId, store]) => {
      const matchingProducts = store.products
        .filter(product => {
          const matchesSearch = term.trim() === "" || 
            product.name.toLowerCase().includes(lowerTerm) ||
            product.category.toLowerCase().includes(lowerTerm);
          
          const matchesCategory = category === "all" || 
            product.category === category;
            
          return matchesSearch && matchesCategory;
        })
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

  // Search products within current store with category filter
  useEffect(() => {
    if (storeData && searchMode === 'store') {
      let results = storeData.products;
      
      if (searchTerm) {
        results = results.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedCategory !== "all") {
        results = results.filter(product => 
          product.category === selectedCategory
        );
      }
      
      setFilteredProducts(results);
    } else if (storeData && searchMode === 'store') {
      setFilteredProducts(storeData.products);
    }
  }, [searchTerm, storeData, searchMode, selectedCategory]);

  const handleQRResult = (text) => {
    setScannedId(text);
    setInputId(text);
    findSupermarket(text);
    setSearchMode('store');
    setIsScannerActive(false);
  };

  const findSupermarket = (id) => {
    setIsLoading(true);
    setError("");
    setSearchTerm("");
    setSelectedCategory("all");
    
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
      searchProductAcrossStores(searchTerm, selectedCategory);
    }
  };

  const toggleSearchMode = () => {
    setSearchMode(prev => prev === 'store' ? 'product' : 'store');
    setSearchTerm('');
    setSelectedCategory('all');
    setProductSearchResults([]);
  };

  const toggleScanner = () => {
    setIsScannerActive(!isScannerActive);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Animated Header */}
        <header className="text-center mb-6 md:mb-10 animate-fadeIn">
          <div className="inline-flex items-center justify-center mb-3 p-2 md:p-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
            shelf<span className="text-yellow-300 ">Sense</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            {storeData 
              ? `📍 ${storeData.name}`
              : searchMode === 'product' 
                ? " Search products across all stores"
                : "📱 Scan a store QR code to begin"}
          </p>
        </header>

        {(!storeData || searchMode === 'product') && (
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 max-w-3xl mx-auto mb-6 transition-all duration-300 hover:shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                {searchMode === 'product' 
                  ? "🔍 Search Product Across Stores"
                  : "🏪 Find a Store First"}
              </h2>
              <button
                onClick={toggleSearchMode}
                className="flex items-center px-3 py-2 text-sm md:text-base bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 hover:from-blue-100 hover:to-indigo-100 transition-all shadow-sm w-full sm:w-auto justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                {searchMode === 'product' ? 'Search by Store' : 'Search Products'}
              </button>
            </div>

            {searchMode === 'product' ? (
              <div>
                <form onSubmit={handleProductSearch} className="mb-4 md:mb-6">
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Search products across all stores (e.g. 'milk', 'bread')"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        searchProductAcrossStores(e.target.value, selectedCategory);
                      }}
                      className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm hover:shadow-md"
                    />
                    <div className="absolute left-3 top-2.5 md:top-3 text-indigo-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        searchProductAcrossStores(searchTerm, e.target.value);
                      }}
                      className="flex-1 px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm"
                    >
                      <option value="all">All Categories</option>
                      {availableCategories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setProductSearchResults([]);
                      }}
                      className="px-3 py-2 md:px-4 md:py-3 text-sm md:text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset
                    </button>
                  </div>
                </form>

                {productSearchResults.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800">
                      Found {productSearchResults.length} {productSearchResults.length === 1 ? 'product' : 'products'} in {new Set(productSearchResults.map(p => p.storeId)).size} stores
                      {selectedCategory !== 'all' && ` (Filtered by: ${selectedCategory})`}
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                      {productSearchResults.map((product, index) => (
                        <div key={index} className="p-3 md:p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 group">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-base md:text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">{product.name}</h4>
                              <p className="text-sm text-gray-600 mb-2">Category: {product.category}</p>
                              <div className="flex items-center text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm md:text-base font-medium">{product.storeName}</span>
                              </div>
                            </div>
                            <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs md:text-sm font-medium whitespace-nowrap">
                              Aisle {product.aisle || 'N/A'}, Row {product.row}
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setInputId(product.storeId);
                              findSupermarket(product.storeId);
                              setSearchMode('store');
                            }}
                            className="mt-2 text-xs md:text-sm text-indigo-600 hover:text-indigo-800 flex items-center group-hover:underline"
                          >
                            View all products in {product.storeName}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : searchTerm || selectedCategory !== 'all' ? (
                  <div className="text-center py-6 md:py-8">
                    <div className="inline-flex items-center justify-center p-3 md:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-3 md:mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="mt-2 text-base md:text-lg font-medium text-gray-700">No products found</h4>
                    <p className="mt-1 text-sm md:text-base text-gray-500">
                      {selectedCategory !== 'all' 
                        ? `No products match your search in the ${selectedCategory} category`
                        : "Try a different search term"}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8">
                    <div className="inline-flex items-center justify-center p-3 md:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-3 md:mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h4 className="mt-2 text-base md:text-lg font-medium text-gray-700">Search for products</h4>
                    <p className="mt-1 text-sm md:text-base text-gray-500">Enter a product name or select a category to find which stores carry it</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="flex-1">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 md:p-6 mb-4 md:mb-6 text-white">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-lg md:text-xl font-semibold flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 22V12h6v10" />
                        </svg>
                        Scan Supermarket QR Code
                      </h2>
                      <button 
                        onClick={toggleScanner}
                        className="text-xs md:text-sm bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full flex items-center transition"
                      >
                        {isScannerActive ? 'Hide Scanner' : 'Show Scanner'}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isScannerActive ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
                        </svg>
                      </button>
                    </div>
                    <p className="text-blue-100 text-sm md:text-base mb-3 md:mb-4">Point your camera at the store's QR code to locate products</p>
                    {isScannerActive && (
                      <div className="mb-4 md:mb-6">
                        <QRScanner onResult={handleQRResult} />
                      </div>
                    )}
                    <div className="flex items-center text-blue-100 text-xs md:text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Make sure the QR code is clearly visible in the frame</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Enter Supermarket ID
                    </h2>
                    <form onSubmit={handleInputSearch} className="space-y-3 md:space-y-4">
                      <input
                        type="text"
                        placeholder="e.g. SM-12345"
                        value={inputId}
                        onChange={(e) => setInputId(e.target.value)}
                        className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm"
                      />
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2 md:py-3 px-4 rounded-lg font-medium text-white transition-all ${isLoading ? 'bg-indigo-400' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'} shadow-md hover:shadow-lg flex items-center justify-center`}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Searching...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                            Find Supermarket
                          </>
                        )}
                      </button>
                    </form>
                    {error && (
                      <div className="mt-3 p-2 md:p-3 bg-red-50 text-red-700 rounded-lg flex items-start border border-red-100 text-sm md:text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {storeData && searchMode === 'store' && (
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 max-w-6xl mx-auto animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3">
              <div className="mb-3 md:mb-0">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-1 md:p-2 rounded-lg mr-3 md:mr-4 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">{storeData.name}</h2>
                    <p className="text-sm md:text-base text-gray-600">Store ID: <span className="font-mono bg-blue-50 px-2 py-0.5 md:px-2 md:py-1 rounded text-blue-700">{scannedId}</span></p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={toggleSearchMode}
                  className="flex items-center px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 hover:from-blue-100 hover:to-indigo-100 transition-all shadow-sm flex-1 md:flex-none justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search All
                </button>
                <button
                  onClick={() => {
                    setStoreData(null);
                    setScannedId("");
                    setInputId("");
                    setError("");
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="flex items-center px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm flex-1 md:flex-none justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  New Store
                </button>
              </div>
            </div>

            <div className="mb-6 md:mb-8">
              <form onSubmit={handleProductSearch} className="max-w-2xl mx-auto">
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Search products in this store (e.g. 'milk', 'bread')"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm hover:shadow-md"
                  />
                  <div className="absolute left-3 top-2 md:top-3 text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2 md:top-3 text-gray-400 hover:text-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm"
                  >
                    <option value="all">All Categories</option>
                    {availableCategories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="px-3 py-2 md:px-4 md:py-3 text-sm md:text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                  </button>
                </div>
              </form>
            </div>

            <div className="mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 md:mb-4 gap-2">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {searchTerm || selectedCategory !== 'all' ? "Search Results" : "All Products"}
                  {selectedCategory !== 'all' && (
                    <span className="ml-2 text-xs md:text-sm font-medium bg-indigo-100 text-indigo-800 px-2 py-0.5 md:px-2 md:py-1 rounded-full">
                      {selectedCategory}
                    </span>
                  )}
                </h3>
                <span className="text-xs md:text-sm font-medium bg-indigo-100 text-indigo-800 px-2 py-0.5 md:px-3 md:py-1 rounded-full">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
                </span>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <div className="inline-flex items-center justify-center p-3 md:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-3 md:mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="mt-2 text-base md:text-lg font-medium text-gray-700">No products found</h4>
                  <p className="mt-1 text-sm md:text-base text-gray-500">
                    {selectedCategory !== 'all' 
                      ? `No products match your search in the ${selectedCategory} category`
                      : "Try a different search term"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {filteredProducts.map((p, i) => (
                    <div
                      key={i}
                      className="p-3 md:p-4 border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-bl-lg">
                        #{i+1}
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors mb-1 pr-6">{p.name}</h3>
                      <div className="flex items-center text-gray-600 text-xs md:text-sm mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mr-1 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span>Category: {p.category}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-xs md:text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mr-1 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span>Row: <span className="font-semibold">{p.row}</span></span>
                      </div>
                      {p.aisle && (
                        <div className="flex items-center text-gray-600 text-xs md:text-sm mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mr-1 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                          <span>Aisle: <span className="font-semibold">{p.aisle}</span></span>
                        </div>
                      )}
                      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</span>
                        <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="mt-8 md:mt-12 text-center text-gray-500 text-xs md:text-sm pb-4 md:pb-6">
        <p>© {new Date().getFullYear()} ShelfSense - Find products faster</p>
      </footer>

      {/* Add some global styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default App;