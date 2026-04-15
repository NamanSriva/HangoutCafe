import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import './Menu.css';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await axios.get('/api/menu');
        if (Array.isArray(data)) {
          setMenuItems(data);
          setLoading(false);
        } else {
          throw new Error('API did not return an array');
        }
      } catch (error) {
        // Fallback mock data if backend isn't running yet
        setMenuItems([
          { _id: '1', name: 'Caramel Macchiato', category: 'Coffee', price: 4.5, description: 'Espresso with vanilla-flavored syrup, milk, and caramel drizzle.', imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80', isAvailable: true },
          { _id: '2', name: 'Matcha Latte', category: 'Tea', price: 5.0, description: 'Pure matcha green tea blended with steamed milk.', imageUrl: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=400&q=80', isAvailable: true },
          { _id: '3', name: 'Butter Croissant', category: 'Bakery', price: 3.5, description: 'Flaky, buttery, and baked fresh every morning.', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f40d21114?w=400&q=80', isAvailable: true },
          { _id: '4', name: 'Nitro Cold Brew', category: 'Coffee', price: 4.8, description: 'Cold brew infused with nitrogen for a smooth, creamy texture.', imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', isAvailable: true },
        ]);
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  
  const filteredItems = filter === 'All' ? menuItems : menuItems.filter(item => item.category === filter);

  return (
    <div className="container menu-page animate-fade-in">
      <div className="menu-header">
        <h1>Explore Our <span className="highlight">Menu</span></h1>
        <p>Premium ingredients, prepared by experts.</p>
      </div>

      <div className="category-filters">
        {categories.map((cat, idx) => (
          <button 
            key={idx} 
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loader">Loading delicacies...</div>
      ) : (
        <motion.div 
          className="menu-grid" 
          layout
        >
          {filteredItems.map(item => (
            <motion.div 
              key={item._id} 
              className="menu-card glass"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <div className="menu-img-wrapper">
                <img src={item.imageUrl} alt={item.name} className="menu-img" />
              </div>
              <div className="menu-info">
                <div className="menu-title-row">
                  <h3>{item.name}</h3>
                  <span className="menu-price">₹{item.price.toFixed(2)}</span>
                </div>
                <p className="menu-desc">{item.description}</p>
                <button 
                  className="btn btn-primary add-to-cart-btn"
                  onClick={() => addToCart(item, 1)}
                  disabled={!item.isAvailable}
                >
                  <Plus size={16} /> {item.isAvailable ? 'Add to Cart' : 'Sold Out'}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Menu;
