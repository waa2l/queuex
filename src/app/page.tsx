import Link from 'next/link';
import { Monitor, Calendar, Shield, Smartphone, Info } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex flex-col items-center justify-center p-6 text-white">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-yellow-400">نظام إدارة العيادات الذكي</h1>
        <p className="text-xl text-gray-300">نظام متكامل لإدارة قوائم الانتظار والمرضى</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* كارت شاشات العرض */}
        <Link href="/display/screen-1" className="group bg-white/10 hover:bg-white/20 p-8 rounded-2xl border border-white/10 backdrop-blur transition-all hover:-translate-y-2">
          <Monitor className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 transition" />
          <h2 className="text-2xl font-bold mb-2">شاشات الانتظار</h2>
          <p className="text-gray-300">الدخول لصفحة العرض الرئيسية للعيادات (مثال: شاشة 1)</p>
        </Link>

        {/* كارت صفحة العميل */}
        <Link href="/customer" className="group bg-white/10 hover:bg-white/20 p-8 rounded-2xl border border-white/10 backdrop-blur transition-all hover:-translate-y-2">
          <Smartphone className="w-12 h-12 text-green-400 mb-4 group-hover:scale-110 transition" />
          <h2 className="text-2xl font-bold mb-2">صفحة العميل</h2>
          <p className="text-gray-300">متابعة الدور وحجز التذاكر عبر الموبايل</p>
        </Link>

        {/* كارت الحجز */}
        <Link href="/booking" className="group bg-white/10 hover:bg-white/20 p-8 rounded-2xl border border-white/10 backdrop-blur transition-all hover:-translate-y-2">
          <Calendar className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition" />
          <h2 className="text-2xl font-bold mb-2">حجز موعد</h2>
          <p className="text-gray-300">حجز موعد جديد لزيارة العيادة</p>
        </Link>

        {/* كارت الإدارة */}
        <Link href="/admin" className="group bg-white/10 hover:bg-white/20 p-8 rounded-2xl border border-white/10 backdrop-blur transition-all hover:-translate-y-2">
          <Shield className="w-12 h-12 text-red-400 mb-4 group-hover:scale-110 transition" />
          <h2 className="text-2xl font-bold mb-2">لوحة الإدارة</h2>
          <p className="text-gray-300">إعدادات النظام، العيادات، والأطباء (دخول محمي)</p>
        </Link>
        
        {/* كارت من نحن */}
        <Link href="/about" className="group bg-white/10 hover:bg-white/20 p-8 rounded-2xl border border-white/10 backdrop-blur transition-all hover:-translate-y-2 col-span-1 md:col-span-2 lg:col-span-1">
          <Info className="w-12 h-12 text-gray-400 mb-4 group-hover:scale-110 transition" />
          <h2 className="text-2xl font-bold mb-2">عن النظام</h2>
          <p className="text-gray-300">معلومات الإصدار والمطور</p>
        </Link>
      </div>
    </main>
  );
}
