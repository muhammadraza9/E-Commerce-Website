"use client"


export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section — mens clothing store */}
      <section className="relative px-6 py-32 flex items-center overflow-hidden min-h-[420px]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(1)",
          }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative max-w-7xl mx-auto w-full">
          <p className="text-[#D4AF37] text-sm font-semibold tracking-widest uppercase mb-3">
            Our Story
          </p>
          <h1 className="text-5xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            About <span className="text-[#D4AF37]">Style Avenue</span>
          </h1>
          <p className="mt-4 text-lg text-gray-200 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] max-w-2xl">
            The story behind Style Avenue — Pakistan's trusted destination
            for premium men's fashion.
          </p>
        </div>
      </section>

      {/* Who We Are — strong men's fashion image */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">
              Who We Are
            </h2>
            <p className="text-gray-100 leading-8">
              Style Avenue is a modern men's fashion destination built for
              gentlemen who care about how they look and carry themselves
              every day. We curate a wide range of clothing — from sharp
              formal suits to refined casual wear — blending the latest
              trends with timeless style.
            </p>
            <p className="text-gray-100 leading-8 mt-5">
              Every product is chosen with quality, fit, and style in mind.
              Whether you're dressing for the boardroom or a weekend out,
              we bring you menswear that commands respect without
              compromising on comfort.
            </p>
            <p className="text-gray-100 leading-8 mt-5">
              Beyond great products, we're committed to a smooth shopping
              experience — easy browsing, secure checkout, and reliable
              delivery, so you can shop with confidence from start to finish.
            </p>
          </div>
          {/* Sharp, well-dressed man — represents the brand */}
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80"
              alt="Style Avenue mens clothing store"
              className="w-full h-[420px] object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Inside Style Avenue — mens store grid */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-[#D4AF37] mb-8 text-center">
          Inside Style Avenue
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Men's suits on rack */}
          <div className="rounded-2xl overflow-hidden shadow-xl h-[260px]">
            <img
              src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80"
              alt="Men's clothing collection shirts"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          {/* Men's formal wear / shirts */}
          <div className="rounded-2xl overflow-hidden shadow-xl h-[260px]">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"
              alt="Men's sneakers joggers shoes"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          {/* Man shopping / trying outfit */}
          <div className="rounded-2xl overflow-hidden shadow-xl h-[260px]">
            <img
              src="https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600&q=80"
              alt="Men's casual clothing folded store"
              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.15)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-[#D4AF37] mb-3">
            What Drives Us
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-12">
            Every decision we make is rooted in three simple values that have
            guided Style Avenue since day one.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="border border-slate-600 bg-black/40 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">✦</div>
              <p className="text-[#D4AF37] text-xl font-bold mb-2">Quality</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Every item is hand-picked and quality-checked before it reaches you.
              </p>
            </div>
            <div className="border border-slate-600 bg-black/40 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <p className="text-[#D4AF37] text-xl font-bold mb-2">Speed</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Fast, reliable delivery right to your doorstep — every time.
              </p>
            </div>
            <div className="border border-slate-600 bg-black/40 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">♡</div>
              <p className="text-[#D4AF37] text-xl font-bold mb-2">Care</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Our 24/7 support team is always here whenever you need us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="border border-slate-700 rounded-2xl p-6 text-center">
            <p className="text-[#D4AF37] text-3xl font-bold">100%</p>
            <p className="text-gray-300 text-sm mt-2">Quality Checked Products</p>
          </div>
          <div className="border border-slate-700 rounded-2xl p-6 text-center">
            <p className="text-[#D4AF37] text-3xl font-bold">Fast</p>
            <p className="text-gray-300 text-sm mt-2">Reliable Doorstep Delivery</p>
          </div>
          <div className="border border-slate-700 rounded-2xl p-6 text-center">
            <p className="text-[#D4AF37] text-3xl font-bold">24/7</p>
            <p className="text-gray-300 text-sm mt-2">Customer Support</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner — confident man */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="rounded-2xl overflow-hidden shadow-2xl relative">
          <img
            src="https://images.unsplash.com/photo-1550246140-29f40b909e5a?w=1400&q=80"
            alt="Style Avenue mens fashion"
            className="w-full h-[260px] object-cover object-top"
            style={{ filter: "brightness(0.5)" }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h3 className="text-white text-2xl font-bold drop-shadow-lg">
              Dress Sharp. <span className="text-[#D4AF37]">Look Confident.</span>
            </h3>
            <p className="text-gray-200 mt-2 text-sm max-w-md drop-shadow">
              Explore our latest men's collections and find your signature style.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}