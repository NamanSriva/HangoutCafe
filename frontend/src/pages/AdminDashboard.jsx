import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BarChart3, PackageOpen, TrendingUp, Users, ShoppingBag, PieChart } from 'lucide-react';
import SalesReport from '../components/SalesReport';
import toast from 'react-hot-toast';
import API from '../api/axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersToday: 0,
    activeItems: 0,
    newCustomers: 0,
    totalOrders: 0,
    totalUsers: 0,
    monthlySales: [],
    yearlySales: []
  });
  const [showReport, setShowReport] = useState(false);

  // Analytics data fetching
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/api/orders/stats');
        setStats(data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch dashboard statistics');
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) return <div className="loader container mt-4">Loading Dashboard...</div>;

  return (
    <div className="admin-container container animate-fade-in">
      <div className="admin-header">
        <h1>Admin <span className="highlight">Dashboard</span></h1>
        <p>Welcome back, {user.name}. Here's what's happening today.</p>
        {showReport && (
          <button className="btn btn-secondary mt-2" onClick={() => setShowReport(false)}>
            Back to Overview
          </button>
        )}
      </div>

      {!showReport ? (
        <>
          <div className="stats-grid">
            <div className="stat-card glass">
              <div className="stat-icon-wrapper sales-icon"><TrendingUp size={24} /></div>
              <div className="stat-info">
                <h3>Total Sales</h3>
                <p className="stat-value">₹{stats.totalSales.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="stat-card glass">
              <div className="stat-icon-wrapper orders-icon"><BarChart3 size={24} /></div>
              <div className="stat-info">
                <h3>Orders Today</h3>
                <p className="stat-value">{stats.ordersToday}</p>
              </div>
            </div>

            <div className="stat-card glass">
              <div className="stat-icon-wrapper items-icon"><PackageOpen size={24} /></div>
              <div className="stat-info">
                <h3>Menu Items</h3>
                <p className="stat-value">{stats.activeItems}</p>
              </div>
            </div>

            <div className="stat-card glass">
              <div className="stat-icon-wrapper users-icon"><Users size={24} /></div>
              <div className="stat-info">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.totalUsers}</p>
              </div>
            </div>

            <div className="stat-card glass">
              <div className="stat-icon-wrapper sales-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                <ShoppingBag size={24} />
              </div>
              <div className="stat-info">
                <h3>Total Orders</h3>
                <p className="stat-value">{stats.totalOrders}</p>
              </div>
            </div>

            <div className="stat-card glass">
              <div className="stat-icon-wrapper users-icon" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>New Customers</h3>
                <p className="stat-value">{stats.newCustomers}</p>
              </div>
            </div>
          </div>

          <div className="admin-actions mt-4">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button className="btn btn-secondary action-btn" onClick={() => navigate('/admin/menu')}>Manage Menu Items</button>
              <button className="btn btn-secondary action-btn" onClick={() => navigate('/admin/orders')}>View Live Orders</button>
              <button className="btn btn-secondary action-btn" onClick={() => setShowReport(true)}>
                <PieChart size={18} style={{ marginRight: '8px' }} />
                Sales Report
              </button>
              <button className="btn btn-secondary action-btn" onClick={() => toast('Inventory Report coming soon!', { icon: '🚧' })}>Inventory Report</button>
            </div>
          </div>
        </>
      ) : (
        <SalesReport monthlyData={stats.monthlySales} yearlyData={stats.yearlySales} />
      )}
    </div>
  );
};

export default AdminDashboard;
