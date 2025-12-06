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
  const [screenTitle, setScreenTitle] = useState('المركز الطبي');
  const [tickerText, setTickerText] = useState('أهلاً وسهلاً بكم...');

  // الساعة
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})), 1000);
    return () => clearInterval(t);
  }, []);

  // جلب الإعدادات والعيادات المرتبطة بالشاشة
  useEffect(() => {
    const initData = async () => {
        // 1. جلب الإعدادات العامة
        const { data: settings } = await supabase.from('settings').select('*').single();
        if (settings) {
            setScreenTitle(settings.center_name);
            setTickerText(settings.ticker_text);
        }

        // 2. محاولة معرفة نوع الـ ID (هل هو شاشة؟)
        // نجلب العيادات المرتبطة بهذا الـ ID من جدول screen_clinics
        const { data: screenClinics } = await supabase
            .from('screen_clinics')
            .select('clinic_id, screens(name)')
            .eq('screen_id', params.id);

        if (screenClinics && screenClinics.length > 0) {
            // هذا ID شاشة
            const clinicIds = screenClinics.map((item: any) => item.clinic_id);
            const { data: clinicsData } = await supabase.from('clinics').select('*').in('id', clinicIds).order('name');
            if (clinicsData) setClinics(clinicsData);
            // تحديث اسم الشاشة اذا وجد
            if (screenClinics[0].screens) {
               // setScreenTitle(screenClinics[0].screens.name); // اختياري: عرض اسم الشاشة
            }
        } else {
            // ربما هو رابط مباشر لعيادة واحدة؟ أو عرض الكل (Fallback)
             const { data: allClinics } = await supabase.from('clinics').select('*').order('name');
             if (allClinics) setClinics(allClinics);
        }
    };

    initData();

    // Realtime Subscription
    const channel = supabase
      .channel('public:clinics')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'clinics' }, (payload) => {
        setClinics((prev) => {
            // هل العيادة المُحدثة موجودة في قائمتنا؟
            const exists = prev.find(c => c.id === payload.new.id);
            if (!exists) return prev; // تجاهل التحديث إذا لم يكن يخص هذه الشاشة

            if (payload.new.current_number > payload.old.current_number) {
                announceNumber(payload.new.current_number, payload.new.name);
            }
            return prev.map((c) => c.id === payload.new.id ? payload.new : c);
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel) };
  }, [params.id]);

  return (
    <div className="min-h-screen bg-slate-900 pb-12 flex flex-col">
      <header className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">{screenTitle}</h1>
        <div className="text-3xl font-mono font-bold text-yellow-400">{toArabicNums(time)}</div>
      </header>

      <div className="flex-1 p-6 flex gap-6 overflow-hidden">
        {/* منطقة الفيديو */}
        <div className="flex-[3] bg-black rounded-xl overflow-hidden relative border border-gray-700 flex items-center justify-center">
             <iframe 
                width="100%" height="100%" 
                src="https://www.youtube.com/embed/videoseries?list=PLYouR_List_ID_Here&autoplay=1&mute=1&loop=1" 
                title="Video player" 
                className="w-full h-full object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
             ></iframe>
        </div>

        {/* قائمة العيادات */}
        <div className="flex-[1] flex flex-col gap-4 overflow-y-auto pr-2">
          {clinics.map((clinic) => (
            <ClinicCard 
              key={clinic.id} 
              name={clinic.name} 
              number={clinic.current_number} 
              status={clinic.status} 
            />
          ))}
          <div className="mt-auto bg-white p-4 rounded-xl text-center">
             <div className="h-24 w-24 bg-gray-300 mx-auto mb-2 flex items-center justify-center">QR</div>
             <p className="text-sm font-bold">تابع دورك على موبايلك</p>
          </div>
        </div>
      </div>
      <Ticker text={tickerText} />
    </div>
  );
}
