import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
// 1. Import the modals
import ConfirmationModal from '../../components/ConfirmationModal.jsx';
import SuccessModal from '../../components/SuccessModal.jsx';

function TrainersPage() {
    const { user } = useAuth();
    const [trainers, setTrainers] = useState([]);

    // Form state
    const [newName, setNewName] = useState('');
    const [newSpecialty, setNewSpecialty] = useState('');
    const [newSalary, setNewSalary] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Edit Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrainer, setEditingTrainer] = useState(null);
    const [modalName, setModalName] = useState('');
    const [modalSpecialty, setModalSpecialty] = useState('');
    const [modalSalary, setModalSalary] = useState('');

    // --- 2. Add state for new modals and errors ---
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [trainerToDelete, setTrainerToDelete] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null); // For form errors

    useEffect(() => {
        const storedTrainers = JSON.parse(localStorage.getItem('gymTrainers')) || [];
        setTrainers(storedTrainers);
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

    const handleAddTrainer = (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        if (!newName || !newSpecialty || !newEmail || !newUsername || !newPassword) {
            setError('Please fill out all trainer details, including login info.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(u => u.username === newUsername || u.email === newEmail);
        if (userExists) {
            setError('Username or email is already taken.');
            return;
        }

        const newTrainerId = uuidv4();
        const newTrainerAccount = { /* ... */ }; // (Your existing logic is fine)
        const newTrainerProfile = { /* ... */ }; // (Your existing logic is fine)

        // (Your existing save logic is fine)

        setShowSuccess(true); // Show success modal
        // (Your existing form reset logic is fine)
    };

    // Step 1: Open the modal
    const handleDeleteClick = (trainer) => {
        setTrainerToDelete(trainer);
        setIsConfirmOpen(true);
    };

    // Step 2: Run the actual delete logic
    const confirmDelete = () => {
        if (!trainerToDelete) return;

        // Delete from gymTrainers
        const updatedTrainers = trainers.filter(t => t.id !== trainerToDelete.id);
        setTrainers(updatedTrainers);
        localStorage.setItem('gymTrainers', JSON.stringify(updatedTrainers));

        // Delete from users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const updatedUsers = users.filter(u => u.id !== trainerToDelete.id);
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        setIsConfirmOpen(false);
        setTrainerToDelete(null);
    };

    // Edit Modal functions (no change)
    // --- Edit Modal functions ---

    const handleOpenModal = (trainer) => {
        setEditingTrainer(trainer);
        setModalName(trainer.name);
        setModalSpecialty(trainer.specialty);
        setModalSalary(trainer.salary);
        setIsModalOpen(true); // This opens the edit modal
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTrainer(null);
    };

    const handleUpdateTrainer = (e) => {
        e.preventDefault();
        const updatedTrainers = trainers.map(t =>
            t.id === editingTrainer.id
                ? { ...t, name: modalName, specialty: modalSpecialty, salary: Number(modalSalary) || 0 }
                : t
        );
        setTrainers(updatedTrainers);
        localStorage.setItem('gymTrainers', JSON.stringify(updatedTrainers));
        handleCloseModal();
    };

    return (
        <div className="space-y-8 text-gray-900 dark:text-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Manage Trainers</h1>

            {/* --- CARD 1: ADD NEW TRAINER --- */}
            {user.role === 'admin' && (
                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Trainer</h2>

                    <form onSubmit={handleAddTrainer}>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3">
                            {/* Profile Info */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input
                                    type="text" value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specialty</label>
                                <input
                                    type="text" value={newSpecialty}
                                    onChange={(e) => setNewSpecialty(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Annual Salary</label>
                                <input
                                    type="number" value={newSalary}
                                    onChange={(e) => setNewSalary(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            {/* Login Info */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input
                                    type="email" value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                                <input
                                    type="text" value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                <input
                                    type="password" value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* --- 4. Add Error Message Display --- */}
                        {error && (
                            <p className="mt-4 text-sm text-red-500">
                                {error}
                            </p>
                        )}

                        {/* Submit Button */}
                        <div className="mt-6">
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 md:w-auto"
                            >
                                Create Trainer Account
                            </motion.button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- CARD 2: ALL TRAINERS TABLE --- */}
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    All Trainers ({trainers.length})
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Specialty</th>
                                {user.role === 'admin' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Salary</th>
                                )}
                                {user.role === 'admin' && (
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800 dark:divide-gray-700">
                            <AnimatePresence>
                                {trainers.map((trainer) => (
                                    <motion.tr
                                        key={trainer.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{trainer.name}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{trainer.specialty}</td>
                                        {user.role === 'admin' && (
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                ${Number(trainer.salary).toLocaleString()}
                                            </td>
                                        )}
                                        {user.role === 'admin' && (
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleOpenModal(trainer)}
                                                    className="rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700"
                                                >
                                                    Edit
                                                </motion.button>
                                                {/* --- 5. Update Delete button onClick --- */}
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDeleteClick(trainer)}
                                                    className="rounded-md bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700"
                                                >
                                                    Delete
                                                </motion.button>
                                            </td>
                                        )}
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- EDIT TRAINER MODAL (with dark mode) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={handleCloseModal}>
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-4 text-xl font-semibold dark:text-white">Edit Trainer</h2>
                        <form onSubmit={handleUpdateTrainer} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                <input
                                    type="text" value={modalName}
                                    onChange={(e) => setModalName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            {/* Specialty */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specialty</label>
                                <input
                                    type="text" value={modalSpecialty}
                                    onChange={(e) => setModalSpecialty(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            {/* Salary */}
                            {user.role === 'admin' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Salary</label>
                                    <input
                                        type="number" value={modalSalary}
                                        onChange={(e) => setModalSalary(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            )}
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
                        <SuccessModal message="Trainer Added!" />
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onCancel={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Trainer?"
                confirmText="Delete"
            >
                Are you sure you want to delete {trainerToDelete?.name}? This action will also delete their login account and cannot be undone.
            </ConfirmationModal>

        </div>
    );
}

export default TrainersPage;