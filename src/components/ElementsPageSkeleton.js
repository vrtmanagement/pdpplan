export default function ElementsPageSkeleton({ detail = false }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-indigo-50/40 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl animate-pulse">
        <div className="mb-6 h-28 rounded-2xl border border-zinc-200 bg-white/80" />

        {detail ? (
          <>
            <div className="mb-6 h-44 rounded-3xl border border-zinc-200 bg-white/85" />
            <div className="space-y-4">
              <div className="h-40 rounded-2xl border border-zinc-200 bg-white/85" />
              <div className="h-40 rounded-2xl border border-zinc-200 bg-white/85" />
              <div className="h-40 rounded-2xl border border-zinc-200 bg-white/85" />
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 h-24 rounded-2xl border border-zinc-200 bg-white/85" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 rounded-2xl border border-zinc-200 bg-white/85"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

