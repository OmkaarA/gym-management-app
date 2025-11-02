// Dashboard page showing key stats and charts

import React, { useState, useEffect } from 'react';
// --- 1. Import Link ---
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import MonthlyRevenueChart from '../../components/MonthlyRevenueChart.jsx';
import TimeframeSwitcher from '../../components/TimeframeSwitcher.jsx';

// Icons (no change)
const MemberIcon = () => <span>👥</span>;
const PlanIcon = () => <span>📄</span>;
const RevenueIcon = () => <span>💰</span>;

function DashboardPage() {
  const { user } = useAuth();

  // (All your existing state hooks remain the same)
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });
  const [timeframe, setTimeframe] = useState('6M');
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [pendingRenewals, setPendingRenewals] = useState([]);


  // (Both of your useEffect hooks remain exactly the same)
  // --- EFFECT 1 ---
  useEffect(() => {
    const storedMembers = JSON.parse(localStorage.getItem('gymMembers')) || [];
    const storedPlans = JSON.parse(localStorage.getItem('gymPlans')) || [];
    setMembers(storedMembers);
    setPlans(storedPlans);

    if (storedMembers.length > 0 && storedPlans.length > 0) {
      const priceMap = new Map(storedPlans.map(p => [p.name, p.price]));
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const thisMonthRevenue = storedMembers
        .filter(m => {
          const joinDate = new Date(m.joinDate);
          return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
        })
        .reduce((sum, m) => sum + (priceMap.get(m.plan) || 0), 0);

      setMonthlyRevenue(thisMonthRevenue);
    }
  }, []);

  // --- EFFECT 2 ---
  useEffect(() => {
    if (members.length > 0 && plans.length > 0) {

      const priceMap = new Map(plans.map(p => [p.name, p.price]));
      const labels = [];
      const data = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const monthsToShowMap = { '6M': 6, '1Y': 12 };
      const numMonths = monthsToShowMap[timeframe];

      for (let i = numMonths - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthLabel = d.toLocaleString('default', { month: 'short' });
        const month = d.getMonth();
        const year = d.getFullYear();
        labels.push(monthLabel);

        const monthRevenue = members
          .filter(m => {
            const joinDate = new Date(m.joinDate);
            return joinDate.getMonth() === month && joinDate.getFullYear() === year;
          })
          .reduce((sum, m) => sum + (priceMap.get(m.plan) || 0), 0);
        data.push(monthRevenue);
      }
      setRevenueData({
        labels,
        datasets: [{ label: 'Revenue', data, borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.5)', tension: 0.2 }],
      });

      const durationMap = new Map(plans.map(p => [p.name, p.duration]));

      const renewals = members
        .map(member => {
          const durationInDays = durationMap.get(member.plan);
          if (!durationInDays) return null;

          const joinDate = new Date(member.joinDate);
          const expiryDate = new Date(joinDate);
          expiryDate.setDate(joinDate.getDate() + durationInDays);
          return { ...member, expiryDate };
        })
        .filter(member => member && member.expiryDate < today)
        .sort((a, b) => a.expiryDate - b.expiryDate);

      setPendingRenewals(renewals);
    }
  }, [timeframe, members, plans]);

  // Derived state
  const activePlans = members.length;
  const recentMembers = [...members]
    .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
    .slice(0, 5);

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-gray-900 space-y-8">
      {/* --- Header (no change) --- */}
      <h1 className="text-4xl font-bold text-gray-800">
        Welcome back, <span className="capitalize">{user?.username || 'User'}</span>!
      </h1>

      {/* --- STAT CARDS (no change) --- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Members" value={members.length} icon={<span>👥</span>} />
        <StatCard title="Active Plans" value={activePlans} icon={<span>📄</span>} />
        <StatCard title="Revenue (This Month)" value={`$${monthlyRevenue}`} icon={<span>💰</span>} />
      </div>

      {/* --- Grid for Chart and Lists --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* 1. Revenue Chart (no change) */}
        <div className="rounded-lg bg-white p-6 shadow-md lg:col-span-2">
          {/* Chart Header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Revenue</h2>
            <div className="flex items-center gap-2">
              <TimeframeSwitcher
                timeframes={['6M', '1Y']}
                active={timeframe}
                onChange={setTimeframe}
              />
              <button
                onClick={() => setIsChartModalOpen(true)}
                title="Expand Chart"
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m4.5 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              </button>
            </div>
          </div>
          {/* Chart (with loading check) */}
          <div className="mt-4">
            {revenueData.labels.length > 0 ? (
              <MonthlyRevenueChart chartData={revenueData} timeframe={timeframe} />
            ) : (
              <p>Loading chart data...</p>
            )}
          </div>
        </div>

        {/* --- 2. New Members List (UPDATED) --- */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          {/* Wrap h2 in a Link and add hover styles */}
          <Link to="/members">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 transition-colors hover:text-blue-600 hover:underline">
              New Members
            </h2>
          </Link>
          <ul className='space-y-3'>
            {recentMembers.length > 0 ? (
              recentMembers.map((member) => (
                <li key={member.id} className="flex justify-between text-gray-700">
                  <span> {member.name}</span>
                  <span className='text-gray-500'>{new Date(member.joinDate).toLocaleDateString()}</span>
                </li>
              ))
            ) : (
              <p className='text-gray-500'>
                No new members have joined yet.
              </p>
            )}
          </ul>
        </div>

        {/* --- 3. Pending Renewals Card (UPDATED) --- */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          {/* Wrap h2 in a Link and add hover styles */}
          <Link to="/renewals">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 transition-colors hover:text-blue-600 hover:underline">
              Pending Renewals
            </h2>
          </Link>

          {pendingRenewals.length > 0 ? (
            <ul className='space-y-3'>
              {pendingRenewals.map((member) => (
                <li key={member.id} className="flex justify-between items-center text-gray-700">
                  <div>
                    <span>{member.name}</span>
                    <span className='block text-sm text-gray-500'>{member.plan}</span>
                  </div>
                  <span className='text-sm font-medium text-red-600'>
                    Expired: {member.expiryDate.toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-gray-500'>No renewals are due.</p>
          )}
        </div>

      </div>

      {/* --- MODAL (no change) --- */}
      {isChartModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setIsChartModalOpen(false)}
        >
          <div
            className="relative w-11/12 max-w-6xl rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsChartModalOpen(false)}
              className="absolute -top-3 -right-3 z-10 rounded-full bg-white p-1 text-gray-500 shadow-md hover:text-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {revenueData.labels.length > 0 ? (
              <MonthlyRevenueChart chartData={revenueData} timeframe={timeframe} />
            ) : (
              <p>Loading chart data...</p>
            )}
          </div>
        </div>
      )}

    </div >
  );
}

export default DashboardPage;