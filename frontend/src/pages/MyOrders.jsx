import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Coffee } from 'lucide-react';
import './AdminDashboard.css';

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=my-orders');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        const { data } = await axios.get('/api/orders/myorders', config);
        setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        toast.error('Failed to load your orders');
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, navigate]);

  if (loading) return <div className="loader container mt-4">Loading your orders...</div>;

  return (
    <div className="admin-container container animate-fade-in">
      <div className="admin-header mb-4">
        <h1>My <span className="highlight">Orders</span></h1>
        <p>Review your past and active orders.</p>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="text-center mt-5">
            <Coffee size={48} className="theme-text mb-3" />
            <p>You haven't placed any orders yet.</p>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/menu')}>Explore Menu</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <div 
                key={order._id} 
                className="stat-card glass" 
                style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer' }}
                onClick={() => navigate(`/order-status?id=${order._id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Order #{order._id.substring(order._id.length - 6).toUpperCase()}</h3>
                  <span className="highlight" style={{ fontWeight: 'bold' }}>₹{order.totalPrice.toFixed(2)}</span>
                </div>
                
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>
                  Method: {order.paymentMethod} | Status: <span style={{ color: order.status === 'completed' || order.status === 'delivered' ? 'lightgreen' : '#ffc107'}}>{order.status.replace(/_/g, ' ')}</span> | Date: {new Date(order.createdAt).toLocaleString()}
                </p>
                
                <div style={{ margin: '0.5rem 0' }}>
                  <strong>Items: </strong> {order.orderItems.map(item => `${item.qty}x ${item.name}`).join(', ')}
                </div>
                
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)'}}>
                  Click to view live tracking &rarr;
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
