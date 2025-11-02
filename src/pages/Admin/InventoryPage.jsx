import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
// 1. Import the modals
import ConfirmationModal from '../../components/ConfirmationModal.jsx';
import SuccessModal from '../../components/SuccessModal.jsx';

// StatusBadge component (with dark mode)
const StatusBadge = ({ status }) => {
    let styles = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    if (status === 'Operational' || status === 'In Stock') {
        styles = 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
    } else if (status === 'Needs Maintenance' || status === 'Low Stock') {
        styles = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
    } else if (status === 'Out') {
        styles = 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>
            {status}
        </span>
    );
};

function InventoryPage() {
    const { user } = useAuth();
    const [inventory, setInventory] = useState([]);

    // Form state
    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState('Equipment');
    const [newQuantity, setNewQuantity] = useState(1);
    const [newStatus, setNewStatus] = useState('Operational');

    // Edit Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalName, setModalName] = useState('');
    const [modalCategory, setModalCategory] = useState('');
    const [modalQuantity, setModalQuantity] = useState(0);
    const [modalStatus, setModalStatus] = useState('');

    // --- 2. Add state for new modals and errors ---
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Pre-defined categories and statuses
    const categories = ['Equipment', 'Supplies', 'For Sale', 'Other'];
    const statuses = ['Operational', 'Needs Maintenance', 'In Stock', 'Low Stock', 'Out'];

    useEffect(() => {
        const storedInventory = JSON.parse(localStorage.getItem('gymInventory')) || [];
        setInventory(storedInventory);
    }, []);

    // Timer effect for the success modal
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    // --- 3. Update Add/Delete functions ---

    const handleAddItem = (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        if (!newName || !newCategory) {
            setError('Please fill out at least Name and Category.');
            return;
        }
        const newItem = {
            id: uuidv4(),
            name: newName,
            category: newCategory,
            quantity: Number(newQuantity),
            status: newStatus,
        };
        const updatedInventory = [...inventory, newItem];
        setInventory(updatedInventory);
        localStorage.setItem('gymInventory', JSON.stringify(updatedInventory));

        setShowSuccess(true); // Show success modal
        setNewName('');
        setNewQuantity(1);
    };

    // Step 1: Open the modal
    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setIsConfirmOpen(true);
    };

    // Step 2: Run the actual delete logic
    const confirmDelete = () => {
        if (!itemToDelete) return;
        const updatedInventory = inventory.filter(item => item.id !== itemToDelete.id);
        setInventory(updatedInventory);
        localStorage.setItem('gymInventory', JSON.stringify(updatedInventory));
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    // Edit Modal functions (no change)
    const handleOpenModal = (item) => {
        setEditingItem(item);
        setModalName(item.name);
        setModalCategory(item.category);
        setModalQuantity(item.quantity);
        setModalStatus(item.status);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => setIsModalOpen(false);
    const handleUpdateItem = (e) => {
        e.preventDefault();
        const updatedInventory = inventory.map(item =>
            item.id === editingItem.id
                ? {
                    ...item,
                    name: modalName,
                    category: modalCategory,
                    quantity: Number(modalQuantity),
                    status: modalStatus,
                }
                : item
        );
        setInventory(updatedInventory);
        localStorage.setItem('gymInventory', JSON.stringify(updatedInventory));
        handleCloseModal();
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
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Inventory Management</h1>

            {/* --- CARD 1: ADD NEW ITEM --- */}
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Item</h2>
                <form onSubmit={handleAddItem} className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
                        <input
                            type="text" value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                        <input
                            type="number" value={newQuantity}
                            onChange={(e) => setNewQuantity(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {statuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                        </select>
                    </div>
                    {/* Submit Button */}
                    <div className="md:self-end">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                            Add Item
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

            {/* --- CARD 2: INVENTORY TABLE --- */}
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Current Inventory ({inventory.length})
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800 dark:divide-gray-700">
                            <AnimatePresence>
                                {inventory.map((item) => (
                                    <motion.tr
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.category}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.quantity}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleOpenModal(item)}
                                                className="rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700"
                                            >
                                                Edit
                                            </motion.button>
                                            {/* --- 5. Update Delete button onClick --- */}
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDeleteClick(item)}
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

            {/* --- EDIT ITEM MODAL (with dark mode) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={handleCloseModal}>
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-4 text-xl font-semibold dark:text-white">Edit Item</h2>
                        <form onSubmit={handleUpdateItem} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
                                <input
                                    type="text" value={modalName}
                                    onChange={(e) => setModalName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                <select
                                    value={modalCategory}
                                    onChange={(e) => setModalCategory(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                                <input
                                    type="number" value={modalQuantity}
                                    onChange={(e) => setModalQuantity(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                <select
                                    value={modalStatus}
                                    onChange={(e) => setModalStatus(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    {statuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                                </select>
                            </div>
                            {/* Buttons */}
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={handleCloseModal} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600">
                                    Cancel
                                </button>
                                <button type="submit" className="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- 6. ADD MODALS (Success & Confirm) --- */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <SuccessModal message="Item Added!" />
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onCancel={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Item?"
                confirmText="Delete"
            >
                Are you sure you want to delete {itemToDelete?.name}? This action cannot be undone.
            </ConfirmationModal>

        </div>
    );
}

export default InventoryPage;