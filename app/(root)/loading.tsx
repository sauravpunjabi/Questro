const CardSkeleton = () => (
  <div className="card-border w-[360px] max-sm:w-full min-h-96 animate-pulse">
    <div className="card-interview flex flex-col justify-between">
      <div>
        <div className="size-[90px] rounded-full bg-gray-700" />
        <div className="h-4 w-48 rounded bg-gray-700 mt-5" />
        <div className="flex flex-row gap-5 mt-3">
          <div className="h-3 w-24 rounded bg-gray-700" />
          <div className="h-3 w-24 rounded bg-gray-700" />
        </div>
        <div className="h-3 w-full rounded bg-gray-700 mt-5" />
        <div className="h-3 w-full rounded bg-gray-700 mt-2" />
      </div>
      <div className="flex flex-row justify-between items-center mt-4">
        <div className="flex flex-row gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="size-7 rounded-full bg-gray-700" />
          ))}
        </div>
        <div className="h-9 w-28 rounded bg-gray-700" />
      </div>
    </div>
  </div>
);

const Loading = () => (
  <section className="flex flex-col gap-6 mt-8">
    <div className="h-6 w-40 rounded bg-gray-700 animate-pulse" />
    <div className="interviews-section">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </section>
);

export default Loading;
