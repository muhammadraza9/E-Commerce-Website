export default function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
      <div className="h-11 w-44 bg-[#0B1F33] border border-[#D4AF37]/20 rounded-xl mb-10" />

      <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-6 md:p-10 shadow-xl shadow-black/20">
        <div className="grid md:grid-cols-2 gap-10 md:gap-20">
          <div className="w-full aspect-[4/5] bg-[#071827] rounded-2xl border border-[#D4AF37]/10" />

          <div className="flex flex-col items-center text-center justify-center">
            <div className="h-4 w-28 bg-[#071827] rounded mb-5" />
            <div className="h-10 w-80 max-w-full bg-[#071827] rounded mb-5" />
            <div className="h-5 w-52 bg-[#071827] rounded mb-8" />
            <div className="h-20 w-full max-w-md bg-[#071827] rounded mb-8" />

            <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-8">
              <div className="h-20 bg-[#071827] rounded-xl" />
              <div className="h-20 bg-[#071827] rounded-xl" />
            </div>

            <div className="h-px bg-[#D4AF37]/20 w-full mb-8" />
            <div className="h-12 w-40 bg-[#071827] rounded mb-8" />

            <div className="flex gap-3 w-full max-w-md">
              <div className="h-12 flex-1 bg-[#071827] rounded-xl" />
              <div className="h-12 flex-1 bg-[#071827] rounded-xl" />
              <div className="h-12 w-14 bg-[#071827] rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid lg:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-6 shadow-xl shadow-black/20"
          >
            <div className="h-7 w-40 bg-[#071827] rounded mb-6" />
            <div className="space-y-4">
              <div className="h-10 bg-[#071827] rounded-xl" />
              <div className="h-10 bg-[#071827] rounded-xl" />
              <div className="h-24 bg-[#071827] rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-6 shadow-xl shadow-black/20">
        <div className="h-8 w-56 bg-[#071827] rounded mb-6" />

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 bg-[#071827] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}