import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <h2 className="text-6xl font-black text-gray-300 mb-4">404</h2>
      <p className="text-xl font-bold text-gray-800 mb-4">عذراً، الصفحة غير موجودة</p>
      <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
        العودة للرئيسية
      </Link>
    </div>
  )
}
