"use client";

import { createContext, useEffect, useMemo, useState } from "react";

export const CartContext = createContext();

export default function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const getCurrentUser = () => {
    if (typeof window === "undefined") return null;

    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const getCartKey = () => {
    const user = getCurrentUser();
    return user?.email ? `cart_${user.email}` : null;
  };

  useEffect(() => {
    const loadCart = () => {
      const cartKey = getCartKey();

      if (!cartKey) {
        setCart([]);
        setIsLoaded(true);
        return;
      }

      const storedCart = localStorage.getItem(cartKey);
      setCart(storedCart ? JSON.parse(storedCart) : []);
      setIsLoaded(true);
    };

    loadCart();

    window.addEventListener("authChange", loadCart);

    return () => {
      window.removeEventListener("authChange", loadCart);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const cartKey = getCartKey();
    if (!cartKey) return;

    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, isLoaded]);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;

    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const increaseQuantity = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const removeSelectedFromCart = (ids) => {
    setCart((prev) => prev.filter((item) => !ids.includes(item.id)));
  };

  const clearCart = () => {
    setCart([]);
    setCheckoutItems([]);
  };

  const startCheckout = (items) => {
    setCheckoutItems(items);
  };

  const removeCheckedOutItems = (ids) => {
    setCart((prev) => prev.filter((item) => !ids.includes(item.id)));
    setCheckoutItems([]);
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const cartTotalQuantity = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,

        addToCart,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,

        removeFromCart,
        removeSelectedFromCart,
        clearCart,

        checkoutItems,
        startCheckout,
        removeCheckedOutItems,

        cartTotal,
        cartTotalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}