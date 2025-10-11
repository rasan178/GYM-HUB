import Link from "next/link";
import { useRouter } from "next/router";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  CreditCard, 
  BookOpen, 
  Star,
  LayoutDashboard,
  Settings,
  Brain,
  MessageSquare,
  FileText,
  ClipboardList
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const router = useRouter();

  const adminMenu = [
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Trainers", path: "/admin/trainers", icon: UserCheck },
    { name: "Classes", path: "/admin/classes", icon: Calendar },
    { name: "Plans", path: "/admin/plans", icon: FileText },
    { name: "Membership Requests", path: "/admin/membership-requests", icon: ClipboardList },
    { name: "Memberships", path: "/admin/memberships", icon: CreditCard },
    { name: "Bookings", path: "/admin/bookings", icon: BookOpen },
    { name: "Testimonials", path: "/admin/testimonials", icon: Star },
  ];

  const userMenu = [
    { name: "My Membership", path: "/dashboard/memberships", icon: CreditCard },
    { name: "My Bookings", path: "/dashboard/bookings", icon: BookOpen },
    { name: "AI Plan", path: "/ai-plan", icon: Brain },
    { name: "My Reviews", path: "/dashboard/testimonials", icon: Star },
  ];

  const menuItems = role === "admin" ? adminMenu : userMenu;

  return (
    <aside className="w-64 h-screen bg-black text-white p-4">
      <Link 
        href={role === "admin" ? "/admin" : "/dashboard"}
        className="flex items-center space-x-2 mb-6 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <Settings className="w-6 h-6 text-white" />
        <h2 className="text-xl font-bold text-white">
          {role === "admin" ? "Admin Panel" : "User Dashboard"}
        </h2>
      </Link>
      <ul className="space-y-2">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = router.pathname === item.path;
          
          return (
            <li key={index}>
              <Link
                href={item.path}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-white text-black shadow-lg"
                    : "text-white hover:bg-white hover:text-black"
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Sidebar;
