import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "https://ishop-2-f9qp.onrender.com";
const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const stages = ["Ordered", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/api/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (error || !order)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h3 className="text-xl font-semibold mb-3">{error || "Order not found"}</h3>
        <Link
          to="/"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
        >
          Go to Home
        </Link>
      </div>
    );

  const isCancelled = order.status === "Cancelled";
  const currentStageIndex = isCancelled ? stages.length : stages.indexOf(order.status);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Success Header */}
      <div className="flex flex-col items-center mb-8">
        <div
          className={`rounded-full w-20 h-20 flex items-center justify-center ${
            isCancelled ? "bg-red-500" : "bg-green-500"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            {isCancelled ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            )}
          </svg>
        </div>
        <h2 className="text-2xl font-bold mt-4 text-center">
          {isCancelled ? "Order Cancelled" : "Thank you! Your order has been placed."}
        </h2>
        {!isCancelled && (
          <p className="text-gray-600 mt-1 text-center">
            Your order is now <span className="font-medium">{order.status}</span>.
          </p>
        )}
      </div>

      {/* Order Tracking */}
      {!isCancelled && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Order Tracking</h3>

          {/* Mobile Vertical Scrollable Layout */}
          <div className="block md:hidden h-96 overflow-y-auto snap-y snap-mandatory">
            {stages.map((stage, idx) => (
              <div
                key={idx}
                className="flex items-start relative snap-start px-4 py-4 border-b last:border-b-0"
              >
                {/* Circle and Connecting Line */}
                <div className="flex flex-col items-center relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                      idx <= currentStageIndex ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {idx <= currentStageIndex ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  {idx !== stages.length - 1 && (
                    <div className="w-1 flex-1 bg-gray-300 relative">
                      <div
                        className={`absolute top-0 left-0 w-1 bg-green-500 transition-all duration-1000`}
                        style={{
                          height: idx < currentStageIndex ? "100%" : "0%",
                        }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Stage Label */}
                <div className="ml-4 mt-1 text-sm">
                  <p
                    className={`text-black${
                      idx <= currentStageIndex ? "text-green-600 font-semibold" : "text-gray-500"
                    }`}
                  >
                    {stage}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Horizontal Layout */}
          <div className="hidden md:flex relative items-center justify-between">
            {/* Progress line */}
            <div className="absolute top-6 left-0 w-full h-1 bg-gray-300 rounded">
              <div
                className="h-1 bg-green-500 rounded transition-all duration-1000"
                style={{
                  width: `${(currentStageIndex / (stages.length - 1)) * 100}%`,
                }}
              ></div>
            </div>

            {stages.map((stage, idx) => (
              <div key={idx} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    idx <= currentStageIndex ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {idx <= currentStageIndex ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <p className="text-xs text-center mt-2">{stage}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Info & Shipping Address */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="bg-white shadow rounded-lg p-6 flex-1">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <p>
            <span className="font-medium">Order ID:</span> {order.orderId}
          </p>
          <p>
            <span className="font-medium">Payment Method:</span> {order.paymentMethod}
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span className={isCancelled ? "text-red-500" : ""}>{order.status}</span>
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 flex-1">
          <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
          <p className="font-medium">{order.shippingAddress?.name}</p>
          <p>{order.shippingAddress?.address}</p>
          <p>
            {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
            {order.shippingAddress?.pincode}
          </p>
          <p> {order.shippingAddress?.phone}</p>
        </div>
      </div>

      {/* Items Ordered */}
      <div className="space-y-4">
        {order.cartItems.map((item) => (
          <div
            key={item._id}
            className="bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.productId?.image}
                alt={item.productId?.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <p className="font-medium">{item.productId?.name}</p>
                <p className="text-sm text-gray-500">{item.productId?.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p>Qty: {item.quantity}</p>
              <p>Price: ₹{item.price}</p>
              <p>Total: ₹{item.quantity * item.price}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <Link
          to="/"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-center transition"
        >
          Continue Shopping
        </Link>
        <Link
          to="/my-orders"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded text-center transition"
        >
          View My Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
