export default function OrderListSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
      <div className="h-10 w-52 bg-[#071827] rounded mb-3" />
      <div className="h-4 w-40 bg-[#071827] rounded mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-5">
            <div className="h-4 w-24 bg-[#071827] rounded mb-4" />
            <div className="h-8 w-20 bg-[#071827] rounded" />
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-6">
            <div className="h-6 w-48 bg-[#071827] rounded mb-4" />
            <div className="h-4 w-32 bg-[#071827] rounded mb-5" />
            <div className="h-20 bg-[#071827] rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}