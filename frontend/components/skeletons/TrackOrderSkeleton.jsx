export default function TrackOrderSkeleton() {
  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div
        className="absolute inset-0 z-0"
        style={{ background: "rgba(10, 22, 40, 0.85)" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-12 animate-pulse">
        <div className="h-11 w-64 bg-[#071827] rounded mb-8" />

        <div className="space-y-4 mb-8">
          <div className="h-12 w-full bg-[#071827] rounded-lg border border-[#D4AF37]/20" />
          <div className="h-12 w-40 bg-[#071827] rounded-xl" />
        </div>

        <div className="rounded-2xl p-6 border bg-[#0B1F33]/90 border-[#D4AF37]/20">
          <div className="h-8 w-48 bg-[#071827] rounded mb-6" />

          <div className="space-y-4">
            <div className="h-5 w-full bg-[#071827] rounded" />
            <div className="h-5 w-3/4 bg-[#071827] rounded" />
            <div className="h-5 w-2/3 bg-[#071827] rounded" />
            <div className="h-5 w-1/2 bg-[#071827] rounded" />
            <div className="h-5 w-3/5 bg-[#071827] rounded" />
          </div>

          <div className="h-7 w-52 bg-[#071827] rounded mt-10 mb-5" />

          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="border border-[#D4AF37]/10 rounded-lg p-4"
              >
                <div className="h-4 w-32 bg-[#071827] rounded mb-3" />
                <div className="h-4 w-28 bg-[#071827] rounded mb-3" />
                <div className="h-4 w-36 bg-[#071827] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}