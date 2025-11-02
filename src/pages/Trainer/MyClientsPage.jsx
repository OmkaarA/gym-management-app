import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

// Updated StatusBadge with dark mode classes
const PlanStatusBadge = ({ status }) => {
    let styles = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'; // Default
    if (status === 'Active') {
        styles = 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
    } else if (status === 'PendingApproval') {
        styles = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
    } else if (status === 'Inactive' || status === 'None') {
        styles = 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
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

    // This logic is already correct
    const myClients = useMemo(() => {
        const mySessions = schedules.filter(s => s.trainerId === user.id);
        const myClientIds = new Set(mySessions.map(s => s.memberId));
        const myClientProfiles = members.filter(m => myClientIds.has(m.id));

        return myClientProfiles.map(client => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcomingSessions = mySessions.filter(s => {
                if (s.memberId !== client.id) return false;
                const parts = s.date.split('-');
                const eventDate = new Date(parts[0], parts[1] - 1, parts[2]);
                return eventDate >= today;
            }).length;

            return {
                ...client,
                upcomingSessions: upcomingSessions
            };
        });

    }, [schedules, members, user.id]);

    // Check role
    if (user.role !== 'trainer') {
        return (
            <div className="p-6 dark:bg-gray-900">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="dark:text-gray-100">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 text-gray-900 dark:text-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">My Clients</h1>

            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    My Client List ({myClients.length})
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Plan Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Upcoming Sessions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800 dark:divide-gray-700">
                            {myClients.length > 0 ? (
                                myClients.map(client => (
                                    <tr key={client.id}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{client.name}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{client.email}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <PlanStatusBadge status={client.planStatus} />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 text-center dark:text-white">
                                            {client.upcomingSessions}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
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