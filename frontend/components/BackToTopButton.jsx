"use client";

import { useEffect, useState } from "react";

export default function BackToTopButton() {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const percent =
        docHeight > 0
          ? Math.min((scrollTop / docHeight) * 100, 100)
          : 0;

      setProgress(percent);
      setShow(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!show) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back To Top"
      className="fixed bottom-6 right-6 z-[9999] group"
    >
      <div
        className="relative w-12 h-12 rounded-full p-[2px] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,.45)]"
        style={{
          background: `conic-gradient(
            #D4AF37 ${progress * 3.6}deg,
            rgba(212,175,55,.18) ${progress * 3.6}deg
          )`,
        }}
      >
        <div className="absolute inset-[2px] rounded-full bg-[#081421] border border-[#D4AF37]/25 flex items-center justify-center transition-all duration-300 group-hover:bg-[#0B1F33]">

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 transition-all duration-300 group-hover:-translate-y-0.5"
          >
            <path d="M12 19V5" />
            <path d="M5 12L12 5L19 12" />
          </svg>

        </div>
      </div>
    </button>
  );
}