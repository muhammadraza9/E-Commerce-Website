import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartProvider from "@/context/CartContext";
import FavoritesProvider from "@/context/FavoritesContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Style Avenue",
  description: "E-Commerce Website",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ scrollbarGutter: "stable" }}
    >
      <body className="m-0 p-0 min-h-screen w-full flex flex-col overflow-x-hidden">
        <CartProvider>
          <FavoritesProvider>
            <Navbar />

            <main className="flex-1 w-full">{children}</main>

            <Footer />

            <ToastContainer
              position="top-right"
              autoClose={2000}
              theme="colored"
              newestOnTop
              pauseOnHover
            />
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}