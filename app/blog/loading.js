export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card rounded-2xl p-8 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="w-16 h-12 bg-gray-200 rounded flex-shrink-0"></div>
              <div className="flex-grow">
                <div className="h-8 bg-gray-200 rounded mb-3 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
