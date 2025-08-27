import { useEffect, useState } from "react";
import API from "../../api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { AiOutlineSortAscending, AiOutlineSortDescending } from "react-icons/ai";
import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    image: "",
    description: "",
    aboutItems: [],
    specifications: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Search, Sort, Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStock, setFilterStock] = useState("");

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "https://ishop-1-le5r.onrender.com";
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();

  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/products/${editingId}`, formData);
        toast.success(" Product updated!");
      } else {
        await API.post("/products", formData);
        toast.success("Product added!");
      }
      fetchProducts();
      resetForm();
      setFormModalOpen(false);
    } catch {
      toast.error("Error saving product");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      stock: "",
      image: "",
      description: "",
      aboutItems: [],
      specifications: [],
    });
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || "",
      price: product.price || "",
      category: product.category || "",
      stock: product.stock || "",
      image: product.image || "",
      description: product.description || "",
      aboutItems: product.aboutItems || [],
      specifications: product.specifications || [],
    });
    setEditingId(product._id);
    setFormModalOpen(true);
  };

  const handleAdd = () => {
    resetForm();
    setFormModalOpen(true);
  };

  const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This product will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      await API.delete(`/products/${id}`);
      Swal.fire({
        title: "Deleted!",
        text: "Product has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchProducts();
    } catch {
      toast.error("Delete failed!");
    }
  }
};

  const handleImageUpload = async (e) => {
    try {
      const imgData = new FormData();
      imgData.append("image", e.target.files[0]);
      const res = await API.post("/products/upload", imgData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData({ ...formData, image: res.data.imageUrl });
      toast.success("Image uploaded!");
    } catch {
      toast.error("Upload failed!");
    }
  };

  function getStockBadge(stock) {
    if (stock === 0)
      return <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Out</span>;
    if (stock <= 2)
      return <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">Order</span>;
    if (stock > 0 && stock <= 5)
      return <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded">Low</span>;
    return <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">In</span>;
  }

  // Filter + Search + Sort
  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((p) => (filterCategory ? p.category === filterCategory : true))
    .filter((p) => {
      if (filterStock === "low") return p.stock > 0 && p.stock <= 5;
      if (filterStock === "out") return p.stock === 0;
      if (filterStock === "in") return p.stock > 5;
      return true;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      if (sortOrder === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

  // Pagination logic after filtering
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="flex-1 flex flex-col p-4 space-y-6 overflow-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center sm:text-left">
          Manage Products
        </h1>
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg"
        >
          <FaPlus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" /> Add Product
        </button>
      </div>

      {/* Filters + Search (Only Desktop) */}
      <div className="hidden md:flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-48"
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>{cat.name}</option>
          ))}
        </select>

        <select
          value={filterStock}
          onChange={(e) => setFilterStock(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Stock</option>
          <option value="low">Low Stock (1-5)</option>
          <option value="out">Out of Stock</option>
          <option value="in">In Stock (&gt;5)</option>
        </select>

        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Sort By</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="stock">Stock</option>
        </select>

        {/* Sort Order */}
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-3 py-1 border rounded flex items-center gap-1"
        >
          {sortOrder === "asc" ? (
            <>
              <AiOutlineSortAscending /> Asc
            </>
          ) : (
            <>
              <AiOutlineSortDescending /> Desc
            </>
          )}
        </button>

        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="p-2 border rounded"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Mobile Card View (UNCHANGED) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {products.map((product) => (
          <div key={product._id} className="bg-white shadow rounded-lg p-4">
            <img
              src={product.image || "https://via.placeholder.com/150"}
              alt={product.name}
              className="w-full h-40 object-contain rounded mb-3 bg-gray-100"
            />
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-500">₹{product.price}</p>
            <p className="text-sm">{product.category}</p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Stock:</span> {product.stock} {getStockBadge(product.stock)}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(product)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      {!loading && (
        <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="w-full text-left min-w-[500px] text-sm">
            <thead className="bg-gray-100 text-xs">
              <tr>
                <th className="p-2">Product Id</th>
                <th className="p-2">Name</th>
                <th className="p-2">Price</th>
                <th className="p-2">Category</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Image</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <tr key={product._id} className="border-t hover:bg-gray-50 transition text-xs">
                    <td className="p-2">{product.productId}</td>
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">₹{product.price}</td>
                    <td className="p-2">{product.category}</td>
                    <td className="p-2 flex flex-col items-start gap-1">
                      {product.stock} {getStockBadge(product.stock)}
                    </td>
                    <td className="p-2">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded border" />
                      ) : (
                        <span className="text-gray-400 italic">No image</span>
                      )}
                    </td>
                    <td className="p-2 flex flex-col gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500 text-sm">
                    No products available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 py-3 border-t">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center gap-1"
            >
              <FaChevronLeft /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 text-sm rounded ${
                  currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center gap-1"
          >
            Next <FaChevronRight />
          </button>
          </div>
        </div>
      )}
      {/* Add/Edit Product Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[95%] max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? " Edit Product" : " Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              {/* Basic fields */}
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                required
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="p-2 border rounded focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                required
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="p-2 border rounded focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={formData.category || ""}
                required
                onChange={(e) => {
                  if (e.target.value === "ADD_CATEGORY") {
                    // Redirect to Add Category page
                     navigate("/admin/categoryManager")
                  } else {
                    setFormData({ ...formData, category: e.target.value });
                  }
                }}
                className="p-2 border rounded focus:ring-2 focus:ring-blue-400 flex-1"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
                <option value="ADD_CATEGORY"> Add Category</option>
              </select>
              <input
                type="number"
                placeholder="Stock"
                value={formData.stock}
                required
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="p-2 border rounded focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="p-2 border rounded focus:ring-2 focus:ring-blue-400"
              />

              {/* New Amazon-style fields */}
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="p-2 border rounded focus:ring-2 focus:ring-blue-400"
                rows={3}
              />

              {/* About this item */}
              <div>
                <label className="font-semibold">About this item:</label>
                {(formData.aboutItems || []).map((item, idx) => (
                  <div key={idx} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...formData.aboutItems];
                        updated[idx] = e.target.value;
                        setFormData({ ...formData, aboutItems: updated });
                      }}
                      className="flex-1 p-2 border rounded"
                    />
                    <button
                    type="button"
                    onClick={() => {
                      const updated = formData.aboutItems.filter((_, i) => i !== idx);
                      setFormData({ ...formData, aboutItems: updated });
                    }}
                    className="bg-red-500 text-white px-2 rounded flex items-center justify-center"
                  >
                    <FaTimes />
                  </button>
                  </div>
                ))}
                <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    aboutItems: [...(formData.aboutItems || []), ""],
                  })
                }
                className="mt-2 bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1"
              >
                <FaPlus /> Add Bullet
              </button>
              </div>

              {/* Specifications */}
              <div>
                <label className="font-semibold">Specifications:</label>
                {(formData.specifications || []).map((spec, idx) => (
                  <div key={idx} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Key"
                      value={spec.key}
                      onChange={(e) => {
                        const updated = [...formData.specifications];
                        updated[idx].key = e.target.value;
                        setFormData({
                          ...formData,
                          specifications: updated,
                        });
                      }}
                      className="flex-1 p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={spec.value}
                      onChange={(e) => {
                        const updated = [...formData.specifications];
                        updated[idx].value = e.target.value;
                        setFormData({
                          ...formData,
                          specifications: updated,
                        });
                      }}
                      className="flex-1 p-2 border rounded"
                    />
                    <button
                    type="button"
                    onClick={() => {
                      const updated = formData.specifications.filter((_, i) => i !== idx);
                      setFormData({ ...formData, specifications: updated });
                    }}
                    className="bg-red-500 text-white px-2 rounded flex items-center justify-center"
                  >
                    <FaTimes />
                  </button>
                  </div>
                ))}
                <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    specifications: [...(formData.specifications || []), { key: "", value: "" }],
                  })
                }
                className="mt-2 bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1"
              >
                <FaPlus /> Add Specification
              </button>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {editingId ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this product?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
