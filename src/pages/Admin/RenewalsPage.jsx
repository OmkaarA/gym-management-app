import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
// 1. Import all the modals
import ConfirmationModal from '../../components/ConfirmationModal.jsx';
import SuccessModal from '../../components/SuccessModal.jsx';

function RenewalsPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [pendingRenewals, setPendingRenewals] = useState([]);

    // Edit Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [modalName, setModalName] = useState("");
    const [modalEmail, setModalEmail] = useState("");
    const [modalPlan, setModalPlan] = useState("");

    // --- 2. Add state for new modals ---
    const [confirmModalState, setConfirmModalState] = useState({
        isOpen: false,
        action: null, // 'renew' or 'delete'
        member: null,
    });
    const [showSuccess, setShowSuccess] = useState(false);

    // Load data
    useEffect(() => {
        const storedMembers = JSON.parse(localStorage.getItem('gymMembers')) || [];
        const storedPlans = JSON.parse(localStorage.getItem('gymPlans')) || [];
        setMembers(storedMembers);
        setPlans(storedPlans);
        if (storedPlans.length > 0) {
            setModalPlan(storedPlans[0].name);
        }
    }, []);

    // Calculate renewals
    useEffect(() => {
        if (members.length > 0 && plans.length > 0) {
            const durationMap = new Map(plans.map(p => [p.name, p.duration]));
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const renewals = members
                .map(member => {
                    const durationInDays = durationMap.get(member.plan);
                    if (!durationInDays || member.planStatus !== 'Active') return null; // Only check active members

                    const joinDate = new Date(member.joinDate);
                    const expiryDate = new Date(joinDate);
                    expiryDate.setDate(joinDate.getDate() + durationInDays);

                    return { ...member, expiryDate };
                })
                .filter(member => member && member.expiryDate < today) // Find expired
                .sort((a, b) => a.expiryDate - b.expiryDate);

            setPendingRenewals(renewals);
        }
    }, [members, plans]);

    // Timer for success modal
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    // --- 3. Update Action Handlers ---

    // Generic function to open the confirmation modal
    const openConfirm = (action, member) => {
        setConfirmModalState({ isOpen: true, action, member });
    };

    const closeConfirm = () => {
        setConfirmModalState({ isOpen: false, action: null, member: null });
    };

    // This runs when the "Confirm" button is clicked
    const handleConfirmAction = () => {
        const { action, member } = confirmModalState;
        if (!member) return;

        if (action === 'renew') {
            const todayISO = new Date().toISOString();
            const updatedMembers = members.map(m =>
                m.id === member.id
                    ? { ...m, joinDate: todayISO } // Reset join date
                    : m
            );
            setMembers(updatedMembers);
            localStorage.setItem('gymMembers', JSON.stringify(updatedMembers));
            setShowSuccess(true); // Show success popup
        }

        if (action === 'delete') {
            // Delete from gymMembers
            const updatedMembers = members.filter(m => m.id !== member.id);
            setMembers(updatedMembers);
            localStorage.setItem('gymMembers', JSON.stringify(updatedMembers));

            // Delete from users
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const updatedUsers = users.filter(u => u.id !== member.id);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
        }

        closeConfirm(); // Close the confirmation modal
    };

    // --- Edit Modal Handlers (no change) ---
    const handleOpenEditModal = (member) => {
        setEditingMember(member);
        setModalName(member.name);
        setModalEmail(member.email);
        setModalPlan(member.plan);
        setIsEditModalOpen(true);
    };
    const handleCloseEditModal = () => setIsEditModalOpen(false);

    const handleUpdateMember = (event) => {
        event.preventDefault();
        const todayISO = new Date().toISOString();
        const updatedMembers = members.map(member => {
            if (member.id === editingMember.id) {
                return {
                    ...member,
                    name: modalName,
                    email: modalEmail,
                    plan: modalPlan,
                    joinDate: todayISO, // Reset join date on plan change
                    planStatus: 'Active' // Ensure they are active
                };
            }
            return member;
        });
        setMembers(updatedMembers);
        localStorage.setItem('gymMembers', JSON.stringify(updatedMembers));
        handleCloseEditModal();
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
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Manage Renewals</h1>

            {/* --- Main Content Card --- */}
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Pending Renewals ({pendingRenewals.length})
                </h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Expired Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Expiry Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800 dark:divide-gray-700">
                            {pendingRenewals.length > 0 ? (
                                pendingRenewals.map((member) => (
                                    <tr key={member.id}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{member.name}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{member.email}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{member.plan}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-600 dark:text-red-500">
                                            {member.expiryDate.toLocaleDateString()}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                onClick={() => openConfirm('renew', member)}
                                                className="rounded-md bg-green-100 px-3 py-1 text-green-700 hover:bg-green-200 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700"
                                            >
                                                Renew
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                onClick={() => handleOpenEditModal(member)}
                                                className="rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700"
                                            >
                                                Change Plan
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                onClick={() => openConfirm('delete', member)}
                                                className="rounded-md bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700"
                                            >
                                                Delete
                                            </motion.button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No renewals are due.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- "Change Plan" Modal (Edit Modal) --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={handleCloseEditModal}>
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-4 text-2xl font-semibold dark:text-white">Change Plan & Renew</h2>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">This will change {editingMember?.name}'s plan and set their new start date to today.</p>
                        <form onSubmit={handleUpdateMember} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                <input
                                    type="text" value={modalName}
                                    onChange={(e) => setModalName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input
                                    type="email" value={modalEmail}
                                    onChange={(e) => setModalEmail(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            {/* Plan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Membership Plan</label>
                                <select
                                    value={modalPlan}
                                    onChange={(e) => setModalPlan(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    {plans.map(plan => (
                                        <option key={plan.id} value={plan.name}>
                                            {plan.name} (${plan.price})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Buttons */}
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={handleCloseEditModal} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600">
                                    Cancel
                                </button>
                                <button type="submit" className="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                                    Save and Renew
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Other Modals --- */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <SuccessModal message="Member Renewed!" />
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={confirmModalState.isOpen}
                onCancel={closeConfirm}
                onConfirm={handleConfirmAction}
                title={confirmModalState.action === 'renew' ? "Renew Member?" : "Delete Member?"}
                confirmText={confirmModalState.action === 'renew' ? "Renew" : "Delete"}
            >
                {confirmModalState.action === 'renew' && (
                    `Are you sure you want to renew ${confirmModalState.member?.name}'s plan? Their new term will start today.`
                )}
                {confirmModalState.action === 'delete' && (
                    `Are you sure you want to delete ${confirmModalState.member?.name}? This will also delete their login account.`
                )}
            </ConfirmationModal>
        </div>
    );
}

export default RenewalsPage;