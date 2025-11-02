import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar({ isOpen, toggle }) {
  // 1. Get the full user object (which includes user.role)
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive
      ? 'flex items-center gap-3 rounded-lg bg-gym-700 px-3 py-2 text-gray-100'
      : 'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:bg-gym-800 hover:text-gray-100';

  return (
    <div className={`fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-gym-900 text-white 
                  transition-transform duration-300 ease-in-out
                  ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

      <div className="flex h-20 items-center justify-center px-6">
        <h2 className="font-tourney text-3xl font-bold text-white">GYM</h2>
        <button onClick={toggle} className="rounded-full p-2 text-gray-400 hover:bg-gym-800 hover:text-white">
          <span className="text-2xl">&larr;</span>
        </button>
      </div>

      {/* --- 2. DYNAMIC NAVIGATION --- */}
      <nav className="flex-1 space-y-2 px-4 py-4">

        {/* --- ADMIN LINKS --- */}
        {user.role === 'admin' && (
          <>
            <NavLink to="/dashboard" className={getNavLinkClass}>
              <span className="font-semibold">Dashboard</span>
            </NavLink>
            <NavLink to="/members" className={getNavLinkClass}>
              <span className="font-semibold">Members</span>
            </NavLink>
            <NavLink to="/plans" className={getNavLinkClass}>
              <span className="font-semibold">Plans</span>
            </NavLink>
            <NavLink to="/renewals" className={getNavLinkClass}>
              <span className="font-semibold">Renewals</span>
            </NavLink>
            <NavLink to="/trainers" className={getNavLinkClass}>
              <span className="font-semibold">Trainers</span>
            </NavLink>
            <NavLink to="/schedule" className={getNavLinkClass}>
              <span className="font-semibold">All Schedules</span>
            </NavLink>
            <NavLink to="/inventory" className={getNavLinkClass}>
              <span className="font-semibold">Inventory</span>
            </NavLink>
          </>
        )}

        {/* --- TRAINER LINKS --- */}
        {user.role === 'trainer' && (
          <>
            {/* 1. UPDATED: Renamed route to avoid conflict */}
            <NavLink to="/trainer-schedule" className={getNavLinkClass}>
              <span className="font-semibold">My Schedule</span>
            </NavLink>
            <NavLink to="/my-clients" className={getNavLinkClass}>
              <span className="font-semibold">My Clients</span>
            </NavLink>
          </>
        )}

        {/* --- MEMBER LINKS --- */}
        {user.role === 'member' && (
          <>
            {/* 2. UPDATED: Changed path from placeholder */}
            <NavLink to="/my-plan" className={getNavLinkClass}>
              <span className="font-semibold">My Plan</span>
            </NavLink>
            {/* 3. NEW: Added schedule link for members */}
            <NavLink to="/my-schedule" className={getNavLinkClass}>
              <span className="font-semibold">My Schedule</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Logout Button (visible to all logged-in users) */}
      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-3 text-gray-300 hover:bg-gym-700 hover:text-white"
        >
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </div >
  );
}

export default Sidebar;