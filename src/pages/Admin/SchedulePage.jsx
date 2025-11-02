import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import GymCalendar from '../../components/GymCalendar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
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

function SchedulePage() {
    const { user } = useAuth(); // Get user
    const [schedules, setSchedules] = useState([]);
    const [members, setMembers] = useState([]);
    const [trainers, setTrainers] = useState([]);

    // Add Form state
    const [newMemberId, setNewMemberId] = useState('');
    const [newTrainerId, setNewTrainerId] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newStartTime, setNewStartTime] = useState('');
    const [newEndTime, setNewEndTime] = useState('');

    // --- 2. Add state for ALL modals and errors ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState(null);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editingBooking, setEditingBooking] = useState(null);
    const [bookingToDelete, setBookingToDelete] = useState(null);

    // State for Edit Modal
    const [modalMemberId, setModalMemberId] = useState('');
    const [modalTrainerId, setModalTrainerId] = useState('');
    const [modalDate, setModalDate] = useState('');
    const [modalStartTime, setModalStartTime] = useState('');
    const [modalEndTime, setModalEndTime] = useState('');
    const [modalStatus, setModalStatus] = useState('');

    // Date const
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

    // Timer for success modal
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

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

    // --- 3. Update ALL Action Handlers ---

    // Click on a calendar event
    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsEventModalOpen(true);
    };

    const closeEventModal = () => {
        setIsEventModalOpen(false);
        setSelectedEvent(null);
    }

    // Add a new booking (Admin-created)
    const handleAddBooking = (e) => {
        e.preventDefault();
        setError(null);
        if (!newMemberId || !newTrainerId || !newDate || !newStartTime || !newEndTime) {
            setError('Please fill out all fields.');
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
        setSuccessMessage('Booking Added!');
        setShowSuccess(true);
    };

    // Confirm any pending booking
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

    // Step 1: Open Delete modal
    const handleDeleteClick = (booking) => {
        setBookingToDelete(booking);
        setIsConfirmOpen(true);
        setIsEventModalOpen(false); // Close the small popup
    };

    // Step 2: Run delete logic
    const confirmDelete = () => {
        if (!bookingToDelete) return;
        const updatedSchedules = schedules.filter(s => s.id !== bookingToDelete.id);
        setSchedules(updatedSchedules);
        localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));
        setIsConfirmOpen(false);
        setBookingToDelete(null);
    };

    // Edit Modal Handlers
    const handleOpenEditModal = (booking) => {
        setEditingBooking(booking);
        setModalMemberId(booking.memberId);
        setModalTrainerId(booking.trainerId);
        setModalDate(booking.date);
        setModalStartTime(booking.startTime);
        setModalEndTime(booking.endTime);
        setModalStatus(booking.status);
        closeEventModal();
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => setIsEditModalOpen(false);

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
                    status: modalStatus,
                }
                : s
        );
        setSchedules(updatedSchedules);
        localStorage.setItem('gymSchedules', JSON.stringify(updatedSchedules));
        handleCloseEditModal();
    };

    // Check role
    if (user.role !== 'admin') {
        return (
            <div className="p-6 dark:bg-gray-900">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="dark:text-gray-100">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        // 4. Add dark mode classes
        <div className="space-y-8 text-gray-900 dark:text-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Manage All Schedules</h1>

            {/* --- CARD 1: ADD NEW BOOKING --- */}
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Book a New Session</h2>
                <form onSubmit={handleAddBooking} className="grid grid-cols-1 gap-4 md:grid-cols-6">
                    {/* Member */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member</label>
                        <select
                            value={newMemberId}
                            onChange={(e) => setNewMemberId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    {/* Trainer */}
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
                    {/* Button */}
                    <div className="md:self-end">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                            Add Booking
                        </motion.button>
                    </div>
                </form>
                {/* --- 5. Add Error Message Display --- */}
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

            {/* --- Calendar Legend --- */}
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Legend</h3>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2"><StatusBadge status="Confirmed" /><span>Confirmed</span></div>
                    <div className="flex items-center gap-2"><StatusBadge status="Pending" /><span>Pending Client</span></div>
                    <div className="flex items-center gap-2"><StatusBadge status="PendingTrainer" /><span>Pending Trainer</span></div>
                    <div className="flex items-center gap-2"><StatusBadge status="N/A" /><span>Old/No Status</span></div>
                </div>
            </div>

            {/* --- 6. ALL MODALS --- */}

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

                        <div className="flex flex-wrap gap-2">
                            {selectedEvent.resource.status !== 'Confirmed' && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => handleConfirm(selectedEvent.resource.id)}
                                    className="flex-1 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                >
                                    Confirm
                                </motion.button>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => handleOpenEditModal(selectedEvent.resource)}
                                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Edit
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteClick(selectedEvent.resource)}
                                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                            >
                                Delete
                            </motion.button>
                            <button
                                onClick={closeEventModal}
                                className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 mt-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Edit Session Modal --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={handleCloseEditModal}>
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-4 text-2xl font-semibold dark:text-white">Edit Session</h2>
                        <form onSubmit={handleUpdateBooking} className="space-y-4">
                            {/* Member Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client</label>
                                <select
                                    value={modalMemberId}
                                    onChange={(e) => setModalMemberId(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            {/* Trainer Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trainer</label>
                                <select
                                    value={modalTrainerId}
                                    onChange={(e) => setModalTrainerId(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                                <input
                                    type="date" value={modalDate}
                                    onChange={(e) => setModalDate(e.target.value)}
                                    min={minDate}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            {/* Start Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                                <input
                                    type="time" value={modalStartTime}
                                    onChange={(e) => setModalStartTime(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            {/* End Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
                                <input
                                    type="time" value={modalEndTime}
                                    onChange={(e) => setModalEndTime(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            {/* Status Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                <select
                                    value={modalStatus}
                                    onChange={(e) => setModalStatus(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Pending">Pending Client</option>
                                    <option value="PendingTrainer">Pending Trainer</option>
                                </select>
                            </div>
                            {/* Buttons */}
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={handleCloseEditModal} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600">
                                    Cancel
                                </button>
                                <button type="submit" className="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                                    Save Changes
                                </button>
                            </div>
                        </form>
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
                onConfirm={confirmDelete}
                title="Delete Session?"
                confirmText="Delete"
            >
                Are you sure you want to delete this session? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
}

export default SchedulePage;