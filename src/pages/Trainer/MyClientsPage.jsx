// src/pages/MyClientsPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

// PlanStatusBadge component (no change)
const PlanStatusBadge = ({ status }) => {
    let styles = 'bg-gray-100 text-gray-800';
    if (status === 'Active') {
        styles = 'bg-green-100 text-green-800';
    } else if (status === 'PendingApproval') {
        styles = 'bg-yellow-100 text-yellow-800';
    } else if (status === 'Inactive' || status === 'None') {
        styles = 'bg-red-100 text-red-800';
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>
            {status}
        </span>
    );
};

function MyClientsPage() {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const storedSchedules = JSON.parse(localStorage.getItem('gymSchedules')) || [];
        const storedMembers = JSON.parse(localStorage.getItem('gymMembers')) || [];
        setSchedules(storedSchedules);
        setMembers(storedMembers);
    }, []);

    // --- THIS SECTION IS NOW FIXED ---
    const myClients = useMemo(() => {
        const mySessions = schedules.filter(s => s.trainerId === user.id);
        const myClientIds = new Set(mySessions.map(s => s.memberId));
        const myClientProfiles = members.filter(m => myClientIds.has(m.id));

        // Enrich each profile
        return myClientProfiles.map(client => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcomingSessions = mySessions.filter(s => {
                if (s.memberId !== client.id) return false;

                // Parse the date as local time
                const parts = s.date.split('-');
                const eventDate = new Date(parts[0], parts[1] - 1, parts[2]);

                // Check if it's today or in the future
                const isUpcoming = eventDate >= today;

                // Count it if it's upcoming (we don't need to check status here)
                return isUpcoming;
            }).length;

            return {
                ...client,
                upcomingSessions: upcomingSessions
            };
        });

    }, [schedules, members, user.id]);
    // --- END OF FIX ---

    return (
        <div className="p-6 bg-gray-100 min-h-screen space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">My Clients</h1>

            <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    My Client List ({myClients.length})
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Plan Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Upcoming Sessions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {myClients.length > 0 ? (
                                myClients.map(client => (
                                    <tr key={client.id}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{client.name}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{client.email}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <PlanStatusBadge status={client.planStatus} />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 text-center">
                                            {client.upcomingSessions}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                        You have no clients assigned.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default MyClientsPage;