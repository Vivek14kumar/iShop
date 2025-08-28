import { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaUserPlus, FaEdit, FaTrash, FaEye, FaPlus, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, admins: 0, customers: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [collapsedAddresses, setCollapsedAddresses] = useState(false);
  const [collapsedOrders, setCollapsedOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL || "https://ishop-2-f9qp.onrender.com";

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await axios.get(`${apiUrl}/api/users`);
      setUsers(res.data);
      setFilteredUsers(res.data);
      const adminCount = res.data.filter(u => u.role === "admin").length;
      const customerCount = res.data.filter(u => u.role === "user").length;
      setStats({ total: res.data.length, admins: adminCount, customers: customerCount });
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    let result = users;
    if (roleFilter !== "all") result = result.filter(u => u.role === roleFilter);
    if (search.trim())
      result = result.filter(
        u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
      );
    setFilteredUsers(result);
    setCurrentPage(1);
  }, [search, roleFilter, users]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const handleNext = () => currentPage < totalPages && setCurrentPage(prev => prev + 1);
  const handlePrev = () => currentPage > 1 && setCurrentPage(prev => prev - 1);

  async function handleDelete(userId) {
    Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${apiUrl}/api/users/${userId}`);
          Swal.fire({
            title: "Deleted!",
            text: "User deleted successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
          fetchUsers();
        } catch {
          toast.error("Failed to delete user");
        }
      }
    });
  }

  async function resetPassword(userId) {
    try {
      await axios.post(`${apiUrl}/api/users/${userId}/reset-password`);
      toast.success("Password reset successfully!");
    } catch {
      toast.error("Failed to reset password");
    }
  }

  useEffect(() => {
    if (activeTab === "orders" && selectedUser?.email) {
    fetchOrders(selectedUser.email);
    }
  }, [activeTab, selectedUser]);


  const addAddress = () => {
     setSelectedUser(prev => ({
    ...prev,
    addresses: [
      ...(prev.addresses || []),
      { label: '', addressLine: '', city: '', state: '', pincode: '', mobile: '' } // no _id here
    ]
  }));
  };

  const deleteAddress = (addrId) => {
  Swal.fire({
    title: "Are you sure?",
    text: "This address will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedUser({
          ...selectedUser,
          addresses: selectedUser.addresses.filter((a) => a._id !== addrId),
        });
        Swal.fire({
          title: "Deleted!",
          text: "Address deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  async function fetchOrders(email) {
  try {
    const res = await axios.get(`${apiUrl}/api/orders/user/${email}`);
    const ordersData = res.data;

    // Fetch all products
    const productsRes = await axios.get(`${apiUrl}/api/products`);
    const products = productsRes.data;

    // Map product names to cartItems
    const ordersWithNames = ordersData.map(order => ({
      ...order,
      cartItems: order.cartItems.map(item => {
        const product = products.find(p => p._id === item.productId);
        return { ...item, productName: product ? product.name : "Unknown Product" };
      }),
    }));

      setOrders(ordersWithNames);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  }


  const updateAddressField = (index, field, value) => {
    const updatedAddresses = selectedUser.addresses.map((a, i) => (i === index ? { ...a, [field]: value } : a));
    setSelectedUser({ ...selectedUser, addresses: updatedAddresses });
  };

  async function saveUser() {
    try {
      await axios.put(`${apiUrl}/api/users/${selectedUser._id}`, selectedUser);
      toast.success("User updated successfully!");
      setSelectedUser(null);
      setEditMode(false);
      fetchUsers();
    } catch {
      toast.error("Failed to update user");
    }
  }

  return (
    <div className="p-4 space-y-6">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon={<FaUsers />} title="Total Users" value={stats.total} color="bg-blue-600" />
        <StatCard icon={<FaUsers />} title="Admins" value={stats.admins} color="bg-purple-600" />
        <StatCard icon={<FaUsers />} title="Customers" value={stats.customers} color="bg-green-600" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name/email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/2"
        />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border p-2 rounded">
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="user">Customers</option>
        </select>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">User Management</h3>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <FaUserPlus /> Add User
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm hidden md:table">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">User Id</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="p-2 text-xs">{u.userId}</td>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setEditMode(false);
                        setActiveTab("info");
                        setCollapsedAddresses(false);
                        setCollapsedOrders(false);
                      }}
                      className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setEditMode(true);
                        setActiveTab("info");
                        setCollapsedAddresses(false);
                        setCollapsedOrders(false);
                      }}
                      className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {currentUsers.map(u => (
              <div key={u._id} className="border rounded p-3 shadow-sm space-y-2">
                <p>
                  <span className="font-semibold">User Id:</span>{" "}
                  <span className="text-sm text-blue-600">{u.userId}</span>
                </p>
                <p>
                  <span className="font-semibold">Name:</span> {u.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {u.email}
                </p>
                <p>
                  <span className="font-semibold">Role:</span> {u.role}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setSelectedUser(u);
                      setEditMode(false);
                      setActiveTab("info");
                      setCollapsedAddresses(false);
                      setCollapsedOrders(false);
                      fetchOrders(u._id); // 🔹 fetch orders here
                    }}
                    className="flex-1 py-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-center"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => {
                    setSelectedUser(u);
                    setEditMode(true);
                    setActiveTab("info");
                    setCollapsedAddresses(false);
                    setCollapsedOrders(false);
                    fetchOrders(u._id); // 🔹 fetch orders here
                  }}
                    className="flex-1 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex justify-center"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex justify-center"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-1"
            >
             <FaChevronLeft/> Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
             className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-1"
            >
             Next <FaChevronRight/>
            </button>
          </div>
        </div>
      </div>

      {/* User Info / Edit Modal */}
  {selectedUser && (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-2">
      <div className="bg-white p-4 rounded-xl w-full max-w-3xl shadow-lg max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{editMode ? "Edit User" : "View User"}</h3>
          <button
            onClick={() => {
              setSelectedUser(null);
              setEditMode(false);
              setNewPassword(""); // reset password input
            }}
            className="px-2 py-1 border rounded"
          >
            Close
          </button>
        </div>
          
        {/* Tabs */}
        <div className="flex gap-4 border-b mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("info")}
          className={`px-3 py-1 ${activeTab === "info" ? "border-b-2 border-blue-600 font-semibold" : ""}`}
        >
          User Info
        </button>
        <button
          onClick={() => setActiveTab("addresses")}
          className={`px-3 py-1 ${activeTab === "addresses" ? "border-b-2 border-blue-600 font-semibold" : ""}`}
        >
          Addresses
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-3 py-1 ${activeTab === "orders" ? "border-b-2 border-blue-600 font-semibold" : ""}`}
        >
          Orders
        </button>
      </div>

      {/* Info Tab */}
      {activeTab === "info" && (
        <div className="space-y-3">
          <input
            type="text"
            value={selectedUser.name}
            onChange={e => editMode && setSelectedUser({ ...selectedUser, name: e.target.value })}
            disabled={!editMode}
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            value={selectedUser.email}
            onChange={e => editMode && setSelectedUser({ ...selectedUser, email: e.target.value })}
            disabled={!editMode}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={selectedUser.mobile || ""}
            onChange={e => editMode && setSelectedUser({ ...selectedUser, mobile: e.target.value })}
            disabled={!editMode}
            className="w-full p-2 border rounded"
          />
          {/* Role displayed as read-only */}
          <p className="p-2 border rounded bg-gray-100">
            <span className="font-semibold">Role:</span> {selectedUser.role}
          </p>
          {/* Reset Password Button */}
        {editMode && (
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Reset Password
          </button>
        )}
          
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === "addresses" && (
        <div className="space-y-2">
          <button
            className="flex justify-between w-full px-3 py-2 bg-gray-100 rounded md:hidden"
            onClick={() => setCollapsedAddresses(!collapsedAddresses)}
          >
            <span>Addresses</span>
            {collapsedAddresses ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          <div className={`${collapsedAddresses ? "hidden" : "block"}`}>
            {(selectedUser.addresses || []).map((a, i) => (
              <div key={a._id} className="border p-2 rounded space-y-1">
                <input
                  type="text"
                  value={a.label}
                  onChange={e => editMode && updateAddressField(i, "label", e.target.value)}
                  disabled={!editMode}
                  placeholder="Label"
                  className="w-full p-1 border rounded"
                />
                <input
                  type="text"
                  value={a.addressLine}
                  onChange={e => editMode && updateAddressField(i, "addressLine", e.target.value)}
                  disabled={!editMode}
                  placeholder="Address"
                  className="w-full p-1 border rounded"
                />
                <input
                  type="text"
                  value={a.city}
                  onChange={e => editMode && updateAddressField(i, "city", e.target.value)}
                  disabled={!editMode}
                  placeholder="City"
                  className="w-full p-1 border rounded"
                />
                <input
                  type="text"
                  value={a.state}
                  onChange={e => editMode && updateAddressField(i, "state", e.target.value)}
                  disabled={!editMode}
                  placeholder="State"
                  className="w-full p-1 border rounded"
                />
                <input
                  type="text"
                  value={a.pincode}
                  onChange={e => editMode && updateAddressField(i, "pincode", e.target.value)}
                  disabled={!editMode}
                  placeholder="Pincode"
                  className="w-full p-1 border rounded"
                />
                <input
                  type="text"
                  value={a.mobile}
                  onChange={e => editMode && updateAddressField(i, "mobile", e.target.value)}
                  disabled={!editMode}
                  placeholder="Mobile"
                  className="w-full p-1 border rounded"
                />
                {editMode && (
                  <button
                    type="button"
                    onClick={() => deleteAddress(a._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 mt-1"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
            {editMode && (
              <button
                type="button"
                onClick={addAddress}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2 flex items-center gap-1"
              >
                <FaPlus /> Add Address
              </button>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-2">
          <button
            className="flex justify-between w-full px-3 py-2 bg-gray-100 rounded md:hidden"
            onClick={() => setCollapsedOrders(!collapsedOrders)}
          >
            <span>Orders</span>
            {collapsedOrders ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          <div className={`${collapsedOrders ? "hidden" : "block"}`}>
            {orders.length ? (
              <>
                <table className="w-full text-sm border-collapse border hidden md:table">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Order Id</th>
                      <th className="p-2 text-left">Product</th>
                      <th className="p-2 text-left">Quantity</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="p-2">{order.orderId}</td>
                        <td className="p-2">{order.cartItems.map(item => <div key={item._id}>{item.productName}</div>)}</td>
                        <td className="p-2">{order.cartItems.map(item => <div key={item._id}>{item.quantity}</div>)}</td>
                        <td className="p-2">{order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="md:hidden space-y-2">
                  {orders.map(order => (
                    <div key={order._id} className="border p-2 rounded">
                      <p><span className="font-semibold">Order Id:</span> {order.orderId}</p>
                      <p><span className="font-semibold">Products:</span></p>
                      {order.cartItems.map(item => (
                        <p key={item._id} className="ml-2">- {item.productName} x {item.quantity}</p>
                      ))}
                      <p><span className="font-semibold">Status:</span> {order.status}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500">No orders found</p>
            )}
          </div>
        </div>
      )}

      {/* Save / Cancel Buttons */}
      {editMode && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={saveUser}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditMode(false);
              setSelectedUser(null);
              setNewPassword("");
            }}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      )}
      {/* Reset Password Modal */}
          {showResetModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-2">
              <div className="bg-white p-4 rounded-xl w-full max-w-md shadow-lg">
                <h3 className="text-lg font-bold mb-3">Reset Password</h3>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full p-2 border rounded mb-3"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await axios.post(`${import.meta.env.VITE_API_URL}/api/users/${selectedUser._id}/reset-password`, { newPassword });
                        toast.success("Password reset successfully!");
                        setShowResetModal(false);
                        setNewPassword("");
                      } catch {
                        toast.error("Failed to reset password");
                      }
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      setShowResetModal(false);
                      setNewPassword("");
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl shadow-lg ${color} text-white`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
