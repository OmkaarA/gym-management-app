// src/pages/MemberSchedulePage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { v4 as uuidv4 } from 'uuid';
import GymCalendar from '../../components/GymCalendar.jsx';
import SuccessModal from '../../components/SuccessModal.jsx';
import { motion, AnimatePresence } from 'framer-motion';

// StatusBadge component (updated for all statuses)
const StatusBadge = ({ status }) => {
    let styles = 'bg-yellow-100 text-yellow-800'; // Default "Pending" (by trainer)
    let text = status; // Start with the real status

    if (status === 'Confirmed') {
        styles = 'bg-green-100 text-green-800';
    } else if (status === 'PendingTrainer') {
        styles = 'bg-blue-100 text-blue-800';
        text = 'Pending Trainer';
    } else if (status === 'Pending') {
        text = 'Pending Client'; // This is a request from a trainer
    } else {
        text = 'N/A'; // Fallback for old/bad data
    }

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>
            {text}
        </span>
    );
};

function MemberSchedulePage() {
    const { user } = useAuth(); // The logged-in member
    const [schedules, setSchedules] = useState([]);
    const [trainers, setTrainers] = useState([]);

    // Form state
    const [newTrainerId, setNewTrainerId] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newStartTime, setNewStartTime] = useState('');
    const [newEndTime, setNewEndTime] = useState('');

    // Modal state
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Get today's date for the date picker
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;

    // 
    const [showSuccess, setShowSuccess] = useState(false);

    // Load data
    useEffect(() => {
        const storedSchedules = JSON.parse(localStorage.getItem('gymSchedules')) || [];
        const storedTrainers = JSON.parse(localStorage.getItem('gymTrainers')) || [];
        setSchedules(storedSchedules);
        setTrainers(storedTrainers);
        if (storedTrainers.length > 0) {
            setNewTrainerId(storedTrainers[0].id);
        }
    }, [user.id]);

    // Transform data for calendar
    const calendarEvents = useMemo(() => {
        const trainerMap = new Map(trainers.map(t => [t.id, t.name]));
        return schedules
            .filter(s => s.memberId === user.id) // Only this member's schedule
            .map(s => {
                const trainerName = trainerMap.get(s.trainerId) || 'Unknown';

                const startDateTime = new Date(`${s.date}T${s.startTime}`);
                const endDateTime = new Date(`${s.date}T${s.endTime}`);

                return {
                    title: `w/ ${trainerName} (${s.status || 'N/A'})`, // Use the real status
                    start: startDateTime,
                    end: endDateTime,
                    resource: s, // Store original object
                };
            });
    }, [schedules, trainers, user.id]);

    // Confirm a booking
    const handleConfirm = (idToConfirm) => {
        const updatedSchedules = schedules.map(s =>
            s.id === idToConfirm ? { ...s, status: 'Confirmed' } : s
        );
        setSchedules(updatedSchedules);
        localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));
        closeEventModal();
    };

    // Delete/Cancel a booking
    const handleDelete = (idToDelete) => {
        if (window.confirm("Are you sure you want to cancel this booking request?")) {
            const updatedSchedules = schedules.filter(s => s.id !== idToDelete);
            setSchedules(updatedSchedules);
            localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));
            closeEventModal();
        }
    };

    // Add a new booking
    const handleAddBooking = (e) => {
        e.preventDefault();
        if (!newTrainerId || !newDate || !newStartTime || !newEndTime) {
            alert('Please fill out all fields.');
            return;
        }
        const newBooking = {
            id: uuidv4(),
            memberId: user.id,
            trainerId: newTrainerId,
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
            status: 'Pending Trainer',
        };
        const updatedSchedules = [...schedules, newBooking];
        setSchedules(updatedSchedules);
        localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));
        setNewDate('');
        setNewStartTime('');
        setNewEndTime('');
        setShowSuccess(true);
    };
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 2000); // Show modal for 2 seconds

            // Clean up the timer if the component unmounts
            return () => clearTimeout(timer);
        }
    }, [showSuccess]); // Only run when showSuccess changes

    // Event modal handlers
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

            {/* --- Request a Session Card --- */}
            <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Request a New Session</h2>
                <form onSubmit={handleAddBooking} className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    {/* Form fields... */}
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
                        <button
                            type="submit"
                            className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                            Request Booking
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

                        <div className="flex flex-col gap-2">
                            {/* --- THIS IS THE FIX --- */}
                            {/* Show "Confirm" for trainer requests */}
                            {selectedEvent.resource.status === 'Pending' && (
                                <button
                                    onClick={() => handleConfirm(selectedEvent.resource.id)}
                                    className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                >
                                    Confirm Session
                                </button>
                            )}
                            {/* Show "Cancel" for member requests */}
                            {selectedEvent.resource.status === 'PendingTrainer' && (
                                <button
                                    onClick={() => handleDelete(selectedEvent.resource.id)}
                                    className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                >
                                    Cancel Request
                                </button>
                            )}
                            <button
                                onClick={closeEventModal}
                                className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* --- 6. NEW: Success Modal --- */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <SuccessModal message="Booking Requested!" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default MemberSchedulePage;