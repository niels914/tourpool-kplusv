export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 w-40 rounded-xl bg-[#E2DFF0]" />
        <div className="mt-2 h-5 w-48 rounded-lg bg-[#EDE8F5]" />
      </div>
      {/* Top row: 3 cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#E2DFF0] bg-white p-5 shadow-sm">
            <div className="mb-4 h-3 w-24 rounded bg-[#EDE8F5]" />
            <div className="space-y-2.5">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="h-3 w-28 rounded bg-[#F3F4F6]" />
                  <div className="h-3 w-10 rounded bg-[#F3F4F6]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Bottom row: 3 cards */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#E2DFF0] bg-white p-5 shadow-sm">
            <div className="mb-3 h-3 w-24 rounded bg-[#EDE8F5]" />
            <div className="h-5 w-3/4 rounded bg-[#F3F4F6]" />
            <div className="mt-2 h-3 w-full rounded bg-[#F3F4F6]" />
            <div className="mt-1 h-3 w-2/3 rounded bg-[#F3F4F6]" />
          </div>
        ))}
      </div>
    </div>
  );
}
