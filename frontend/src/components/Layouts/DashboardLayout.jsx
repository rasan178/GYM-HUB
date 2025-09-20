import Navbar from '../Navbar';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import { useContext, useState } from 'react';
import AuthContext from '../../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const { error, role } = useContext(AuthContext); // get role to show user menu
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <header className="w-full">
        <Navbar />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for desktop */}
        <aside className="hidden lg:block w-64 bg-gray-900 text-white">
          <Sidebar role={role} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-100">
          {error && <div className="alert alert-error mb-4">{error}</div>}
          {children}
        </main>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar drawer */}
            <div className="relative w-64 bg-gray-900 text-white h-full p-4">
              <button
                className="absolute top-2 right-2 text-2xl"
                onClick={() => setSidebarOpen(false)}
              >
                ✕
              </button>
              <Sidebar role={role} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile hamburger button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-800 text-white px-4 py-2 rounded-md"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DashboardLayout;
