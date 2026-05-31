export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white border border-[#c4c7ca] rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-100 rounded" style={{ width: `${70 + i * 10}%` }} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white border border-[#c4c7ca] rounded-2xl overflow-hidden animate-pulse">
      <div className="bg-gray-100 px-6 py-4 flex gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded w-20" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-5 flex gap-8 border-t border-gray-100">
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="h-3 bg-gray-100 rounded" style={{ width: `${60 + j * 15}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
