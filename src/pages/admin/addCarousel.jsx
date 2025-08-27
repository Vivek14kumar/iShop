import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CarouselManager() {
  const [carousels, setCarousels] = useState([]);
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [editId, setEditId] = useState(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [sizeValid, setSizeValid] = useState(false);
  const formRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL || "https://ishop-1-le5r.onrender.com";

  // Recommended size
  const RECOMMENDED_WIDTH = 1920;
  const RECOMMENDED_HEIGHT = 600;

  // Fetch carousel images
  const fetchCarousels = async () => {
    try {
      
      const { data } = await axios.get(`${apiUrl}/api/carousels`);
      setCarousels(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load carousel images");
    }
  };

  useEffect(() => {
    fetchCarousels();

    // Show message when page loads
    toast.info(`Image Required size: ${RECOMMENDED_WIDTH} × ${RECOMMENDED_HEIGHT}px`, {
      position: "top-center",
      autoClose: 2000,
    });
  }, []);

  // Check image size before setting
  const handleImageChange = (file) => {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      setSize({ width: img.width, height: img.height });
      if (img.width === RECOMMENDED_WIDTH && img.height === RECOMMENDED_HEIGHT) {
        setImage(file);
        setSizeValid(true);
      } else {
        setImage(null);
        setSizeValid(false);
        toast.warning(
          `Image size must be exactly ${RECOMMENDED_WIDTH} × ${RECOMMENDED_HEIGHT}px`
        );
      }
    };
    img.src = URL.createObjectURL(file);
  };

  // Add or update carousel
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sizeValid && !editId) {
      toast.warning("Please upload an image with the correct dimensions.");
      return;
    }

    try {
      const formData = new FormData();
      if (image) formData.append("image", image);
      formData.append("title", title);

      if (editId) {
        await axios.put(`${apiUrl}/api/carousels/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Carousel updated successfully");
      } else {
        await axios.post(`${apiUrl}/api/carousels`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Carousel image added successfully");
      }

      setImage(null);
      setTitle("");
      setEditId(null);
      setSize({ width: 0, height: 0 });
      setSizeValid(false);
      fetchCarousels();
    } catch (error) {
      console.error(error);
      toast.error("Error saving carousel image");
    }
  };

  // Edit carousel
  const handleEdit = (carousel) => {
    setTitle(carousel.title);
    setEditId(carousel._id);
    setImage(null);
    setSize({ width: 0, height: 0 });
    setSizeValid(true);

    // Scroll to form
  if (formRef.current) {
    formRef.current.scrollIntoView({ behavior: "smooth" });
  }
  };

  // Delete carousel
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the carousel.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${apiUrl}/api/carousels/${id}`);
          fetchCarousels();
          Swal.fire({
            title: "Deleted!",
            text: "The carousel has been deleted.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "Failed to delete carousel.",
            icon: "error",
          });
        }
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {editId ? "Edit Carousel" : "Add Carousel"}
      </h2>

      {/*<div className="mb-6 p-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-center font-medium">
        Image Required size: {RECOMMENDED_WIDTH} × {RECOMMENDED_HEIGHT}px
      </div>*/}

      {/* Form */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md space-y-4 border border-gray-100"
      >
        <p className="text-sm text-red-600 mb-2">
          Required size:{" "}
          <span className="font-semibold">
            {RECOMMENDED_WIDTH} × {RECOMMENDED_HEIGHT}px
          </span>
        </p>

        {/* File Upload */}
        <label
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
        >
          <span className="text-gray-500">Click or drag to upload an image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files[0])}
            className="hidden"
          />
        </label>

        {/* Preview */}
        {image && (
          <div className="mt-2">
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="mt-2 w-full h-48 object-cover rounded-lg shadow"
            />
            <p className="text-sm mt-1">
              Uploaded size: {size.width} × {size.height}px{" "}
              {sizeValid ? (
                <span className="text-green-600 font-semibold">Perfect size</span>
              ) : (
                <span className="text-red-600 font-semibold">Wrong size</span>
              )}
            </p>
          </div>
        )}

        {/* Title */}
        <input
          type="text"
          placeholder="Enter carousel title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        {/* Submit + Cancel Buttons */}
<div className="flex gap-3">
  <button
    type="submit"
    disabled={!sizeValid && !editId}
    className={`flex-1 px-5 py-2 rounded-lg text-white font-semibold transition ${
      sizeValid || editId
        ? "bg-green-600 hover:bg-green-700"
        : "bg-gray-400 cursor-not-allowed"
    }`}
  >
    {editId ? "Update Carousel" : "Add Carousel"}
  </button>

  {/* Cancel button (always visible) */}
  <button
    type="button"
    onClick={() => {
      setEditId(null);   // exit edit mode
      setTitle("");      // reset title
      setImage(null);    // clear uploaded image
      setSize({ width: 0, height: 0 }); 
      setSizeValid(false); // reset validation
    }}
    className="px-5 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold"
  >
    Cancel
  </button>
</div>

      </form>

      {/* Carousel List */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Carousel Images
        </h3>
        {carousels.length === 0 ? (
          <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">
            No carousel images yet. Add one above
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {carousels.map((c) => (
              <div
                key={c._id}
                className="bg-white border rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1"
              >
                <img
                  src={`${apiUrl}${c.image}`}
                  alt={c.title}
                  className="w-full h-40 object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <p className="font-semibold text-gray-800">{c.title || "Untitled"}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(c)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
