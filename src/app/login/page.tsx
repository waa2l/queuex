'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, LogIn, Stethoscope } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // جلب العيادات عند الفتح
  useEffect(() => {
    const fetchClinics = async () => {
      const { data } = await supabase.from('clinics').select('id, name, control_password').order('name');
      if (data) setClinics(data);
    };
    fetchClinics();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const clinic = clinics.find(c => c.id === selectedClinicId);

    if (!clinic) {
      setError('الرجاء اختيار العيادة');
      setLoading(false);
      return;
    }

    if (password === clinic.control_password) {
      // حفظ تسجيل الدخول في المتصفح لكي لا يطلب الباسورد مرة أخرى في الصفحة التالية
      localStorage.setItem(`auth_${clinic.id}`, 'true');
      
      // التوجيه لصفحة التحكم
      router.push(`/control/${clinic.id}`);
    } else {
      setError('كلمة المرور غير صحيحة');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* زخرفة خلفية */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>

        <div className="text-center mb-8">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Stethoscope size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">بوابة دخول العيادات</h1>
          <p className="text-gray-500 mt-2 text-sm">اختر العيادة وسجل الدخول للتحكم</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* اختيار العيادة */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">اختر العيادة</label>
            <select 
              className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-black transition"
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              required
            >
              <option value="">-- اضغط للاختيار --</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* كلمة المرور */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">كلمة المرور</label>
            <div className="relative">
              <input 
                type="password" 
                className="w-full p-4 pl-10 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-black transition"
                placeholder="أدخل كود العيادة"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-bold animate-pulse">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'جاري التحقق...' : <><LogIn size={20} /> تسجيل الدخول</>}
          </button>

        </form>

        <div className="mt-8 text-center border-t pt-4">
          <p className="text-xs text-gray-400">نظام إدارة قوائم الانتظار الذكي</p>
        </div>
      </div>
    </div>
  );
}
