import { useContext, useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import AuthContext from "../../context/AuthContext";
import { X } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { role } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Navbar at the top */}
      <header className="w-full">
        <Navbar onMenuClick={toggleSidebar} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for desktop (visible on extra-large screens only) */}
        <aside className="hidden xl:block">
          <Sidebar role={role} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-black text-white border-l border-white/10">{children}</main>

        {/* Mobile/sidebar drawer (hidden on extra-large screens) */}
        <div className={`fixed inset-0 z-50 xl:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeSidebar}
            aria-hidden="true"
          ></div>

          {/* Sidebar drawer */}
          <div className={`relative w-72 sm:w-80 bg-black text-white h-full shadow-2xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Header with close button */}
            <div className="flex items-center justify-between p-6 border-b border-white/20 bg-gradient-to-r from-black to-gray-900">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white text-black flex items-center justify-center font-extrabold text-lg rounded-xl shadow-lg">
                  GH
                </div>
                <div>
                  <h2 className="font-black text-xl uppercase tracking-wider">
                    Admin Panel
                  </h2>
                  <p className="text-white/70 text-sm font-medium">
                    Manage your gym
                  </p>
                </div>
              </div>
              <button
                className="p-3 text-white hover:bg-white/10 hover:text-white transition-all duration-300 rounded-xl hover:scale-110"
                onClick={closeSidebar}
                aria-label="Close menu"
                title="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile sidebar content */}
            <div className="p-6 flex-1 overflow-y-auto">
              <Sidebar role={role} isMobile={true} onItemClick={closeSidebar} />
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/20 bg-gradient-to-r from-gray-900 to-black">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-black text-xs font-bold">A</span>
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Administrator</p>
                  <p className="text-white/70 text-xs">Full access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
