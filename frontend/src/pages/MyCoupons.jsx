import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Tag, CheckCircle, XCircle } from 'lucide-react';
import './AdminDashboard.css';

const MyCoupons = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=my-coupons');
      return;
    }

    const fetchMyCoupons = async () => {
      try {
        const { data } = await API.get('/api/coupons/mycoupons');
        setCoupons(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        toast.error('Failed to load your coupons');
      } finally {
        setLoading(false);
      }
    };

    fetchMyCoupons();
  }, [user, navigate]);

  if (loading) return <div className="loader container mt-4">Loading your coupons...</div>;

  return (
    <div className="admin-container container animate-fade-in">
      <div className="admin-header mb-4">
        <h1>My <span className="highlight">Coupons</span></h1>
        <p>View your active and used refund coupons.</p>
      </div>

      <div className="orders-list">
        {coupons.length === 0 ? (
          <div className="text-center mt-5">
            <Tag size={48} className="theme-text mb-3" />
            <p>You don't have any refund coupons.</p>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/menu')}>Explore Menu</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {coupons.map(coupon => (
              <div 
                key={coupon._id} 
                className="stat-card glass" 
                style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: coupon.status === 'live' ? '4px solid #4CAF50' : '4px solid #aaa' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'monospace', color: coupon.status === 'live' ? 'var(--primary-color)' : '#aaa' }}>
                    {coupon.code}
                  </h3>
                  <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: coupon.status === 'live' ? '#fff' : '#aaa' }}>
                    ₹{coupon.amount.toFixed(2)}
                  </span>
                </div>
                
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc' }}>
                  <strong>Status:</strong> {coupon.status === 'live' ? <span style={{color: '#4CAF50'}}>Live <CheckCircle size={14} style={{display:'inline', verticalAlign:'text-bottom'}}/></span> : <span>Used <XCircle size={14} style={{display:'inline', verticalAlign:'text-bottom'}}/></span>}
                </p>

                <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem'}}>
                  <em>Issued from Cancelled Order #{coupon.generatedFromOrder ? coupon.generatedFromOrder._id.substring(coupon.generatedFromOrder._id.length - 6).toUpperCase() : 'N/A'} on {new Date(coupon.createdAt).toLocaleDateString()}</em>
                  {coupon.status === 'used' && coupon.usedInOrder && (
                    <div style={{color: '#d32f2f', marginTop: '0.2rem'}}>Consumed in Order #{coupon.usedInOrder._id.substring(coupon.usedInOrder._id.length - 6).toUpperCase()}</div>
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

export default MyCoupons;
