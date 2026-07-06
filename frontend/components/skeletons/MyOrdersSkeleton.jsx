export default function MyOrdersSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
      <div className="mb-8">
        <div className="h-4 w-32 bg-[#071827] rounded mb-3" />
        <div className="h-10 w-56 bg-[#071827] rounded mb-3" />
        <div className="h-4 w-44 bg-[#071827] rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="border border-[#D4AF37]/20 rounded-2xl p-5 bg-[#0B1F33]"
          >
            <div className="h-4 w-28 bg-[#071827] rounded mb-4" />
            <div className="h-8 w-20 bg-[#071827] rounded" />
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-10 w-28 rounded-full bg-[#071827] border border-[#D4AF37]/20 shrink-0"
          />
        ))}
      </div>

      <div className="space-y-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-5">
              <div>
                <div className="h-6 w-48 bg-[#071827] rounded mb-3" />
                <div className="h-4 w-32 bg-[#071827] rounded" />
              </div>

              <div className="h-7 w-24 bg-[#071827] rounded-full" />
            </div>

            <div className="space-y-3 mb-5">
              {Array.from({ length: 3 }).map((_, itemIndex) => (
                <div key={itemIndex} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#071827]" />
                  <div className="h-4 w-52 bg-[#071827] rounded" />
                </div>
              ))}
            </div>

            <div className="border-t border-[#D4AF37]/10 pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <div className="h-4 w-20 bg-[#071827] rounded mb-3" />
                <div className="h-5 w-28 bg-[#071827] rounded" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="h-10 w-28 bg-[#071827] rounded-lg" />
                <div className="h-10 w-28 bg-[#071827] rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}