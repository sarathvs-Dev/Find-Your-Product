import React from "react";

const CategoryList = ({ products, onSelect }) => {
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="flex flex-wrap gap-2 justify-center p-4">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryList;
