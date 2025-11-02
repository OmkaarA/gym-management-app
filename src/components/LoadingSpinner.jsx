import React from 'react';
import Lottie from 'lottie-react';
import gymAnimationData from '../assets/gymanim.json'; // Make sure this path is correct

/**
 * A reusable loading spinner component that shows the gym Lottie animation.
 */
function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="w-24 h-24">
                <Lottie animationData={gymAnimationData} loop={true} />
            </div>
            <p className="text-sm font-medium text-gray-500">Loading data...</p>
        </div>
    );
}

export default LoadingSpinner;