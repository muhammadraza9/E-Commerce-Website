"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";

const DEFAULT_SETTINGS = {
  storeName: "Style Avenue",
  storeEmail: "support@styleavenue.pk",
  phoneNumber: "+92 312 6779452",
  whatsappNumber: "+92 312 6779452",
  storeAddress: "Islamabad, Pakistan",
  instagramUrl: "",
  facebookUrl: "",
  supportHours: "Monday - Saturday: 10:00 AM - 9:00 PM",
};

export default function Footer() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/admin-settings");

        setSettings({
          ...DEFAULT_SETTINGS,
          ...res.data,
        });
      } catch (error) {
        console.log("Footer settings load failed:", error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <footer className="bg-[#0B1F33] border-t border-[#D4AF37]/20 mt-15">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-8">
        <div className="flex flex-wrap justify-between gap-16">
          <div className="flex-1 min-w-[260px]">
            <h2 className="text-[#D4AF37] text-2xl font-bold mb-4">
              {settings.storeName}
            </h2>

            <p className="text-gray-400 text-sm leading-8">
              {settings.storeName} is a premium fashion destination offering
              modern, elegant, and high-quality clothing. We focus on style,
              comfort, and affordability to provide the best shopping
              experience.
            </p>
          </div>

          <div className="flex-1 min-w-[180px] lg:ml-24">
            <h3 className="text-white text-lg font-semibold mb-4">
              Quick Links
            </h3>

            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <Link href="/" className="hover:text-[#D4AF37]">
                  Home
                </Link>
              </li>

              <li>
                <Link href="/products" className="hover:text-[#D4AF37]">
                  Products
                </Link>
              </li>

              <li>
                <Link href="/about" className="hover:text-[#D4AF37]">
                  About Us
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-[#D4AF37]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex-1 min-w-[180px]">
            <h3 className="text-white text-lg font-semibold mb-4">
              Customer Service
            </h3>

            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <Link href="/track-order" className="hover:text-[#D4AF37]">
                  Track Order
                </Link>
              </li>

              <li>
                <Link
                  href="/profile/my-orders"
                  className="hover:text-[#D4AF37]"
                >
                  My Orders
                </Link>
              </li>

              <li>
                <Link href="/cart" className="hover:text-[#D4AF37]">
                  Shopping Cart
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-[#D4AF37]">
                  Support Center
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex-1 min-w-[220px]">
            <h3 className="text-white text-lg font-semibold mb-4">
              Contact Information
            </h3>

            <div className="space-y-4 text-gray-400 text-sm">
              <p>📧 {settings.storeEmail}</p>
              <p>📞 {settings.phoneNumber}</p>

              {settings.whatsappNumber && (
                <p>💬 WhatsApp: {settings.whatsappNumber}</p>
              )}

              <p>📍 {settings.storeAddress}</p>

              {settings.supportHours && <p>🕒 {settings.supportHours}</p>}

              <div className="flex gap-4 pt-2">
                {settings.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#D4AF37] hover:text-white transition"
                  >
                    Instagram
                  </a>
                )}

                {settings.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#D4AF37] hover:text-white transition"
                  >
                    Facebook
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-16 pt-8">
          <div className="flex flex-col items-center gap-5 text-gray-400 text-sm">
            <p>
              © {new Date().getFullYear()} {settings.storeName}. All Rights
              Reserved.
            </p>

            <div className="flex gap-10">
              <Link href="#" className="hover:text-[#D4AF37]">
                Privacy Policy
              </Link>

              <Link href="#" className="hover:text-[#D4AF37]">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}