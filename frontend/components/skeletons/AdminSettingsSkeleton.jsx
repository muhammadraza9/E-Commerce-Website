export default function AdminSettingsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-4 w-32 bg-slate-800 rounded mb-3" />
        <div className="h-10 w-64 bg-slate-800 rounded mb-3" />
        <div className="h-4 w-80 bg-slate-800 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-5"
          >
            <div className="h-4 w-24 bg-slate-800 rounded mb-4" />
            <div className="h-7 w-32 bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index}>
              <div className="h-4 w-32 bg-slate-800 rounded mb-3" />
              <div className="h-12 w-full bg-slate-800 rounded-xl" />
            </div>
          ))}

          <div className="md:col-span-2">
            <div className="h-4 w-32 bg-slate-800 rounded mb-3" />
            <div className="h-28 w-full bg-slate-800 rounded-xl" />
          </div>
        </div>

        <div className="h-12 w-44 bg-slate-800 rounded-xl mt-6" />
      </div>
    </div>
  );
}