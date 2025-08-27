import { useCart } from "../../context/cartContext";
import EmptyCartIllustration from "../../components/emptyCartIllustration";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { cart, removeFromCart, updateQty } = useCart();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Page Container */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
        
        {/* Left Section - Cart Items */}
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-800">
            Shopping Cart
          </h2>

          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {message}
            </div>
          )}

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white p-2 rounded-lg shadow-sm">
              <EmptyCartIllustration className="mb-6" size={260} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Your iShop Cart is empty
              </h3>
              <p className="text-gray-500 mb-6 text-center">
                Shop today’s deals and fill it up with iShop products.
              </p>
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold transition"
                onClick={() => navigate("/")}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
              
                <div
                  key={item._Id}
                  className="flex flex-col sm:flex-row justify-between bg-white p-4 border rounded-lg shadow-sm hover:shadow-md transition"
                >
                  {/* Product Info */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-28 h-28 object-contain rounded border"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-lg text-gray-800 hover:text-yellow-600 cursor-pointer">
                        {item.name}
                      </h4>
                      <p className="text-gray-700 font-semibold mt-1">
                        ₹{item.price}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Eligible for FREE Delivery
                      </p>
                      <p className="text-sm text-gray-600">
                        In stock
                      </p>
                    </div>
                  </div>

                  {/* Qty + Remove */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 mt-4 sm:mt-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Qty:</span>
                      <select
                        value={item.qty}
                        onChange={(e) =>
                          updateQty(item._id, Number(e.target.value))
                        }
                        className="border p-1 rounded"
                      >
                        {[...Array(10).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => removeFromCart(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section - Order Summary */}
        {cart.length > 0 && (
          <div className="w-full md:w-80 bg-white h-fit p-6 border rounded-lg shadow-md sticky top-6">
            <h3 className="text-lg font-medium mb-4">
              Subtotal ({cart.length} items):{" "}
              <span className="font-bold text-lg text-gray-800">
                ₹{total.toFixed(2)}
              </span>
            </h3>
            <button
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold transition"
              onClick={() =>
                navigate("/buy-now", {
                  state: { cartItems: cart, totalAmount: total },
                })
              }
            >
              Proceed to Buy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
