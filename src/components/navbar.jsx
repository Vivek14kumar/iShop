import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useCart } from "../context/cartContext";

// React Icons
import { FiMenu, FiX, FiSearch, FiUser, FiLogIn, FiUserPlus, FiSettings } from "react-icons/fi";
import { AiOutlineShoppingCart, AiOutlineHome } from "react-icons/ai";
import { BiCategory, BiLogOut } from "react-icons/bi";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef(null);

  // Dropdown + search state
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState(["All"]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Use env variable or fallback to production URL
        const apiUrl = import.meta.env.VITE_API_URL || "https://ishop-1-le5r.onrender.com";
        const res = await fetch(`${apiUrl}/api/categories`);

        // Check if the response is JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Expected JSON but got HTML:", text);
          return;
        }

        const data = await res.json();
        setCategories(["All", ...data.map((c) => c.name)]);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim() && selectedCategory === "All") return;

    const params = new URLSearchParams();
    if (selectedCategory !== "All") params.append("category", selectedCategory);
    if (searchQuery.trim()) params.append("search", searchQuery);

    navigate(`/products?${params.toString()}`);
    setMenuOpen(false);
  };

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Desktop Navbar */}
      <header className="bg-[#131921] text-white sticky top-0 z-50 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center px-4 py-2 gap-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-yellow-400 whitespace-nowrap">
            iShop
          </Link>

          {/* Location */}
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-xs text-gray-300">Deliver to</span>
            <span className="font-semibold">India</span>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 hidden md:flex">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2 py-2 bg-gray-100 text-black rounded-l-full border-r border-gray-300 focus:outline-none"
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${selectedCategory}`}
              className="w-full px-4 py-2 text-black focus:outline-none"
            />
            <button
              type="submit"
              className="bg-yellow-400 text-black px-4 rounded-r-full font-bold hover:bg-yellow-500"
            >
              <FiSearch size={20} />
            </button>
          </form>

          {/* Account + Cart */}
          <nav className="hidden md:flex gap-6 items-center text-sm">
            {user ? (
              <>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-300">Hello, {user.name}</span>
                  <span
                    onClick={logout}
                    className="font-bold cursor-pointer hover:text-yellow-400 flex items-center gap-1"
                  >
                    <BiLogOut /> Logout
                  </span>
                </div>

                {!isAdmin && (
                  <>
                    <Link to="/my-orders" className="flex flex-col hover:text-yellow-400">
                      <span className="text-xs text-gray-300">Returns</span>
                      <span className="font-bold">& Orders</span>
                    </Link>
                    <Link
                      to="/cart"
                      className="relative flex items-center font-bold hover:text-yellow-400"
                    >
                      <AiOutlineShoppingCart size={20} />
                      <span className="ml-1">Cart</span>
                      {cart.length > 0 && (
                        <span className="absolute -top-2 -right-3 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                          {cart.length}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                <Link to="/profile" className="hover:text-yellow-400 font-bold flex items-center gap-1">
                  <FiUser /> My Profile
                </Link>

                {isAdmin && (
                  <Link to="/admin" className="hover:text-yellow-400 font-bold flex items-center gap-1">
                    <FiSettings /> Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-yellow-400 flex items-center gap-1">
                  <FiLogIn /> Login
                </Link>
                <Link to="/register" className="hover:text-yellow-400 flex items-center gap-1">
                  <FiUserPlus /> Register
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Secondary category nav */}
        <div className="bg-[#232f3e] text-sm hidden md:block">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 overflow-x-auto">
            <Link to="/products" className="py-2 hover:text-yellow-400 whitespace-nowrap">
              All Products
            </Link>
            {categories
              .filter((c) => c !== "All")
              .map((c, idx) => (
                <Link
                  key={idx}
                  to={`/products?category=${c}`} 
                  className="py-2 hover:text-yellow-400 whitespace-nowrap"
                >
                  {c}
                </Link>
              ))}
          </div>
        </div>
      </header>

      {/* Mobile Amazon-style Navbar */}
      <header className="bg-[#131921] text-white sticky top-0 z-50 md:hidden">
        {/* Top Row */}
        <div className="flex items-center justify-between px-4 py-2">
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl focus:outline-none"
          >
            <FiMenu />
          </button>

          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-yellow-400">
            iShop
          </Link>

          {/* Cart (hidden for admin) */}
          {!isAdmin && (
            <Link
              to="/cart"
              className="relative flex items-center font-bold"
              onClick={() => setMenuOpen(false)}
            >
              <AiOutlineShoppingCart size={22} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-3 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                  {cart.length}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 bg-white rounded-full mx-3 mb-2 px-1 py-1"
        >
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2 py-1 text-sm bg-gray-100 text-black rounded-l-full rounded-r-lg focus:outline-none"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search in ${selectedCategory}`}
            className="flex-1 px-2 py-1 text-black text-sm focus:outline-none"
          />
          <button
            type="submit"
            className=" text-black px-3 py-1 rounded-r-full rounded-s-lg font-bold"
          >
            <FiSearch />
          </button>
        </form>

        {/* Slide-out Drawer */}
        {menuOpen && (
          <div
            ref={drawerRef}
            className="absolute top-0 left-0 w-3/4 h-screen bg-[#232f3e] text-white p-4 space-y-4 animate-slideDown z-50"
          >
            {/* Close */}
            <button
              onClick={() => setMenuOpen(false)}
              className="text-xl font-bold mb-2"
            >
              <FiX />
            </button>

            {/* User */}
            {user ? (
              <>
                <div>
                  <span className="text-xs text-gray-300">Hello, {user.name}</span>
                </div>
                {!isAdmin && (
                  <>
                    <div>
                      <Link to="/my-orders" onClick={() => setMenuOpen(false)}>
                        My Orders
                      </Link>
                    </div>
                    <div>
                      <Link to="/cart" onClick={() => setMenuOpen(false)}>
                        Cart
                      </Link>
                    </div>
                  </>
                )}
                <div>
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>
                    My Profile
                  </Link>
                </div>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-1">
                    <FiSettings /> Admin Panel
                  </Link>
                )}
                <div className="flex flex-col mb-3">
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="text-yellow-400 font-bold flex items-center gap-1"
                  >
                    <BiLogOut /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <FiLogIn className="inline mr-1" /> Login
                  </Link>
                </div>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  <FiUserPlus className="inline mr-1" /> Register
                </Link>
              </>
            )}

            {/* Categories */}
            <div className="border-t border-gray-600 pt-3">
              <h3 className="font-bold mb-2">Shop by Category</h3>
              <div className="flex flex-col gap-2">
                {categories
                  .filter((c) => c !== "All")
                  .map((c, idx) => (
                    <Link
                      key={idx}
                      to={`/products?category=${c}`} 
                      className="hover:text-yellow-400"
                      onClick={() => setMenuOpen(false)}
                    >
                      {c}
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 flex justify-around items-center py-2 text-xs font-bold md:hidden z-50">
        <Link
          to="/"
          className={`flex flex-col items-center ${
            location.pathname === "/" ? "text-yellow-500" : "text-gray-700"
          }`}
        >
          <AiOutlineHome size={20} />
          <span>Home</span>
        </Link>

        <Link
          to="/products"
          className={`flex flex-col items-center ${
            location.pathname.startsWith("/category") ||
            location.pathname.startsWith("/products")
              ? "text-yellow-500"
              : "text-gray-700"
          }`}
        >
          <BiCategory size={20} />
          <span>Products</span>
        </Link>

        {/* Show Admin instead of My Orders for Admin */}
        {isAdmin && user && (
          <Link
            to="/admin"
            className={`flex flex-col items-center relative ${
              location.pathname === "/admin" ? "text-yellow-500" : "text-gray-700"
            }`}
          >
            <FiSettings size={20} />
            <span>Admin</span>
          </Link>
        )}

        {!isAdmin && user && (
          <Link
            to="/my-orders"
            className={`flex flex-col items-center relative ${
              location.pathname === "/my-orders" ? "text-yellow-500" : "text-gray-700"
            }`}
          >
            <AiOutlineShoppingCart size={20} />
            <span>My Orders</span>
          </Link>
        )}

        {!user && (
          <Link
            to="/register"
            className={`flex flex-col items-center relative ${
              location.pathname === "/register" ? "text-yellow-500" : "text-gray-700"
            }`}
          >
            <FiUserPlus size={20} />
            <span>Register</span>
          </Link>
        )}

        {user ? (
          <Link
            to="/profile"
            className={`flex flex-col items-center ${
              location.pathname === "/profile" ? "text-yellow-500" : "text-gray-700"
            }`}
          >
            <FiUser size={20} />
            <span>Account</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className={`flex flex-col items-center ${
              location.pathname === "/login" ? "text-yellow-500" : "text-gray-700"
            }`}
          >
            <FiLogIn size={20} />
            <span>Login</span>
          </Link>
        )}
      </nav>
    </>
  );
}
