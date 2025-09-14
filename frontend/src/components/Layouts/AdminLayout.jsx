import Navbar from '../Navbar';
import Drawer from '../Drawer';
import Link from 'next/link';

const AdminLayout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div className="drawer drawer-mobile">
        <input id="admin-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <main className="container mx-auto p-4">{children}</main>
        </div>
        <div className="drawer-side">
          <label htmlFor="admin-drawer" className="drawer-overlay"></label>
          <ul className="menu p-4 w-80 bg-base-100 text-base-content">
            <li><Link href="/admin/users">Users</Link></li>
            <li><Link href="/admin/trainers">Trainers</Link></li>
            <li><Link href="/admin/classes">Classes</Link></li>
            <li><Link href="/admin/memberships">Memberships</Link></li>
            <li><Link href="/admin/bookings">Bookings</Link></li>
            <li><Link href="/admin/testimonials">Testimonials</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;