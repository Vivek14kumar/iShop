import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const stages = ["Ordered", "Processing", "Out for Delivered", "Delivered"]; // Adjust as needed

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.email) return;

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/user/${user.email}`);
        const ordersData = res.data;

        const ordersWithProducts = await Promise.all(
          ordersData.map(async (order) => {
            const itemsWithDetails = await Promise.all(
              order.cartItems.map(async (item) => {
                const prodRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${item.productId}`);
                return { ...item, product: prodRes.data };
              })
            );
            return { ...order, cartItems: itemsWithDetails };
          })
        );

        setOrders(ordersWithProducts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-6 text-lg">Loading orders...</p>;
  if (orders.length === 0) return <p className="text-center mt-6 text-gray-500">No orders found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">My Orders</h2>

      {orders.map((order) => {
        const totalAmount = order.cartItems.reduce(
          (sum, item) => sum + item.quantity * item.product.price,
          0
        );

        const currentStageIndex = stages.indexOf(order.status);

        return (
          <div
            key={order._id}
            className="bg-white shadow-lg rounded-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 flex flex-col gap-4 p-5"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Order ID: {order.orderId}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-sm rounded-full font-semibold ${
                  order.status === "Ordered"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "Processing"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "Delivered"
                    ? "bg-green-100 text-green-800"
                    : order.status === "Cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status}
              </span>
            </div>

            {/* Items Preview */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
              {order.cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col items-center gap-1 p-1 transform hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={item.product.image || "/placeholder.jpg"}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <p className="text-xs text-center text-gray-700 w-20 truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-500">₹{item.product.price}</p>
                </div>
              ))}
            </div>

            {/* Progress Bar with Points */}
            <div className="relative mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-green-500 h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentStageIndex + 1) / stages.length) * 100}%`,
                  }}
                ></div>
              </div>
              {/* Rounded Points */}
              <div className="absolute top-[-6px] left-0 w-full flex justify-between">
                {stages.map((stage, idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                      idx <= currentStageIndex
                        ? "bg-green-500 border-green-500"
                        : "bg-white border-gray-300"
                    }`}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                {stages.map((stage, idx) => (
                  <span key={idx}>{stage}</span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <p className="text-gray-700 font-medium">Total: ₹{totalAmount}</p>
              <button
                onClick={() => navigate(`/orderSuccess/${order.orderId}`)}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                View Details
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
