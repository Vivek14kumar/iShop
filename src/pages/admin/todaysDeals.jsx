import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

export default function TodaysDeals() {
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState([]); //  categories list
  const [products, setProducts] = useState([]); //  products list
  const [form, setForm] = useState({
    categoryId: "",
    productId: "",
    discount: "",
    startDate: "",
    endDate: "",
    stock: "",
    status: "active",
  });
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null); // for live price

  //  search, sorting & filter states
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterDiscount, setFilterDiscount] = useState("all");

  //  pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Fetch deals
  const fetchDeals = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/todaysDeals");
      setDeals(res.data);
    } catch {
      toast.error("Failed to fetch deals");
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  // Fetch products by category
  const fetchProducts = async (categoryName) => {
    try {
      const res = await axios.get(
     `http://localhost:5000/api/products/category/${categoryName}`
   );
   setProducts(res.data);
    } catch {
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchDeals();
    fetchCategories();
  }, []);

  // Handle category selection
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setForm((prev) => ({ ...prev, categoryId, productId: "" }));
    setProducts([]);
    setSelectedProduct(null);
    setPreview(null);
    if (categoryId) fetchProducts(categoryId);
  };

  // Handle product selection
  const handleProductChange = (e) => {
    const productId = e.target.value;
    const product = products.find((p) => p._id === productId);

    setForm((prev) => ({
      ...prev,
      productId,
      stock: product ? product.stock : "",
    }));

    setSelectedProduct(product || null);

    if (product) {
      setPreview(
        product.image.startsWith("http")
          ? product.image
          : `http://localhost:5000${product.image}`
      );
    } else {
      setPreview(null);
    }
  };

  // Handle other inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or Update deal
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = { ...form };

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/todaysDeals/${editingId}`,
          formData
        );
        toast.success("Deal updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/todaysDeals", formData);
        toast.success("Deal added successfully!");
      }

      setForm({
        categoryId: "",
        productId: "",
        discount: "",
        startDate: "",
        endDate: "",
        stock: "",
        status: "active",
      });
      setPreview(null);
      setEditingId(null);
      setSelectedProduct(null);
      fetchDeals();
    } catch {
      toast.error("Error saving deal");
    }
  };

  // Edit deal
const handleEdit = async (deal) => {
  setForm({
    categoryId: deal.category || "",
    productId: deal.product?._id || "",
    discount: deal.discount,
    startDate: deal.startDate ? deal.startDate.slice(0, 10) : "",
    endDate: deal.endDate ? deal.endDate.slice(0, 10) : "",
    stock: deal.stock,
    status: deal.status,
  });
  setEditingId(deal._id);

  // Fetch products for this category to auto-select product
  if (deal.category) {
    await fetchProducts(deal.category);
  }

  setSelectedProduct(deal.product || null);
  setPreview(
    deal.image.startsWith("http")
      ? deal.image
      : `http://localhost:5000${deal.image}`
  );
  toast.info("Editing deal");
};


  // Delete deal (with SweetAlert2)
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This deal will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/todaysDeals/${id}`);
          Swal.fire({
            title: "Deleted!",
            text: "The deal has been deleted.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
          fetchDeals();
        } catch {
          Swal.fire({
            title: "Error!",
            text: "Failed to delete deal.",
            icon: "error",
          });
        }
      }
    });
  };

  // Calculate final price preview
  const finalPrice =
    selectedProduct && form.discount
      ? (
          selectedProduct.price -
          (selectedProduct.price * form.discount) / 100
        ).toFixed(2)
      : selectedProduct?.price;

  //  Search + Sorting + Filtering logic
  const filteredDeals = deals
    .filter((deal) =>
      deal.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((deal) => {
      if (filterDiscount === "all") return true;
      if (filterDiscount === "low") return deal.discount < 20;
      if (filterDiscount === "medium")
        return deal.discount >= 20 && deal.discount <= 50;
      if (filterDiscount === "high") return deal.discount > 50;
      return true;
    })
    .sort((a, b) => {
      const aFinal = a.price - (a.price * a.discount) / 100;
      const bFinal = b.price - (b.price * b.discount) / 100;

      let fieldA =
        sortField === "finalPrice"
          ? aFinal
          : sortField === "price"
          ? a.price
          : sortField === "discount"
          ? a.discount
          : a.title.toLowerCase();

      let fieldB =
        sortField === "finalPrice"
          ? bFinal
          : sortField === "price"
          ? b.price
          : sortField === "discount"
          ? b.discount
          : b.title.toLowerCase();

      if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredDeals.length / itemsPerPage);
  const paginatedDeals = filteredDeals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field)
      return <ArrowUpDown size={16} className="inline ml-1 text-gray-400" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={16} className="inline ml-1 text-blue-600" />
    ) : (
      <ArrowDown size={16} className="inline ml-1 text-blue-600" />
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer position="top-right" autoClose={2000} />

      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Manage Today's Deals
      </h2>

      {/* ---------- Add / Edit Form ---------- */}
      <div className="bg-white p-6 rounded-xl shadow-lg border mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          {editingId ? " Edit Deal" : " Add New Deal"}
        </h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Category Dropdown */}
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleCategoryChange}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Product Dropdown */}
          <select
            name="productId"
            value={form.productId}
            onChange={handleProductChange}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required
            disabled={!form.categoryId}
          >
            <option value="">-- Select Product --</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} (₹{p.price})
              </option>
            ))}
          </select>

          {/* Discount */}
          <input
            type="number"
            name="discount"
            placeholder="Discount (%)"
            value={form.discount}
            onChange={handleChange}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          {/* Start Date */}
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          {/* End Date */}
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          {/* Stock */}
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          {/* Status */}
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="expired">Expired</option>
          </select>

          {/* Final Price Preview */}
          {selectedProduct && (
            <div className="col-span-1 md:col-span-2 p-3 bg-gray-50 rounded border">
              <p>Original Price: ₹{selectedProduct.price}</p>
              <p>
                Final Price after Discount:{" "}
                <span className="font-bold text-green-600">₹{finalPrice}</span>
              </p>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="col-span-1 md:col-span-2 mt-2">
              <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
              <img
                src={preview}
                alt="Preview"
                className="w-48 h-auto rounded border"
              />
            </div>
          )}

          {/* Submit */}
          {/* Submit + Reset */}
<div className="col-span-1 md:col-span-2 flex justify-end gap-2">
  <button
    type="button"
    onClick={() => {
      setForm({
        categoryId: "",
        productId: "",
        discount: "",
        startDate: "",
        endDate: "",
        stock: "",
        status: "active",
      });
      setPreview(null);
      setEditingId(null);
      setSelectedProduct(null);
    }}
    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
  >
    Reset
  </button>
  <button
    type="submit"
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
  >
    {editingId ? "Update Deal" : "Add Deal"}
  </button>
</div>

        </form>
      </div>


       {/* ---------- Search & Filter Controls ---------- */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset page on search
          }}
          className="border p-2 rounded flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <select
          value={filterDiscount}
          onChange={(e) => {
            setFilterDiscount(e.target.value);
            setCurrentPage(1); // reset page on filter
          }}
          className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">All Discounts</option>
          <option value="low">Below 20%</option>
          <option value="medium">20% - 50%</option>
          <option value="high">Above 50%</option>
        </select>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
        </select>
      </div>

      {/* ---------- Table View (Desktop) ---------- */}
      <div className="bg-white rounded-xl shadow-md border overflow-x-auto hidden md:block">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border">Image</th>
              <th
                className="p-3 border cursor-pointer hover:bg-gray-200 transition"
                onClick={() => toggleSort("title")}
              >
                Title {renderSortIcon("title")}
              </th>
              <th
                className="p-3 border cursor-pointer hover:bg-gray-200 transition"
                onClick={() => toggleSort("price")}
              >
                Price {renderSortIcon("price")}
              </th>
              <th
                className="p-3 border cursor-pointer hover:bg-gray-200 transition"
                onClick={() => toggleSort("discount")}
              >
                Discount (%) {renderSortIcon("discount")}
              </th>
              <th
                className="p-3 border cursor-pointer hover:bg-gray-200 transition"
                onClick={() => toggleSort("finalPrice")}
              >
                Final Price {renderSortIcon("finalPrice")}
              </th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDeals.map((deal) => {
              const finalPrice =
                deal.price - (deal.price * deal.discount) / 100;
              return (
                <tr
                  key={deal._id}
                  className="hover:bg-gray-50 transition duration-200"
                >
                  <td className="p-3 border">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="w-12 h-12 object-cover rounded border" 
                    />
                  </td>
                  <td className="p-3 border font-medium text-gray-800">
                    {deal.title}
                  </td>
                  <td className="p-3 border text-gray-700">₹{deal.price}</td>
                  <td className="p-3 border text-gray-700">{deal.discount}%</td>
                  <td className="p-3 border font-semibold text-green-600">
                    ₹{finalPrice.toFixed(2)}
                  </td>
                  <td className="p-3 border text-center space-x-2">
                    <div className="flex flex-wrap gap-2 text-center">
                      <button
                        onClick={() => handleEdit(deal)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(deal._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginatedDeals.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No deals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Pagination Controls ---------- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === idx + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* ---------- Card View (Mobile) ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden mt-6">
        {paginatedDeals.map((deal) => {
          const finalPrice =
            deal.price - (deal.price * deal.discount) / 100;
          return (
            <div
              key={deal._id}
              className="bg-white shadow rounded-lg p-4 flex flex-col"
            >
           
              <img
                src={deal.image}
                alt={deal.title}
                className="w-full h-40 object-contain rounded mb-3 bg-gray-100"
              />
              <h3 className="font-semibold text-lg">{deal.title}</h3>
              <p className="text-gray-600">Price: ₹{deal.price}</p>
              <p className="text-gray-600">Discount: {deal.discount}%</p>
              <p className="font-bold text-green-600">
                Final Price: ₹{finalPrice.toFixed(2)}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleEdit(deal)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(deal._id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {paginatedDeals.length === 0 && (
          <p className="text-center text-gray-500 col-span-2">
            No deals found.
          </p>
        )}
      </div>
    </div>
  );
}
