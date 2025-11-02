import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion'; // <-- ADD THIS

// A helper component for styling the status badges
const StatusBadge = ({ status }) => {
    let styles = 'bg-gray-100 text-gray-800';
    if (status === 'Operational' || status === 'In Stock') {
        styles = 'bg-green-100 text-green-800';
    } else if (status === 'Needs Maintenance' || status === 'Low Stock') {
        styles = 'bg-yellow-100 text-yellow-800';
    } else if (status === 'Out') {
        styles = 'bg-red-100 text-red-800';
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>
            {status}
        </span>
    );
};

function InventoryPage() {
    const { user } = useAuth(); // Get user role

    // --- State for data ---
    const [inventory, setInventory] = useState([]);

    // --- State for the 'Add Item' form ---
    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState('Equipment'); // Default category
    const [newQuantity, setNewQuantity] = useState(1);
    const [newStatus, setNewStatus] = useState('Operational'); // Default status

    // --- State for the Edit Modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalName, setModalName] = useState('');
    const [modalCategory, setModalCategory] = useState('');
    const [modalQuantity, setModalQuantity] = useState(0);
    const [modalStatus, setModalStatus] = useState('');

    // Pre-defined categories and statuses
    const categories = ['Equipment', 'Supplies', 'For Sale', 'Other'];
    const statuses = ['Operational', 'Needs Maintenance', 'In Stock', 'Low Stock', 'Out'];

    // --- Load data on component mount ---
    useEffect(() => {
        const storedInventory = JSON.parse(localStorage.getItem('gymInventory')) || [];
        setInventory(storedInventory);
    }, []);

    // --- Add a new item ---
    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newName || !newCategory) {
            alert('Please fill out at least Name and Category.');
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

        // Reset form
        setNewName('');
        setNewQuantity(1);
    };

    // --- Delete an item ---
    const handleDeleteItem = (idToDelete) => {
        if (window.confirm('Are you sure you want to delete this inventory item?')) {
            const updatedInventory = inventory.filter(item => item.id !== idToDelete);
            setInventory(updatedInventory);
            localStorage.setItem('gymInventory', JSON.stringify(updatedInventory));
        }
    };

    // --- Modal Open ---
    const handleOpenModal = (item) => {
        setEditingItem(item);
        setModalName(item.name);
        setModalCategory(item.category);
        setModalQuantity(item.quantity);
        setModalStatus(item.status);
        setIsModalOpen(true);
    };

    // --- Modal Close ---
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    // --- Update an item ---
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
            <div className="p-6">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">Inventory Management</h1>

            {/* --- CARD 1: ADD NEW ITEM --- */}
            <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Add New Item</h2>
                <form onSubmit={handleAddItem} className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Item Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input
                            type="number"
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            {statuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                        </select>
                    </div>
                    {/* Submit Button */}
                    <div className="md:self-end">
                        <button
                            type="submit"
                            className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                            Add Item
                        </button>
                    </div>
                </form>
            </div>

            {/* --- CARD 2: INVENTORY TABLE --- */}
            <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    Current Inventory ({inventory.length})
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {/* 1. Wrap the map in AnimatePresence */}
                            <AnimatePresence>
                                {inventory.map((item) => (
                                    // 2. Change <tr> to motion.tr and add props
                                    <motion.tr
                                        key={item.id}
                                        layout // This is what makes the other items slide up
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 3 }} // Makes the fade smoother
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.category}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.quantity}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleOpenModal(item)}
                                                className="rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200"
                                            >
                                                Edit
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="rounded-md bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200"
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

            {/* --- EDIT ITEM MODAL --- */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={handleCloseModal}
                >
                    <div
                        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-4 text-xl font-semibold">Edit Item</h2>
                        <form onSubmit={handleUpdateItem} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                                <input
                                    type="text"
                                    value={modalName}
                                    onChange={(e) => setModalName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    value={modalCategory}
                                    onChange={(e) => setModalCategory(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                <input
                                    type="number"
                                    value={modalQuantity}
                                    onChange={(e) => setModalQuantity(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={modalStatus}
                                    onChange={(e) => setModalStatus(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {statuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                                </select>
                            </div>
                            {/* Buttons */}
                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InventoryPage;