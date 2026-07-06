export default function AdminUsersSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
      <div className="mb-8">
        <div className="h-4 w-32 bg-[#071827] rounded mb-3" />
        <div className="h-10 w-60 bg-[#071827] rounded mb-3" />
        <div className="h-4 w-44 bg-[#071827] rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-5"
          >
            <div className="h-4 w-24 bg-[#071827] rounded mb-4" />
            <div className="h-8 w-16 bg-[#071827] rounded" />
          </div>
        ))}
      </div>

      <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-12 bg-[#071827] rounded-xl" />
          <div className="h-12 bg-[#071827] rounded-xl" />
        </div>
      </div>

      <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl overflow-x-auto">
        <div className="min-w-[850px]">
          <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-[#D4AF37]/10">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-4 bg-[#071827] rounded" />
            ))}
          </div>

          {Array.from({ length: 7 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-5 gap-4 px-6 py-5 border-b border-[#D4AF37]/10"
            >
              {Array.from({ length: 5 }).map((_, colIndex) => (
                <div key={colIndex} className="h-5 bg-[#071827] rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}