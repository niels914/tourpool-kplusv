export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 animate-pulse">
      <div className="mb-8">
        <div className="h-8 w-28 rounded-xl bg-[#E2DFF0]" />
        <div className="mt-2 h-4 w-56 rounded-lg bg-[#EDE8F5]" />
      </div>
      {/* Top riders skeleton */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-[#E2DFF0] bg-white shadow-sm">
        <div className="border-b border-[#E2DFF0] bg-[#F3F1FA] px-4 py-3">
          <div className="h-3 w-24 rounded bg-[#E2DFF0]" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-[#F3F4F6] px-4 py-3">
            <div className="h-3 w-4 rounded bg-[#F3F4F6]" />
            <div className="h-5 w-8 rounded bg-[#EDE8F5]" />
            <div className="h-3 w-36 rounded bg-[#F3F4F6]" />
            <div className="ml-auto h-3 w-16 rounded bg-[#F3F4F6]" />
          </div>
        ))}
      </div>
      {/* Team groups skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-[#E2DFF0] bg-white shadow-sm">
            <div className="border-b border-[#E2DFF0] bg-[#F3F1FA] px-4 py-3 flex items-center gap-3">
              <div className="h-7 w-12 rounded bg-[#E2DFF0]" />
              <div className="h-4 w-40 rounded bg-[#E2DFF0]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
