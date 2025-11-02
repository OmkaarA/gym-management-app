import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { v4 as uuidv4 } from 'uuid';
import GymCalendar from '../../components/GymCalendar.jsx';
import { motion, AnimatePresence } from 'framer-motion';
// 1. Import all the modals
import ConfirmationModal from '../../components/ConfirmationModal.jsx';
import SuccessModal from '../../components/SuccessModal.jsx';

// StatusBadge component (with dark mode)
const StatusBadge = ({ status }) => {
    let styles = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
    let text = status || 'N/A';
    if (status === 'Confirmed') {
        styles = 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
    } else if (status === 'PendingTrainer') {
        styles = 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
        text = 'Pending Trainer';
    } else if (status === 'Pending') {
        styles = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
        text = 'Pending Client';
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>
            {text}
        </span>
    );
};

function MemberSchedulePage() {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [trainers, setTrainers] = useState([]);

    // Form state
    const [newTrainerId, setNewTrainerId] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newStartTime, setNewStartTime] = useState('');
    const [newEndTime, setNewEndTime] = useState('');

    // --- 2. Add state for ALL modals and errors ---
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState(null);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [bookingToCancel, setBookingToCancel] = useState(null);

    // Date const
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;

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

    // Timer for success modal
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    // Transform data for calendar
    const calendarEvents = useMemo(() => {
        const trainerMap = new Map(trainers.map(t => [t.id, t.name]));
        return schedules
            .filter(s => s.memberId === user.id)
            .map(s => {
                const trainerName = trainerMap.get(s.trainerId) || 'Unknown';
                const startDateTime = new Date(`${s.date}T${s.startTime}`);
                const endDateTime = new Date(`${s.date}T${s.endTime}`);
                return {
                    title: `w/ ${trainerName} (${s.status || 'N/A'})`,
                    start: startDateTime,
                    end: endDateTime,
                    resource: s,
                };
            });
    }, [schedules, trainers, user.id]);

    // --- 3. Update ALL Action Handlers ---

    // Confirm a booking (for trainer-made requests)
    const handleConfirm = (idToConfirm) => {
        const updatedSchedules = schedules.map(s =>
            s.id === idToConfirm ? { ...s, status: 'Confirmed' } : s
        );
        setSchedules(updatedSchedules);
        localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));

        setSuccessMessage('Session Confirmed!');
        setShowSuccess(true);
        closeEventModal();
    };

    // Step 1: Open Cancel modal
    const handleCancelClick = (booking) => {
        setBookingToCancel(booking);
        setIsConfirmOpen(true);
        setIsEventModalOpen(false); // Close small popup
    };

    // Step 2: Run cancel logic
    const confirmCancel = () => {
        if (!bookingToCancel) return;
        const updatedSchedules = schedules.filter(s => s.id !== bookingToCancel.id);
        setSchedules(updatedSchedules);
        localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));
        setIsConfirmOpen(false);
        setBookingToCancel(null);
    };

    // Add a new booking (by the member)
    const handleAddBooking = (e) => {
        e.preventDefault();
        setError(null);
        if (!newTrainerId || !newDate || !newStartTime || !newEndTime) {
            setError('Please fill out all fields.');
            return;
        }
        const newBooking = {
            id: uuidv4(),
            memberId: user.id,
            trainerId: newTrainerId,
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
            status: 'PendingTrainer',
        };
        const updatedSchedules = [...schedules, newBooking];
        setSchedules(updatedSchedules);
        localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));

        setNewDate('');
        setNewStartTime('');
        setNewEndTime('');
        setSuccessMessage('Booking Requested!');
        setShowSuccess(true);
    };

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
        <div className="space-y-8 text-gray-900 dark:text-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">My Schedule</h1>

            {/* --- Request a Session Card --- */}
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Request a New Session</h2>
                <form onSubmit={handleAddBooking} className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    {/* Trainer Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trainer</label>
                        <select
                            value={newTrainerId}
                            onChange={(e) => setNewTrainerId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                        <input
                            type="date" value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            min={minDate}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    {/* Start Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                        <input
                            type="time" value={newStartTime}
                            onChange={(e) => setNewStartTime(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    {/* End Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
                        <input
                            type="time" value={newEndTime}
                            onChange={(e) => setNewEndTime(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    {/* Submit Button */}
                    <div className="md:self-end">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                            Request Booking
                        </motion.button>
                    </div>
                </form>
                {/* --- 4. Add Error Message Display --- */}
                {error && (
                    <p className="mt-4 text-sm text-red-500">
                        {error}
                    </p>
                )}
            </div>

            {/* --- RENDER THE CALENDAR --- */}
            <GymCalendar
                events={calendarEvents}
                onSelectEvent={handleEventClick}
            />

            {/* --- 5. ALL MODALS --- */}

            {/* --- Event Click Popup Modal --- */}
            {isEventModalOpen && selectedEvent && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={closeEventModal}
                >
                    <div
                        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-2 text-2xl font-semibold dark:text-white">{selectedEvent.title}</h2>
                        <div className="mb-4">
                            <p className="text-gray-700 dark:text-gray-300">
                                {selectedEvent.start.toLocaleString()}
                            </p>
                            <StatusBadge status={selectedEvent.resource.status} />
                        </div>

                        <div className="flex flex-col gap-2">
                            {/* Show "Confirm" for trainer requests */}
                            {selectedEvent.resource.status === 'Pending' && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => handleConfirm(selectedEvent.resource.id)}
                                    className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                >
                                    Confirm Session
                                </motion.button>
                            )}
                            {/* Show "Cancel" for member requests */}
                            {selectedEvent.resource.status === 'PendingTrainer' && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => handleCancelClick(selectedEvent.resource)}
                                    className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                >
                                    Cancel Request
                                </motion.button>
                            )}
                            <button
                                onClick={closeEventModal}
                                className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Success & Confirm Modals --- */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <SuccessModal message={successMessage} />
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onCancel={() => setIsConfirmOpen(false)}
                onConfirm={confirmCancel}
                title="Cancel Request?"
                confirmText="Yes, Cancel"
            >
                Are you sure you want to cancel this booking request?
            </ConfirmationModal>
        </div>
    );
}

export default MemberSchedulePage;