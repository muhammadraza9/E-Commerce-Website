export default function SignInSkeleton() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 animate-pulse">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div
        className="absolute inset-0 z-0"
        style={{ background: "rgba(10, 22, 40, 0.85)" }}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl p-10 border bg-[#0B1F33]/90 border-[#D4AF37]/20">
        <div className="h-10 w-40 bg-[#071827] rounded mx-auto mb-10" />

        <div className="mb-5">
          <div className="h-5 w-20 bg-[#071827] rounded mb-3" />
          <div className="h-14 w-full bg-[#071827] rounded-xl" />
        </div>

        <div className="mb-8">
          <div className="h-5 w-24 bg-[#071827] rounded mb-3" />
          <div className="h-14 w-full bg-[#071827] rounded-xl" />
        </div>

        <div className="h-14 w-full bg-[#071827] rounded-xl" />

        <div className="h-5 w-64 bg-[#071827] rounded mx-auto mt-6" />
      </div>
    </div>
  );
}