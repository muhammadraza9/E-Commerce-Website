export default function ProductCardSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-xl overflow-hidden animate-pulse"
        >
          <div className="w-full h-64 bg-slate-700" />

          <div className="p-4">
            <div className="h-6 w-3/4 bg-slate-700 rounded mb-4" />

            <div className="h-4 w-full bg-slate-700 rounded mb-2" />

            <div className="h-4 w-2/3 bg-slate-700 rounded mb-5" />

            <div className="h-8 w-28 bg-slate-700 rounded mb-5" />

            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-slate-700 rounded-lg" />

              <div className="flex-1 h-10 bg-slate-700 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}