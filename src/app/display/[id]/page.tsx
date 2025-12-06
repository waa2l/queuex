'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAudio } from '@/lib/hooks/useAudio';
import ClinicCard from '@/components/ClinicCard';
import Ticker from '@/components/Ticker';
import NotificationBanner from '@/components/NotificationBanner';
import { toArabicNums } from '@/lib/utils';

export default function DisplayPage({ params }: { params: { id: string } }) {
  const [clinics, setClinics] = useState<any[]>([]);
  const { announceNumber } = useAudio();
  const [time, setTime] = useState('');
  const [screenTitle, setScreenTitle] = useState('المركز الطبي');
  const [tickerText, setTickerText] = useState('أهلاً وسهلاً بكم...');
  
  // States for Notification Banner
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');

  // الساعة
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})), 1000);
    return () => clearInterval(t);
  }, []);

  // دالة مساعدة لتشغيل صوت التنبيه
  const playAlertSound = (type: string) => {
      // يمكنك وضع ملفات صوتية في مجلد public/audio
      // في حالة عدم وجود الملفات، يمكننا الاكتفاء بالنطق أو تجاهل الخطأ
      try {
        const audioPath = type === 'emergency' ? '/audio/alarm.mp3' : '/audio/notification.mp3';
        const audio = new Audio(audioPath);
        audio.play().catch(() => {}); // تجاهل الخطأ إذا لم يوجد ملف
      } catch (e) {
        console.error("Audio error", e);
      }
  };

  // جلب البيانات والاشتراك في التحديثات
  useEffect(() => {
    const initData = async () => {
        // 1. جلب الإعدادات العامة
        const { data: settings } = await supabase.from('settings').select('*').single();
        if (settings) {
            setScreenTitle(settings.center_name);
            setTickerText(settings.ticker_text);
        }

        // 2. معرفة العيادات المرتبطة بهذه الشاشة
        const { data: screenClinics } = await supabase
            .from('screen_clinics')
            .select('clinic_id')
            .eq('screen_id', params.id);

        let clinicIds: string[] = [];
        
        if (screenClinics && screenClinics.length > 0) {
            // إذا كان هذا ID شاشة، اعرض العيادات المرتبطة بها فقط
            clinicIds = screenClinics.map((item: any) => item.clinic_id);
            const { data: clinicsData } = await supabase.from('clinics').select('*').in('id', clinicIds).order('name');
            if (clinicsData) setClinics(clinicsData);
        } else {
            // (اختياري) إذا لم يكن ID شاشة، ربما نعرض كل العيادات أو نعتبره ID عيادة واحدة
             const { data: allClinics } = await supabase.from('clinics').select('*').order('name');
             if (allClinics) {
                 setClinics(allClinics);
                 clinicIds = allClinics.map(c => c.id);
             }
        }
        
        return clinicIds;
    };

    // تنفيذ الجلب ثم الاشتراك
    initData().then((myClinicIds) => {
        
        // A. اشتراك تحديث الأرقام (Clinics)
        const clinicChannel = supabase
          .channel('display-clinics')
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'clinics' }, (payload) => {
            setClinics((prev) => {
                const exists = prev.find(c => c.id === payload.new.id);
                if (!exists) return prev; // تجاهل التحديث إذا لم يكن يخص هذه الشاشة

                if (payload.new.current_number > payload.old.current_number) {
                    announceNumber(payload.new.current_number, payload.new.name);
                }
                return prev.map((c) => c.id === payload.new.id ? payload.new : c);
            });
          })
          .subscribe();

        // B. اشتراك التنبيهات (Notifications)
        const notifChannel = supabase
          .channel('display-notifications')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
              const notif = payload.new;
              
              // التحقق: هل التنبيه لهذه الشاشة؟
              // التنبيه يظهر إذا كان target_clinic_id فارغ (عام للكل) 
              // أو إذا كان target_clinic_id يطابق إحدى عيادات هذه الشاشة
              const isForMe = !notif.target_clinic_id || myClinicIds.includes(notif.target_clinic_id);

              if (isForMe) {
                  // 1. تشغيل الصوت
                  if (notif.type === 'voice' && notif.payload) {
                      const audio = new Audio(notif.payload);
                      audio.play().catch(() => {});
                  } else {
                      playAlertSound(notif.type);
                  }

                  // 2. عرض البانر إذا كان تنبيه نصي أو طوارئ
                  if (notif.type === 'alert' || notif.type === 'emergency' || notif.type === 'transfer') {
                      setBannerMessage(notif.message);
                      setShowBanner(true);
                      
                      // قراءة النص (TTS)
                      if ('speechSynthesis' in window) {
                          const u = new SpeechSynthesisUtterance(notif.message);
                          u.lang = 'ar-SA';
                          window.speechSynthesis.speak(u);
                      }
                  }
              }
          })
          .subscribe();

        return () => {
            supabase.removeChannel(clinicChannel);
            supabase.removeChannel(notifChannel);
        };
    });

  }, [params.id, announceNumber]); // تم إضافة announceNumber للتبعية

  return (
    <div className="min-h-screen bg-slate-900 pb-12 flex flex-col relative overflow-hidden">
      
      {/* البانر المنبثق */}
      <NotificationBanner 
        isVisible={showBanner} 
        message={bannerMessage} 
        onClose={() => setShowBanner(false)} 
      />

      <header className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-lg z-10">
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
        <div className="flex-[1] flex flex-col gap-4 overflow-y-auto pr-2 z-10">
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
