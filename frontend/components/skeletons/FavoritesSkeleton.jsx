export default function FavoritesSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <div className="h-4 w-32 bg-[#071827] rounded mb-3" />
          <div className="h-12 w-72 bg-[#071827] rounded mb-3" />
          <div className="h-4 w-44 bg-[#071827] rounded" />
        </div>

        <div className="h-12 w-40 bg-[#071827] rounded-xl" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-full flex flex-col bg-[#0B1F33] border border-[#D4AF37]/20 rounded-xl overflow-hidden"
          >
            <div className="relative w-full h-64 bg-[#071827]" />

            <div className="p-4 flex flex-col flex-1">
              <div className="h-6 w-3/4 bg-[#071827] rounded mb-4" />
              <div className="h-4 w-full bg-[#071827] rounded mb-2" />
              <div className="h-4 w-2/3 bg-[#071827] rounded mb-5" />
              <div className="h-8 w-28 bg-[#071827] rounded mb-5" />

              <div className="mt-auto pt-5 flex gap-2">
                <div className="h-10 flex-1 bg-[#071827] rounded-lg" />
                <div className="h-10 flex-1 bg-[#071827] rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}