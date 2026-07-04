export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="animate-pulse">
        <div className="h-10 w-64 bg-[#0B1F33] border border-[#D4AF37]/10 rounded-xl mb-8" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-xl overflow-hidden"
            >
              <div className="h-64 bg-[#071827]" />

              <div className="p-4">
                <div className="h-5 bg-[#071827] rounded mb-3" />
                <div className="h-4 bg-[#071827] rounded mb-2" />
                <div className="h-4 w-2/3 bg-[#071827] rounded mb-5" />
                <div className="h-8 w-24 bg-[#071827] rounded mb-5" />

                <div className="flex gap-2">
                  <div className="h-10 flex-1 bg-[#071827] rounded-lg" />
                  <div className="h-10 flex-1 bg-[#071827] rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}