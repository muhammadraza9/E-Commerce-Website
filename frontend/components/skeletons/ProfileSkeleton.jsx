export default function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse">
      <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-8 mb-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-[#071827] rounded-full" />
          <div className="h-8 w-48 bg-[#071827] rounded" />
          <div className="h-4 w-64 bg-[#071827] rounded" />
          <div className="h-8 w-24 bg-[#071827] rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="h-24 bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl" />
        <div className="h-24 bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl" />
      </div>

      <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-8">
        <div className="h-7 w-44 bg-[#071827] rounded mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#071827] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}