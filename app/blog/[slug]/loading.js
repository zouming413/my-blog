export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4 w-3/4"></div>
          <div className="flex gap-2 mb-8">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>

          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-32 bg-gray-200 rounded my-6"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
