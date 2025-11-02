import React, { useEffect } from 'react';
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
// 1. Import the useTheme hook
import { useTheme } from '../context/ThemeContext.jsx';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// 2. Define our light and dark mode colors
const lightModeColor = '#6B7280'; // Tailwind's text-gray-500
const darkModeColor = '#9CA3AF';  // Tailwind's text-gray-400

function MonthlyRevenueChart({ chartData, timeframe }) {
    // 3. Get the current theme
    const { theme } = useTheme();

    // 4. This automatically sets the default text color for the whole chart
    useEffect(() => {
        ChartJS.defaults.color = theme === 'dark' ? darkModeColor : lightModeColor;
    }, [theme]);

    const dynamicTitle = timeframe === '1Y'
        ? 'Revenue from New Members (Last 12 Months)'
        : 'Revenue from New Members (Last 6 Months)';

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                // We can also set colors explicitly
                labels: {
                    color: theme === 'dark' ? darkModeColor : lightModeColor,
                }
            },
            title: {
                display: true,
                text: dynamicTitle,
                font: {
                    size: 20,
                },
                color: theme === 'dark' ? darkModeColor : lightModeColor,
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value) {
                        return '$' + value;
                    },
                    color: theme === 'dark' ? darkModeColor : lightModeColor,
                },
                // 5. Set the grid line colors
                grid: {
                    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                }
            },
            x: {
                ticks: {
                    color: theme === 'dark' ? darkModeColor : lightModeColor,
                },
                grid: {
                    display: false, // Hiding the X-axis grid lines often looks cleaner
                }
            }
        }
    };

    return (
        // You might need to adjust the height for your layout
        <div style={{ height: '400px' }}>
            <Line options={options} data={chartData} />
        </div>
    );
}

export default MonthlyRevenueChart;