import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Moon, Sun, Coffee, User, Menu, X } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import "./Navbar.css";

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { cartItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  useEffect(() => {
    let interval;
    if (user && (user.isAdmin || user.email === "admin@hangoutcafe.com")) {
      const checkNewOrders = async () => {
        try {
          const { data } = await API.get('/api/orders/stats');
          const lastTotal = parseInt(localStorage.getItem('adminLastTotalOrders'), 10);
          
          if (isNaN(lastTotal)) {
            // First time loading, initialize it
            localStorage.setItem('adminLastTotalOrders', data.totalOrders.toString());
            setNewOrdersCount(0);
          } else if (data.totalOrders > lastTotal) {
            setNewOrdersCount(data.totalOrders - lastTotal);
          } else {
            setNewOrdersCount(0);
          }
        } catch (err) {
          console.error("Failed to fetch order stats", err);
        }
      };

      checkNewOrders();
      interval = setInterval(checkNewOrders, 15000);

      const handleOrdersViewed = () => {
        setNewOrdersCount(0);
      };
      window.addEventListener('ordersViewed', handleOrdersViewed);

      return () => {
        clearInterval(interval);
        window.removeEventListener('ordersViewed', handleOrdersViewed);
      };
    }
  }, [user]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="navbar glass">
      <div className="container navbar-content">
        <Link to="/" className="navbar-logo">
          <Coffee className="logo-icon" />
          <span>Hangout Cafe</span>
        </Link>

        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-links ${isOpen ? "active" : ""}`}>
          <Link to="/menu" className="nav-link" onClick={closeMenu}>
            Menu
          </Link>

          {!user?.isAdmin && user?.email !== "admin@hangoutcafe.com" && (
            <Link to="/cart" className="nav-link cart-link" onClick={closeMenu}>
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </Link>
          )}

          {user ? (
            <div className="user-menu">
              <span className="user-name">Hi, {user.name.split(" ")[0]}</span>
              {!user.isAdmin && user.email !== "admin@hangoutcafe.com" && (
                <div style={{ display: "flex", gap: "0.8rem" }}>
                  <Link to="/my-orders" className="nav-link" onClick={closeMenu}>
                    MyOrders
                  </Link>
                  <Link to="/my-coupons" className="nav-link" onClick={closeMenu}>
                    MyCoupons
                  </Link>
                </div>
              )}
              {(user.isAdmin || user.email === "admin@hangoutcafe.com") && (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link to="/admin" className="nav-link admin-link" onClick={closeMenu}>
                    Dashboard
                  </Link>
                  <Link to="/admin/orders" className="nav-link admin-link" onClick={closeMenu} style={{ position: 'relative' }}>
                    Orders
                    {newOrdersCount > 0 && (
                      <span style={{ position: 'absolute', top: '-6px', right: '-12px', background: '#ff4757', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                        {newOrdersCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/admin/menu" className="nav-link admin-link" onClick={closeMenu}>
                    Menu Mgr
                  </Link>
                </div>
              )}
              <button onClick={() => { logout(); closeMenu(); }} className="nav-link logout-btn">
                Logout
              </button>
              <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
            </div>
          ) : (
            <Link to="/login" className="nav-link" onClick={closeMenu}>
              <User size={20} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
