// src/pages/TrainersPage.jsx

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthContext.jsx';

function TrainersPage() {
    const { user } = useAuth();
    const [trainers, setTrainers] = useState([]);

    // --- 1. Add state for new login fields ---
    const [newName, setNewName] = useState('');
    const [newSpecialty, setNewSpecialty] = useState('');
    const [newSalary, setNewSalary] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // --- State for the Edit Modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrainer, setEditingTrainer] = useState(null);
    const [modalName, setModalName] = useState('');
    const [modalSpecialty, setModalSpecialty] = useState('');
    const [modalSalary, setModalSalary] = useState('');

    useEffect(() => {
        const storedTrainers = JSON.parse(localStorage.getItem('gymTrainers')) || [];
        setTrainers(storedTrainers);
    }, []);

    // --- 2. Update handleAddTrainer function ---
    const handleAddTrainer = (e) => {
        e.preventDefault();
        if (!newName || !newSpecialty || !newEmail || !newUsername || !newPassword) {
            alert('Please fill out all trainer details, including login info.');
            return;
        }

        // Load both lists from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const trainerProfiles = JSON.parse(localStorage.getItem('gymTrainers')) || [];

        // Check if username or email is already taken
        const userExists = users.some(u => u.username === newUsername || u.email === newEmail);
        if (userExists) {
            alert('Username or email is already taken.');
            return;
        }

        // --- Create the new data ---
        const newTrainerId = uuidv4(); // Use the same ID for both records

        // 1. Create the login account
        const newTrainerAccount = {
            id: newTrainerId,
            email: newEmail,
            username: newUsername,
            password: newPassword,
            role: 'trainer'
        };

        // 2. Create the public profile
        const newTrainerProfile = {
            id: newTrainerId,
            name: newName,
            specialty: newSpecialty,
            salary: Number(newSalary) || 0
        };

        // --- Save to both lists ---
        const updatedUsers = [...users, newTrainerAccount];
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        const updatedTrainers = [...trainerProfiles, newTrainerProfile];
        setTrainers(updatedTrainers); // Update state
        localStorage.setItem('gymTrainers', JSON.stringify(updatedTrainers));

        // Reset the form
        setNewName('');
        setNewSpecialty('');
        setNewSalary('');
        setNewEmail('');
        setNewUsername('');
        setNewPassword('');
    };

    // --- Delete a trainer (NEEDS TO BE UPDATED) ---
    const handleDeleteTrainer = (idToDelete) => {
        if (window.confirm('Are you sure you want to delete this trainer? This will also delete their login account.')) {
            // 1. Delete from gymTrainers (profile list)
            const updatedTrainers = trainers.filter(t => t.id !== idToDelete);
            setTrainers(updatedTrainers);
            localStorage.setItem('gymTrainers', JSON.stringify(updatedTrainers));

            // 2. Delete from users (login list)
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const updatedUsers = users.filter(u => u.id !== idToDelete);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
        }
    };

    // --- Modal Open ---
    const handleOpenModal = (trainer) => {
        setEditingTrainer(trainer);
        setModalName(trainer.name);
        setModalSpecialty(trainer.specialty);
        setModalSalary(trainer.salary);
        setIsModalOpen(true);
    };

    // --- Modal Close ---
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTrainer(null);
    };

    // --- Update a trainer (Profile only) ---
    const handleUpdateTrainer = (e) => {
        e.preventDefault();
        // This function just updates the *profile*. 
        // We can add password/email updates later if needed.
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
        <div className="p-6 bg-gray-100 min-h-screen space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">Manage Trainers</h1>

            {/* --- CARD 1: ADD NEW TRAINER (FORM UPDATED) --- */}
            {user.role === 'admin' && (
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">Add New Trainer</h2>

                    <form onSubmit={handleAddTrainer}>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3">
                            {/* Profile Info */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text" id="name" value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">Specialty</label>
                                <input
                                    type="text" id="specialty" value={newSpecialty}
                                    onChange={(e) => setNewSpecialty(e.target.value)}
                                    placeholder="e.g., Weightlifting, Yoga"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Annual Salary</label>
                                <input
                                    type="number" id="salary" value={newSalary}
                                    onChange={(e) => setNewSalary(e.target.value)}
                                    placeholder="e.g., 50000"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            {/* Login Info */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email" id="email" value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="trainer@gym.com"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                <input
                                    type="text" id="username" value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="trainer_username"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password" id="password" value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Set a temporary password"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6">
                            <button
                                type="submit"
                                className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 md:w-auto"
                            >
                                Create Trainer Account
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- CARD 2: ALL TRAINERS TABLE (no change) --- */}
            <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    All Trainers ({trainers.length})
                </h2>
                <div className="overflow-x-auto">
                    {/* ... Your existing table ... */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Specialty</th>
                                {user.role === 'admin' && (
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Salary</th>
                                )}
                                {user.role === 'admin' && (
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {trainers.map((trainer) => (
                                <tr key={trainer.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{trainer.name}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{trainer.specialty}</td>
                                    {user.role === 'admin' && (
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            ${Number(trainer.salary).toLocaleString()}
                                        </td>
                                    )}
                                    {user.role === 'admin' && (
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleOpenModal(trainer)}
                                                className="rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTrainer(trainer.id)}
                                                className="rounded-md bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- EDIT TRAINER MODAL (no change) --- */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={handleCloseModal}
                >
                    <div
                        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-4 text-xl font-semibold">Edit Trainer</h2>
                        <form onSubmit={handleUpdateTrainer} className="space-y-4">
                            {/* ... Your existing modal form ... */}
                            <div>
                                <label htmlFor="editName" className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text" id="editName" value={modalName}
                                    onChange={(e) => setModalName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="editSpecialty" className="block text-sm font-medium text-gray-700">Specialty</label>
                                <input
                                    type="text" id="editSpecialty" value={modalSpecialty}
                                    onChange={(e) => setModalSpecialty(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            {user.role === 'admin' && (
                                <div>
                                    <label htmlFor="editSalary" className="block text-sm font-medium text-gray-700">Salary</label>
                                    <input
                                        type="number" id="editSalary" value={modalSalary}
                                        onChange={(e) => setModalSalary(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            )}
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

export default TrainersPage;