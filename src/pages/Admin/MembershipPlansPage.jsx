import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
// 1. Import modals
import ConfirmationModal from '../../components/ConfirmationModal.jsx';
import SuccessModal from '../../components/SuccessModal.jsx';

function MembershipPlansPage() {
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);

    // Form state
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newDuration, setNewDuration] = useState('');

    // --- 2. Add state for modals and errors ---
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Load data
    useEffect(() => {
        const storedPlans = JSON.parse(localStorage.getItem('gymPlans')) || [];
        setPlans(storedPlans);
    }, []);

    // Timer for success modal
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    // --- 3. Update Add/Delete functions ---

    const handleAddPlan = (e) => {
        e.preventDefault();
        setError(null);
        if (!newName || !newPrice || !newDuration) {
            setError('Please fill out all fields.');
            return;
        }

        const newPlan = {
            id: uuidv4(),
            name: newName,
            price: Number(newPrice),
            duration: Number(newDuration),
        };

        const updatedPlans = [...plans, newPlan];
        setPlans(updatedPlans);
        localStorage.setItem('gymPlans', JSON.stringify(updatedPlans));

        setShowSuccess(true); // Show success
        setNewName('');
        setNewPrice('');
        setNewDuration('');
    };

    // Step 1: Open confirm modal
    const handleDeleteClick = (plan) => {
        setPlanToDelete(plan);
        setIsConfirmOpen(true);
    };

    // Step 2: Run delete logic
    const confirmDelete = () => {
        if (!planToDelete) return;
        const updatedPlans = plans.filter(p => p.id !== planToDelete.id);
        setPlans(updatedPlans);
        localStorage.setItem('gymPlans', JSON.stringify(updatedPlans));
        setIsConfirmOpen(false);
        setPlanToDelete(null);
    };

    // Only render for admins
    if (user.role !== 'admin') {
        return (
            <div className="p-6 dark:bg-gray-900">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="dark:text-gray-100">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 text-gray-900 dark:text-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Membership Plans</h1>

            {/* --- CARD 1: ADD NEW PLAN --- */}
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Plan</h2>
                <form onSubmit={handleAddPlan} className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plan Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g., 1 Month"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
                        <input
                            type="number"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            placeholder="e.g., 50"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (in days)</label>
                        <input
                            type="number"
                            value={newDuration}
                            onChange={(e) => setNewDuration(e.target.value)}
                            placeholder="e.g., 30"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    {/* Submit Button */}
                    <div className="md:self-end">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                            Add Plan
                        </motion.button>
                    </div>
                </form>
                {/* --- 4. Add Error Message Display --- */}
                {error && (
                    <p className="mt-4 text-sm text-red-500">
                        {error}
                    </p>
                )}
            </div>

            {/* --- CARD 2: ALL PLANS TABLE --- */}
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Available Plans ({plans.length})
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Plan Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Duration</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800 dark:divide-gray-700">
                            <AnimatePresence>
                                {plans.map((plan) => (
                                    <motion.tr
                                        key={plan.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{plan.name}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${plan.price}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{plan.duration} days</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                                            {/* Note: We can add an "Edit" modal here later if needed */}
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDeleteClick(plan)}
                                                className="rounded-md bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700"
                                            >
                                                Delete
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- 5. ADD MODALS (Success & Confirm) --- */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <SuccessModal message="Plan Added!" />
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onCancel={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Plan?"
                confirmText="Delete"
            >
                Are you sure you want to delete the {planToDelete?.name} plan? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
}

export default MembershipPlansPage;