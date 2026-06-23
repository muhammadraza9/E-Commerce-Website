"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0B1F33] border-t border-[#D4AF37]/20 mt-15">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-8">

        {/* Top Footer */}
        <div className="flex flex-wrap justify-between gap-16">

          {/* Style Avenue */}
          <div className="flex-1 min-w-[260px]">
            <h2 className="text-[#D4AF37] text-2xl font-bold mb-4">
              Style Avenue
            </h2>

            <p className="text-gray-400 text-sm leading-8">
              Style Avenue is a premium fashion destination offering modern,
              elegant, and high-quality clothing. We focus on style, comfort,
              and affordability to provide the best shopping experience.
            </p>
          </div>

          {/* Quick Links */}
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

          {/* Customer Service */}
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

          {/* Contact Information */}
          <div className="flex-1 min-w-[220px]">
            <h3 className="text-white text-lg font-semibold mb-4">
              Contact Information
            </h3>

            <div className="space-y-4 text-gray-400 text-sm">
              <p>📧 support@styleavenue.com</p>
              <p>📞 +92 312 6779452</p>
              <p>📍 Islamabad, Pakistan</p>
            </div>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-700 mt-16 pt-8">
          <div className="flex flex-col items-center gap-5 text-gray-400 text-sm">
            <p>
              © {new Date().getFullYear()} Style Avenue. All Rights Reserved.
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