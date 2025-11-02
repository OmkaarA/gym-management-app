import React from 'react';

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md flex items-center justify-between dark:bg-gray-800">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </p>
      </div>
      <div className="flex-shrink-0 rounded-full bg-blue-100 p-3 dark:bg-blue-900">
        <span
          className="h-6 w-6 text-blue-600 dark:text-blue-300"
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

export default StatCard;