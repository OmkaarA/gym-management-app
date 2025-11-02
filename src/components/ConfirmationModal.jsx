import React from 'react';
// import Lottie from 'lottie-react'; // We don't need Lottie for this component anymore
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. NEW: SVG Warning Icon ---
const WarningIcon = () => (
    <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
    </svg>
);
// --- End of new SVG ---

function ConfirmationModal({ isOpen, onCancel, onConfirm, title, confirmText, children }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">

                            {/* --- 2. Replace Lottie with the SVG --- */}
                            <div className="w-24 h-24 flex items-center justify-center">
                                <WarningIcon />
                            </div>

                            <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                {title}
                            </h2>

                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                {children}
                            </p>

                            <div className="mt-6 flex w-full gap-3">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ConfirmationModal;