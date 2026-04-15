import React, { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item, qty) => {
    const existItem = cartItems.find((x) => x.product === item._id);

    if (existItem) {
      setCartItems(
        cartItems.map((x) =>
          x.product === existItem.product ? { ...x, qty: x.qty + qty } : x
        )
      );
    } else {
      setCartItems([...cartItems, { ...item, product: item._id, qty }]);
    }
    
    if (qty > 0) {
      toast.success(`${item.name} added to cart`);
    } else if (qty < 0) {
      // toast.info(`${item.name} quantity updated`);
    }
  };

  const removeFromCart = (id) => {
    const itemToRemove = cartItems.find(x => x.product === id);
    setCartItems(cartItems.filter((x) => x.product !== id));
    if (itemToRemove) {
      toast.error(`${itemToRemove.name} removed from cart`);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
