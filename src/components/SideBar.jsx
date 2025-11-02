import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle.jsx';

function Sidebar({ isOpen, toggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 2. Update the NavLink class function
  // We make it 'relative' to position the highlight inside it
  // The 'active' class now only makes the text white
  const getNavLinkClass = ({ isActive }) =>
    `relative flex items-center gap-3 rounded-lg px-3 py-2 ${isActive
      ? 'text-gray-100' // Active text
      : 'text-gray-400 hover:bg-gym-800 hover:text-gray-100' // Inactive text
    }`;

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


      {/* --- 3. DYNAMIC NAVIGATION (Updated with motion.div) --- */}
      <nav className="flex-1 space-y-2 px-4 py-4">

        {/* --- ADMIN LINKS --- */}
        {user.role === 'admin' && (
          <>
            <NavLink to="/dashboard" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeHighlight" // Shared ID
                      className="absolute inset-0 rounded-lg bg-gym-700"
                    />
                  )}
                  <span className="relative z-10 font-semibold">Dashboard</span>
                </>
              )}
            </NavLink>
            <NavLink to="/members" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeHighlight"
                      className="absolute inset-0 rounded-lg bg-gym-700"
                    />
                  )}
                  <span className="relative z-10 font-semibold">Members</span>
                </>
              )}
            </NavLink>
            <NavLink to="/plans" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeHighlight"
                      className="absolute inset-0 rounded-lg bg-gym-700"
                    />
                  )}
                  <span className="relative z-10 font-semibold">Plans</span>
                </>
              )}
            </NavLink>
            <NavLink to="/renewals" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeHighlight"
                      className="absolute inset-0 rounded-lg bg-gym-700"
                    />
                  )}
                  <span className="relative z-10 font-semibold">Renewals</span>
                </>
              )}
            </NavLink>
            <NavLink to="/trainers" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeHighlight"
                      className="absolute inset-0 rounded-lg bg-gym-700"
                    />
                  )}
                  <span className="relative z-10 font-semibold">Trainers</span>
                </>
              )}
            </NavLink>
            <NavLink to="/schedule" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeHighlight"
                      className="absolute inset-0 rounded-lg bg-gym-700"
                    />
                  )}
                  <span className="relative z-10 font-semibold">All Schedules</span>
                </>
              )}
            </NavLink>
            <NavLink to="/inventory" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeHighlight"
                      className="absolute inset-0 rounded-lg bg-gym-700"
                    />
                  )}
                  <span className="relative z-10 font-semibold">Inventory</span>
                </>
              )}
            </NavLink>
          </>
        )}

        {/* --- TRAINER LINKS --- */}
        {user.role === 'trainer' && (
          <>
            <NavLink to="/trainer-schedule" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeHighlight"
                      className="absolute inset-0 rounded-lg bg-gym-700"
                    />
                  )}
                  <span className="relative z-10 font-semibold">My Schedule</span>
                </>
              )}
            </NavLink>
            <NavLink to="/my-clients" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeHighlight"
                      className="absolute inset-0 rounded-lg bg-gym-700"
                    />
                  )}
                  <span className="relative z-10 font-semibold">My Clients</span>
                </>
              )}
            </NavLink>
          </>
        )}

        {/* --- MEMBER LINKS --- */}
        {user.role === 'member' && (
          <>
            <NavLink to="/my-plan" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeHighlight"
                      className="absolute inset-0 rounded-lg bg-gym-700"
                    />
                  )}
                  <span className="relative z-10 font-semibold">My Plan</span>
                </>
              )}
            </NavLink>
            <NavLink to="/my-schedule" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeHighlight"
                      className="absolute inset-0 rounded-lg bg-gym-700"
                    />
                  )}
                  <span className="relative z-10 font-semibold">My Schedule</span>
                </>
              )}
            </NavLink>
          </>
        )}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto p-4 space-y-2">
        {/* 2. Add the toggle here */}
        <ThemeToggle />

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