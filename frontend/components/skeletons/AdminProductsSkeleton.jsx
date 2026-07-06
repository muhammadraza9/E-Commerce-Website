export default function AdminProductsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="mb-10">
        <div className="h-10 w-72 bg-[#071827] rounded mb-3" />
        <div className="h-4 w-40 bg-[#071827] rounded" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="h-14 flex-1 bg-[#071827] rounded-xl" />
        <div className="h-14 md:w-56 bg-[#071827] rounded-xl" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl overflow-hidden"
          >
            <div className="aspect-[4/5] bg-[#071827]" />

            <div className="p-5">
              <div className="h-6 w-3/4 bg-[#071827] rounded mb-4" />
              <div className="h-4 w-full bg-[#071827] rounded mb-2" />
              <div className="h-4 w-2/3 bg-[#071827] rounded mb-4" />
              <div className="h-6 w-28 bg-[#071827] rounded mb-5" />
              <div className="h-7 w-36 bg-[#071827] rounded-full mb-6" />

              <div className="flex gap-3">
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