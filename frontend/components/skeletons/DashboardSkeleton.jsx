export default function DashboardSkeleton() {
  return (
    <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto animate-pulse">
      <div className="h-4 w-28 bg-[#071827] rounded mb-3" />
      <div className="h-10 w-64 bg-[#071827] rounded mb-3" />
      <div className="h-4 w-80 bg-[#071827] rounded mb-8" />

      <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-5 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-6"
          >
            <div className="h-4 w-24 bg-[#071827] rounded mb-4" />
            <div className="h-9 w-28 bg-[#071827] rounded" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-6"
          >
            <div className="h-6 w-40 bg-[#071827] rounded mb-5" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-20 bg-[#071827] rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-6">
        <div className="h-6 w-44 bg-[#071827] rounded mb-5" />
        <div className="h-80 bg-[#071827] rounded-xl" />
      </div>
    </div>
  );
}