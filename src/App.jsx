import React, { useEffect } from 'react'; // 1. Make sure to import useEffect
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import DashboardPage from './pages/Admin/DashboardPage.jsx';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import MembersPage from './pages/Admin/MembersPage.jsx';
import MembershipPlansPage from './pages/Admin/MembershipPlansPage.jsx';
import RenewalsPage from './pages/Admin/RenewalsPage.jsx';
import TrainersPage from './pages/Admin/TrainersPage.jsx';
import SchedulePage from './pages/Admin/SchedulePage.jsx';
import MySchedulePage from './pages/Trainer/MySchedulePage.jsx';
import MyClientsPage from './pages/Trainer/MyClientsPage.jsx';
import MyPlanPage from './pages/Client/MyPlanPage.jsx';
import MemberSchedulePage from './pages/Client/MemberSchedulePage.jsx';
import InventoryPage from './pages/Admin/InventoryPage.jsx';

const seedLocalStorage = () => {
  // 1. Seed Plans (No change)
  const storedPlans = localStorage.getItem('gymPlans');
  if (!storedPlans || JSON.parse(storedPlans).length === 0) {
    const defaultPlans = [
      { id: 1, name: '1 Month', price: 50, duration: 30 },
      { id: 2, name: '3 Months', price: 120, duration: 90 },
      { id: 3, name: '6 Months', price: 200, duration: 180 },
      { id: 4, name: '9 months', price: 230, duration: 270 },
      { id: 5, name: '1 Year', price: 300, duration: 365 }
    ];
    localStorage.setItem('gymPlans', JSON.stringify(defaultPlans));
    console.log("default plans seeded.");
  }

  // 2. Define Member/Admin data (No change)
  const defaultData = [
    { id: 101, name: 'Alice Smith', email: 'alice@example.com', username: 'alice', password: 'password123', plan: '1 Year', joinDate: new Date(2025, 4, 15), role: 'member', planStatus: 'Active' },
    { id: 102, name: 'Bob Johnson', email: 'bob@example.com', username: 'bob', password: 'password123', plan: '1 Month', joinDate: new Date(2025, 5, 20), role: 'member', planStatus: 'Active' },
    { id: 103, name: 'Charlie Brown', email: 'charlie@example.com', username: 'charlie', password: 'password123', plan: '3 Months', joinDate: new Date(2025, 6, 5), role: 'member', planStatus: 'Active' },
    { id: 104, name: 'David Lee', email: 'david@example.com', username: 'david', password: 'password123', plan: '1 Year', joinDate: new Date(2025, 7, 12), role: 'member', planStatus: 'Active' },
    { id: 105, name: 'Eva Green', email: 'eva@example.com', username: 'eva', password: 'password123', plan: '6 Months', joinDate: new Date(2025, 7, 28), role: 'member', planStatus: 'Active' },
    { id: 106, name: 'Frank White', email: 'frank@example.com', username: 'frank', password: 'password123', plan: '3 Months', joinDate: new Date(2025, 8, 19), role: 'member', planStatus: 'Active' },

    // --- Admin Account ---
    { id: 107, name: 'Admin User', email: 'admin@gym.com', username: 'admin', password: 'admin', plan: '1 Year', joinDate: new Date(2025, 0, 1), role: 'admin', planStatus: 'Active' }
  ];

  // 3. Define Trainer data
  const defaultTrainers = [
    { id: 't1', name: 'Alex Costa', email: 'alex@gym.com', username: 'alex', password: 'trainer123', role: 'trainer', specialty: 'Weightlifting', salary: 50000 },
    { id: 't2', name: 'Maria Fiori', email: 'maria@gym.com', username: 'maria', password: 'trainer123', role: 'trainer', specialty: 'Yoga & Pilates', salary: 55000 },
    { id: 't3', name: 'David G.', email: 'davidg@gym.com', username: 'davidg', password: 'trainer123', role: 'trainer', specialty: 'Cardio & HIIT', salary: 48000 },
  ];

  // 4. Seed User Logins (for the 'users' key)
  const storedUsers = localStorage.getItem('users');
  if (!storedUsers || JSON.parse(storedUsers).length === 0) {

    // Get logins from members/admin
    // 5. FIX: Use the correct variable name 'defaultUsers'
    const defaultUsers = defaultData.map(d => ({
      id: d.id,
      email: d.email,
      username: d.username,
      password: d.password,
      role: d.role
    }));

    // Get logins from trainers (this now works)
    const trainerUsers = defaultTrainers.map(t => ({
      id: t.id,
      email: t.email,
      username: t.username,
      password: t.password,
      role: t.role
    }));

    // Combine them into one master user list
    // 6. Use the correct variable name 'defaultUsers'
    const allUsers = [...defaultUsers, ...trainerUsers];

    localStorage.setItem('users', JSON.stringify(allUsers));
    console.log("default user logins (with roles for ALL users) seeded.");
  }

  // 5. Seed Member Profiles (No change)
  const storedMembers = localStorage.getItem('gymMembers');
  if (!storedMembers || JSON.parse(storedMembers).length === 0) {
    const defaultMembers = defaultData.map(d => ({
      id: d.id,
      name: d.name,
      email: d.email,
      plan: d.plan,
      joinDate: d.joinDate.toISOString(),
      planStatus: d.planStatus // <-- ADD THIS LINE
    }));
    localStorage.setItem('gymMembers', JSON.stringify(defaultMembers));
    console.log("default member profiles (with status) seeded."); // Updated log
  }

  // 6. Seed Trainer Profiles (for the 'gymTrainers' key)
  const storedTrainers = localStorage.getItem('gymTrainers');
  if (!storedTrainers || JSON.parse(storedTrainers).length === 0) {

    // 7. Removed the extra nested 'if' block
    // Strip sensitive login info before saving
    const trainerProfiles = defaultTrainers.map(t => ({
      id: t.id,
      name: t.name,
      specialty: t.specialty,
      salary: t.salary
    }));

    localStorage.setItem('gymTrainers', JSON.stringify(trainerProfiles));
    console.log("default trainer PROFILES seeded.");
  }

  // 7. Seed Schedule Data
  // 7. Seed Schedule Data
  const storedSchedules = localStorage.getItem('gymSchedules');
  if (!storedSchedules || JSON.parse(storedSchedules).length === 0) {
    const defaultSchedules = [
      // Link members (101-106) to trainers (t1-t3)
      // Alex (t1) sessions
      { id: 's1', memberId: 101, trainerId: 't1', date: '2025-11-03', startTime: '09:00', endTime: '10:00', status: 'Confirmed' },
      { id: 's2', memberId: 104, trainerId: 't1', date: '2025-11-03', startTime: '10:00', endTime: '11:00', status: 'Confirmed' },
      { id: 's3', memberId: 101, trainerId: 't1', date: '2025-11-05', startTime: '09:00', endTime: '10:00', status: 'Confirmed' },

      // Maria (t2) sessions
      { id: 's4', memberId: 102, trainerId: 't2', date: '2025-11-04', startTime: '14:00', endTime: '15:00', status: 'Confirmed' },
      { id: 's5', memberId: 105, trainerId: 't2', date: '2025-11-06', startTime: '15:00', endTime: '16:00', status: 'Confirmed' },

      // David (t3) sessions
      { id: 's6', memberId: 103, trainerId: 't3', date: '2025-11-03', startTime: '11:00', endTime: '12:00', status: 'Confirmed' },
      { id: 's7', memberId: 106, trainerId: 't3', date: '2025-11-07', startTime: '11:00', endTime: '12:00', status: 'Confirmed' },
    ];
    localStorage.setItem('gymSchedules', JSON.stringify(defaultSchedules));
    console.log("default schedules *with status* seeded."); // Corrected log
  }

  // 8. Seed Inventory Data
  const storedInventory = localStorage.getItem('gymInventory');
  if (!storedInventory || JSON.parse(storedInventory).length === 0) {
    const defaultInventory = [
      {
        id: 'eq1',
        name: 'Treadmill - Model T-1000',
        category: 'Equipment',
        quantity: 5,
        status: 'Operational'
      },
      {
        id: 'eq2',
        name: 'Dumbbell Set (5-50 lbs)',
        category: 'Equipment',
        quantity: 10,
        status: 'Operational'
      },
      {
        id: 'sp1',
        name: 'Protein Bars (Box)',
        category: 'Supplies',
        quantity: 50,
        status: 'In Stock'
      },
      {
        id: 'sp2',
        name: 'Hand Sanitizer (1L)',
        category: 'Supplies',
        quantity: 10,
        status: 'In Stock'
      },
      {
        id: 'eq3',
        name: 'Elliptical Machine',
        category: 'Equipment',
        quantity: 1,
        status: 'Needs Maintenance'
      },
    ];
    localStorage.setItem('gymInventory', JSON.stringify(defaultInventory));
    console.log("default inventory seeded.");
  }

};

function App() {
  const location = useLocation();

  useEffect(() => {
    seedLocalStorage();
  }, []);
  return (

    <AnimatePresence mode='wait' >
      <Routes location={location} key={location.pathname}>

        {/* Redirect root and unknown paths to /login so the app doesn't render a blank page */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* --- Admin Routes --- */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/plans" element={<MembershipPlansPage />} />
            <Route path="/renewals" element={<RenewalsPage />} />
            <Route path="/trainers" element={<TrainersPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/inventory" element={<InventoryPage />} />

            {/* --- Trainer Routes --- */}
            {/* UPDATED: Renamed path to match sidebar */}
            <Route path="/trainer-schedule" element={<MySchedulePage />} />
            <Route path="/my-clients" element={<MyClientsPage />} />

            {/* --- Member Routes --- */}
            {/* NEW: Added the two new routes for members */}
            <Route path="/my-plan" element={<MyPlanPage />} />
            <Route path="/my-schedule" element={<MemberSchedulePage />} />
          </Route>
        </Route>


      </Routes>
    </AnimatePresence >

  )
}

export default App;