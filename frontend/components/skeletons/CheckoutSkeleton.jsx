export default function CheckoutSkeleton() {
  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://wallpapers.com/images/hd/e-commerce-1920-x-1080-wallpaper-tb4uqckgoo0883zw.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div
        className="absolute inset-0 z-0"
        style={{ background: "rgba(10, 22, 40, 0.85)" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 min-h-screen animate-pulse">
        <div className="h-10 w-56 bg-[#071827] rounded mb-8" />

        <div className="rounded-2xl p-6 mb-6 border bg-[#0B1F33]/90 border-[#D4AF37]/20">
          <div className="h-6 w-52 bg-[#071827] rounded mb-5" />

          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#071827] rounded-lg" />
                  <div className="h-4 w-44 bg-[#071827] rounded" />
                </div>

                <div className="h-4 w-20 bg-[#071827] rounded" />
              </div>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-[#D4AF37]/20 flex justify-between">
            <div className="h-5 w-20 bg-[#071827] rounded" />
            <div className="h-6 w-24 bg-[#071827] rounded" />
          </div>
        </div>

        <div className="space-y-5 rounded-2xl p-8 border bg-[#0B1F33]/90 border-[#D4AF37]/20">
          <div className="h-12 w-full bg-[#071827] rounded-lg" />
          <div className="h-12 w-full bg-[#071827] rounded-lg" />
          <div className="h-12 w-full bg-[#071827] rounded-lg" />
          <div className="h-28 w-full bg-[#071827] rounded-lg" />

          <div>
            <div className="h-5 w-40 bg-[#071827] rounded mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-16 bg-[#071827] rounded-xl" />
              <div className="h-16 bg-[#071827] rounded-xl" />
              <div className="h-16 bg-[#071827] rounded-xl" />
            </div>
          </div>

          <div className="h-12 w-full bg-[#071827] rounded-xl" />
        </div>
      </div>
    </div>
  );
}