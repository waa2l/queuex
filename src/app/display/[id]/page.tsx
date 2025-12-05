'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAudio } from '@/lib/hooks/useAudio';
import ClinicCard from '@/components/ClinicCard';
import Ticker from '@/components/Ticker';
import { toArabicNums } from '@/lib/utils';

export default function DisplayPage({ params }: { params: { id: string } }) {
  const [clinics, setClinics] = useState<any[]>([]);
  const { announceNumber } = useAudio();
  const [time, setTime] = useState('');

  // الساعة
  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'}));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // جلب البيانات والاشتراك في التحديثات
  useEffect(() => {
    const fetchClinics = async () => {
      // هنا نجلب العيادات المرتبطة بالشاشة (سنفترض جلب الكل حالياً للتسهيل)
      const { data } = await supabase.from('clinics').select('*').order('name');
      if (data) setClinics(data);
    };

    fetchClinics();

    // Realtime Subscription
    const channel = supabase
      .channel('public:clinics')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'clinics' }, (payload) => {
        const newClinic = payload.new;
        
        setClinics((prev) => 
          prev.map((c) => c.id === newClinic.id ? newClinic : c)
        );

        // إذا تغير الرقم وزاد، شغل الصوت
        if (newClinic.current_number > payload.old.current_number) {
          announceNumber(newClinic.current_number, newClinic.name);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel) };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 pb-12 flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">المركز الطبي التخصصي</h1>
        <div className="text-3xl font-mono font-bold text-yellow-400">{toArabicNums(time)}</div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 flex gap-6 overflow-hidden">
        
        {/* Left Side: Video & Promo */}
        <div className="flex-[3] bg-black rounded-xl overflow-hidden relative border border-gray-700 flex items-center justify-center">
            <p className="text-gray-500">مساحة الفيديو (YouTube Playlist)</p>
            {/* هنا يمكن إضافة iframe لليوتيوب */}
        </div>

        {/* Right Side: Clinics Grid */}
        <div className="flex-[1] flex flex-col gap-4 overflow-y-auto pr-2">
          {clinics.map((clinic) => (
            <ClinicCard 
              key={clinic.id} 
              name={clinic.name} 
              number={clinic.current_number} 
              status={clinic.status} 
            />
          ))}
          
          {/* QR Code */}
          <div className="mt-auto bg-white p-4 rounded-xl text-center">
             <div className="h-24 w-24 bg-gray-300 mx-auto mb-2">QR</div>
             <p className="text-sm font-bold">تابع دورك على موبايلك</p>
          </div>
        </div>
      </div>

      <Ticker text="أهلاً وسهلاً بكم .. الرجاء الالتزام بالهدوء .. نتمنى لكم الشفاء العاجل" />
    </div>
  );
}
