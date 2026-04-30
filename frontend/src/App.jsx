import { Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout.jsx';
import AdminRoute from './components/common/AdminRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import SearchResultsPage from './pages/SearchResultsPage.jsx';
import CartPage from './pages/CartPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import OrderTrackingPage from './pages/OrderTrackingPage.jsx';
import AdminProductsPage from './pages/AdminProductsPage.jsx';
import ComparePage from './pages/ComparePage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:orderId/track" element={<OrderTrackingPage />} />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProductsPage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
}
