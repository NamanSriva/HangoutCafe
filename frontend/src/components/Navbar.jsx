import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Moon, Sun, Coffee, User, Menu, X } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { cartItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

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
                  <Link to="/admin/orders" className="nav-link admin-link" onClick={closeMenu}>
                    Orders
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
