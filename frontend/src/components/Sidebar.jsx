import Link from "next/link";
import { useRouter } from "next/router";

const Sidebar = ({ role }) => {
  const router = useRouter();

  const adminMenu = [
    { name: "Users", path: "/admin/users" },
    { name: "Trainers", path: "/admin/trainers" },
    { name: "Classes", path: "/admin/classes" },
    { name: "Memberships", path: "/admin/memberships" },
    { name: "Bookings", path: "/admin/bookings" },
    { name: "Testimonials", path: "/admin/testimonials" },
  ];

  const userMenu = [
    { name: "My Membership", path: "/dashboard/memberships" },
    { name: "My Bookings", path: "/dashboard/bookings" },
    { name: "AI Plan", path: "/ai-plan" },
    { name: "My Reviews", path: "/dashboard/testimonials" },
  ];

  const menuItems = role === "admin" ? adminMenu : userMenu;

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-4">
      <h2 className="text-xl font-bold mb-6">
        {role === "admin" ? "Admin Panel" : "User Dashboard"}
      </h2>
      <ul className="space-y-3">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link
              href={item.path}
              className={`block px-3 py-2 rounded-md transition ${
                router.pathname === item.path
                  ? "bg-gray-700 text-yellow-300"
                  : "hover:bg-gray-800"
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
