// components/AisleMap.jsx
import React from 'react';

const aisles = ['1', '2', '3', '4', '5', '6'];

const AisleMap = ({ highlightedAisle }) => {
  return (
    <div className="flex justify-center gap-4 p-4">
      {aisles.map((aisle) => (
        <div
          key={aisle}
          className={`w-16 h-24 border rounded flex items-center justify-center cursor-pointer ${
            aisle === highlightedAisle ? 'bg-yellow-300 font-bold' : 'bg-gray-100'
          }`}
        >
          Aisle {aisle}
        </div>
      ))}
    </div>
  );
};

export default AisleMap;
