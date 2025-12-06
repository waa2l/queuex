'use client';
import { useState, useEffect } from 'react'; ///page.tsx]
import { supabase } from '@/lib/supabase';
import { toArabicNums } from '@/lib/utils';
// ... باقي الـ imports كما هي (Play, Pause, Lock, etc...)
import { 
  Play, Pause, StepForward, StepBack, RotateCcw, Lock, 
  Mic, Bell, ArrowRightLeft, AlertTriangle, Hash, Repeat, User, LogOut 
} from 'lucide-react';

export default function ControlPage({ params }: { params: { id: string } }) {
  // --- States ---
  const [clinic, setClinic] = useState<any>(null);
  const [clinicsList, setClinicsList] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Modal States
  const [modalType, setModalType] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  // 1. جلب البيانات والتحقق من تسجيل الدخول السابق
  useEffect(() => {
    // التحقق هل تم تسجيل الدخول من صفحة Login Page؟
    const isAuth = localStorage.getItem(`auth_${params.id}`);
    if (isAuth === 'true') {
        setIsAuthenticated(true);
    }

    const init = async () => {
      const { data: c } = await supabase.from('clinics').select('*').eq('id', params.id).single();
      if (c) setClinic(c);
      const { data: all } = await supabase.from('clinics').select('id, name').neq('id', params.id);
      if (all) setClinicsList(all);
    };
    init();

    const ch = supabase.channel('control-clinic')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'clinics', filter: `id=eq.${params.id}` }, 
      (payload) => setClinic(payload.new))
      .subscribe();
    return () => { supabase.removeChannel(ch) };
  }, [params.id]);

  // 2. تسجيل الدخول (اليدوي من نفس الصفحة)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (clinic && passwordInput === clinic.control_password) {
        setIsAuthenticated(true);
        // حفظ الدخول للمستقبل
        localStorage.setItem(`auth_${params.id}`, 'true');
    }
    else alert('كلمة المرور غير صحيحة');
  };
  
  // دالة الخروج
  const handleLogout = () => {
      setIsAuthenticated(false);
      localStorage.removeItem(`auth_${params.id}`);
      // اختياري: العودة لصفحة الدخول الرئيسية
      // window.location.href = '/login';
  };

  // ... باقي دوال التحكم (updateNumber, sendNotification) اتركها كما هي في الكود السابق ...
  // فقط تأكد من تعريفها هنا لاستخدامها في الـ Return بالأسفل
  const updateNumber = async (action: any) => { /* نفس الكود السابق */ 
      if (!clinic) return;
      setLoading(true);
      let newNum = clinic.current_number;
      if (action === 'next') newNum++;
      if (action === 'prev') newNum = Math.max(0, newNum - 1);
      if (action === 'reset') newNum = 0;
      if (action === 'specific') newNum = parseInt(inputValue);
      
      if (action === 'repeat') {
          await supabase.from('notifications').insert([{
              type: 'repeat', target_clinic_id: clinic.id, message: `نداء رقم ${newNum}`
          }]);
          setMsg('تم تكرار النداء');
      } else {
          await supabase.from('clinics').update({ current_number: newNum, status: 'active' }).eq('id', params.id);
      }
      setLoading(false); setModalType(null); setInputValue('');
  };

  const sendNotification = async (type: string, payload?: string, targetId?: string) => { /* نفس الكود السابق */ 
      await supabase.from('notifications').insert([{
        type, target_clinic_id: targetId || clinic.id, message: payload, payload: payload
      }]);
      setModalType(null); setInputValue(''); setMsg('تم الإرسال'); setTimeout(() => setMsg(''), 3000);
  };

  // --- واجهة تسجيل الدخول (إذا لم يدخل) ---
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
        <Lock className="mx-auto text-blue-600 mb-4" size={40} />
        <h2 className="text-xl font-bold mb-4">{clinic?.name || 'تحميل...'}</h2>
        <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} 
          className="w-full p-3 border rounded mb-4 text-center text-black" placeholder="كلمة المرور" autoFocus />
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-bold">دخول</button>
        <a href="/login" className="block mt-4 text-sm text-gray-500 hover:underline">العودة لصفحة اختيار العيادة</a>
      </form>
    </div>
  );

  // --- واجهة التحكم ---
  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      {/* Header */}
      <header className="bg-white p-4 rounded-xl shadow mb-4 flex justify-between items-center">
        <div>
            <h1 className="text-xl font-bold text-gray-800">{clinic.name}</h1>
            <div className={`text-xs px-2 py-1 rounded inline-block ${clinic.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {clinic.status === 'active' ? 'نشطة' : 'متوقفة'}
            </div>
        </div>
        <div className="text-4xl font-mono font-black text-blue-700">{toArabicNums(clinic.current_number)}</div>
      </header>

      {/* الأزرار وباقي الصفحة كما هي تماماً من الرد السابق... */}
      {/* Grid Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* ... أزرار التحكم السابقة ... */}
        <button onClick={() => updateNumber('next')} className="bg-blue-600 text-white p-6 rounded-xl font-bold text-lg flex flex-col items-center gap-2 hover:bg-blue-700 col-span-2">
            <StepForward size={32} /> العميل التالي
        </button>
        <button onClick={() => updateNumber('prev')} className="bg-gray-200 text-gray-800 p-6 rounded-xl font-bold flex flex-col items-center gap-2 hover:bg-gray-300">
            <StepBack size={24} /> السابق
        </button>
        <button onClick={() => updateNumber('repeat')} className="bg-yellow-500 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2">
            <Repeat size={24} /> تكرار النداء
        </button>
        <button onClick={() => setModalType('number')} className="bg-indigo-500 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2">
            <Hash size={24} /> رقم معين
        </button>
        <button onClick={() => setModalType('alert_patient')} className="bg-teal-600 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2">
            <User size={24} /> تنبيه باسم
        </button>
        <button onClick={async () => await supabase.from('clinics').update({status: clinic.status === 'active' ? 'paused' : 'active'}).eq('id', params.id)} 
            className={`${clinic.status === 'active' ? 'bg-orange-500' : 'bg-green-600'} text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2`}>
            {clinic.status === 'active' ? <><Pause /> إيقاف مؤقت</> : <><Play /> استئناف</>}
        </button>
        <button onClick={() => setModalType('transfer')} className="bg-purple-600 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2">
            <ArrowRightLeft size={24} /> تحويل عميل
        </button>
        <button onClick={() => setModalType('alert_control')} className="bg-cyan-600 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2">
            <Bell size={24} /> تنبيه لوحة أخرى
        </button>
        <button onClick={() => sendNotification('emergency', 'حالة طوارئ في ' + clinic.name)} className="bg-red-600 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2 animate-pulse">
            <AlertTriangle size={24} /> طوارئ
        </button>
        <button onClick={() => { if(confirm('تصفير العداد؟')) updateNumber('reset') }} className="bg-red-100 text-red-600 p-4 rounded-xl font-bold flex flex-col items-center gap-2">
            <RotateCcw size={24} /> تصفير
        </button>
        <button onClick={handleLogout} className="bg-gray-800 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2">
            <LogOut size={24} /> خروج
        </button>
      </div>

      {/* ... باقي المودالز والنوافذ المنبثقة كما هي في الرد السابق ... */}
      {modalType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm text-black">
                {/* ... محتوى المودال كما هو ... */}
                <h3 className="text-xl font-bold mb-4 text-center">خيارات</h3>
                 {(modalType === 'number') && <input type="number" className="w-full p-3 border rounded mb-4 text-center text-xl" autoFocus value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="رقم العميل" />}
                 {(modalType === 'alert_patient' || modalType === 'alert_control') && <input type="text" className="w-full p-3 border rounded mb-4" autoFocus value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="الرسالة/الاسم" />}
                 {(modalType === 'transfer' || modalType === 'alert_control') && (
                    <select className="w-full p-3 border rounded mb-4" onChange={e => setInputValue(e.target.value)}>
                        <option value="">اختر العيادة...</option>
                        {clinicsList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                )}
                <div className="flex gap-2">
                    <button onClick={() => setModalType(null)} className="flex-1 bg-gray-200 py-3 rounded font-bold">إلغاء</button>
                    <button onClick={() => {
                         if(modalType === 'number') updateNumber('specific');
                         if(modalType === 'alert_patient') sendNotification('alert', `المريض ${inputValue}`);
                         if(modalType === 'transfer') sendNotification('transfer', `تحويل من ${clinic.name}`, inputValue);
                         if(modalType === 'alert_control') sendNotification('alert', 'تنبيه إداري', inputValue);
                    }} className="flex-1 bg-blue-600 text-white py-3 rounded font-bold">تأكيد</button>
                </div>
            </div>
        </div>
      )}
      {msg && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-2 rounded-full">{msg}</div>}
    </div>
  );
}
