import React from "react";

const ProductCard = ({ product }) => {
  return (
    <div className="border p-4 rounded shadow bg-white">
      <h2 className="text-xl font-semibold">{product.name}</h2>
      <p className="text-gray-700">Aisle: {product.aisle}</p>
      <p className="text-sm text-gray-500">Category: {product.category}</p>
    </div>
  );
};

export default ProductCard;
