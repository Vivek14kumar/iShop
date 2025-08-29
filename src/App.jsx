import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import ForgetPassword from './pages/forgetPassword';
import Products from './pages/products';
import ProductDetail from './pages/productDetail';
import DealDetailPage from "./pages/dealDetailPage";
import CartPage from './features/cart/cartPage';
import NotFound from './pages/notFound';
// import PaymentPage from './features/payment/paymentPage';
// import ConfirmationPage from './features/payment/confirmationPage';

// Context
import { AuthProvider } from './context/authContext';
import { CartProvider } from './context/cartContext';

// Components / Layouts
import AdminLayout from './layouts/adminLayout';
import Navbar from './components/navbar';
import Footer from "./components/footer";
import ProtectedRoute from './components/protectedRoute';
import ProtectedAdminRoute from './components/protectedAdminRoute';

// Admin Pages
import AdminDashboard from './pages/admin/adminDashboard';
import ManageUsers from './pages/admin/manageUser';
import ManageProducts from './pages/admin/manageProduct';
import ManageOrders from './pages/admin/manageOrder';
import CategoryManager from './pages/admin/categoryManager';
import AddCarousel from './pages/admin/addCarousel';
import TodaysDeals from './pages/admin/todaysDeals';

// User Pages
import Profile from './pages/profile';
import UserOrders from './pages/userOrder';
import BuyNow from './features/cart/buyNow';
import OrderSuccess from './features/cart/orderSuccess';

function DemoToast() {
  useEffect(() => {
    toast.info(
      " This is a demo site — no real accounts or personal info.",
      {
        position: "top-center",
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  }, []);

  return <ToastContainer />;
}

function DemoBanner() {
  return (
    <div className="bg-yellow-300 text-black text-center font-semibold">
      !! This is a demo site — no real accounts or personal info. !!
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          {/* Permanent Banner */}
          <DemoBanner />

          {/* Navbar */}
          <Navbar />

          {/* Toast for users */}
          <DemoToast />

          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgetPassword" element={<ForgetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/todaysDeals/:dealId" element={<DealDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/buy-now" element={<BuyNow />} />
            <Route path="/orderSuccess/:id" element={<OrderSuccess />} />

            {/* Protected User Pages */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/my-orders" element={<UserOrders />} />

            {/* Admin Pages */}
            <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="orders" element={<ManageOrders />} />
              <Route path="categoryManager" element={<CategoryManager />} />
              <Route path="addCarousel" element={<AddCarousel />} />
              <Route path="todaysDeals" element={<TodaysDeals />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Footer */}
          <Footer />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
