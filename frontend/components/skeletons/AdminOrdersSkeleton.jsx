export default function AdminOrdersSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
      <div className="mb-8">
        <div className="h-4 w-28 bg-[#071827] rounded mb-3" />
        <div className="h-10 w-72 bg-[#071827] rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-5"
          >
            <div className="h-4 w-24 bg-[#071827] rounded mb-4" />
            <div className="h-8 w-20 bg-[#071827] rounded" />
          </div>
        ))}
      </div>

      <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-12 bg-[#071827] rounded-xl" />
          <div className="h-12 bg-[#071827] rounded-xl" />
        </div>
      </div>

      <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl overflow-hidden">
        <div className="h-14 bg-[#071827]" />

        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-8 gap-4 px-4 py-5 border-t border-[#D4AF37]/10 min-w-[1050px]"
          >
            {Array.from({ length: 8 }).map((__, colIndex) => (
              <div key={colIndex} className="h-5 bg-[#071827] rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}