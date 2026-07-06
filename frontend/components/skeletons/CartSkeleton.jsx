export default function CartSkeleton() {
  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div
        className="absolute inset-0 z-0"
        style={{ background: "rgba(10, 22, 40, 0.82)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen animate-pulse">
        <div className="mb-8">
          <div className="h-4 w-32 bg-[#071827] rounded mb-3" />
          <div className="h-10 w-72 bg-[#071827] rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-4 p-4 rounded-xl border bg-[#0B1F33]/90 border-[#D4AF37]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="h-6 w-36 bg-[#071827] rounded" />

              <div className="flex gap-2">
                <div className="h-10 w-36 bg-[#071827] rounded-lg" />
                <div className="h-10 w-28 bg-[#071827] rounded-lg" />
              </div>
            </div>

            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="border rounded-xl p-4 sm:p-5 mb-4 bg-[#0B1F33]/90 border-[#D4AF37]/20 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
              >
                <div className="flex items-start gap-4 w-full">
                  <div className="w-5 h-5 bg-[#071827] rounded mt-1 shrink-0" />
                  <div className="w-20 h-20 bg-[#071827] rounded-lg shrink-0" />

                  <div className="flex-1">
                    <div className="h-6 w-48 bg-[#071827] rounded mb-4" />
                    <div className="h-5 w-40 bg-[#071827] rounded mb-4" />
                    <div className="h-5 w-24 bg-[#071827] rounded" />
                  </div>
                </div>

                <div className="h-10 w-full sm:w-24 bg-[#071827] rounded-lg" />
              </div>
            ))}
          </div>

          <div className="h-fit rounded-2xl border p-6 bg-[#0B1F33]/90 border-[#D4AF37]/20">
            <div className="h-8 w-44 bg-[#071827] rounded mb-6" />

            <div className="space-y-4">
              <div className="h-5 w-full bg-[#071827] rounded" />
              <div className="h-5 w-full bg-[#071827] rounded" />
              <div className="h-5 w-full bg-[#071827] rounded" />
              <div className="h-px bg-[#D4AF37]/20" />
              <div className="h-8 w-full bg-[#071827] rounded" />
            </div>

            <div className="h-12 w-full bg-[#071827] rounded-lg mt-6" />
            <div className="h-4 w-40 mx-auto bg-[#071827] rounded mt-4" />
          </div>
        </div>

        <div className="flex justify-center sm:justify-end mt-16 pb-4">
          <div className="text-center sm:text-right">
            <div className="h-8 w-48 bg-[#071827] rounded mb-3" />
            <div className="h-4 w-64 bg-[#071827] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}