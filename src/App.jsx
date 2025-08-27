import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import ForgetPassword from './pages/forgetPassword';
import Products from './pages/products';
import ProductDetail from './pages/productDetail';
import DealDetailPage from "./pages/dealDetailPage";
import CartPage from './features/cart/cartPage';
import NotFound from './pages/notFound';
//import PaymentPage from './features/payment/paymentPage';
//import ConfirmationPage from './features/payment/confirmationPage';
import { AuthProvider } from './context/authContext';
import { CartProvider } from './context/cartContext';
import AdminLayout from './layouts/adminLayout';
import Navbar from './components/navbar';
import AdminDashboard from './pages/admin/adminDashboard';
import ManageUsers from './pages/admin/manageUser';
import ManageProducts from './pages/admin/manageProduct';
import ManageOrders from './pages/admin/manageOrder';
import CategoryManager from './pages/admin/categoryManager';
import AddCarousel from './pages/admin/addCarousel';
import TodaysDeals from './pages/admin/todaysDeals';
import Profile from './pages/profile';
import ProtectedRoute from './components/protectedRoute';
import ProtectedAdminRoute from './components/protectedAdminRoute';
import UserOrders from './pages/userOrder';
import BuyNow from './features/cart/buyNow';
import OrderSuccess from './features/cart/orderSuccess';
import Footer from "./components/footer";

function App() {
  
  return (
    <>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
          <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgetPassword" element={<ForgetPassword/>}/>
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/todaysDeals/:dealId" element={<DealDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/buy-now" element={<BuyNow/>}/>
              <Route path="/orderSuccess/:id" element={<OrderSuccess/>}/>
              {/*<Route path="/checkout" element={<CheckoutPage />} />*/}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>  
              <Route path="/admin" 
                element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<ManageProducts />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="orders" element={<ManageOrders />} />
                <Route path="categoryManager" element={<CategoryManager/>}/>
                <Route path="addCarousel" element={<AddCarousel/>}/>
                <Route path="todaysDeals" element={<TodaysDeals/>}/>
              </Route>
              <Route path="/my-orders" element={<UserOrders />} />
              {/*<Route path="/payment" element={<PaymentPage />} />*/}
              {/*<Route path="/confirmation" element={<ConfirmationPage />} />*/}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </>
  )
}

export default App
