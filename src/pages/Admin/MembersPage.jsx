import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
// 1. Import your new modal components
import ConfirmationModal from '../../components/ConfirmationModal.jsx';
import SuccessModal from '../../components/SuccessModal.jsx';

function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);

  // Form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');

  // Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [modalName, setModalName] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalPlan, setModalPlan] = useState("");

  // --- 2. Add state for new modals ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load data
  useEffect(() => {
    const storedMembers = JSON.parse(localStorage.getItem('gymMembers')) || [];
    const storedPlans = JSON.parse(localStorage.getItem('gymPlans')) || [];
    setMembers(storedMembers);
    setPlans(storedPlans);
    if (storedPlans.length > 0) {
      const defaultPlanName = storedPlans[0].name;
      setSelectedPlan(defaultPlanName);
      setModalPlan(defaultPlanName);
    }
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

  // Derived state (no change)
  const membersWithExpiry = useMemo(() => {
    // ... (logic is unchanged)
    if (!plans.length) return members;
    const durationMap = new Map(plans.map(p => [p.name, p.duration]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return members.map(member => {
      const durationInDays = durationMap.get(member.plan);
      let expiryDate = null;
      let isExpired = false;
      if (member.planStatus === 'Active' && durationInDays) {
        const joinDate = new Date(member.joinDate);
        expiryDate = new Date(joinDate);
        expiryDate.setDate(joinDate.getDate() + durationInDays);
        isExpired = expiryDate < today;
      }
      return { ...member, expiryDate, isExpired };
    });
  }, [members, plans]);

  // --- 3. Update Add/Delete functions ---

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !selectedPlan) {
      // We can create an error state here later
      alert('Please fill out all fields.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(u => u.email === newEmail);
    if (userExists) {
      alert('A user with this email already exists.');
      return;
    }

    const newMemberId = uuidv4();
    const newMemberProfile = {
      id: newMemberId,
      name: newName,
      email: newEmail,
      plan: selectedPlan,
      joinDate: new Date().toISOString(),
      planStatus: 'Active'
    };

    const newUserAccount = {
      id: newMemberId,
      email: newEmail,
      username: newEmail,
      password: 'password123',
      role: 'member'
    };

    localStorage.setItem('users', JSON.stringify([...users, newUserAccount]));

    const updatedMembers = [...members, newMemberProfile];
    setMembers(updatedMembers);
    localStorage.setItem('gymMembers', JSON.stringify(updatedMembers));

    setShowSuccess(true); // <-- Show success modal
    setNewName('');
    setNewEmail('');
  };

  // Step 1: Open the modal
  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setIsConfirmOpen(true);
  };

  // Step 2: Run the actual delete logic on confirm
  const confirmDelete = () => {
    if (!memberToDelete) return;

    // Delete from gymMembers
    const updatedMembers = members.filter(m => m.id !== memberToDelete.id);
    setMembers(updatedMembers);
    localStorage.setItem('gymMembers', JSON.stringify(updatedMembers));

    // Delete from users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.filter(u => u.id !== memberToDelete.id);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Close modal
    setIsConfirmOpen(false);
    setMemberToDelete(null);
  };

  // Approve plan (no change)
  const handleApprovePlan = (memberId) => {
    // ... (logic is unchanged)
    if (window.confirm("Are you sure you want to approve this member's plan? This will set their start date to today.")) {
      const todayISO = new Date().toISOString();
      const updatedMembers = members.map(m =>
        m.id === memberId
          ? { ...m, planStatus: 'Active', joinDate: todayISO }
          : m
      );
      setMembers(updatedMembers);
      localStorage.setItem('gymMembers', JSON.stringify(updatedMembers));
    }
  };

  // --- Modal Logic (for Edit) ---
  const handleOpenModal = (member) => {
    setEditingMember(member);
    setModalName(member.name);
    setModalEmail(member.email);
    setModalPlan(member.plan);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleUpdateMember = (e) => {
    e.preventDefault();
    const updatedMembers = members.map(m =>
      m.id === editingMember.id
        ? { ...m, name: modalName, email: modalEmail, plan: modalPlan }
        : m
    );
    setMembers(updatedMembers);
    localStorage.setItem('gymMembers', JSON.stringify(updatedMembers));
    handleCloseModal();
  };

  return (
    // --- 4. Add Dark Mode classes to the page ---
    <div className="space-y-8 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Manage Members</h1>

      {/* --- CARD 1: ADD NEW MEMBER --- */}
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Member</h2>
        <form onSubmit={handleAddMember} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text" value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email" value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Membership Plan</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {plans.map(p => <option key={p.id} value={p.name}>{p.name} (${p.price})</option>)}
            </select>
          </div>
          {/* Button */}
          <div className="md:self-end">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Add & Activate Member
            </motion.button>
          </div>
        </form>
      </div>

      {/* --- CARD 2: ALL MEMBERS TABLE --- */}
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          All Members ({members.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Expiry Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800 dark:divide-gray-700">
              <AnimatePresence>
                {membersWithExpiry.map((member) => (
                  <motion.tr
                    key={member.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{member.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{member.email}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{member.plan}</td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      {member.planStatus === 'Active' && <span className="text-green-600 dark:text-green-500">Active</span>}
                      {member.planStatus === 'PendingApproval' && <span className="text-yellow-600 dark:text-yellow-500">Pending</span>}
                      {member.planStatus === 'Inactive' && <span className="text-gray-500 dark:text-gray-400">Inactive</span>}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {member.planStatus === 'Active' ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {member.expiryDate ? (
                        <span className={member.isExpired ? 'font-medium text-red-600 dark:text-red-500' : 'text-gray-500 dark:text-gray-400'}>
                          {member.expiryDate.toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                      {member.planStatus === 'PendingApproval' ? (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleApprovePlan(member.id)}
                          className="rounded-md bg-green-100 px-3 py-1 text-green-700 hover:bg-green-200 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700"
                        >
                          Approve
                        </motion.button>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleOpenModal(member)}
                            className="rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700"
                          >
                            Edit
                          </motion.button>
                          {/* 5. Update Delete button onClick */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteClick(member)}
                            className="rounded-md bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700"
                          >
                            Delete
                          </motion.button>
                        </>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EDIT MODAL (with dark mode) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={handleCloseModal}>
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-xl font-semibold dark:text-white">Edit Member</h2>
            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text" value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email" value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Membership Plan</label>
                <select
                  value={modalPlan}
                  onChange={(e) => setModalPlan(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {plans.map(p => <option key={p.id} value={p.name}>{p.name} (${p.price})</option>)}
                </select>
              </div>
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
            <SuccessModal message="Member Added!" />
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Member?"
        confirmText="Delete"
      >
        Are you sure you want to delete {memberToDelete?.name}? This action will also delete their login account and cannot be undone.
      </ConfirmationModal>

    </div>
  );
}

export default MembersPage;