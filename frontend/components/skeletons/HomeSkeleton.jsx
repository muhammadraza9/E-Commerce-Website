export default function HomeSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
      <div className="grid lg:grid-cols-2 gap-10 items-center mb-16">
        <div>
          <div className="h-5 w-32 bg-[#071827] rounded mb-4" />
          <div className="h-12 w-full max-w-md bg-[#071827] rounded mb-4" />
          <div className="h-12 w-3/4 bg-[#071827] rounded mb-6" />
          <div className="h-5 w-full max-w-lg bg-[#071827] rounded mb-3" />
          <div className="h-5 w-4/5 bg-[#071827] rounded mb-8" />

          <div className="flex gap-4">
            <div className="h-12 w-36 bg-[#071827] rounded-xl" />
            <div className="h-12 w-36 bg-[#071827] rounded-xl" />
          </div>
        </div>

        <div className="h-[420px] bg-[#071827] rounded-3xl border border-[#D4AF37]/20" />
      </div>

      <div className="mb-10">
        <div className="h-5 w-40 bg-[#071827] rounded mb-3" />
        <div className="h-10 w-72 bg-[#071827] rounded" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-xl overflow-hidden"
          >
            <div className="h-56 bg-[#071827]" />

            <div className="p-4">
              <div className="h-5 w-3/4 bg-[#071827] rounded mb-3" />
              <div className="h-4 w-full bg-[#071827] rounded mb-2" />
              <div className="h-4 w-2/3 bg-[#071827] rounded mb-5" />
              <div className="h-8 w-28 bg-[#071827] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}