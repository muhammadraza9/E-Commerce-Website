export default function AboutSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <section className="relative px-6 py-32 min-h-[420px] bg-[#071827]">
        <div className="relative max-w-7xl mx-auto w-full">
          <div className="h-4 w-32 bg-[#0B1F33] rounded mb-4" />
          <div className="h-12 w-full max-w-xl bg-[#0B1F33] rounded mb-4" />
          <div className="h-5 w-full max-w-2xl bg-[#0B1F33] rounded" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="h-8 w-40 bg-[#071827] rounded mb-8" />
            <div className="space-y-4">
              <div className="h-5 w-full bg-[#071827] rounded" />
              <div className="h-5 w-full bg-[#071827] rounded" />
              <div className="h-5 w-4/5 bg-[#071827] rounded" />
              <div className="h-5 w-full bg-[#071827] rounded mt-6" />
              <div className="h-5 w-3/4 bg-[#071827] rounded" />
            </div>
          </div>

          <div className="h-[420px] bg-[#071827] rounded-2xl" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="h-8 w-56 bg-[#071827] rounded mx-auto mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-[260px] bg-[#071827] rounded-2xl" />
          <div className="h-[260px] bg-[#071827] rounded-2xl" />
          <div className="h-[260px] bg-[#071827] rounded-2xl" />
        </div>
      </section>

      <section className="py-20 bg-[#071827]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="h-8 w-44 bg-[#0B1F33] rounded mx-auto mb-4" />
          <div className="h-5 w-full max-w-xl bg-[#0B1F33] rounded mx-auto mb-12" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="border border-[#D4AF37]/20 bg-[#0B1F33] rounded-2xl p-8"
              >
                <div className="h-10 w-10 bg-[#071827] rounded mx-auto mb-4" />
                <div className="h-6 w-24 bg-[#071827] rounded mx-auto mb-4" />
                <div className="h-4 w-full bg-[#071827] rounded mb-2" />
                <div className="h-4 w-4/5 bg-[#071827] rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border border-[#D4AF37]/20 rounded-2xl p-6 text-center"
            >
              <div className="h-9 w-20 bg-[#071827] rounded mx-auto mb-4" />
              <div className="h-4 w-36 bg-[#071827] rounded mx-auto" />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="h-[260px] bg-[#071827] rounded-2xl" />
      </section>
    </div>
  );
}