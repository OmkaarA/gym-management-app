// src/pages/MySchedulePage.jsx (Trainer's Schedule)

import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthContext.jsx';
import GymCalendar from '../../components/GymCalendar.jsx';

// StatusBadge component
const StatusBadge = ({ status }) => {
    let styles = 'bg-yellow-100 text-yellow-800';
    let text = status || 'Pending';
    if (status === 'Confirmed') {
        styles = 'bg-green-100 text-green-800';
    } else if (status === 'Pending Trainer') {
        styles = 'bg-blue-100 text-blue-800';
        text = 'Pending Trainer';
    } else if (status === 'Pending') {
        text = 'Pending Client';
    } else {
        text = 'N/A';
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>
            {text}
        </span>
    );
};

function MySchedulePage() {
    const { user } = useAuth(); // The logged-in trainer
    const [schedules, setSchedules] = useState([]);
    const [members, setMembers] = useState([]);

    // Form/Modal states
    const [newMemberId, setNewMemberId] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newStartTime, setNewStartTime] = useState('');
    const [newEndTime, setNewEndTime] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editingBooking, setEditingBooking] = useState(null);
    const [modalMemberId, setModalMemberId] = useState('');
    const [modalDate, setModalDate] = useState('');
    const [modalStartTime, setModalStartTime] = useState('');
    const [modalEndTime, setModalEndTime] = useState('');

    // Date const
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;

    // Load data
    useEffect(() => {
        const storedSchedules = JSON.parse(localStorage.getItem('gymSchedules')) || [];
        const storedMembers = JSON.parse(localStorage.getItem('gymMembers')) || [];
        setSchedules(storedSchedules);
        setMembers(storedMembers);
        if (storedMembers.length > 0) {
            setNewMemberId(storedMembers[0].id);
        }
    }, [user.id]);

    // --- 1. NEW: Dashboard card logic ---
    const mySchedule = useMemo(() => {
        return schedules.filter(s => s.trainerId === user.id);
    }, [schedules, user.id]);

    const pendingTrainerConfirmations = useMemo(() => {
        return mySchedule.filter(s => s.status === 'Pending Trainer').length;
    }, [mySchedule]);

    const pendingClientConfirmations = useMemo(() => {
        return mySchedule.filter(s => s.status === 'Pending').length;
    }, [mySchedule]);

    // --- Transform schedule data for the calendar ---
    const calendarEvents = useMemo(() => {
        const memberMap = new Map(members.map(m => [m.id, m.name]));
        return mySchedule.map(s => { // Use the already-filtered list
            const memberName = memberMap.get(s.memberId) || 'Unknown';
            const startDateTime = new Date(`${s.date}T${s.startTime}`);
            const endDateTime = new Date(`${s.date}T${s.endTime}`);
            return {
                title: `${memberName} (${s.status || 'N/A'})`,
                start: startDateTime,
                end: endDateTime,
                resource: s,
            };
        });
    }, [mySchedule, members]); // Depend on mySchedule

    // --- Action Handlers (all correct) ---
    const handleAddBooking = (e) => {
        e.preventDefault();
        if (!newMemberId || !newDate || !newStartTime || !newEndTime) {
            alert('Please fill out all fields.');
            return;
        }
        const newBooking = {
            id: uuidv4(),
            memberId: newMemberId,
            trainerId: user.id,
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
            status: 'Pending', // Sent to member for confirmation
        };
        const updatedSchedules = [...schedules, newBooking];
        setSchedules(updatedSchedules);
        localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));
        setNewDate('');
        setNewStartTime('');
        setNewEndTime('');
        if (members.length > 0) {
            setNewMemberId(members[0].id);
        }
    };

    const handleDelete = (idToDelete) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            const updatedSchedules = schedules.filter(s => s.id !== idToDelete);
            setSchedules(updatedSchedules);
            localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));
            setIsEventModalOpen(false);
            setSelectedEvent(null);
        }
    };

    const handleConfirm = (idToConfirm) => {
        const updatedSchedules = schedules.map(s =>
            s.id === idToConfirm ? { ...s, status: 'Confirmed' } : s
        );
        setSchedules(updatedSchedules);
        localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));
        setIsEventModalOpen(false);
        setSelectedEvent(null);
    };

    const handleOpenEditModal = (booking) => {
        setEditingBooking(booking);
        setModalMemberId(booking.memberId);
        setModalDate(booking.date);
        setModalStartTime(booking.startTime);
        setModalEndTime(booking.endTime);
        setIsEventModalOpen(false);
        setIsModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsModalOpen(false);
        setEditingBooking(null);
        setSelectedEvent(null);
    };

    const handleUpdateBooking = (e) => {
        e.preventDefault();
        const updatedSchedules = schedules.map(s =>
            s.id === editingBooking.id
                ? {
                    ...s,
                    memberId: modalMemberId,
                    date: modalDate,
                    startTime: modalStartTime,
                    endTime: modalEndTime,
                    status: 'Pending',
                }
                : s
        );
        setSchedules(updatedSchedules);
        localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));
        handleCloseEditModal();
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsEventModalOpen(true);
    };

    const closeEventModal = () => {
        setIsEventModalOpen(false);
        setSelectedEvent(null);
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">My Schedule</h1>

            {/* --- 2. NEW: Dashboard Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Requests from Members */}
                <div className="rounded-lg bg-blue-100 p-6 shadow-md">
                    <h2 className="mb-2 text-xl font-semibold text-blue-800">New Requests</h2>
                    {pendingTrainerConfirmations > 0 ? (
                        <p className="text-blue-700">
                            You have **{pendingTrainerConfirmations}** new session request(s) from members.
                        </p>
                    ) : (
                        <p className="text-blue-700">You have no new requests from members.</p>
                    )}
                </div>
                {/* Pending Replies from Clients */}
                <div className="rounded-lg bg-yellow-100 p-6 shadow-md">
                    <h2 className="mb-2 text-xl font-semibold text-yellow-800">Pending Client Replies</h2>
                    {pendingClientConfirmations > 0 ? (
                        <p className="text-yellow-700">
                            You are waiting for clients to confirm **{pendingClientConfirmations}** session(s).
                        </p>
                    ) : (
                        <p className="text-yellow-700">You are not waiting for any client replies.</p>
                    )}
                </div>
            </div>

            {/* --- CARD: ADD NEW SESSION --- */}
            <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Book a New Session</h2>
                <form onSubmit={handleAddBooking} className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    {/* Form fields... */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Client</label>
                        <select
                            value={newMemberId}
                            onChange={(e) => setNewMemberId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            min={minDate}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input
                            type="time"
                            value={newStartTime}
                            onChange={(e) => setNewStartTime(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <input
                            type="time"
                            value={newEndTime}
                            onChange={(e) => setNewEndTime(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="md:self-end">
                        <button
                            type="submit"
                            className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                            Add Booking
                        </button>
                    </div>
                </form>
            </div>

            {/* --- RENDER THE CALENDAR --- */}
            <GymCalendar
                events={calendarEvents}
                onSelectEvent={handleEventClick}
            />

            {/* --- Event Click Popup Modal --- */}
            {isEventModalOpen && selectedEvent && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={closeEventModal}
                >
                    <div
                        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-2 text-2xl font-semibold">{selectedEvent.title}</h2>
                        <div className="mb-4">
                            <p className="text-gray-700">
                                {selectedEvent.start.toLocaleString()}
                            </p>
                            <StatusBadge status={selectedEvent.resource.status} />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {/* Show "Confirm" for member-made requests */}
                            {selectedEvent.resource.status === 'PendingTrainer' && (
                                <button
                                    onClick={() => handleConfirm(selectedEvent.resource.id)}
                                    className="flex-1 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                >
                                    Confirm
                                </button>
                            )}
                            <button
                                onClick={() => handleOpenEditModal(selectedEvent.resource)}
                                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(selectedEvent.resource.id)}
                                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                            <button
                                onClick={closeEventModal}
                                className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 mt-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- EDIT SESSION MODAL (No change) --- */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={handleCloseEditModal}
                >
                    <div
                        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ... (Modal content is unchanged) ... */}
                        <h2 className="mb-4 text-2xl font-semibold">Edit Session</h2>
                        <p className="mb-4 text-sm text-gray-600">Editing this session will set its status back to 'Pending' for the client to confirm.</p>
                        <form onSubmit={handleUpdateBooking} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Client</label>
                                <select
                                    value={modalMemberId}
                                    onChange={(e) => setModalMemberId(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <input
                                    type="date"
                                    value={modalDate}
                                    onChange={(e) => setModalDate(e.target.value)}
                                    min={minDate}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                <input
                                    type="time"
                                    value={modalStartTime}
                                    onChange={(e) => setModalStartTime(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Time</label>
                                <input
                                    type="time"
                                    value={modalEndTime}
                                    onChange={(e) => setModalEndTime(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseEditModal}
                                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                                >
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

export default MySchedulePage;