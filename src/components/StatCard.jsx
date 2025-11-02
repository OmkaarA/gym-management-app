// src/components/StatCard.jsx
import React from 'react';

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        {/* We'll just render the icon prop. Later, you can pass an icon component here */}
        <div className="text-4xl text-blue-500">
          {icon} 
        </div>
      </div>
    </div>
  );
}

export default StatCard;