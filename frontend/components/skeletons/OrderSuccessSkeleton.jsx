export default function OrderSuccessSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 animate-pulse">
      <div className="bg-[#0B1F33] border border-[#D4AF37]/20 p-10 rounded-2xl text-center max-w-xl w-full shadow-2xl">
        <div className="h-16 w-16 bg-[#071827] rounded-full mx-auto mb-6" />

        <div className="h-10 w-full bg-[#071827] rounded mb-4" />

        <div className="h-5 w-64 bg-[#071827] rounded mx-auto mb-3" />

        <div className="h-5 w-52 bg-[#071827] rounded mx-auto mb-4" />

        <div className="bg-[#071827] border border-[#D4AF37]/20 rounded-lg p-4 mb-6">
          <div className="h-7 w-44 bg-[#0B1F33] rounded mx-auto" />
        </div>

        <div className="flex gap-4 justify-center">
          <div className="h-12 w-40 bg-[#071827] rounded-xl" />
          <div className="h-12 w-32 bg-[#071827] rounded-xl" />
        </div>
      </div>
    </div>
  );
}