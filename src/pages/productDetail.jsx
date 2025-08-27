import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, Tab } from "@mui/material";
import { useCart } from "../context/cartContext";
import { CheckCircle, RefreshCcw, Truck  } from "lucide-react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
  };

  const handleBuyNow = () => {
    navigate("/buy-now", {
      state: {
        cartItems: [{ ...product, qty: quantity }],
      },
    });
  };

  if (!product) {
    return <p className="text-center mt-10 text-lg">Loading product details...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* LEFT SIDE: Product Image */}
        <div className="md:col-span-4 flex justify-center items-start">
          <img
            src={product.image || "/placeholder.png"}
            alt={product.name}
            className="w-full max-w-sm rounded-lg shadow-md object-contain"
          />
        </div>

        {/* MIDDLE: Product Info */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <span className="text-gray-500">{product.category}</span>

          {/* Ratings */}
          
          <div className="flex items-center text-yellow-500 text-sm">
            {[...Array(5)].map((_, i) => {
              const number = i + 1;
              return (
                <span key={i}>
                  {product.rating >= number ? (
                    <FaStar />
                  ) : product.rating >= number - 0.5 ? (
                    <FaStarHalfAlt />
                  ) : (
                    <FaRegStar />
                  )}
                </span>
              );
            })}
            <span className="ml-2 text-gray-600">{product.reviewsCount || 100} ratings</span>
          </div>
          
          {/* Price */}
          <span className="text-3xl font-semibold text-red-600">
            ₹{product.price}
          </span>

          {/* Stock Status */}
          <span
            className={`px-3 py-1 rounded-full text-sm w-fit ${
              product.stock <= 0
                ? "bg-red-500 text-white"
                : product.stock <= 5
                ? "bg-yellow-400 text-black"
                : "bg-green-500 text-white"
            }`}
          >
            {product.stock <= 0
              ? "Out of Stock"
              : product.stock <= 5
              ? "Only a few left!"
              : "In Stock"}
          </span>
        </div>

        {/* RIGHT: Buy Box */}
        <div className="md:col-span-3 border rounded-lg shadow-sm p-4 flex flex-col gap-4 bg-gray-50">
          <span className="text-2xl font-semibold text-red-600">
            ₹{product.price}
          </span>

          {/* Quantity Selector */}
          <div>
            <label className="text-sm font-medium">Quantity: </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="ml-2 border rounded p-1"
            >
              {Array.from(
                { length: Math.min(product.stock, 10) },
                (_, i) => i + 1
              ).map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`w-full py-2 rounded font-semibold ${
              product.stock > 0
                ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            Add to Cart
          </button>

          <button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className={`w-full py-2 rounded text-white font-semibold ${
              product.stock > 0
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            Buy Now
          </button>

         {/* Delivery Info */}
        <div className="text-sm text-gray-600 mt-2 space-y-2">
          <p className="flex items-center gap-2">
            <CheckCircle className="text-green-600 w-4 h-4" /> Secure transaction
          </p>
          <p className="flex items-center gap-2">
            <RefreshCcw className="text-blue-600 w-4 h-4" /> 7 Days Replacement
          </p>
          <p className="flex items-center gap-2">
            <Truck className="text-orange-600 w-4 h-4" /> Delivered by Platinum Express
          </p>
        </div>
        </div>
      </div>

      {/* Tabs Section (Full Width) */}
      <div className="mt-10">
  <Tabs
    value={tabValue}
    onChange={(e, newValue) => setTabValue(newValue)}
  >
    {product.description && <Tab label="Description" />}
    {product.aboutItems && product.aboutItems.length > 0 && (
      <Tab label="About this item" />
    )}
    {product.specifications && product.specifications.length > 0 && (
      <Tab label="Specifications" />
    )}
  </Tabs>

  <div className="mt-4 bg-white border rounded-lg p-4">
    {/* Description */}
    {tabValue === 0 && product.description && (
      <div>
        <h2 className="text-lg font-semibold mb-2">Product Description</h2>
        <p>{product.description}</p>
      </div>
    )}

    {/* About this item */}
    {((!product.description && tabValue === 0) ||
      (product.description && tabValue === 1)) &&
      product.aboutItems &&
      product.aboutItems.length > 0 && (
        <div>
          <h2 className="font-semibold text-lg mb-1">About this item</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {product.aboutItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

    {/* Specifications */}
    {((!product.description && !product.aboutItems && tabValue === 0) ||
      (!product.description && product.aboutItems && tabValue === 1) ||
      (product.description && product.aboutItems && tabValue === 2)) &&
      product.specifications &&
      product.specifications.length > 0 && (
        <div>
          <h2 className="font-semibold text-lg mb-1">Specifications</h2>
          <table className="w-full border border-gray-300 text-sm">
            <tbody>
              {product.specifications.map((spec, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="border px-3 py-2 font-medium w-1/3">
                    {spec.key}
                  </td>
                  <td className="border px-3 py-2">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
  </div>
</div>

    </div>
  );
};

export default ProductDetails;
