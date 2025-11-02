// Page to manage membership renewals
import React, { useState, useEffect } from 'react';

function RenewalsPage() {
    // --- State for base data ---
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);

    // --- State for our calculated list ---
    const [pendingRenewals, setPendingRenewals] = useState([]);

    // --- State for the "Change Plan" modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [modalName, setModalName] = useState("");
    const [modalEmail, setModalEmail] = useState("");
    const [modalPlan, setModalPlan] = useState("");

    // --- EFFECT 1: Load all data on mount ---
    useEffect(() => {
        const storedMembers = JSON.parse(localStorage.getItem('gymMembers')) || [];
        const storedPlans = JSON.parse(localStorage.getItem('gymPlans')) || [];
        setMembers(storedMembers);
        setPlans(storedPlans);
    }, []); // Runs once on mount

    // --- EFFECT 2: Calculate pending renewals whenever data changes ---
    useEffect(() => {
        // Wait until members and plans are loaded
        if (members.length > 0 && plans.length > 0) {
            const durationMap = new Map(plans.map(p => [p.name, p.duration]));
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to start of day

            const renewals = members
                .map(member => {
                    const durationInDays = durationMap.get(member.plan);
                    if (!durationInDays) return null;

                    const joinDate = new Date(member.joinDate);
                    const expiryDate = new Date(joinDate);
                    expiryDate.setDate(joinDate.getDate() + durationInDays);

                    return { ...member, expiryDate };
                })
                .filter(member => {
                    // Filter for members who exist AND whose expiry date is in the past
                    return member && member.expiryDate < today;
                })
                .sort((a, b) => a.expiryDate - b.expiryDate); // Show oldest expired first

            setPendingRenewals(renewals);
        }
    }, [members, plans]); // Re-run when data changes


    // --- ACTION 1: Renew a member's current plan ---
    const handleRenewMember = (memberToRenew) => {
        if (window.confirm(`Renew ${memberToRenew.name}'s plan (${memberToRenew.plan}) for another term?`)) {
            const todayISO = new Date().toISOString();

            const updatedMembers = members.map(m =>
                m.id === memberToRenew.id
                    ? { ...m, joinDate: todayISO } // Reset the join date to today
                    : m
            );

            setMembers(updatedMembers);
            localStorage.setItem('gymMembers', JSON.stringify(updatedMembers));
            // The useEffect hook will automatically remove them from the renewals list
        }
    };

    // --- ACTION 2: Delete a member (End Tenure) ---
    const handleDeleteMember = (idToDelete) => {
        if (window.confirm("Are you sure you want to permanently delete this member?")) {
            const updatedMembers = members.filter(m => m.id !== idToDelete);
            setMembers(updatedMembers);
            localStorage.setItem('gymMembers', JSON.stringify(updatedMembers));
        }
    };

    // --- ACTION 3: Change Plan (Modal Logic) ---

    // Open modal (same as MembersPage)
    const handleOpenModal = (member) => {
        setEditingMember(member);
        setModalName(member.name);
        setModalEmail(member.email);
        setModalPlan(member.plan);
        setIsModalOpen(true);
    };

    // Close modal (same as MembersPage)
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMember(null);
    };

    // Save changes from modal
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
                    joinDate: todayISO, // Also reset their join date
                };
            }
            return member;
        });

        setMembers(updatedMembers);
        localStorage.setItem('gymMembers', JSON.stringify(updatedMembers));
        handleCloseModal();
    };


    return (
        <div className="p-6 bg-gray-100 min-h-screen space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">Manage Renewals</h1>

            {/* --- Main Content Card --- */}
            <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    Pending Renewals ({pendingRenewals.length})
                </h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Expired Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Expiry Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {pendingRenewals.length > 0 ? (
                                pendingRenewals.map((member) => (
                                    <tr key={member.id}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{member.name}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{member.email}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{member.plan}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-600">
                                            {member.expiryDate.toLocaleDateString()}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleRenewMember(member)}
                                                className="rounded-md bg-green-100 px-3 py-1 text-green-700 hover:bg-green-200"
                                            >
                                                Renew
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(member)}
                                                className="rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200"
                                            >
                                                Change Plan
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMember(member.id)}
                                                className="rounded-md bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No renewals are due.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- "Change Plan" Modal (Copied from MembersPage) --- */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={handleCloseModal}
                >
                    <div
                        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-4 text-2xl font-semibold">Change Plan</h2>
                        <p className="mb-4 text-sm text-gray-600">You are updating {editingMember?.name}. This will also reset their membership start date to today.</p>
                        <form onSubmit={handleUpdateMember} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={modalName}
                                    onChange={(e) => setModalName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={modalEmail}
                                    onChange={(e) => setModalEmail(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Membership Plan</label>
                                <select
                                    value={modalPlan}
                                    onChange={(e) => setModalPlan(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {plans.map(plan => (
                                        <option key={plan.id} value={plan.name}>
                                            {plan.name} (${plan.price})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
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
                                    Save and Renew
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RenewalsPage;