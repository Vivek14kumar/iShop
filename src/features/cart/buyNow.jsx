import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCart } from "../../context/cartContext";
import { FaMoneyBillWave, FaCreditCard, FaUniversity, FaPlus } from "react-icons/fa";
import { SiPaytm } from "react-icons/si";
import axios from "axios";

export default function BuyNow() {
  const location = useLocation();
  const navigate = useNavigate();
  const cartItems = location.state?.cartItems || [];
  const [loading, setLoading] = useState(false);
  const { clearCart } = useCart();

  const API_URL =   "http://localhost:5000/api/users";
  const user = JSON.parse(localStorage.getItem("user"));

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // For new address form
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    name: user?.name || "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    mobile: user?.mobile || "",
  });

  useEffect(() => {
    if (!user?._id) {
      navigate("/login");
      return;
    }
    const fetchAddresses = async () => {
      try {
        const res = await axios.get(`${API_URL}/${user._id}`);
        if (res.data?.addresses?.length > 0) {
          setSavedAddresses(res.data.addresses);

          if (!selectedAddress) {
            setSelectedAddress(res.data.addresses[0]._id);
          }
        } else {
          setSavedAddresses([]);
          setSelectedAddress(null);
        }
      } catch (err) {
        console.error("Fetch addresses error:", err);
      }
    };
    fetchAddresses();
  }, [user, navigate, selectedAddress]);

  // Payment methods
  const paymentMethods = [
    { id: "COD", name: "Cash on Delivery", icon: <FaMoneyBillWave className="text-green-600 text-xl" /> },
    { id: "Card", name: "Credit/Debit Card", icon: <FaCreditCard className="text-blue-600 text-xl" /> },
    { id: "UPI", name: "UPI / Wallet", icon: <SiPaytm className="text-indigo-600 text-xl" /> },
    { id: "NetBanking", name: "Net Banking", icon: <FaUniversity className="text-purple-600 text-xl" /> },
  ];
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Add new address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/${user._id}/addresses`, newAddress);
      setSavedAddresses(res.data);
      const latest = res.data[res.data.length - 1];
      setSelectedAddress(latest._id);
      toast.success("Address added successfully!");
      setShowForm(false);
      setNewAddress({
        label: "",
        name: user?.name || "",
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
        mobile: user?.mobile || "",
      });
    } catch (err) {
      console.error("Add address error:", err);
      toast.error(" Failed to add address");
    }
  };

const placeOrder = async () => {
  if (!cartItems || cartItems.length === 0) {
    return toast.error("Your cart is empty.");
  }

  if (!selectedAddress) {
    return toast.error("Please select a delivery address before placing order.");
  }

  if (!paymentMethod) {
    return toast.error("Please select a payment method before placing order.");
  }

  const chosenAddr = savedAddresses.find((a) => a._id === selectedAddress);

  if (
    !chosenAddr ||
    !chosenAddr.addressLine ||
    !chosenAddr.city ||
    !chosenAddr.state ||
    !chosenAddr.pincode ||
    !chosenAddr.mobile
  ) {
    return toast.error("Please select a valid delivery address");
  }

  // Filter valid cart items
  const validCartItems = cartItems.filter((item) => item._id && item.qty > 0);
  if (validCartItems.length === 0) {
    return toast.error("Cart has invalid items");
  }

  try {
    setLoading(true);

    // Map cart items properly
const orderCartItems = validCartItems.map((item) => ({
  productId: item._id,                   // product ID only
  dealId: item.dealId || null,           // deal reference
  productName: item.name,                // deal/product name
  productImage: item.image,              // product image
  productCategory: item.category || "",  // category
  price: item.price,                     // final price (discounted if deal)
  originalPrice: item.originalPrice || item.price, 
  discount: item.discount || 0,
  quantity: item.qty,
  totalAmount: item.price * item.qty,    // total for this line
}));

    // Calculate totalAmount
    const totalAmount = validCartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    const orderData = {
      userId: user._id,           // MongoDB ObjectId
      customUserId: user.userId,  // optional, custom ID
      userEmail: user.email,
      cartItems: orderCartItems,
      shippingAddress: {
        name: chosenAddr.name || user.name, // fallback to user name
        phone: chosenAddr.mobile,
        address: chosenAddr.addressLine,
        city: chosenAddr.city,
        state: chosenAddr.state,
        pincode: chosenAddr.pincode,
      },
      paymentMethod,
      totalAmount,
      status: "Ordered",
    };

    const res = await axios.post("http://localhost:5000/api/orders", orderData);

    localStorage.setItem("lastOrder", JSON.stringify(res.data));
    toast.success(` Order ${res.data.order?.orderId} placed successfully!`);

    clearCart();
    setTimeout(() => navigate(`/orderSuccess/${res.data.order?.orderId}`), 1200);
  } catch (err) {
    console.error("Place order error:", err.response?.data || err.message);
    toast.error(err.response?.data?.message || " Failed to place order");
  } finally {
    setLoading(false);
  }
};

  const deliveryDates = useMemo(() => {
    return cartItems.map(() => {
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 4) + 2);
      return date.toDateString();
    });
  }, [cartItems]);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">

          {/* Address Selection */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">Select a delivery address</h3>
            {savedAddresses.length === 0 ? (
              <p className="text-gray-500">No saved addresses found.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`block border rounded-lg p-3 cursor-pointer transition ${
                      selectedAddress === addr._id
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-300 hover:border-yellow-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr._id}
                      checked={selectedAddress === addr._id}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="mr-2"
                    />
                    <span className="font-bold">{addr.label}</span>
                    <div className="text-sm text-gray-600 ml-6">
                      {addr.name}, {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                      <br />
                      Phone: {addr.mobile}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Add New Address Button */}
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 text-blue-600 hover:underline mt-2"
              >
                <FaPlus /> Add a new address
              </button>
            )}

            {/* Add New Address Form */}
            {showForm && (
              <form onSubmit={handleAddAddress} className="space-y-3 mt-4">
                <input
                  type="text"
                  placeholder="Label (Home, Office)"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
                <textarea
                  placeholder="Address"
                  value={newAddress.addressLine}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full border p-2 rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="w-full border p-2 rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={newAddress.mobile}
                    onChange={(e) => setNewAddress({ ...newAddress, mobile: e.target.value })}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">Select payment method</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition ${
                    paymentMethod === method.id
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-300 hover:border-yellow-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                  />
                  {method.icon}
                  {method.name}
                </label>
              ))}
            </div>
          </div>

          {/* Product List */}
          <div>
            <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Review your order</h2>
            {cartItems.length === 0 ? (
              <p className="text-gray-600">No items found for checkout.</p>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 bg-white p-4 rounded-lg shadow hover:shadow-lg transition mb-3"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover border rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-gray-500">Qty: {item.qty}</p>
                    <p className="text-green-700 font-bold">₹{item.price}</p>
                    <p className="text-sm text-green-600 flex items-center gap-1">
                       Get it by {deliveryDates[idx]}
                    </p>
                  </div>
                  <div className="font-bold text-gray-800">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-lg sticky top-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Order Summary</h3>
            <div className="flex justify-between mb-2">
              <span>Items ({cartItems.length}):</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Delivery:</span>
              <span className="text-green-600">FREE</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-bold text-red-600">
              <span>Order Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button
              onClick={placeOrder}
              disabled={loading}
              className={`mt-4 w-full py-2 rounded-lg font-semibold text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              {loading ? "Placing Order..." : "Place Your Order"}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              By placing your order, you agree to Amazon's Conditions of Use & Sale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
