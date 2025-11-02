import React from 'react';

// 'timeframes' is an array like ['6M', '1Y']
// 'active' is the one that's currently selected
// 'onChange' is the function to call when a button is clicked
function TimeframeSwitcher({ timeframes, active, onChange }) {

    const getButtonClass = (time) => {
        return time === active
            ? 'rounded-md bg-blue-600 px-3 py-1 text-sm font-semibold text-white' // Active
            : 'rounded-md bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-300'; // Inactive
    };

    return (
        <div className="flex gap-2">
            {timeframes.map((time) => (
                <button
                    key={time}
                    onClick={() => onChange(time)}
                    className={getButtonClass(time)}
                >
                    {time}
                </button>
            ))}
        </div>
    );
}

export default TimeframeSwitcher;