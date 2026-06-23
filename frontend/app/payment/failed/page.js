export default function PaymentFailed() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Payment Failed</h1>
        <p className="text-gray-400">Please try again or choose a different method.</p>
      </div>
    </div>
  );
}