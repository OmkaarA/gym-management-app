import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// 1. Accept the new 'timeframe' prop in the function arguments
function MonthlyRevenueChart({ chartData, timeframe }) {

    // 2. Create a dynamic title based on the prop
    const dynamicTitle = timeframe === '1Y'
        ? 'Revenue from New Members (Last 1 Year)'
        : 'Revenue from New Members (Last 6 Months)';

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Good for responsiveness
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: dynamicTitle, // 3. Use the dynamic title here
                font: {
                    size: 16,
                }
            },
        },
        scales: {
            y: {
                ticks: {
                    // Format the y-axis ticks as dollars
                    callback: function (value, index, ticks) {
                        return '$' + value;
                    }
                }
            }
        }
    };

    // Give the chart a specific height, especially useful in the modal
    return (
        <div style={{ height: '400px' }}>
            <Line options={options} data={chartData} />
        </div>
    );
}

export default MonthlyRevenueChart;