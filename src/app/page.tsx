import Link from 'next/link';
import { Monitor, Calendar, Shield, Smartphone, Info, LogIn } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex flex-col items-center justify-center p-6 text-white" dir="rtl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-yellow-400">نظام إدارة العيادات الذكي</h1>
        <p className="text-xl text-gray-300">نظام متكامل لإدارة قوائم الانتظار والمرضى</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        
        {/* === زر جديد: بوابة دخول الموظفين === */}
        <Link href="/login" className="group bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 p-8 rounded-2xl shadow-xl border border-blue-400/30 transform hover:-translate-y-2 transition-all col-span-1 md:col-span-2 lg:col-span-3 flex items-center justify-center gap-6">
          <div className="bg-white/20 p-4 rounded-full group-hover:scale-110 transition">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold mb-1">بوابة الموظفين والأطباء</h2>
            <p className="text-blue-100 text-lg">سجل الدخول للتحكم في العيادات والشاشات</p>
          </div>
        </Link>

        {/* كارت شاشات العرض */}
        <Link href="/display/screen-1" className="group bg-white/10 hover:bg-white/20 p-8 rounded-2xl border border-white/10 backdrop-blur transition-all hover:-translate-y-2">
          <Monitor className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 transition" />
          <h2 className="text-2xl font-bold mb-2">شاشات الانتظار</h2>
          <p className="text-gray-300">شاشات العرض للجمهور</p>
        </Link>

        {/* كارت صفحة العميل */}
        <Link href="/customer" className="group bg-white/10 hover:bg-white/20 p-8 rounded-2xl border border-white/10 backdrop-blur transition-all hover:-translate-y-2">
          <Smartphone className="w-12 h-12 text-green-400 mb-4 group-hover:scale-110 transition" />
          <h2 className="text-2xl font-bold mb-2">صفحة العميل</h2>
          <p className="text-gray-300">متابعة الدور وحجز التذاكر</p>
        </Link>

        {/* كارت الحجز */}
        <Link href="/booking" className="group bg-white/10 hover:bg-white/20 p-8 rounded-2xl border border-white/10 backdrop-blur transition-all hover:-translate-y-2">
          <Calendar className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition" />
          <h2 className="text-2xl font-bold mb-2">حجز موعد</h2>
          <p className="text-gray-300">حجز زيارة جديدة</p>
        </Link>

        {/* كارت الإدارة (للمشرف العام فقط) */}
        <Link href="/admin" className="group bg-white/5 hover:bg-white/10 p-8 rounded-2xl border border-white/5 backdrop-blur transition-all hover:-translate-y-2 opacity-60 hover:opacity-100">
          <Shield className="w-12 h-12 text-red-400 mb-4 group-hover:scale-110 transition" />
          <h2 className="text-xl font-bold mb-2">الإعدادات العامة</h2>
          <p className="text-gray-400 text-sm">للمسؤولين فقط</p>
        </Link>
        
        {/* كارت من نحن */}
        <Link href="/about" className="group bg-white/5 hover:bg-white/10 p-8 rounded-2xl border border-white/5 backdrop-blur transition-all hover:-translate-y-2 opacity-60 hover:opacity-100">
          <Info className="w-12 h-12 text-gray-400 mb-4 group-hover:scale-110 transition" />
          <h2 className="text-xl font-bold mb-2">عن النظام</h2>
          <p className="text-gray-400 text-sm">معلومات الإصدار</p>
        </Link>
      </div>
    </main>
  );
}
