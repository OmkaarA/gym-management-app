// Admin page to manage membership plans
import React, { useState, useEffect } from 'react'


function MembershipPlansPage() {
    const [planName, setPlanName] = useState("");
    const [duration, setDuration] = useState("");
    const [price, setPrice] = useState("");

    const [plans, setPlans] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [modalPlanName, setModalPlanName] = useState("");
    const [modalDuration, setModalDuration] = useState("");
    const [modalPrice, setModalPrice] = useState("");

    useEffect(() => {
        // Fetch plans from localStorage on component mount
        const storedPlans = JSON.parse(localStorage.getItem('gymPlans')) || [];
        setPlans(storedPlans);
    }, []);

    const handleAddPlan = (event) => {
        event.preventDefault();
        if (!planName || !duration || !price) {
            alert("Please fill in all fields");
            return;
        }


        const newPlan = { id: Date.now(), name: planName, duration: parseInt(duration), price: parseFloat(price) };

        const updatedPlans = [...plans, newPlan];
        setPlans(updatedPlans);
        localStorage.setItem('gymPlans', JSON.stringify(updatedPlans));

        setPlanName("");
        setDuration("");
        setPrice("");
    };

    const handleOpenModal = (plan) => {
        setEditingPlan(plan);
        setModalPlanName(plan.name);
        setModalDuration(plan.duration);
        setModalPrice(plan.price);
        setIsModalOpen(true);
    }
    const handleUpdatePlan = (event) => {
        event.preventDefault();

        const updatedPlans = plans.map((plan) =>
            plan.id === editingPlan.id
                ? {
                    ...plan,
                    name: modalPlanName,
                    price: parseFloat(modalPrice),
                    duration: parseInt(modalDuration),
                }
                : plan
        );
        setPlans(updatedPlans);
        localStorage.setItem('gymPlans', JSON.stringify(updatedPlans));
        setIsModalOpen(false);
    }
    const handleDeletePlan = (idToDelete) => {
        if (window.confirm("Are you sure you want to delete this plan? This cannot be undone")) {
            const updatedPlans = plans.filter(plan => plan.id !== idToDelete);
            setPlans(updatedPlans);
            localStorage.setItem('gymPlans', JSON.stringify(updatedPlans));
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-gray-800">Membership Plans</h1>
            <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-2xl font-semibold">Add New Plan</h2>
                <form onSubmit={handleAddPlan} className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                        <input
                            type="text"
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                        <input
                            type="number"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Duration (Days)</label>
                        <input
                            type="number"
                            min="1"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
                        >
                            Add Plan
                        </button>
                    </div>
                </form>
            </div><div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-2xl font-semibold">All Plans ({plans.length})</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Plan Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Duration</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {plans.length > 0 ? (
                            plans.map((plan) => (
                                <tr key={plan.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{plan.name}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">${plan.price}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{plan.duration} days</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenModal(plan)}
                                            className="mr-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlan(plan.id)}
                                            className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No plans defined.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                    <h2 className="mb-4 text-2xl font-semibold">Edit Plan</h2>
                    <form onSubmit={handleUpdatePlan} className="space-y-4">
                        {/* Plan Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                            <input
                                type="text"
                                value={modalPlanName}
                                onChange={(e) => setModalPlanName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        {/* Price Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                            <input
                                type="number"
                                min="0"
                                value={modalPrice}
                                onChange={(e) => setModalPrice(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        {/* Duration Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Duration (in days)</label>
                            <input
                                type="number"
                                min="1"
                                value={modalDuration}
                                onChange={(e) => setModalDuration(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            )}

        </div> // This is your main closing </div>
    );
}

export default MembershipPlansPage;