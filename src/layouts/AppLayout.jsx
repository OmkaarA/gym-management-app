import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/SideBar'; // <-- Double check this filename!

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
      <main
        className={`flex-1 overflow-y-auto bg-gray-100 p-8 transition-all duration-300 dark:bg-gray-900 ${isSidebarOpen ? 'ml-64' : 'ml-0'
          }`}
      >
        {/* === ADD THIS "SHOW" BUTTON === */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-20 rounded-md bg-gym-900 p-2 text-white"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        {/* === END OF BUTTON === */}

        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;