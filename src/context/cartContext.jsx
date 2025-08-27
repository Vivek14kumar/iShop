import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Add to cart (update qty if exists)
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, qty: 1 }];
      }
    });
  };

  // Remove from cart
  const removeFromCart = (_id) => {
    setCart((prev) => prev.filter((item) => item._id !== _id));
  };

  // Update qty
  const updateQty = (_id, qty) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === _id ? { ...item, qty: Math.max(qty, 1) } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
