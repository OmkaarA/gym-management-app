// src/pages/MembersPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthContext.jsx'; // 1. Import useAuth

function MembersPage() {
  const { user } = useAuth(); // 2. Get the user
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);

  // Form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [modalName, setModalName] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalPlan, setModalPlan] = useState("");

  // Load data
  useEffect(() => {
    const storedMembers = JSON.parse(localStorage.getItem('gymMembers')) || [];
    const storedPlans = JSON.parse(localStorage.getItem('gymPlans')) || [];
    setMembers(storedMembers);
    setPlans(storedPlans);
    if (storedPlans.length > 0) {
      setSelectedPlan(storedPlans[0].name);
      setModalPlan(storedPlans[0].name); // Also set for modal
    }
  }, []);

  // --- 3. Update membersWithExpiry to include planStatus ---
  const membersWithExpiry = useMemo(() => {
    if (!plans.length) return members;

    const durationMap = new Map(plans.map(p => [p.name, p.duration]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return members.map(member => {
      const durationInDays = durationMap.get(member.plan);
      let expiryDate = null;
      let isExpired = false;

      // Only calculate expiry if the plan is active and has a duration
      if (member.planStatus === 'Active' && durationInDays) {
        const joinDate = new Date(member.joinDate);
        expiryDate = new Date(joinDate);
        expiryDate.setDate(joinDate.getDate() + durationInDays);
        isExpired = expiryDate < today;
      }

      return { ...member, expiryDate, isExpired };
    });
  }, [members, plans]);

  // --- Add a new member (Admin manual add) ---
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !selectedPlan) {
      alert('Please fill out all fields.');
      return;
    }

    // This creates a new member *and* their login in one go.
    // We can merge the logic from SignUpPage here.
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
      planStatus: 'Active' // Admin-added members are auto-approved
    };

    // We should also create a login for them
    const newUserAccount = {
      id: newMemberId,
      email: newEmail,
      username: newEmail, // Default username to email
      password: 'password123', // Default temporary password
      role: 'member'
    };

    localStorage.setItem('users', JSON.stringify([...users, newUserAccount]));

    const updatedMembers = [...members, newMemberProfile];
    setMembers(updatedMembers);
    localStorage.setItem('gymMembers', JSON.stringify(updatedMembers));

    alert('Member added and login account created with default password "password123".');
    setNewName('');
    setNewEmail('');
  };

  // --- Delete a member ---
  const handleDeleteMember = (idToDelete) => {
    if (window.confirm('Are you sure you want to delete this member? This will also delete their login account.')) {
      const updatedMembers = members.filter(m => m.id !== idToDelete);
      setMembers(updatedMembers);
      localStorage.setItem('gymMembers', JSON.stringify(updatedMembers));

      const users = JSON.parse(localStorage.getItem('users')) || [];
      const updatedUsers = users.filter(u => u.id !== idToDelete);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
  };

  // --- 4. NEW: Approve a member's plan ---
  const handleApprovePlan = (memberId) => {
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
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      <h1 className="text-4xl font-bold text-gray-800">Manage Members</h1>

      {/* --- CARD 1: ADD NEW MEMBER (Admin's "manual add" form) --- */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Add New Member</h2>
        <form onSubmit={handleAddMember} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* ... (Form is unchanged) ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text" value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email" value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Membership Plan</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {plans.map(p => <option key={p.id} value={p.name}>{p.name} (${p.price})</option>)}
            </select>
          </div>
          <div className="md:self-end">
            <button type="submit" className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
              Add & Activate Member
            </button>
          </div>
        </form>
      </div>

      {/* --- CARD 2: ALL MEMBERS TABLE (Table Updated) --- */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          All Members ({members.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Plan</th>
                {/* --- 5. NEW: Status Column --- */}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Expiry Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {membersWithExpiry.map((member) => (
                <tr key={member.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{member.name}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{member.email}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{member.plan}</td>

                  {/* --- 6. NEW: Status Data --- */}
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    {member.planStatus === 'Active' && <span className="text-green-600">Active</span>}
                    {member.planStatus === 'PendingApproval' && <span className="text-yellow-600">Pending</span>}
                    {member.planStatus === 'Inactive' && <span className="text-gray-500">Inactive</span>}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {member.planStatus === 'Active' ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {member.expiryDate ? (
                      <span className={member.isExpired ? 'font-medium text-red-600' : 'text-gray-500'}>
                        {member.expiryDate.toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>

                  {/* --- 7. NEW: Conditional Actions --- */}
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                    {member.planStatus === 'PendingApproval' ? (
                      <button
                        onClick={() => handleApprovePlan(member.id)}
                        className="rounded-md bg-green-100 px-3 py-1 text-green-700 hover:bg-green-200"
                      >
                        Approve
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenModal(member)}
                          className="rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="rounded-md bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EDIT MODAL (No change) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={handleCloseModal}>
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-xl font-semibold">Edit Member</h2>
            <form onSubmit={handleUpdateMember} className="space-y-4">
              {/* ... (Modal form is unchanged) ... */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text" value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email" value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Membership Plan</label>
                <select
                  value={modalPlan}
                  onChange={(e) => setModalPlan(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {plans.map(p => <option key={p.id} value={p.name}>{p.name} (${p.price})</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={handleCloseModal} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
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

    </div>
  );
}

export default MembersPage;