import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import {  
  Users, 
  Calendar, 
  Phone, 
  LayoutDashboard, 
  Settings, 
  LogIn, 
  UserPlus, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, error } = useContext(AuthContext);
  const [role, setRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <>
      <nav className="bg-black text-white shadow-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
                <div className="bg-white text-black px-3 py-1 font-bold text-xl">
                  GYM-HUB
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
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
                    <Link href="/contact" className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                      <Phone className="w-4 h-4" />
                      <span>Contact</span>
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
                    <Link href="/contact" className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                      <Phone className="w-4 h-4" />
                      <span>Contact</span>
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

                {/* Auth navigation */}
                {!user && (
                  <div className="flex items-center space-x-2 ml-4">
                    <Link href="/auth/login" className="flex items-center space-x-2 px-4 py-2 rounded-md bg-white text-black hover:bg-gray-200 transition-colors font-medium">
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </Link>
                    <Link href="/auth/register" className="flex items-center space-x-2 px-4 py-2 rounded-md border border-white text-white hover:bg-white hover:text-black transition-colors font-medium">
                      <UserPlus className="w-4 h-4" />
                      <span>Register</span>
                    </Link>
                  </div>
                )}

                {/* Logout */}
                {user && (
                  <button 
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-md border border-white text-white hover:bg-white hover:text-black transition-colors font-medium ml-4"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="bg-white text-black p-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black border-t border-white/10">
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
                  <Link href="/contact" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                    <Phone className="w-5 h-5" />
                    <span>Contact</span>
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
                  <Link href="/contact" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                    <Phone className="w-5 h-5" />
                    <span>Contact</span>
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
                  <Link href="/" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                  </Link>
                  <Link href="/admin" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-white hover:text-black transition-colors">
                    <Settings className="w-5 h-5" />
                    <span>Admin</span>
                  </Link>
                </>
              )}

              {/* Auth navigation */}
              {!user && (
                <div className="border-t border-white/10 pt-3 mt-3">
                  <Link href="/auth/login" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-md bg-white text-black hover:bg-gray-200 transition-colors font-medium mb-2">
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                  <Link href="/auth/register" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-md border border-white text-white hover:bg-white hover:text-black transition-colors font-medium">
                    <UserPlus className="w-5 h-5" />
                    <span>Register</span>
                  </Link>
                </div>
              )}

              {/* Logout */}
              {user && (
                <div className="border-t border-white/10 pt-3 mt-3">
                  <button 
                    onClick={() => { logout(); closeMobileMenu(); }}
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