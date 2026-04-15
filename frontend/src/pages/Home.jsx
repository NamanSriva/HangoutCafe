import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Coffee, Star } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero container">
        <motion.div 
          className="hero-text"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Sip into the <span className="highlight">Future</span></h1>
          <p className="subtitle">
            Experience premium dine-in ordering with our seamless, 3D immersive cafe interface.
            Taste the extraordinary.
          </p>
          <div className="hero-buttons">
            <Link to="/menu" className="btn btn-primary">
              Explore Our Menu <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </motion.div>
        
        <motion.div 
          className="hero-image"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Defaulting to a high-quality 3D rendered generic coffee cup */}
          <div className="blobs-container">
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <img 
              src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600&auto=format&fit=crop" 
              alt="3D Coffee Render" 
              className="hero-coffee-img"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features container">
        <h2 className="section-title text-center">Why Hangout Cafe?</h2>
        <div className="features-grid">
          <motion.div className="feature-card glass" whileHover={{ y: -10 }}>
            <Coffee className="feature-icon" size={40} />
            <h3>Artisan Blends</h3>
            <p>Sourced from the finest global estates, roasted to perfection.</p>
          </motion.div>
          <motion.div className="feature-card glass" whileHover={{ y: -10 }} transition={{ delay: 0.1 }}>
            <Star className="feature-icon" size={40} />
            <h3>3D Ordering</h3>
            <p>View your treats in stunning 3D before you bring them to your table.</p>
          </motion.div>
          <motion.div className="feature-card glass" whileHover={{ y: -10 }} transition={{ delay: 0.2 }}>
            <ArrowRight className="feature-icon" size={40} />
            <h3>Seamless Dine-In</h3>
            <p>Order from your seat, track your prep status, and pick up instantly.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
