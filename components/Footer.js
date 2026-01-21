export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600 max-w-5xl mx-auto">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} ZM. Built with Next.js
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Designed with simplicity in mind
          </p>
        </div>
      </div>
    </footer>
  )
}
