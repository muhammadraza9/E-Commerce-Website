"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import { showErrorToast } from "@/utils/toast";

export const CartContext = createContext();

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

const getStock = (item) => Number(item?.stock ?? 0);

export default function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

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

    return () => window.removeEventListener("authChange", loadCart);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const cartKey = getCartKey();
    if (!cartKey) return;

    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, isLoaded]);

  const addToCart = (product, quantity = 1) => {
    const stock = getStock(product);
    const qty = Number(quantity || 1);

    if (stock <= 0) {
      showErrorToast("This product is out of stock");
      return false;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    const currentQty = existingItem?.quantity || 0;
    const nextQty = currentQty + qty;

    if (nextQty > stock) {
      showErrorToast(`Only ${stock} item(s) available in stock`);
      return false;
    }

    setCart((prev) => {
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: nextQty, stock }
            : item
        );
      }

      return [...prev, { ...product, stock, quantity: qty }];
    });

    return true;
  };

  const updateQuantity = (id, quantity) => {
    const nextQty = Number(quantity);
    if (nextQty < 1) return;

    const item = cart.find((cartItem) => cartItem.id === id);
    if (!item) return;

    const stock = getStock(item);

    if (nextQty > stock) {
      showErrorToast(`Only ${stock} item(s) available in stock`);
      return;
    }

    setCart((prev) =>
      prev.map((cartItem) =>
        cartItem.id === id ? { ...cartItem, quantity: nextQty } : cartItem
      )
    );
  };

  const increaseQuantity = (id) => {
    const item = cart.find((cartItem) => cartItem.id === id);
    if (!item) return;

    const stock = getStock(item);

    if (item.quantity >= stock) {
      showErrorToast(`Only ${stock} item(s) available in stock`);
      return;
    }

    setCart((prev) =>
      prev.map((cartItem) =>
        cartItem.id === id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
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
    for (const item of items) {
      const stock = getStock(item);
      const qty = Number(item.quantity || 1);

      if (stock <= 0) {
        showErrorToast(`${item.name} is out of stock`);
        return false;
      }

      if (qty > stock) {
        showErrorToast(`${item.name} has only ${stock} item(s) left`);
        return false;
      }
    }

    setCheckoutItems(items);
    return true;
  };

  const removeCheckedOutItems = (ids) => {
    setCart((prev) => prev.filter((item) => !ids.includes(item.id)));
    setCheckoutItems([]);
  };

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
  }, [cart]);

  const cartTotalQuantity = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
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