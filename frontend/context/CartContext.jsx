'use client';

import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export default function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadCart = () => {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user) {
        setCart([]);
        setIsLoaded(true);
        return;
      }

      const userCart = localStorage.getItem(
        `cart_${user.email}`
      );

      setCart(
        userCart ? JSON.parse(userCart) : []
      );

      setIsLoaded(true);
    };

    loadCart();

    window.addEventListener(
      "authChange",
      loadCart
    );

    return () => {
      window.removeEventListener(
        "authChange",
        loadCart
      );
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (!user) return;

    localStorage.setItem(
      `cart_${user.email}`,
      JSON.stringify(cart)
    );
  }, [cart, isLoaded]);

  // quantity: kitni quantity add karni hai (default 1)
  // Agar product cart mein already hai, to quantity ADD ho jayegi
  // (jaise professional websites mein hota hai - duplicate item nahi banta)
  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(
      (item) => item.id === product.id
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + quantity,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity,
        },
      ]);
    }
  };

  // Cart page par quantity directly set karne ke liye (e.g. +/- buttons, ya manual input)
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;

    setCart(
      cart.map((item) =>
        item.id === id
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart(
      cart.filter(
        (item) => item.id !== id
      )
    );
  };

  const startCheckout = (items) => {
    setCheckoutItems(items);
  };

  const removeCheckedOutItems = (ids) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !ids.includes(item.id)
      )
    );

    setCheckoutItems([]);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        checkoutItems,
        startCheckout,
        removeCheckedOutItems,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}