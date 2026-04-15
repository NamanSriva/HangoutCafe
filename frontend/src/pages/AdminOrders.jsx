import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { RefreshCw, Tag } from 'lucide-react';
import './AdminDashboard.css';

const AdminOrders = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/api/orders');
      // Sort newest first
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || (!user.isAdmin && user.email !== 'admin@hangoutcafe.com')) {
      navigate('/');
      return;
    }
    fetchOrders();
    
    // Auto refresh every 10 seconds to simulate live orders
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders(); // refresh
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const statusOptions = ['placed', 'baking', 'prepared', 'ready_to_pickup', 'delivered', 'completed'];

  if (loading && orders.length === 0) return <div className="loader container mt-4">Loading Orders...</div>;

  return (
    <div className="admin-container container animate-fade-in">
      <div className="admin-header d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1>Live <span className="highlight">Orders</span></h1>
          <p>Manage customer orders and update culinary states.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchOrders}><RefreshCw size={18} /> Refresh</button>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <p>No active orders.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <div key={order._id} className="stat-card glass" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Order #{order._id.substring(order._id.length - 6).toUpperCase()}</h3>
                  <span className="highlight" style={{ fontWeight: 'bold' }}>₹{order.totalPrice.toFixed(2)}</span>
                </div>
                
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>Method: {order.paymentMethod} | Status: {order.isPaid ? 'Paid' : 'Pending'} | Date: {new Date(order.createdAt).toLocaleTimeString()}</p>
                
                <div style={{ margin: '0.5rem 0' }}>
                  <strong>Items: </strong> {order.orderItems.map(item => `${item.qty}x ${item.name}`).join(', ')}
                </div>

                {(order.consumedCouponCode || order.issuedCouponCode) && (
                  <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontSize: '0.85rem' }}>
                    {order.consumedCouponCode && (
                      <div style={{ color: '#4CAF50' }}><Tag size={14} style={{display:'inline', verticalAlign:'bottom'}}/> <strong>Used Coupon:</strong> {order.consumedCouponCode}</div>
                    )}
                    {order.issuedCouponCode && (
                      <div style={{ color: '#ffb74d', marginTop: '4px' }}><Tag size={14} style={{display:'inline', verticalAlign:'bottom'}}/> <strong>Refund Issued:</strong> {order.issuedCouponCode}</div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid #444', paddingTop: '1rem' }}>
                  <label htmlFor={`status-${order._id}`}><strong>Update Stage:</strong></label>
                  
                  {order.status === 'cancelled' ? (
                     <div style={{ padding: '0.3rem 0.8rem', borderRadius: '4px', background: 'rgba(211, 47, 47, 0.2)', color: '#ff6666', border: '1px solid #d32f2f', fontWeight: 'bold' }}>
                       Cancelled
                     </div>
                  ) : (
                    <select 
                      id={`status-${order._id}`}
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="form-control"
                      style={{ padding: '0.3rem', borderRadius: '4px', background: '#333', color: '#fff', border: '1px solid #555' }}
                    >
                      {statusOptions.map((opt, index) => {
                        const currentStatusIndex = statusOptions.indexOf(order.status);
                        // Disable if the option is BEFORE the current status
                        const isDisabled = index < currentStatusIndex;
                        return (
                          <option key={opt} value={opt} disabled={isDisabled}>
                            {opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
