export default function ContactSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <section className="relative px-6 py-24 flex items-center overflow-hidden min-h-[700px] bg-[#071827]">
        <div className="relative max-w-7xl mx-auto w-full">
          <div className="h-4 w-32 bg-[#0B1F33] rounded mb-4" />
          <div className="h-12 w-72 bg-[#0B1F33] rounded mb-5" />
          <div className="h-5 w-full max-w-xl bg-[#0B1F33] rounded mb-3" />
          <div className="h-5 w-96 bg-[#0B1F33] rounded" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <div className="h-9 w-72 bg-[#071827] rounded mb-8" />

          <div className="space-y-5">
            <div className="h-14 w-full bg-[#071827] rounded-xl" />
            <div className="h-14 w-full bg-[#071827] rounded-xl" />
            <div className="h-40 w-full bg-[#071827] rounded-xl" />
            <div className="h-14 w-full bg-[#071827] rounded-xl" />
          </div>
        </div>

        <div className="flex flex-col justify-center gap-8">
          <div className="h-9 w-72 bg-[#071827] rounded" />

          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex gap-4">
              <div className="h-10 w-10 bg-[#071827] rounded" />

              <div className="flex-1">
                <div className="h-5 w-40 bg-[#071827] rounded mb-3" />
                <div className="h-4 w-full bg-[#071827] rounded" />
              </div>
            </div>
          ))}

          <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-6 mt-4">
            <div className="h-7 w-44 bg-[#071827] rounded mb-4" />
            <div className="h-4 w-full bg-[#071827] rounded mb-3" />
            <div className="h-4 w-full bg-[#071827] rounded mb-3" />
            <div className="h-4 w-4/5 bg-[#071827] rounded" />
          </div>
        </div>
      </section>
    </div>
  );
}