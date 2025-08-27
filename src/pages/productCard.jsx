import { Link } from 'react-router-dom';
import { useCart } from '../context/cartContext';
import { FaStar, FaRegStar } from "react-icons/fa";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="border rounded-lg shadow-sm hover:shadow-lg p-4 flex flex-col transition duration-200 relative">
  {/* Stock badge */}
<div
  className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-bold ${
    product.stock > 3
      ? "bg-green-100 text-green-700"
      : product.stock > 0
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700"
  }`}
>
  {product.stock > 3
    ? "In Stock"
    : product.stock > 0
    ? "Limited Stock"
    : "Out of Stock"}
</div>



  {/* Image */}
  <div className="w-full h-48 flex items-center justify-center bg-gray-50 rounded mb-4">
  <img
    src={product.image}
    alt={product.name}
    className="max-h-full max-w-full object-contain rounded"
  />
</div>


  {/* Name & Price */}
  <h3 className="text-lg font-bold mb-1">{product.name}</h3>
  <p className="text-blue-600 font-semibold mb-2">₹{product.price}</p>

  {/* Rating */}
<div className="flex mb-2 text-yellow-400 text-sm">
  {[...Array(5)].map((_, i) =>
    i < (product.rating || 4) ? (
      <FaStar key={i} />
    ) : (
      <FaRegStar key={i} />
    )
  )}
</div>

  {/* Buttons */}
  <div className="mt-auto space-y-2">
    <Link
      to={`/product/${product._id}`}
      className="block bg-gray-200 text-center text-sm py-1 rounded hover:bg-gray-300"
    >
      View Details
    </Link>

    <button
      onClick={() => addToCart(product)}
      disabled={product.stock <= 0}
      className={`w-full py-1 text-sm rounded font-semibold ${
        product.stock > 0
          ? 'bg-yellow-400 hover:bg-yellow-500 text-black'
          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
      }`}
    >
      Add to Cart
    </button>
  </div>
</div>
  );
}
