import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Login from './pages/Login';
import OrderStatus from './pages/OrderStatus';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/AdminDashboard';
import AdminMenuManager from './pages/AdminMenuManager';
import AdminOrders from './pages/AdminOrders';
import MyCoupons from './pages/MyCoupons';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="app-container">
        <Navbar />
        <main style={{ minHeight: '80vh', padding: '2rem 0' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/my-coupons" element={<ProtectedRoute><MyCoupons /></ProtectedRoute>} />
            <Route path="/order-status" element={<ProtectedRoute><OrderStatus /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/menu" element={<ProtectedRoute adminOnly={true}><AdminMenuManager /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly={true}><AdminOrders /></ProtectedRoute>} />
          </Routes>
        </main>
        <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--border-color)'}}>
          <p>&copy; {new Date().getFullYear()} Hangout Cafe. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
