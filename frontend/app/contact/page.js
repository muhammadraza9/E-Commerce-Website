"use client";

import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import ContactSkeleton from "@/components/skeletons/ContactSkeleton";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

const EMAILJS_SERVICE_ID = "service_si7x6yg";
const EMAILJS_TEMPLATE_ID = "template_piobd0l";
const EMAILJS_PUBLIC_KEY = "I3kmaWk4nlrKIj1RS";

export default function Contact() {
  const [formData, setFormData] = useState({
    from_name: "",
    from_email: "",
    message: "",
  });

  const [status, setStatus] = useState("idle");
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.from_name,
          from_email: formData.from_email,
          message: formData.message,
        },
        EMAILJS_PUBLIC_KEY
      );

      setFormData({
        from_name: "",
        from_email: "",
        message: "",
      });

      showSuccessToast(
        "Message sent successfully! We'll get back to you shortly."
      );
    } catch (err) {
      console.error("EmailJS Error:", err);
      showErrorToast(err?.text || "Something went wrong. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  if (pageLoading) {
    return <ContactSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <section className="relative px-6 py-24 flex items-center overflow-hidden min-h-[700px]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.openai.com/static-rsc-4/P4BFgu2jYDHTvCx61eKvAcJSEceLmurkyHBmhON8Zwxke-1cpCNY4udUf_UXxXreaf6gxQljcml0gUXgIsXrCLlmxgVh5_a2au9hYQTz6AgVAU-9BWnzEuw469QU5J0DweHH0T44GfHX4Fkb-nagOE9x4oRdY8sVnmZNUM-qbaqRBhI9Gs6UgEWjq1TJyP_n?purpose=inline')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(1)",
          }}
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative max-w-7xl mx-auto w-full">
          <p className="text-[#D4AF37] text-sm font-semibold tracking-widest uppercase mb-3">
            Get In Touch
          </p>

          <h1 className="text-5xl font-bold text-white">
            Contact <span className="text-[#D4AF37]">Us</span>
          </h1>

          <p className="mt-4 text-gray-200 max-w-xl">
            Have a question? We'd love to hear from you.{" "}
            <span className="text-[#D4AF37]">
              Send us a message and we'll
            </span>{" "}
            respond as soon as possible.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h2 className="text-3xl font-bold text-[#D4AF37] mb-8">
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="from_name"
              value={formData.from_name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              className="w-full border border-slate-700 bg-slate-900 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37]"
            />

            <input
              type="email"
              name="from_email"
              value={formData.from_email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="w-full border border-slate-700 bg-slate-900 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37]"
            />

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              placeholder="Your Message"
              required
              className="w-full border border-slate-700 bg-slate-900 rounded-xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-[#D4AF37]"
            />

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-[#D4AF37] text-[#001F14] py-4 rounded-xl font-semibold hover:scale-105 transition disabled:opacity-60"
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        <div className="flex flex-col justify-center gap-8">
          <h2 className="text-3xl font-bold text-[#D4AF37]">
            Store Information
          </h2>

          <div className="flex gap-4">
            <span className="text-3xl">📍</span>

            <div>
              <h3 className="text-white font-semibold text-lg">Address</h3>
              <p className="text-gray-400 mt-1">
                Style Avenue, Main Market, Rawalpindi, Punjab, Pakistan
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="text-3xl">📞</span>

            <div>
              <h3 className="text-white font-semibold text-lg">
                Phone / WhatsApp
              </h3>
              <p className="text-gray-400 mt-1">+92 312 6779452</p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="text-3xl">📧</span>

            <div>
              <h3 className="text-white font-semibold text-lg">Email</h3>
              <p className="text-gray-400 mt-1">info@styleavenue.pk</p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="text-3xl">🕒</span>

            <div>
              <h3 className="text-white font-semibold text-lg">
                Store Hours
              </h3>
              <p className="text-gray-400 mt-1">
                Monday – Saturday: 10:00 AM – 9:00 PM
              </p>
              <p className="text-gray-400">Sunday: 12:00 PM – 6:00 PM</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mt-4">
            <h3 className="text-[#D4AF37] text-xl font-bold mb-3">
              Why Contact Us?
            </h3>

            <p className="text-gray-400 leading-7">
              We're always happy to help with orders, returns, product
              information, or any questions you may have. Our support team is
              committed to providing you with the best shopping experience.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}