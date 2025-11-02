import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

function MyPlanPage() {
    const { user } = useAuth(); // The logged-in member
    const [member, setMember] = useState(null);
    const [plan, setPlan] = useState(null);
    const [expiryDate, setExpiryDate] = useState(null);
    const [allPlans, setAllPlans] = useState([]);
    const [mySchedule, setMySchedule] = useState([]);
    const [trainers, setTrainers] = useState([]);

    // Helper function to load all data
    const loadData = () => {
        const allMembers = JSON.parse(localStorage.getItem('gymMembers')) || [];
        const allPlansFromStorage = JSON.parse(localStorage.getItem('gymPlans')) || [];
        const allSchedules = JSON.parse(localStorage.getItem('gymSchedules')) || [];
        const allTrainers = JSON.parse(localStorage.getItem('gymTrainers')) || [];

        setAllPlans(allPlansFromStorage);
        setTrainers(allTrainers);

        const myProfile = allMembers.find(m => m.id === user.id);
        setMember(myProfile);

        const myScheduleData = allSchedules.filter(s => s.memberId === user.id);
        setMySchedule(myScheduleData);

        if (myProfile && myProfile.planStatus === 'Active') {
            const myPlan = allPlansFromStorage.find(p => p.name === myProfile.plan);
            if (myPlan) {
                setPlan(myPlan);
                const joinDate = new Date(myProfile.joinDate);
                const expDate = new Date(joinDate);
                expDate.setDate(joinDate.getDate() + myPlan.duration);
                setExpiryDate(expDate);
            }
        } else if (myProfile && myProfile.planStatus === 'PendingApproval') {
            const requestedPlan = allPlansFromStorage.find(p => p.name === myProfile.plan);
            setPlan(requestedPlan);
        }
    };

    // Load data on component mount
    useEffect(() => {
        loadData();
    }, [user.id]);

    // --- Memoized values for the dashboard cards ---

    const pendingConfirmations = useMemo(() => {
        return mySchedule.filter(s => s.status === 'Pending').length;
    }, [mySchedule]);

    // --- THIS SECTION CONTAINS THE DATE FIX ---
    const upcomingSessions = useMemo(() => {
        const trainerMap = new Map(trainers.map(t => [t.id, t.name]));
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of today (local time)

        return mySchedule
            .filter(s => {
                if (s.status !== 'Confirmed') return false;

                // --- THE FIX ---
                // Parse the "YYYY-MM-DD" string as local time
                const parts = s.date.split('-');
                // parts[1] - 1 because months are 0-indexed
                const eventDate = new Date(parts[0], parts[1] - 1, parts[2]);

                return eventDate >= today; // Compare local to local
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(s => ({
                ...s,
                trainerName: trainerMap.get(s.trainerId) || 'Unknown'
            }))
            .slice(0, 3); // Get the next 3
    }, [mySchedule, trainers]);
    // --- END OF FIX ---

    // "Request Plan" button click handler (no change)
    const handleRequestPlan = (chosenPlan) => {
        if (!window.confirm(`Are you sure you want to request the ${chosenPlan.name} plan? An admin will need to approve this request.`)) {
            return;
        }
        const allMembers = JSON.parse(localStorage.getItem('gymMembers')) || [];
        const updatedMembers = allMembers.map(m =>
            m.id === user.id
                ? { ...m, plan: chosenPlan.name, planStatus: 'PendingApproval' }
                : m
        );
        localStorage.setItem('gymMembers', JSON.stringify(updatedMembers));
        loadData();
    };

    // --- Render Loading State ---
    if (!member) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen">
                <h1 className="text-4xl font-bold text-gray-800">My Plan</h1>
                <div className="rounded-lg bg-white p-6 shadow-md mt-6">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">
                Welcome, {member.name}!
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* --- Member is ACTIVE --- */}
                    {member.planStatus === 'Active' && plan && (
                        <div className="rounded-lg bg-white p-6 shadow-md">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">My Membership Plan</h2>
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-sm font-medium text-gray-500">Plan Name</span>
                                    <span className="text-lg font-semibold text-gray-900">{plan.name}</span>
                                </div>
                                <div>
                                    <span className="block text-sm font-medium text-gray-500">Price</span>
                                    <span className="text-lg font-semibold text-gray-900">${plan.price}</span>
                                </div>
                                <div>
                                    <span className="block text-sm font-medium text-gray-500">Joined On</span>
                                    <span className="text-lg font-semibold text-gray-900">{new Date(member.joinDate).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="block text-sm font-medium text-gray-500">Expires On</span>
                                    <span className="text-lg font-semibold text-red-600">{expiryDate ? expiryDate.toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* --- Member is PENDING APPROVAL --- */}
                    {member.planStatus === 'PendingApproval' && (
                        <div className="rounded-lg bg-white p-6 shadow-md">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">Request Pending</h2>
                            <p className="text-lg text-gray-700">
                                Your request for the **{member.plan}** plan is pending admin approval.
                            </p>
                            <p className="mt-2 text-gray-500">This will be updated once your payment is confirmed.</p>
                        </div>
                    )}
                    {/* --- Member is INACTIVE (New Signup) --- */}
                    {member.planStatus === 'Inactive' && (
                        <div className="rounded-lg bg-white p-6 shadow-md">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">Choose Your Plan</h2>
                            <p className="mb-4 text-gray-600">You do not have an active plan. Please choose a plan below to request activation.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {allPlans.map(p => (
                                    <div key={p.id} className="flex flex-col justify-between rounded-lg border border-gray-200 p-4 shadow-sm">
                                        <div>
                                            <h3 className="text-lg font-semibold text-blue-600">{p.name}</h3>
                                            <p className="text-2xl font-bold text-gray-900">${p.price}</p>
                                            <p className="text-sm text-gray-500">{p.duration} days</p>
                                        </div>
                                        <button
                                            onClick={() => handleRequestPlan(p)}
                                            className="mt-4 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                                        >
                                            Request Plan
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {/* --- Sidebar Cards --- */}
                <div className="space-y-6">
                    {/* --- Pending Actions Card --- */}
                    {pendingConfirmations > 0 && (
                        <div className="rounded-lg bg-yellow-100 p-6 shadow-md">
                            <h2 className="mb-2 text-xl font-semibold text-yellow-800">Action Required</h2>
                            <p className="text-yellow-700">
                                You have **{pendingConfirmations}** session(s) waiting for your confirmation.
                            </p>
                            <Link
                                to="/my-schedule"
                                className="mt-4 inline-block rounded-md bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-700"
                            >
                                View Schedule
                            </Link>
                        </div>
                    )}
                    {/* --- Upcoming Sessions Card --- */}
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
                        {upcomingSessions.length > 0 ? (
                            <ul className="space-y-3">
                                {upcomingSessions.map(s => (
                                    <li key={s.id} className="rounded-md border border-gray-200 p-3">
                                        <p className="font-semibold text-gray-800">w/ {s.trainerName}</p>
                                        <p className="text-sm text-gray-600">{new Date(s.date).toLocaleDateString()}</p>
                                        <p className="text-sm text-gray-600">{s.startTime} - {s.endTime}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">You have no upcoming confirmed sessions.</p>
                        )}
                        <Link
                            to="/my-schedule"
                            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
                        >
                            View Full Schedule &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyPlanPage;