import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartProvider from "@/context/CartContext";
import FavoritesProvider from "@/context/FavoritesContext";
import BackToTopButton from "@/components/BackToTopButton";

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
  title: {
    default: "Style Avenue",
    template: "%s | Style Avenue",
  },

  description:
    "Style Avenue is a premium men's fashion e-commerce store offering clothing, shoes, hoodies, t-shirts and accessories in Pakistan.",

  keywords: [
    "Style Avenue",
    "mens fashion",
    "men clothing Pakistan",
    "online shopping Pakistan",
    "shoes",
    "hoodies",
    "t-shirts",
    "accessories",
    "ecommerce store",
  ],

  authors: [{ name: "Style Avenue" }],
  creator: "Style Avenue",

  openGraph: {
    title: "Style Avenue",
    description: "Premium men's fashion e-commerce store in Pakistan.",
    siteName: "Style Avenue",
    type: "website",
    locale: "en_PK",
  },

  twitter: {
    card: "summary_large_image",
    title: "Style Avenue",
    description: "Premium men's fashion e-commerce store in Pakistan.",
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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

            <BackToTopButton />

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