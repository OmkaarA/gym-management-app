import React from 'react';
import Lottie from 'lottie-react';
import successAnimationData from '../assets/success.json'; // Check this path

/**
 * A modal that shows a success animation and a message.
 * @param {string} message - The message to display below the animation.
 */
function SuccessModal({ message }) {
    return (
        // Full-screen overlay
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="rounded-lg bg-white p-6 shadow-xl text-center">
                <div className="w-32 h-32 mx-auto">
                    <Lottie
                        animationData={successAnimationData}
                        loop={false} // We only want it to play once
                    />
                </div>
                <p className="mt-4 text-lg font-semibold text-gray-700">
                    {message}
                </p>
            </div>
        </div>
    );
}

export default SuccessModal;