import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import {  
  Users, 
  Calendar, 
  CreditCard, 
  LayoutDashboard, 
  Settings, 
  LogIn, 
  UserPlus, 
  LogOut,
  Menu,
  X,
  User,
  ChevronDown
} from 'lucide-react';
import AuthPopup from '../pages/auth/components/AuthPopup';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, error } = useContext(AuthContext);
  const [role, setRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Only run on client to read role
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("role");
      setRole(storedRole);
    }
  }, [user]); // re-run when user changes (e.g. login/logout)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const closeAuthPopup = () => {
    setCurrentPage("");
  };

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuOpen && !event.target.closest('.profile-menu-container')) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  return (
    <>
      <nav className="bg-black text-white shadow-xl h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2 text-white hover:text-white transition-colors">
                <div className="bg-white text-black px-3 py-1 font-bold text-xl">
                  GYM-HUB
                </div>
              </Link>
            </div>

            {/* Desktop Navigation (visible on extra-large screens only) */}
            <div className="hidden xl:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {/* Always visible links for newcomers */}
                {!user && (
                  <>
                    <Link href="/trainers" className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                      <Users className="w-4 h-4" />
                      <span>Trainers</span>
                    </Link>
                    <Link href="/classes" className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                      <Calendar className="w-4 h-4" />
                      <span>Classes</span>
                    </Link>
                    <Link href="/memberships" className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                      <CreditCard className="w-4 h-4" />
                      <span>Memberships</span>
                    </Link>
                  </>
                )}

                {/* User navigation */}
                {user && role === "user" && (
                  <>
                    <Link href="/trainers" className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                      <Users className="w-4 h-4" />
                      <span>Trainers</span>
                    </Link>
                    <Link href="/classes" className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                      <Calendar className="w-4 h-4" />
                      <span>Classes</span>
                    </Link>
                    <Link href="/memberships" className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                      <CreditCard className="w-4 h-4" />
                      <span>Memberships</span>
                    </Link>
                    <Link href="/dashboard" className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  </>
                )}

                {/* Admin navigation */}
                {user && role === "admin" && (
                  <>
                    <Link href="/admin" className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                      <Settings className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  </>
                )}

                {/* Auth navigation items as buttons */}
                {!user && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      onClick={() => setCurrentPage("login")}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </button>
                    <button 
                      onClick={() => setCurrentPage("signup")}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Register</span>
                    </button>
                  </div>
                )}

                {/* Admin Logout Button */}
                {user && role === "admin" && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 ml-4 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                )}

                {/* User Profile Avatar */}
                {user && role === "user" && (
                  <div className="relative profile-menu-container">
                    <button
                      onClick={toggleProfileMenu}
                      className="flex items-center space-x-2 ml-4 hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={user?.profileImageURL || "/images/default-profile.svg"}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                      />
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {profileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-black z-50">
                        <div className="py-1">
                          <Link 
                            href="/profile" 
                            className="flex items-center px-4 py-2 text-black hover:bg-black hover:text-white transition-colors"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Profile
                          </Link>
                          <button 
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-black hover:bg-black hover:text-white transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button: visible on tablet and mobile (hidden on extra-large screens) */}
            <div className="xl:hidden">
              <button
                onClick={() => onMenuClick ? onMenuClick() : toggleMobileMenu()}
                className="bg-white text-black p-2 rounded-md hover:bg-black hover:text-white transition-colors"
                aria-label="Open menu"
              >
                {onMenuClick ? <Menu className="w-5 h-5" /> : (mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />)}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation (only when no parent menu handler provided) — shown on tablet and mobile */}
        {!onMenuClick && mobileMenuOpen && (
          <div className="xl:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black">
              {/* Always visible links for newcomers */}
              {!user && (
                <>
                  <Link href="/trainers" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                    <Users className="w-5 h-5" />
                    <span>Trainers</span>
                  </Link>
                  <Link href="/classes" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                    <Calendar className="w-5 h-5" />
                    <span>Classes</span>
                  </Link>
                  <Link href="/memberships" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                    <CreditCard className="w-5 h-5" />
                    <span>Memberships</span>
                  </Link>
                </>
              )}

              {/* User navigation */}
              {user && role === "user" && (
                <>
                  <Link href="/trainers" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                    <Users className="w-5 h-5" />
                    <span>Trainers</span>
                  </Link>
                  <Link href="/classes" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                    <Calendar className="w-5 h-5" />
                    <span>Classes</span>
                  </Link>
                  <Link href="/memberships" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                    <CreditCard className="w-5 h-5" />
                    <span>Memberships</span>
                  </Link>
                  <Link href="/dashboard" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                </>
              )}

              {/* Admin navigation */}
              {user && role === "admin" && (
                <>
                  <Link href="/admin" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                    <Settings className="w-5 h-5" />
                    <span>Admin</span>
                  </Link>
                </>
              )}

              {/* Auth navigation items as buttons for mobile */}
              {!user && (
                <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
                  <button 
                    onClick={() => { setCurrentPage("login"); closeMobileMenu(); }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors w-full"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </button>
                  <button 
                    onClick={() => { setCurrentPage("signup"); closeMobileMenu(); }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors w-full"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Register</span>
                  </button>
                </div>
              )}

              {/* Admin Logout for mobile */}
              {user && role === "admin" && (
                <div className="border-t border-white/10 pt-3 mt-3">
                  <button 
                    onClick={() => { handleLogout(); closeMobileMenu(); }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md border border-white text-white hover:bg-white hover:text-black transition-colors font-medium w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}

              {/* User Profile and Logout for mobile */}
              {user && role === "user" && (
                <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
                  <Link 
                    href="/profile" 
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors w-full"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); closeMobileMenu(); }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md border border-white text-white hover:bg-white hover:text-black transition-colors font-medium w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Popup */}
      {(currentPage === "login" || currentPage === "signup") && (
        <AuthPopup 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          onClose={closeAuthPopup} 
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-white border-l-4 border-black p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-black font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;