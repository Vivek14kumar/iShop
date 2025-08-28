import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CategoryManager() {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const formRef = useRef(null);
  const nameInputRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL || "https://ishop-2-f9qp.onrender.com";

  // Fetch categories
  const fetchCategories = async () => {
    
    const res = await axios.get(`${apiUrl}/api/categories`);
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Preview image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  // Add or Update category
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    if (image) formData.append("image", image);

    try {
      if (editId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/categories/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category Updated");
        setEditId(null);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/categories`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category added!");
      }
      resetForm();
      fetchCategories();
    } catch {
      toast.error("Error saving category");
    }
  };

  // Edit
  const handleEdit = (category) => {
    setName(category.name);
    setEditId(category._id);
    setPreview(category.image ? `${import.meta.env.VITE_API_URL}${category.image}` : null);

    formRef.current.scrollIntoView({ behavior: "smooth" });

    setTimeout(() => {
      nameInputRef.current.focus();
    }, 300);
  };

  // Reset form
  const resetForm = () => {
    setName("");
    setImage(null);
    setPreview(null);
    setEditId(null);

    if (formRef.current) {
      const fileInput = formRef.current.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the category.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${apiUrl}/api/categories/${id}`);
          fetchCategories();

          Swal.fire({
            title: "Deleted!",
            text: "The category has been deleted.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch {
          Swal.fire({
            title: "Error!",
            text: "Failed to delete category.",
            icon: "error",
          });
        }
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-gray-50 rounded-lg shadow-lg">
      <ToastContainer position="top-right" autoClose={3000} transition={Slide} />

      <h2 className="text-2xl font-bold mb-6 text-gray-800">{editId ? "Edit Category" : "Add Category"}</h2>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md space-y-4 transition-transform transform hover:scale-102"
      >
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
          ref={nameInputRef}
        />

        <div>
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-3 h-20 w-20 min-w-[80px] min-h-[80px] object-cover rounded border"
            />
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {editId ? "Update" : "Add"} Category
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Reset
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="text-xl font-semibold mt-10 mb-4 text-gray-700">Categories</h3>

      {/* Table for large screens */}
      <div className="hidden md:block overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-blue-100">
              <th className="border p-3 text-gray-700">ID</th>
              <th className="border p-3 text-gray-700">Image</th>
              <th className="border p-3 text-gray-700">Name</th>
              <th className="border p-3 text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr
                key={cat._id}
                className="transition-transform transform hover:scale-101 hover:shadow-lg hover:bg-gray-50"
              >
                <td className="border p-3">{cat.categoryId}</td>
                <td className="border p-3">
                  {cat.image && (
                   <div className="w-20 h-20 relative rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={`${apiUrl}${cat.image}`}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-contain rounded"
                    />
                  </div>
                  )}
                </td>
                <td className="border p-3">{cat.name}</td>
                <td className="border p-3 space-x-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modern Cards for Mobile */}
    <div className="md:hidden space-y-4 px-2">
      {categories.map((cat) => (
        <div
          key={cat._id}
          className="bg-white rounded-2xl shadow-lg p-4 flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
          {/* Image */}
          {cat.image && (
           <img
                src={`${apiUrl}${cat.image}`}
                alt={cat.name}
                className="w-full h-40 object-contain rounded mb-3 bg-gray-100 "
              />
          )}
          
          {/* Text */}
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-bold text-gray-800 text-lg">{cat.name}</h4>
            <p className="text-gray-500 text-sm mt-1">ID: {cat.categoryId}</p>
          </div>
        
          {/* Action Buttons */}
          <div className="flex space-x-2 mt-3 sm:mt-0">
            <button
              onClick={() => handleEdit(cat)}
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1 rounded-xl transition-colors font-semibold text-sm shadow"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(cat._id)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-xl transition-colors font-semibold text-sm shadow"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
    </div>
  );
}
