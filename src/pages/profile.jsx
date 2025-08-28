import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Package,
  MapPin,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Mail,
  ClipboardCopy,
} from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]); // always array
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "" });
  const [currentAddress, setCurrentAddress] = useState({});
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL || "https://ishop-2-f9qp.onrender.com";

  // ---------- helpers ----------
  const normalizeOrders = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.orders)) return data.orders;
    if (Array.isArray(data?.data)) return data.data;
    if (data && typeof data === "object" && (data._id || data.id)) return [data];
    return [];
  };

  const inr = (n) =>
    typeof n === "number"
      ? n.toLocaleString("en-IN", { style: "currency", currency: "INR" })
      : n;

  const badgeClass = (status) => {
    switch (status) {
      case "Ordered":
        return "bg-yellow-100 text-yellow-800";
        case "Confirmed":
        return "bg-blue-100 text-yellow-800";
      case "Processing":
        return "bg-purple-100 text-blue-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const tabVariants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  // ---------- load user ----------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setFormData({
        name: parsed.name,
        email: parsed.email,
        mobile: parsed.mobile || "",
      });
    }
    setLoadingUser(false);
  }, []);

  // ---------- fetch full user ----------
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = user?.id || user?._id;
      if (!userId) return;
      try {
        const res = await axios.get(`${apiUrl}/api/users/${userId}`);
        setUser(res.data);
        setFormData({
          name: res.data.name || "",
          userId: res.data.userId || "",
          email: res.data.email || "",
          mobile: res.data.mobile || "",
        });
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch {
        toast.error("Failed to fetch user data!");
      }
    };
    fetchUserData();
  }, [user?.id, user?._id]);
  console.log("Fetching orders for user:", user);

  // ---------- fetch orders with product details ----------
  const fetchOrdersWithProducts = async () => {
    if (!user?.email) return;

    try {
      setLoadingOrders(true);
      const res = await axios.get(`${apiUrl}/api/orders/user/${user.email}`);
      const ordersData = normalizeOrders(res.data);

      // Fetch product details for each cartItem
      const ordersWithProducts = await Promise.all(
        ordersData.map(async (order) => {
          const items = await Promise.all(
            order.cartItems.map(async (item) => {
              try {
                const prodRes = await axios.get(`${apiUrl}/api/products/${item.productId}`);
                return {
                  ...item,
                  name: prodRes.data.name,
                  price: prodRes.data.price,
                  image: prodRes.data.image,
                };
              } catch {
                return item;
              }
            })
          );
          return { ...order, cartItems: items };
        })
      );

      setOrders(ordersWithProducts);
    } catch {
      //toast.error("Failed to fetch orders!");
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") fetchOrdersWithProducts();
  }, [user?.email, activeTab]);


  // ---------- save profile ----------
  const handleSave = async (e) => {
    e.preventDefault();
    const userId = user?.id || user?._id;
    if (!userId) return;

    try {
      const res = await axios.put(
        `${apiUrl}/api/users/account/${userId}`,
        formData
      );
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Error updating profile!");
    }
  };

  // ---------- add/edit address ----------
  const handleAddEditAddress = async (e) => {
    e.preventDefault();
    const userId = user?.id || user?._id;
    if (!userId) return;

    try {
      let res;
      if (currentAddress._id) {
        res = await axios.put(
          `${apiUrl}/api/users/${userId}/addresses/${currentAddress._id}`,
          currentAddress
        );
      } else {
        console.log("Posting address:", currentAddress);

        res = await axios.post(
          `${apiUrl}/api/users/${userId}/addresses`,
          currentAddress
        );
      }

      const updatedAddresses = Array.isArray(res.data) ? res.data : [res.data];
      const updatedUser = { ...user, addresses: updatedAddresses };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setAddressModalOpen(false);
      setCurrentAddress({});
      toast.success("Address saved successfully!");
    } catch {
      toast.error("Failed to save address!");
    }
  };

  // ---------- delete address ----------
  const handleDeleteAddress = async (id) => {
    const userId = user?.id || user?._id;
    if (!userId) return;

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the address.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(
        `${apiUrl}/api/users/${userId}/addresses/${id}`
      );
      const updatedAddresses = Array.isArray(res.data) ? res.data : [];
      const updatedUser = { ...user, addresses: updatedAddresses };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      Swal.fire({
        title: "Deleted!",
        text: "The deal has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Failed to delete deal.",
        icon: "error",
      });
    }
  };

  // ---------- cancel order ----------
const handleCancelOrder = async (orderId) => {
  const confirm = await Swal.fire({
    title: "Cancel Order?",
    text: "Are you sure you want to cancel this order?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, cancel it!",
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await axios.put(`${apiUrl}/api/orders/${orderId}/cancel`);
    
    // Update state with new order status
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId || o.orderId === orderId ? { ...o, status: "Cancelled" } : o
      )
    );

    Swal.fire({
      title: "Cancelled!",
      text: "Your order has been cancelled.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire("Error!", "Failed to cancel order.", "error");
  }
};


  if (loadingUser) return <p className="text-center mt-6">Loading profile...</p>;

  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-4 py-8 gap-6 ">
      {/* Sidebar: sticky only on md+ to avoid mobile overlap */}
      <aside className="w-full md:w-64 bg-white shadow-lg rounded-xl p-5 md:sticky md:top-4 h-fit space-y-4">
        <h2 className="text-lg font-bold mb-4">
          Hello, <span className="text-blue-600">{user?.name || "Guest"}</span>
        </h2>
        <nav className="space-y-2">
          {[
            { key: "orders", label: "Your Orders", icon: Package },
            { key: "account", label: "Account Settings", icon: User },
            { key: "addresses", label: "Addresses", icon: MapPin },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition ${
                activeTab === tab.key
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}

          <button
            onClick={() => {
              localStorage.removeItem("user");
              window.location.reload();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-500 hover:bg-gray-100"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="min-h-[220px]">
          <AnimatePresence mode="wait">
            {/* Orders */}
            {activeTab === "orders" && (
              <motion.div
                key="orders"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <h1 className="text-2xl font-bold mb-4">Your Orders</h1>

                {/* Scrollable only on desktop */}
                <div className="md:max-h-[calc(100vh-220px)] md:overflow-y-auto md:pr-2">
                  {loadingOrders ? (
                    <p className="text-center mt-6">Loading orders...</p>
                  ) : Array.isArray(orders) && orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map((order) => {
  const items = Array.isArray(order?.cartItems) ? order.cartItems : [];
  const stages = ["Ordered", "Processing","Shipped", "Delivered"]; // Amazon-like stages
  const currentStageIndex = stages.indexOf(order.status);

  return (
    <div
      key={order.orderId || order._id}
      className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-xl transition"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">
              Order Id {order.orderId || order._id}
            </h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() =>
                copyToClipboard(order.orderId || order._id)
              }
              title="Copy Order ID"
            >
              <ClipboardCopy size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar size={14} />
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : "—"}
          </p>
          {order.userEmail && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Mail size={14} />
              {order.userEmail}
            </p>
          )}
        </div>
        <span
          className={`px-3 py-1 text-sm rounded-full ${badgeClass(
            order.status
          )}`}
        >
          {order.status || "—"}
        </span>

      </div>
          
      {/* Items */}
      <div className="divide-y">
        {items.length === 0 ? (
          <div className="py-3 text-gray-500 text-sm">
            No items found for this order.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id || item.productId}
              className="flex items-center gap-4 py-3"
            >
              <img
                src={item.image || "https://via.placeholder.com/64x64.png?text=Img"}
                alt={item.name}
                className="w-16 h-16 object-cover rounded border"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity ?? 1}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{inr(Number(item.price || 0))}</p>
                {item.quantity > 1 && (
                  <p className="text-xs text-gray-500">
                    Subtotal: {inr(Number(item.price || 0) * Number(item.quantity || 1))}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Total */}
      <div className="flex justify-end gap-4 mt-4 border-t pt-3">
        <p className="text-sm text-gray-500">
          Total Items: {items.reduce((a, c) => a + (c.quantity || 1), 0)}
        </p>
        <p className="font-bold text-lg">
    Total: {inr(
      items.reduce(
        (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)),
        0
      )
    )}
  </p>
      </div>

      {/* Trace Order Timeline */}
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Track Order</h4>
        <div className="flex justify-between items-center relative">
          {stages.map((stage, idx) => (
            <div key={stage} className="flex-1 flex flex-col items-center relative">
              {/* Line */}
              {idx < stages.length - 1 && (
                <div
                  className={`absolute top-3 left-1/2 w-full h-1 -translate-x-1/2 ${
                    idx < currentStageIndex ? "bg-green-500" : "bg-gray-200"
                  }`}
                  style={{ zIndex: -1 }}
                />
              )}
              {/* Circle */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  idx <= currentStageIndex
                    ? "bg-green-500 border-green-500"
                    : "bg-white border-gray-300"
                }`}
              >
                {idx <= currentStageIndex && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <span className="text-xs mt-1 text-center">{stage}</span>
            </div>
          ))}
        </div>
      </div>

            {/* Actions (Bottom-Right) */}
            <div className="flex justify-end gap-3 mt-6">
              <Link
                to={`/orderSuccess/${order.orderId}`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded transition"
              >
                View Details
              </Link>

              {order.status !== "Cancelled" && order.status !== "Delivered" && (
                <button
                  onClick={() => handleCancelOrder(order.orderId || order._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded transition"
                >
                  Cancel Order
                </button>
              )}
            </div>
            </div>
            );
            })}
            </div>
            ) : (
              <p className="text-center mt-6 text-gray-500">
                No orders found.
              </p>
            )}
          </div>
        </motion.div>
      )}

            {/* Account */}
            {activeTab === "account" && user && (
              <motion.div
                key="account"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="bg-white shadow rounded-lg p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Account Settings</h1>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="flex items-center gap-1 text-blue-500 hover:underline"
                    >
                      <Edit size={16} /> {editMode ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  {!editMode ? (
                    <div className="space-y-2">
                      <p>
                        <strong>Username:</strong> {user.name}
                      </p>
                       <p>
                        <strong>User ID:</strong> {user.userId}
                      </p>
                      <p>
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p>
                        <strong>Mobile:</strong> {user.mobile || "N/A"}
                      </p>
                      <p>
                        <strong>Member Since:</strong>{" "}
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSave} className="space-y-4">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full border p-2 rounded"
                        placeholder="Full Name"
                      />
                      <input
                        type="text"
                        value={formData.userId}
                        disabled
                        className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
                      />
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
                      />
                      <input
                        type="text"
                        value={formData.mobile}
                        onChange={(e) =>
                          setFormData({ ...formData, mobile: e.target.value })
                        }
                        className="w-full border p-2 rounded"
                        placeholder="Mobile"
                      />
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Save Changes
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            )}

            {/* Addresses */}
            {activeTab === "addresses" && user && (
              <motion.div
                key="addresses"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Addresses</h1>
                    <button
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      onClick={() => {
                        setCurrentAddress({});
                        setAddressModalOpen(true);
                      }}
                    >
                      <Plus size={18} /> Add Address
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(user.addresses || []).map((addr) => (
                      <div
                        key={addr._id}
                        className="bg-white shadow rounded p-4 hover:shadow-lg transition"
                      >
                        <p className="font-semibold">{addr.label}</p>
                        <p className="text-gray-500">{addr.addressLine}</p>
                        <p className="text-gray-500">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-gray-500">Mobile: {addr.mobile}</p>
                        <div className="flex gap-3 mt-3">
                          <button
                            className="flex items-center gap-1 text-blue-500 hover:underline text-sm"
                            onClick={() => {
                              setCurrentAddress(addr);
                              setAddressModalOpen(true);
                            }}
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            className="flex items-center gap-1 text-red-500 hover:underline text-sm"
                            onClick={() => handleDeleteAddress(addr._id)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Address Modal (animated) */}
      <AnimatePresence>
        {addressModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAddressModalOpen(false)}
          >
            <motion.form
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg space-y-4"
              onSubmit={handleAddEditAddress}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold">
                {currentAddress?._id ? "Edit Address" : "Add Address"}
              </h3>
              {["label", "addressLine", "city", "state", "pincode", "mobile"].map(
                (field) => (
                  <input
                    key={field}
                    type="text"
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    required
                    value={currentAddress?.[field] || ""}
                    onChange={(e) =>
                      setCurrentAddress({
                        ...currentAddress,
                        [field]: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                )
              )}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
