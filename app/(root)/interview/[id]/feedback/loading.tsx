const Loading = () => (
  <div className="flex flex-col gap-8 max-w-3xl mx-auto animate-pulse">

    <div className="flex flex-col gap-2">
      <div className="h-6 w-48 rounded bg-gray-700" />
      <div className="h-4 w-32 rounded bg-gray-700" />
    </div>

    <div className="card-border">
      <div className="card-interview items-center flex flex-col gap-3">
        <div className="size-[120px] rounded-full bg-gray-700" />
        <div className="h-4 w-36 rounded bg-gray-700" />
      </div>
    </div>

    <div className="flex flex-col gap-3">
      <div className="h-5 w-40 rounded bg-gray-700" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-4 w-full rounded bg-gray-700 mt-3" />
      ))}
    </div>

    <div className="flex flex-col gap-3">
      <div className="h-5 w-28 rounded bg-gray-700" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-3 w-3/4 rounded bg-gray-700 mt-2" />
      ))}
    </div>

    <div className="flex flex-col gap-3">
      <div className="h-5 w-40 rounded bg-gray-700" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-3 w-3/4 rounded bg-gray-700 mt-2" />
      ))}
    </div>

    <div className="flex flex-col gap-3">
      <div className="h-5 w-36 rounded bg-gray-700" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-3 w-full rounded bg-gray-700 mt-2" />
      ))}
    </div>

    <div className="flex flex-row gap-4">
      <div className="h-12 flex-1 rounded bg-gray-700" />
      <div className="h-12 flex-1 rounded bg-gray-700" />
    </div>

  </div>
);

export default Loading;
