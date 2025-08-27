import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import ShippingLabel from "../../utils/ShippingLabel";
import Notifications from "../../components/Notifications";
import { socket } from "../../utils/socket";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Newest");

  // Helper to add notification only once
  const addNotification = (notif) => {
    setNotifications((prev) => {
      if (prev.some((n) => n.message === notif.message)) return prev;
      return [...prev, notif];
    });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`);
      const productsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
      const productsMap = {};
      productsRes.data.forEach((p) => (productsMap[p._id] = p));

      const seenOrders = JSON.parse(localStorage.getItem("seenOrders") || "[]");

      const enrichedOrders = res.data.map((order) => ({
        ...order,
        cartItems: order.cartItems.map((item) => ({
          ...item,
          product: productsMap[item.productId] || null,
        })),
        highlight: !seenOrders.includes(order._id), // stays true until clicked
      }));

      // Notify only for new orders
     /* enrichedOrders.forEach((order) => {
        if (!seenOrders.includes(order._id)) {
          toast.success(` New Order: ${order.orderId}`, { autoClose: 5000 });
        }
      });*/

      setOrders(enrichedOrders);
    } catch (err) {
      console.error(err);
      addNotification({ type: "error", message: "Failed to load orders" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleNotification = (data) => {
      
      if (data.type === "orderCreated") {
        addNotification({ type: data.type, message: data.message });
        fetchOrders();
      }
    };

    socket.on("notification", handleNotification);
    fetchOrders();

    return () => socket.off("notification", handleNotification);
  }, []);

  useEffect(() => {
  const handleReload = () => {
    fetchOrders(); //  just reload, no toast
  };

  socket.on("orderReload", handleReload);
  fetchOrders();

  return () => socket.off("orderReload", handleReload);
}, []);


  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/orders/${id}/status`, {
        status: newStatus,
      });
      toast.success("Order status updated");
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById("shipping-label").innerHTML;
    const printWindow = window.open("", "PRINT", "height=600,width=400");
    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Label</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .barcode text { font-size: 14px; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const deleteOrder = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This order will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${import.meta.env.VITE_API_URL}/api/orders/${id}`);
          setOrders((prev) => prev.filter((order) => order._id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Order has been deleted.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (err) {
          console.error(err);
          Swal.fire("Error!", "Failed to delete order.", "error");
        }
      }
    });
  };

  // Mark order as seen when clicked
  const markOrderSeen = (id) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, highlight: false } : o))
    );

    const seenOrders = JSON.parse(localStorage.getItem("seenOrders") || "[]");
    if (!seenOrders.includes(id)) {
      localStorage.setItem("seenOrders", JSON.stringify([...seenOrders, id]));
    }
  };

  // Filter + Sort
  const filteredOrders = orders
    .filter((order) => {
      const searchText = searchTerm.toLowerCase();
      const inSearch =
        order.orderId?.toLowerCase().includes(searchText) ||
        order.userEmail?.toLowerCase().includes(searchText) ||
        order.shippingAddress?.name?.toLowerCase().includes(searchText) ||
        order.shippingAddress?.phone?.toLowerCase().includes(searchText) ||
        order.cartItems.some((item) =>
          item.product?.name?.toLowerCase().includes(searchText)
        );
      const inStatus =
        statusFilter === "All" ? true : order.status === statusFilter;
      return inSearch && inStatus;
    })
    .sort((a, b) => {
      if (sortOption === "Newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOption === "Oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOption === "PriceHigh")
        return (
          b.cartItems.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0) -
          a.cartItems.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0)
        );
      if (sortOption === "PriceLow")
        return (
          a.cartItems.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0) -
          b.cartItems.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0)
        );
      return 0;
    });

  if (loading) return <p className="p-4">Loading orders...</p>;

  const statusColors = {
    Ordered: "bg-yellow-500",
    Confirmed: "bg-blue-500",
    Processing: "bg-purple-500",
    Shipped: "bg-indigo-500",
    "Out for Delivery": "bg-orange-500",
    Delivered: "bg-green-500",
    Cancelled: "bg-red-500",
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-6">Manage Orders</h2>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by Order ID, Name, Email, Product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="All">All Status</option>
          <option>Ordered</option>
          <option>Confirmed</option>
          <option>Processing</option>
          <option>Shipped</option>
          <option>Out for Delivery</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="Newest">Newest First</option>
          <option value="Oldest">Oldest First</option>
          <option value="PriceHigh">Price: High → Low</option>
          <option value="PriceLow">Price: Low → High</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-6">
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            onClick={() => markOrderSeen(order._id)}
            className={`bg-white shadow-md rounded-lg border relative cursor-pointer transition-all duration-500 ease-in-out p-4 min-h-[400px]
              ${order.highlight ? "border-yellow-400 animate-fadeIn" :
                order.status === "Cancelled" ? "border-red-400" :
                order.status === "Ordered" ? "border-gray-300" :
                "border-green-400"
              }`}
          >
            {/* New Order & Confirm Badges */}
            {(order.highlight || order.status === "Ordered") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none space-y-2">
                {order.highlight && (
                  <span className="bg-green-600 text-white text-sm font-bold text-xl px-4 py-1 rounded-full shadow-lg animate-pulse">
                    NEW
                  </span>
                )}
                {order.status === "Ordered" && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full font-semibold text-sm">
                    Please Confirm the Order
                  </span>
                )}
              </div>
            )}

            {order.status === "Cancelled" && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-white/60">
                <span className="bg-red-500 text-white px-3 py-1 rounded-full font-semibold text-sm">
                  {order.cancelledBy === "User" ? "Order Cancelled by User" : "Order Cancelled"}
                </span>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-wrap justify-between items-center border-b pb-2 mb-3">
              <div>
                <p className="text-sm font-bold">
                  Order ID: <span className="text-blue-600">{order.orderId}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
                      
              {/* Status Badge - neatly on right */}
              {order.status && (
                <span
                  className={`text-white px-3 py-1 rounded text-xs font-semibold whitespace-nowrap shadow-md ${statusColors[order.status]}`}
                >
                  {order.status}
                </span>
              )}
            </div>

            {/* Customer Info + Payment in two columns */}
            <div className="mb-3 flex flex-wrap justify-between items-start">
              {/* Customer Info (left) */}
              <div className="max-w-[70%]">
                <p className="font-semibold text-sm">Customer</p>
                <p className="text-sm">
                  {order.shippingAddress.name} ({order.shippingAddress.phone})
                </p>
                <p className="text-xs text-gray-500">{order.userEmail}</p>
                <p className="text-xs text-gray-400">
                  {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>

              {/* Payment Info (right) */}
              <div className="text-right">
                <p className="text-sm font-semibold">
                  Payment: {order.paymentMethod}
                </p>
                <p className="text-green-600 font-bold text-lg">
                  ₹
                  {order.cartItems.reduce(
                    (sum, item) => sum + (item.price || 0) * item.quantity,
                    0
                  )}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="font-semibold mb-2 text-sm">Items</p>
              <ul className="divide-y max-h-48 overflow-y-auto">
                {order.cartItems.map((item, i) => (
                  <li key={i} className="flex justify-between py-2 gap-3">
                    <div className="flex gap-3">
                      <img
                        src={item.product?.image || item.ProductImage || "/no-image.png"}
                        alt={item.ProductName ||item.product?.name || "Unknown"}
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <div>
                        <p className="text-sm font-medium">{item.ProductName || item.product?.name ||"Unknown"}</p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} × ₹{item.price || 0}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-600">
                      ₹{(item.price || 0) * item.quantity}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Status */}
            <div className="mt-4">
              <label className="text-sm font-semibold">Status</label>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order._id, e.target.value)}
                className="border p-2 rounded w-full text-sm mt-1"
              >
                <option>Ordered</option>
                <option>Confirmed</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Out for Delivery</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
            </div>

            {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              className="bg-yellow-500 text-white px-3 py-2 rounded  text-sm font-medium"
              onClick={() => setSelectedOrder(order)}
            >
              Print Shipping Label
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded  text-xs font-semibold disabled:bg-gray-300 disabled:text-gray-500"
              disabled={!(order.status === "Ordered" || order.status === "Cancelled")}
              onClick={() => deleteOrder(order._id)}
            >
              Delete
            </button>
          </div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <ShippingLabel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPrint={handlePrint}
        />
      )}

      <Notifications externalNotifications={notifications} />
    </div>
  );
}
