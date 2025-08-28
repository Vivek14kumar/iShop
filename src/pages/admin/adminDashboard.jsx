import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaRupeeSign,
  FaClipboardList,
  FaTags,
  FaCrown,
} from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { socket } from "../../utils/socket";
import "react-toastify/dist/ReactToastify.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- Helpers ---
const extractArray = (res) => {
  // Normalize common API shapes into an array
  if (!res) return [];
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.data)) return res.data.data;
  if (Array.isArray(res.data?.results)) return res.data.results;
  if (Array.isArray(res.data?.items)) return res.data.items;
  // if object with keys that contains an array, return first array found
  if (typeof res.data === "object") {
    const arr = Object.values(res.data).find((v) => Array.isArray(v));
    if (arr) return arr;
  }
  // sometimes API returns array directly as res
  if (Array.isArray(res)) return res;
  return [];
};

const idEq = (a, b) => {
  if (a == null || b == null) return false;
  return a.toString() === b.toString();
};

const fmtCurrency = (v = 0) =>
  "₹" + Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

// Chart error boundary to avoid unhandled Chart.js exceptions
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err, info) {
    console.error("Chart rendering error:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-sm text-red-500">
          Failed to render chart (see console).
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    pendingOrders: 0,
    deals: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [chartData, setChartData] = useState({
    ordersRevenue: { labels: [], datasets: [] },
    topProducts: { labels: [], datasets: [] },
    categoryRevenue: { labels: [], datasets: [] },
  });
  const [topCustomers, setTopCustomers] = useState([]);
  const [recentDeals, setRecentDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    const handleNewOrder = (data) => {
      if (data?.type === "orderCreated") {
        toast.success(`New order received: ${data.orderId}`, {
          position: "bottom-left",
          autoClose: 5000,
        });
        fetchData();
      }
    };
    socket?.on("notification", handleNewOrder);

    return () => {
      mountedRef.current = false;
      socket?.off("notification", handleNewOrder);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://ishop-2-f9qp.onrender.com";
      const [usersRes, productsRes, ordersRes, dealsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/users`),
        axios.get(`${apiUrl}/api/products`),
        axios.get(`${apiUrl}/api/orders`),
        axios.get(`${apiUrl}/api/todaysDeals`),
      ]);

      const usersArr = extractArray(usersRes);
      const productsArr = extractArray(productsRes);
      const ordersArr = extractArray(ordersRes);
      const dealsArr = extractArray(dealsRes);

      // attach deals to products
      const productsWithDeals = productsRes.data.map((p) => {
  const deal = dealsRes.data.find((d) => d.product?._id === p._id);
  return { ...p, isDeal: !!deal, deal };
});


      // compute totals
      const totalRevenue = ordersArr.reduce((sum, o) => {
        return (
          sum +
          (o.cartItems || []).reduce(
            (sub, item) => sub + (Number(item.totalAmount) || 0),
            0
          )
        );
      }, 0);
      
      const pendingOrdersCount = ordersArr.filter(
        (o) => o.status === "Ordered"
      ).length;
      
      if (!mountedRef.current) return;
      
      setStats({
        users: usersArr.length,
        products: productsArr.length,
        orders: ordersArr.length,
        revenue: totalRevenue,
        pendingOrders: pendingOrdersCount,
        deals: productsWithDeals.filter((p) => p.isDeal).length,
      });


      // sort orders by createdAt desc, fallback to id
      const sortedOrders = [...ordersArr].sort((a, b) => {
        const da = new Date(a.createdAt || a.createdAtAt || 0).getTime();
        const db = new Date(b.createdAt || b.createdAtAt || 0).getTime();
        return db - da;
      });

      setRecentOrders(sortedOrders.slice(0, 5));
      setProducts(productsWithDeals);
      setRecentDeals(
        dealsArr
          .filter((d) => d.status === "active" || d.isActive)
          .sort((a, b) => (new Date(b.createdAt || 0) - new Date(a.createdAt || 0)))
          .slice(0, 5)
      );

      updateCharts(sortedOrders, productsWithDeals);
      updateTopCustomers(sortedOrders);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      toast.error("Failed to load dashboard data (see console)");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const updateCharts = (ordersArr = [], productsData = []) => {
  try {
    const monthNames = [
      "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
    ];
    const currentYear = new Date().getFullYear();

    // --- Monthly Orders & Revenue ---
    const ordersByMonth = Array(12).fill(0);
    const revenueByMonth = Array(12).fill(0);

    ordersArr.forEach((o) => {
      const orderDate = new Date(o.createdAt || o.createdAtAt || Date.now());
      if (orderDate.getFullYear() !== currentYear) return;

      const month = orderDate.getMonth();

      const orderQuantity = (o.cartItems || []).reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
      );
      const orderRevenue = (o.cartItems || []).reduce((sum, item) => {
        // robust product matching
        const pid = item.productId || item.product?._id || item._id;
        const p = productsData.find(pp => idEq(pp._id, pid) || idEq(pp.id, pid));
        if (!p) return sum;

        const qty = Number(item.quantity || 0);
        const price = p.isDeal ? Number(p.finalPrice || 0) : Number(item.price || 0);
        if (!qty || !price) return sum;

        return sum + qty * price;
      }, 0);

      ordersByMonth[month] += orderQuantity || 0;
      revenueByMonth[month] += orderRevenue || 0;
    });

    // --- Top Products by Units Sold ---
    const topProductsMap = {};
    ordersArr.forEach((o) => {
      (o.cartItems || []).forEach((item) => {
        const pid = item.productId || item.product?._id || item._id;
        if (!pid) return;

        const qty = Number(item.quantity || 0);
        if (!qty) return;

        topProductsMap[pid.toString()] = (topProductsMap[pid.toString()] || 0) + qty;
      });
    });

    const topProductsArr = Object.keys(topProductsMap)
      .map((id) => {
        const p = productsData.find(pp => idEq(pp._id, id) || idEq(pp.id, id));
        if (!p) return null;
        return { name: p.name, sold: topProductsMap[id] };
      })
      .filter(Boolean)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    // --- Revenue by Category ---
    const categoryRevenueMap = {};
    ordersArr.forEach((o) => {
      (o.cartItems || []).forEach((item) => {
        const pid = item.productId || item.product?._id || item._id;
        const p = productsData.find(pp => idEq(pp._id, pid) || idEq(pp.id, pid));
        if (!p) return;

        const qty = Number(item.quantity || 0);
        const price = p.isDeal ? Number(p.finalPrice || 0) : Number(item.price || 0);
        if (!qty || !price) return;

        const cat = p.category || "Uncategorized";
        categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + qty * price;
      });
    });
    const colors = [
      "#3b82f6","#10b981","#f59e0b","#8b5cf6","#ef4444","#6366f1","#ec4899","#14b8a6"
    ];
    const bgColors = Object.keys(categoryRevenueMap).map((_, i) => colors[i % colors.length]);

    // --- Set chart data ---
    setChartData({
      ordersRevenue: {
        labels: monthNames,
        datasets: [
          {
            label: "Orders",
            data: ordersByMonth,
            backgroundColor: "rgba(59,130,246,0.7)",
            borderRadius: 4,
          },
          {
            label: "Revenue",
            data: revenueByMonth,
            backgroundColor: "rgba(16,185,129,0.7)",
            borderRadius: 4,
          },
        ],
      },
      topProducts: {
        labels: topProductsArr.map(p => p.name),
        datasets: [
          {
            label: "Units Sold",
            data: topProductsArr.map(p => p.sold),
            backgroundColor: "rgba(245,158,11,0.8)",
            borderRadius: 4,
          },
        ],
      },
      categoryRevenue: {
        labels: Object.keys(categoryRevenueMap),
        datasets: [
          {
            label: "Revenue",
            data: Object.values(categoryRevenueMap),
            backgroundColor: bgColors,
          },
        ],
      },
    });

  } catch (err) {
    console.error("updateCharts error:", err);
  }
};


  const updateTopCustomers = (ordersArr) => {
  if (!ordersArr || ordersArr.length === 0) {
    setTopCustomers([]);
    return;
  }

  const spendMap = {};

  ordersArr.forEach((order) => {
    const customerEmail = order.userEmail || "unknown";
    const customerName = order.shippingAddress?.name || customerEmail;

    // calculate order total from cartItems
    const orderTotal = (order.cartItems || []).reduce(
      (sum, item) => sum + (Number(item.totalAmount) || 0),
      0
    );

    if (!spendMap[customerEmail]) {
      spendMap[customerEmail] = { email: customerEmail, name: customerName, spent: 0 };
    }

    spendMap[customerEmail].spent += orderTotal;
  });

  // convert map → array, sort, take top 5
  const topCustomersArr = Object.values(spendMap)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  setTopCustomers(topCustomersArr);
};


  // Chart options
  const commonBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="space-y-6 p-4 sm:p-4 md:p-6 lg:p-8">
      {/* Dashboard Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard icon={<FaUsers />} title="Users" value={stats.users} color="bg-blue-500" />
        <StatCard icon={<FaBox />} title="Products" value={stats.products} color="bg-yellow-500" />
        <StatCard icon={<FaShoppingCart />} title="Orders" value={stats.orders} color="bg-purple-500" />
        <StatCard icon={<FaRupeeSign />} title="Revenue" value={fmtCurrency(stats.revenue)} color="bg-green-500" />
        <StatCard icon={<FaClipboardList />} title="Pending Orders" value={stats.pendingOrders} color="bg-red-500" />
        <StatCard icon={<FaTags />} title="Today's Deals" value={stats.deals} color="bg-indigo-500" />
      </div>

      {loading && <div className="text-sm text-gray-500">Loading dashboard...</div>}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Orders & Revenue">
          <ChartErrorBoundary>
            {chartData.ordersRevenue?.labels?.length > 0 ? (
              <div className="w-full h-72 overflow-auto">
                <Bar data={chartData.ordersRevenue} options={commonBarOptions} />
              </div>
            ) : (
              <p className="text-gray-500">No monthly data.</p>
            )}
          </ChartErrorBoundary>
        </ChartCard>
          
        <ChartCard title="Top Selling Products">
          <ChartErrorBoundary>
            {chartData.topProducts?.labels?.length > 0 ? (
              <div className="w-full h-72 overflow-auto">
                <Bar
                  data={chartData.topProducts}
                  options={{ ...commonBarOptions, indexAxis: "y" }}
                />
              </div>
            ) : (
              <p className="text-gray-500">No top products data.</p>
            )}
          </ChartErrorBoundary>
        </ChartCard>
      </div>
          
      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue by Category">
          <ChartErrorBoundary>
            {chartData.categoryRevenue?.labels?.length > 0 ? (
              <div className="flex justify-center">
                <div className="w-full max-w-xs h-72">
                  <Pie
                    data={chartData.categoryRevenue}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "bottom" } },
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No category revenue data.</p>
            )}
          </ChartErrorBoundary>
        </ChartCard>
          
          {/*  New Chart: Orders by Status */}
        <ChartCard title="Orders by Status">
          <ChartErrorBoundary>
            {stats.orders > 0 ? (
              <div className="flex justify-center">
                <div className="w-full max-w-xs h-72">
                  <Pie
                    data={{
                      labels: ["Ordered",
                        "Confirmed",
                        "Processing",
                        "Shipped",
                        "Out for Delivery",
                        "Delivered",
                        "Cancelled"],
                      datasets: [
                        {
                          label: "Orders",
                          data: [
                            recentOrders.filter((o) => o.status === "Ordered").length,
                            recentOrders.filter((o) => o.status === "Confirmed").length,
                            recentOrders.filter((o) => o.status === "Processing").length,
                            recentOrders.filter((o) => o.status === "Shipped").length,
                            recentOrders.filter((o) => o.status === "Out for Delivery").length,
                            recentOrders.filter((o) => o.status === "Delivered").length,
                            recentOrders.filter((o) => o.status === "Cancelled").length,
                          ],
                          backgroundColor: [
                            "#f59e0b", // Ordered - yellow
                            "#6366f1", // Confirmed - indigo
                            "#06b6d4", // Processing - cyan
                            "#3b82f6", // Shipped - blue
                            "#8b5cf6", // Out for Delivery - violet
                            "#10b981", // Delivered - green
                            "#ef4444", // Cancelled - red
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "bottom" } },
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No order status data.</p>
            )}
          </ChartErrorBoundary>
        </ChartCard>
      </div>

      {/* Recent Orders */}
      <ChartCard
        title="Recent Orders"
        extra={<Link to="/admin/orders" className="text-blue-600 hover:underline text-sm">View All</Link>}
      >
        <OrdersTable orders={recentOrders} products={products} />
      </ChartCard>

      {/* Low Stock Products */}
      <ChartCard title="Low Stock Products">
        <LowStockTable products={products} />
      </ChartCard>

      {/* Top Customers */}
      <ChartCard title="Top Customers by Spend">
        {topCustomers.length > 0 ? (
          <ul className="divide-y">
          {topCustomers.map((c, i) => (
            <li key={i} className="py-2 flex justify-between items-center">
              <span className="flex items-center gap-2">
                <FaCrown className="text-yellow-500" />
                <div className="flex flex-col">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-xs text-gray-500">{c.email}</span>
                </div>
              </span>
              <span className="font-semibold">{fmtCurrency(c.spent)}</span>
            </li>
          ))}
        </ul>
        ) : (
          <p className="text-gray-500">No customer data.</p>
        )}
      </ChartCard>

      {/* Recent Deals */}
      <ChartCard title="Recent Deals">
        {recentDeals.length > 0 ? (
          <ul className="divide-y">
            {recentDeals.map((d) => (
              <li key={d._id || d.dealId} className="py-2 flex justify-between items-center">
                <span>{d.title || d.name || "Untitled deal"}</span>
                <span className="font-semibold text-green-600">{fmtCurrency(d.finalPrice || d.price)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No active deals.</p>
        )}
      </ChartCard>
    </div>
  );
}

// --- Components ---
function StatCard({ icon, title, value, color }) {
  return (
    <div className={`p-3 sm:p-4 md:p-5 rounded-xl flex items-center gap-3 shadow hover:shadow-lg transition transform hover:-translate-y-1 ${color} text-white`}>
      <div className="text-2xl sm:text-3xl">{icon}</div>
      <div>
        <p className="text-xs sm:text-sm">{title}</p>
        <p className="text-base sm:text-lg md:text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children, extra }) {
  return (
    <div className="bg-white p-3 sm:p-5 rounded-xl shadow hover:shadow-lg transition">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2">
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        {extra}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}

function OrdersTable({ orders = [], products = [] }) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return <p className="text-gray-500">No recent orders.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs sm:text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 sm:p-3">Order</th>
            <th className="p-2 sm:p-3">Customer</th>
            <th className="p-2 sm:p-3">Products</th>
            <th className="p-2 sm:p-3">Amount</th>
            <th className="p-2 sm:p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id || order.orderId} className="border-b hover:bg-gray-50 transition">
              <td className="p-2 sm:p-3 font-medium">{order.orderId || (order._id && order._id.toString().slice(-6)) || "—"}</td>
              <td className="p-2 sm:p-3">{order.shippingAddress?.name || order.userEmail || "—"}</td>
              <td className="p-2 sm:p-3 flex gap-1 sm:gap-2 flex-wrap">
                {(order.cartItems || []).map((item) => {
                  const product = products.find((p) => idEq(p._id, item.productId) || idEq(p._id, item.product));
                  return product ? (
                    <img
                      key={item._id || item.productId}
                      src={product.image || product.images?.[0] || ""}
                      alt={product.name || "product"}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover"
                    />
                  ) : null;
                })}
              </td>
              <td className="p-2 sm:p-3 font-semibold">
                {fmtCurrency(
                  order.cartItems.reduce(
                    (sum, item) => sum + (Number(item.totalAmount) || 0),
                    0
                  )
                )}
              </td>
              <td className="p-2 sm:p-3">
              <span
                className={`px-2 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                  order.status === "Ordered"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "Confirmed"
                    ? "bg-indigo-100 text-indigo-800"
                    : order.status === "Processing"
                    ? "bg-purple-100 text-purple-800"
                    : order.status === "Shipped"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "Out for Delivery"
                    ? "bg-orange-100 text-orange-800"
                    : order.status === "Delivered"
                    ? "bg-green-100 text-green-800"
                    : order.status === "Cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status || "—"}
              </span>
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LowStockTable({ products = [] }) {
  const lowStockProducts = (products || []).filter((p) => Number(p.stock) <= 5);

  if (lowStockProducts.length === 0)
    return <p className="text-gray-500">No low stock products.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs sm:text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 sm:p-3">Product</th>
            <th className="p-2 sm:p-3">Stock</th>
          </tr>
        </thead>
        <tbody>
          {lowStockProducts.map((p) => {
            const isOutOfStock = Number(p.stock) === 0;
            return (
              <tr
                key={p._id}
                className={`border-b hover:bg-gray-50 transition ${
                  isOutOfStock ? "bg-red-100 text-red-700 font-bold" : ""
                }`}
              >
                <td className="p-2 sm:p-3 flex items-center gap-2">
                  <img
                    src={p.image || p.images?.[0] || ""}
                    alt={p.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <span>{p.name}</span>
                </td>
                <td className="p-2 sm:p-3 font-semibold">{Number(p.stock || 0)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
