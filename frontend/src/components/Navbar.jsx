import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, error } = useContext(AuthContext);
  const [role, setRole] = useState(
    () => (typeof window !== "undefined" ? localStorage.getItem("role") : null)
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const interval = setInterval(() => {
      setRole(localStorage.getItem("role"));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          GYM-HUB
        </Link>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          {/* User navigation */}
          {user && role === "user" && (
            <>
              <li>
                <Link href="/trainers">Trainers</Link>
              </li>
              <li>
                <Link href="/classes">Classes</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
            </>
          )}

          {/* Admin navigation */}
          {user && role === "admin" && (
            <li>
              <Link href="/admin">Admin</Link>
            </li>
          )}

          {/* Auth navigation */}
          {!user && (
            <>
              <li>
                <Link href="/auth/login">Login</Link>
              </li>
              <li>
                <Link href="/auth/register">Register</Link>
              </li>
            </>
          )}

          {/* Logout */}
          {user && (
            <li>
              <a onClick={logout}>Logout</a>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
