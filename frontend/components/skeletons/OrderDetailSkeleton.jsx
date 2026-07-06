export default function OrderDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
      <div className="mb-6">
        <div className="h-12 w-44 bg-[#071827] rounded-xl border border-[#D4AF37]/20" />
      </div>

      <div className="bg-[#0d1117] border border-[#D4AF37]/20 rounded-2xl p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <div className="h-4 w-32 bg-[#071827] rounded mb-3" />
            <div className="h-9 w-56 bg-[#071827] rounded mb-3" />
            <div className="h-4 w-64 bg-[#071827] rounded" />
          </div>

          <div className="h-9 w-28 bg-[#071827] rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="border border-[#D4AF37]/20 rounded-xl p-4"
            >
              <div className="h-6 w-48 bg-[#071827] rounded mb-5" />

              <div className="space-y-3">
                <div className="h-4 w-full bg-[#071827] rounded" />
                <div className="h-4 w-4/5 bg-[#071827] rounded" />
                <div className="h-4 w-3/4 bg-[#071827] rounded" />
                <div className="h-4 w-5/6 bg-[#071827] rounded" />
              </div>
            </div>
          ))}
        </div>

        <div className="border border-[#D4AF37]/20 rounded-xl p-5 sm:p-6 mb-8">
          <div className="h-7 w-52 bg-[#071827] rounded mb-5" />

          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="border border-[#D4AF37]/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg bg-[#071827]" />

                <div className="flex-1">
                  <div className="h-6 w-52 bg-[#071827] rounded mb-4" />
                  <div className="h-4 w-28 bg-[#071827] rounded mb-3" />
                  <div className="h-4 w-32 bg-[#071827] rounded mb-3" />
                  <div className="h-5 w-36 bg-[#071827] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="h-12 w-44 bg-[#071827] rounded-lg" />
          <div className="h-12 w-36 bg-[#071827] rounded-lg" />
        </div>
      </div>
    </div>
  );
}