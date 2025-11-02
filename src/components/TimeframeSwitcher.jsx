import React from 'react';

function TimeframeSwitcher({ timeframes, active, onChange }) {
    return (
        <div className="flex rounded-md bg-gray-200 p-0.5 dark:bg-gray-700">
            {timeframes.map((frame) => {
                const isActive = active === frame;
                return (
                    <button
                        key={frame}
                        onClick={() => onChange(frame)}
                        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors
              ${isActive
                                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }
            `}
                    >
                        {frame}
                    </button>
                );
            })}
        </div>
    );
}

export default TimeframeSwitcher;