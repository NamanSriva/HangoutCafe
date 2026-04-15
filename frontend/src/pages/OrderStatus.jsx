import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Coffee, Bell, Smile, XCircle } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import './OrderStatus.css';

const OrderStatus = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [statusIndex, setStatusIndex] = useState(0);
  const [order, setOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!order || !order.createdAt) return;

    const calculateTimeLeft = () => {
      const orderTime = new Date(order.createdAt).getTime();
      const now = Date.now();
      const diff = 2 * 60 * 1000 - (now - orderTime);
      return diff > 0 ? diff : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timerInterval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [order?.createdAt]);

  const statuses = [
    { key: 'placed', label: 'Order Placed', icon: <CheckCircle /> },
    { key: 'baking', label: 'Baking/Preparing', icon: <Clock /> },
    { key: 'prepared', label: 'Prepared', icon: <Coffee /> },
    { key: 'ready_to_pickup', label: 'Ready to Pickup', icon: <Bell /> },
    { key: 'delivered', label: 'Completed/Delivered', icon: <Smile /> },
  ];

  // Fetch true order status
  useEffect(() => {
    if (!orderId || !user) return;

    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/api/orders/${orderId}`);
        setOrder(data);
        const currentIndex = statuses.findIndex(s => s.key === data.status);
        if (currentIndex !== -1) setStatusIndex(currentIndex);
      } catch (error) {
        console.error('Error fetching order', error);
      }
    };

    fetchOrder();
    let interval;
    if (order?.status !== 'cancelled' && order?.status !== 'completed' && order?.status !== 'delivered') {
        interval = setInterval(fetchOrder, 5000); // poll every 5s
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderId, user, order?.status]);

  const handleCancelOrder = async () => {
    if (timeLeft <= 0) {
      toast.error('Cancel time limit (2 minutes) has expired');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.put(
        `/api/orders/${orderId}/cancel`,
        {},
        config
      );

      toast.success(data.message || 'Order Cancelled Successfully');

      // Update state with confirmed backend data
      setStatusIndex(-1);
      setOrder(data);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancellation failed');
    }
  };

  if (!orderId || !order) return <div className="container mt-4">Loading order...</div>;

  return (
    <div className="container status-page animate-fade-in">
      <div className="status-card glass" style={order?.status === 'cancelled' ? { border: '1px solid #d32f2f' } : {}}>
        <h2>Order Status</h2>
        <p className="order-id">Order ID: #{orderId}</p>

        {order?.status === 'cancelled' ? (
          <div className="text-center my-4">
            <XCircle size={64} style={{ color: '#d32f2f', marginBottom: '1rem' }} />
            <h3 style={{ color: '#d32f2f' }}>Order Cancelled</h3>
            <p>This order has been cancelled and cannot be fulfilled.</p>
          </div>
        ) : (
          <>
            <div className="status-timeline">
              {statuses.map((s, index) => {
                const isActive = index <= statusIndex;
                return (
                  <div key={s.key} className={`timeline-step ${isActive ? 'active' : ''}`}>
                    <motion.div
                      className="step-icon"
                      initial={{ scale: 0 }}
                      animate={{ scale: isActive ? 1 : 0.8 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {s.icon}
                    </motion.div>
                    <div className="step-label">{s.label}</div>
                    {index < statuses.length - 1 && (
                      <div className={`step-line ${isActive ? 'active' : ''}`}></div>
                    )}
                  </div>
                );
              })}
            </div>

            <motion.div
              className="current-status-message glass"
              key={statusIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {statusIndex === 0 && <p>Your order has been placed successfully.</p>}
              {statusIndex === 1 && <p>Our baristas and chefs are preparing your items.</p>}
              {statusIndex === 2 && <p>Your items are prepared and being packaged.</p>}
              {statusIndex === 3 && (
                <div className="pickup-ready">
                  <h3>Yay! Your order is ready!</h3>
                  <p>Please come to the counter to pick it up.</p>
                </div>
              )}
              {statusIndex === 4 && <p>Order Complete. Enjoy!</p>}
            </motion.div>
          </>
        )}

        {/* Cancellation Button */}
        {order?.status && ['placed', 'baking'].includes(order.status) && (
          <div className="mt-4 text-center">
            {timeLeft > 0 ? (
              <>
                <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                  Time remaining to cancel: {Math.floor(timeLeft / 60000)}:{(Math.floor((timeLeft % 60000) / 1000)).toString().padStart(2, '0')}
                </p>
                <button
                  className="btn btn-outline"
                  style={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                  onClick={handleCancelOrder}
                >
                  Cancel Order
                </button>
              </>
            ) : (
              <button
                className="btn btn-outline disabled"
                style={{ borderColor: 'gray', color: 'gray', cursor: 'not-allowed', opacity: 0.6 }}
                disabled
              >
                Cancel Time Expired
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
