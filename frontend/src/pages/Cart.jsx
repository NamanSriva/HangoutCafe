import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, CreditCard, ArrowRight, Wallet, Tag } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import './Cart.css';

const Cart = () => {
  const { cartItems, addToCart, removeFromCart, cartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const tax = cartTotal * 0.08; // 8% tax
  const subTotalWithTax = cartTotal + tax;
  const discount = appliedCoupon ? Math.min(appliedCoupon.amount, subTotalWithTax) : 0;
  const finalTotal = Math.max(0, subTotalWithTax - discount);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await API.post('/api/coupons/validate', { code: couponInput }, config);
      setAppliedCoupon(data);
      toast.success(`Coupon applied! ₹${data.amount.toFixed(2)} off.`);
      if (subTotalWithTax - data.amount <= 0) {
        setPaymentMethod('Coupon');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid Coupon Code');
      setAppliedCoupon(null);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login?redirect=cart');
      return;
    }
    
    setIsProcessing(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };

      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          image: item.imageUrl || item.image,
          price: item.price,
          product: item.product || item._id
        })),
        totalPrice: subTotalWithTax, // Send original total before coupon so backend calculates deduction safely
        paymentMethod,
        isPaid: paymentMethod === 'UPI' || paymentMethod === 'Coupon',
        couponCode: appliedCoupon ? appliedCoupon.code : undefined
      };

      const { data } = await axios.post('/api/orders', orderData, config);

      if (paymentMethod === 'UPI') {
        const upiLink = `upi://pay?pa=cafe@axis&pn=Hangout%20Cafe&am=${finalTotal.toFixed(2)}&cu=INR&tr=${data._id}`;
        const gpayIntent = `intent://pay?pa=cafe@axis&pn=Hangout%20Cafe&am=${finalTotal.toFixed(2)}&cu=INR&tr=${data._id}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
        
        // Use intent on Android for better GPay reliability
        const isAndroid = /Android/i.test(navigator.userAgent);
        const finalLink = isAndroid ? gpayIntent : upiLink;

        toast('Rerouting to Google Pay...', { icon: '💳' });
        
        try {
          // Robust redirection method
          const link = document.createElement('a');
          link.href = finalLink;
          link.click();
        } catch (err) {
          window.location.href = finalLink;
        }

        setTimeout(() => {
          clearCart();
          setIsProcessing(false);
          navigate(`/order-status?id=${data._id}`);
        }, 3000);
      } else {
        clearCart();
        setIsProcessing(false);
        navigate(`/order-status?id=${data._id}`);
      }
    } catch (error) {
      setIsProcessing(false);
      const msg = error.response?.data?.message || 'Checkout failed';
      toast.error(msg);
      console.log(msg);
      console.error('Order creation error:', error);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container cart-empty animate-fade-in">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any items to your cart yet.</p>
        <Link to="/menu" className="btn btn-primary mt-4">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="container cart-page animate-fade-in">
      <h1 className="mb-4">Your Order</h1>
      
      <div className="cart-content">
        <div className="cart-items">
          <AnimatePresence>
            {cartItems.map(item => (
              <motion.div 
                key={item.product}
                className="cart-card glass"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <img src={item.imageUrl || item.image} alt={item.name} className="cart-item-img" />
                
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">₹{item.price.toFixed(2)}</p>
                </div>
                
                <div className="cart-item-actions">
                  <div className="qty-controls">
                    <button 
                      onClick={() => addToCart(item, -1)}
                      disabled={item.qty <= 1}
                      className="qty-btn"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="qty-text">{item.qty}</span>
                    <button 
                      onClick={() => addToCart(item, 1)}
                      className="qty-btn"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <button onClick={() => removeFromCart(item.product)} className="remove-btn">
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <div className="item-line-total">
                  ₹{(item.price * item.qty).toFixed(2)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="cart-summary glass">
          <h2>Order Summary</h2>
          
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Taxes (8%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          {appliedCoupon && (
            <div className="summary-row" style={{color: '#4CAF50'}}>
              <span>Coupon ({appliedCoupon.code})</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total-row">
            <span>Total</span>
            <span className="highlight">₹{finalTotal.toFixed(2)}</span>
          </div>
          
          <div className="coupon-section mt-3">
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Enter Coupon Code" 
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="form-control"
                style={{flex: 1}}
              />
              <button 
                onClick={applyCoupon}
                className="btn btn-secondary"
                disabled={!user || !couponInput.trim()}
              >
                Apply
              </button>
            </div>
          </div>

          <div className="payment-options mt-4 mb-4">
            <h3 className="mb-2" style={{ fontSize: '1.1rem' }}>Payment Method</h3>
            <div className="payment-radio" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="UPI" 
                  checked={paymentMethod === 'UPI'} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                />
                <CreditCard size={18} /> Google Pay / UPI
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Cash" 
                  checked={paymentMethod === 'Cash'} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  disabled={finalTotal === 0}
                />
                <Wallet size={18} /> Cash at Counter
              </label>
              {finalTotal === 0 && appliedCoupon && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#4CAF50' }}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="Coupon" 
                    checked={paymentMethod === 'Coupon'} 
                    readOnly
                  />
                  <Tag size={18} /> Covered by Coupon
                </label>
              )}
            </div>
          </div>

          <button 
            className={`btn btn-primary checkout-btn ${paymentMethod === 'UPI' ? 'google-pay-btn' : ''}`}
            onClick={handleCheckout}
            disabled={isProcessing}
            style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isProcessing ? 'Processing...' : (
              paymentMethod === 'UPI' ? (
                <><CreditCard size={20} /> Pay with Google Pay</>
              ) : paymentMethod === 'Coupon' ? (
                <><Tag size={20} /> Pay via Coupon & Place Order</>
              ) : (
                <><ArrowRight size={20} /> Place Order</>
              )
            )}
          </button>
          
          {!user && (
            <p className="login-prompt">You will be asked to login during checkout.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
