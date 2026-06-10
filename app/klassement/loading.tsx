export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 animate-pulse">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="h-8 w-36 rounded-xl bg-[#E2DFF0]" />
          <div className="mt-2 h-4 w-32 rounded-lg bg-[#EDE8F5]" />
        </div>
        <div className="h-16 w-16 rounded-xl bg-[#EDE8F5]" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#E2DFF0] bg-white shadow-sm">
        <div className="border-b border-[#E2DFF0] bg-[#F3F1FA] px-4 py-3 flex gap-4">
          {["w-6", "w-40", "w-20", "w-16", "w-20", "w-16"].map((w, i) => (
            <div key={i} className={`h-3 ${w} rounded bg-[#E2DFF0]`} />
          ))}
        </div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-[#F3F4F6] px-4 py-3.5">
            <div className="h-5 w-5 rounded bg-[#F3F4F6]" />
            <div className="flex items-center gap-2 flex-1">
              <div className="h-7 w-7 rounded-full bg-[#EDE8F5]" />
              <div className="h-4 w-32 rounded bg-[#F3F4F6]" />
            </div>
            <div className="ml-auto h-4 w-16 rounded bg-[#F3F4F6]" />
          </div>
        ))}
      </div>
    </div>
  );
}
