export default function PaymentSuccessSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 animate-pulse">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-10 text-center">
        <div className="h-16 w-16 rounded-full bg-slate-800 mx-auto mb-6"></div>

        <div className="h-8 w-64 bg-slate-800 rounded mx-auto mb-5"></div>

        <div className="h-4 w-72 bg-slate-800 rounded mx-auto mb-2"></div>

        <div className="h-4 w-52 bg-slate-800 rounded mx-auto"></div>

        <div className="mt-8 h-12 w-44 bg-slate-800 rounded-xl mx-auto"></div>
      </div>
    </div>
  );
}