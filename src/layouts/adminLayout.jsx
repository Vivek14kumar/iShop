import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { 
  FaUsers, FaBoxOpen, FaClipboardList, FaSignOutAlt, FaTachometerAlt, 
  FaBars, FaListUl, FaImages, FaTags 
} from "react-icons/fa";
import { socket } from "../utils/socket";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const { logout } = useAuth();
  const location = useLocation();

  // Reset badge when navigating to Manage Orders
  useEffect(() => {
    if (location.pathname === "/admin/orders") {
      setNewOrdersCount(0);
    }
  }, [location.pathname]);

  // Listen to socket for new orders
  useEffect(() => {
    const handleOrderNotification = (data) => {
      if (data.type === "orderCreated") {
        // Show WhatsApp-like toast
        toast.success(`You Have New Order`, {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          pauseOnHover: true,
          draggable: true,
          className: "bg-green-600 text-white font-semibold rounded-lg shadow-lg",
        });

        // Increment count if not on Manage Orders page
        if (location.pathname !== "/admin/orders") {
          setNewOrdersCount((prev) => prev + 1);
        }
      }
    };

    socket.on("notification", handleOrderNotification);
    return () => socket.off("notification", handleOrderNotification);
  }, [location.pathname]);

  const navLinks = [
    { to: "/admin", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/admin/users", label: "Manage Users", icon: <FaUsers /> },
    { to: "/admin/products", label: "Manage Products", icon: <FaBoxOpen /> },
    { to: "/admin/orders", label: "Manage Orders", icon: <FaClipboardList />, badge: newOrdersCount },
    { to: "/admin/categoryManager", label: " Manage Category", icon: <FaListUl /> },
    { to: "/admin/addCarousel", label: "Manage Carousel", icon: <FaImages /> },
    { to: "/admin/todaysDeals", label: "Today's Deals", icon: <FaTags /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white fixed md:static top-0 left-0 w-64 p-6 z-30 transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          h-auto max-h-screen md:h-full
          overflow-y-auto scroll-smooth touch-auto
        `}
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-yellow-400 w-10 h-10 flex items-center justify-center rounded-full font-bold text-gray-900">A</div>
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>

        <nav className="space-y-3">
          {navLinks.map(({ to, label, icon, badge }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                location.pathname === to
                  ? "bg-yellow-400 text-gray-900 font-semibold"
                  : "hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-3">{icon}<span>{label}</span></div>
              {badge > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {badge}
                </span>
              )}
            </Link>
          ))}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:text-red-600 transition-colors w-full"
          >
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>

      {open && <div className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20" onClick={() => setOpen(false)}></div>}

      <div className="flex-1 flex flex-col bg-gray-100">
        <header className="bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-10">
          <button className="md:hidden p-2 bg-gray-200 rounded" onClick={() => setOpen(!open)}><FaBars /></button>
          <h1 className="text-lg font-semibold capitalize">
            {location.pathname.replace("/admin", "") || "Dashboard"}
          </h1>
        </header>

        <main className="flex-1 p-6 overflow-y-auto scroll-smooth relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
