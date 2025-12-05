export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-100 text-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-blue-900">عن النظام</h1>
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-md">
        <p className="mb-4">
          نظام إدارة قوائم الانتظار الذكي (QMS) إصدار 1.0
        </p>
        <p className="text-sm text-gray-500 mb-6">
          تم التصميم والتطوير باستخدام أحدث تقنيات الويب (Next.js 14, Supabase, Tailwind).
        </p>
        <div className="border-t pt-4">
          <p className="text-xs text-gray-400">جميع الحقوق محفوظة للمركز الطبي © 2024</p>
        </div>
      </div>
    </div>
  );
}
