// src/pages/SchedulePage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import GymCalendar from '../../components/GymCalendar.jsx';
import { motion } from 'framer-motion';

// StatusBadge component
const StatusBadge = ({ status }) => {
    let styles = 'bg-yellow-100 text-yellow-800';
    let text = status || 'N/A';
    if (status === 'Confirmed') {
        styles = 'bg-green-100 text-green-800';
    } else if (status === 'Pending Trainer') {
        styles = 'bg-blue-100 text-blue-800';
        text = 'Pending Trainer';
    } else if (status === 'Pending') {
        styles = 'bg-yellow-100 text-yellow-800';
        text = 'Pending Client';
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>
            {text}
        </span>
    );
};

function SchedulePage() {
    // Data state
    const [schedules, setSchedules] = useState([]);
    const [members, setMembers] = useState([]);
    const [trainers, setTrainers] = useState([]);

    // Add Form state
    const [newMemberId, setNewMemberId] = useState('');
    const [newTrainerId, setNewTrainerId] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newStartTime, setNewStartTime] = useState('');
    const [newEndTime, setNewEndTime] = useState('');

    // --- 1. ADD STATE FOR MODALS ---
    const [isEventModalOpen, setIsEventModalOpen] = useState(false); // For the click popup
    const [selectedEvent, setSelectedEvent] = useState(null);       // The clicked event
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);   // For the edit form
    const [editingBooking, setEditingBooking] = useState(null);     // The booking being edited

    // State for Edit Modal form fields
    const [modalMemberId, setModalMemberId] = useState('');
    const [modalTrainerId, setModalTrainerId] = useState('');
    const [modalDate, setModalDate] = useState('');
    const [modalStartTime, setModalStartTime] = useState('');
    const [modalEndTime, setModalEndTime] = useState('');
    const [modalStatus, setModalStatus] = useState('');

    // Get today's date for the date picker
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;

    // Load all data
    useEffect(() => {
        const storedSchedules = JSON.parse(localStorage.getItem('gymSchedules')) || [];
        const storedMembers = JSON.parse(localStorage.getItem('gymMembers')) || [];
        const storedTrainers = JSON.parse(localStorage.getItem('gymTrainers')) || [];
        setSchedules(storedSchedules);
        setMembers(storedMembers);
        setTrainers(storedTrainers);
        if (storedMembers.length > 0) setNewMemberId(storedMembers[0].id);
        if (storedTrainers.length > 0) setNewTrainerId(storedTrainers[0].id);
    }, []);

    // Transform data for calendar
    const calendarEvents = useMemo(() => {
        const memberMap = new Map(members.map(m => [m.id, m.name]));
        const trainerMap = new Map(trainers.map(t => [t.id, t.name]));
        return schedules.map(s => {
            const memberName = memberMap.get(s.memberId) || 'Unknown';
            const trainerName = trainerMap.get(s.trainerId) || 'Unknown';
            const startDateTime = new Date(`${s.date}T${s.startTime}`);
            const endDateTime = new Date(`${s.date}T${s.endTime}`);
            return {
                title: `${memberName} w/ ${trainerName} (${s.status || 'N/A'})`,
                start: startDateTime,
                end: endDateTime,
                resource: s,
            };
        });
    }, [schedules, members, trainers]);

    // --- 2. UPDATE CLICK HANDLER ---
    // This just opens the popup modal
    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsEventModalOpen(true);
    };

    const closeEventModal = () => {
        setIsEventModalOpen(false);
        setSelectedEvent(null);
    }

    // --- ACTION HANDLERS (for buttons) ---

    const handleConfirm = (idToConfirm) => {
        const updatedSchedules = schedules.map(s =>
            s.id === idToConfirm ? { ...s, status: 'Confirmed' } : s
        );
        setSchedules(updatedSchedules);
        localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));
        closeEventModal();
    };

    const handleDelete = (idToDelete) => {
        if (window.confirm('Are you sure you want to permanently delete this session?')) {
            const updatedSchedules = schedules.filter(s => s.id !== idToDelete);
            setSchedules(updatedSchedules);
            localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));
            closeEventModal();
        }
    };

    // Add a new booking (Admin-created)
    const handleAddBooking = (e) => {
        e.preventDefault();
        if (!newMemberId || !newTrainerId || !newDate || !newStartTime || !newEndTime) {
            alert('Please fill out all fields.');
            return;
        }
        const newBooking = {
            id: uuidv4(),
            memberId: newMemberId,
            trainerId: newTrainerId,
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
            status: 'Confirmed', // Admin bookings are auto-confirmed
        };
        const updatedSchedules = [...schedules, newBooking];
        setSchedules(updatedSchedules);
        localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));
        setNewDate('');
        setNewStartTime('');
        setNewEndTime('');
    };

    // --- 3. ADD EDIT MODAL LOGIC ---

    const handleOpenEditModal = (booking) => {
        setEditingBooking(booking);
        setModalMemberId(booking.memberId);
        setModalTrainerId(booking.trainerId); // Admin can change trainer
        setModalDate(booking.date);
        setModalStartTime(booking.startTime);
        setModalEndTime(booking.endTime);
        setModalStatus(booking.status);     // Admin can change status

        closeEventModal();       // Close the small popup
        setIsEditModalOpen(true); // Open the big edit modal
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingBooking(null);
    };

    // Save changes from Edit Modal
    const handleUpdateBooking = (e) => {
        e.preventDefault();
        const updatedSchedules = schedules.map(s =>
            s.id === editingBooking.id
                ? {
                    ...s,
                    memberId: modalMemberId,
                    trainerId: modalTrainerId,
                    date: modalDate,
                    startTime: modalStartTime,
                    endTime: modalEndTime,
                    status: modalStatus, // Save the new status
                }
                : s
        );
        setSchedules(updatedSchedules);
        localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));
        handleCloseEditModal();
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">Manage All Schedules</h1>

            {/* --- CARD 1: ADD NEW BOOKING (no change) --- */}
            <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Book a New Session</h2>
                <form onSubmit={handleAddBooking} className="grid grid-cols-1 gap-4 md:grid-cols-6">                    {/* Form fields... (no change) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Member</label>
                        <select
                            value={newMemberId}
                            onChange={(e) => setNewMemberId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Trainer</label>
                        <select
                            value={newTrainerId}
                            onChange={(e) => setNewTrainerId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
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
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }} // Pop out on hover
                            whileTap={{ scale: 0.95 }}   // Push in on click
                            className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                            Add Booking
                        </motion.button>
                    </div>
                </form>
            </div>

            {/* --- RENDER THE CALENDAR --- */}
            <GymCalendar
                events={calendarEvents}
                onSelectEvent={handleEventClick}
            />

            {/* --- Calendar Legend (no change) --- */}
            <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="text-lg font-semibold mb-2">Legend</h3>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2"><StatusBadge status="Confirmed" /><span>Confirmed</span></div>
                    <div className="flex items-center gap-2"><StatusBadge status="Pending" /><span>Pending Client</span></div>
                    <div className="flex items-center gap-2"><StatusBadge status="PendingTrainer" /><span>Pending Trainer</span></div>
                    <div className="flex items-center gap-2"><StatusBadge status="N/A" /><span>Old/No Status</span></div>
                </div>
            </div>

            {/* --- 4. NEW: Event Click Popup Modal --- */}
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
                            {/* Admin can "Confirm" any pending session */}
                            {selectedEvent.resource.status !== 'Confirmed' && (
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

            {/* --- 5. NEW: Edit Modal --- */}
            {isEditModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={handleCloseEditModal}
                >
                    <div
                        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-4 text-2xl font-semibold">Edit Session</h2>
                        <form onSubmit={handleUpdateBooking} className="space-y-4">
                            {/* Member Select */}
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
                            {/* Trainer Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Trainer</label>
                                <select
                                    value={modalTrainerId}
                                    onChange={(e) => setModalTrainerId(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            {/* Date */}
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
                            {/* Start Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                <input
                                    type="time"
                                    value={modalStartTime}
                                    onChange={(e) => setModalStartTime(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            {/* End Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Time</label>
                                <input
                                    type="time"
                                    value={modalEndTime}
                                    onChange={(e) => setModalEndTime(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            {/* Status Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={modalStatus}
                                    onChange={(e) => setModalStatus(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Pending">Pending Client</option>
                                    <option value="Pending Trainer">Pending Trainer</option>
                                </select>
                            </div>
                            {/* Buttons */}
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

export default SchedulePage;