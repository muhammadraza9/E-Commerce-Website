"use client";

import { createContext, useEffect, useState } from "react";

export const FavoritesContext = createContext();

export default function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const getCurrentUser = () => {
    if (typeof window === "undefined") return null;

    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const getFavoritesKey = () => {
    const user = getCurrentUser();
    return user?.email ? `favorites_${user.email}` : null;
  };

  useEffect(() => {
    const loadFavorites = () => {
      const key = getFavoritesKey();

      if (!key) {
        setFavorites([]);
        setIsLoaded(true);
        return;
      }

      const storedFavorites = localStorage.getItem(key);
      setFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);
      setIsLoaded(true);
    };

    loadFavorites();

    window.addEventListener("authChange", loadFavorites);

    return () => {
      window.removeEventListener("authChange", loadFavorites);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const key = getFavoritesKey();
    if (!key) return;

    localStorage.setItem(key, JSON.stringify(favorites));
  }, [favorites, isLoaded]);

  const isFavorite = (id) => {
    return favorites.some((item) => item.id === id);
  };

  const toggleFavorite = (product) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === product.id);

      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }

      return [...prev, product];
    });
  };

  const removeFromFavorites = (id) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        removeFromFavorites,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}