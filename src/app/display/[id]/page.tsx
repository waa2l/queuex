'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAudio } from '@/lib/hooks/useAudio';
import ClinicCard from '@/components/ClinicCard';
import Ticker from '@/components/Ticker';
import NotificationBanner from '@/components/NotificationBanner'; // تأكد من إنشاء هذا الملف
import { toArabicNums } from '@/lib/utils';
import { Play } from 'lucide-react';

export default function DisplayPage({ params }: { params: { id: string } }) {
  // States
  const [clinics, setClinics] = useState<any[]>([]);
  const { announceNumber } = useAudio();
  const [time, setTime] = useState('');
  const [screenTitle, setScreenTitle] = useState('المركز الطبي');
  const [tickerText, setTickerText] = useState('جاري التحميل...');
  
  // Banner States
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMsg, setBannerMsg] = useState('');
  const [bannerType, setBannerType] = useState<'alert'|'emergency'>('alert');

  // Audio Context State (لحل مشكلة المتصفح)
  const [hasInteracted, setHasInteracted] = useState(false);

  // الساعة
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})), 1000);
    return () => clearInterval(t);
  }, []);

  // دالة التعامل مع الأصوات
  const playSoundEffect = (type: string, payloadUrl?: string) => {
    if (!hasInteracted) return; // لن يعمل الصوت إلا بعد الضغط على زر البدء

    if (type === 'voice' && payloadUrl) {
        // تشغيل صوت مسجل
        new Audio(payloadUrl).play().catch(e => console.error(e));
    } else if (type === 'emergency') {
        // صوت إنذار (يمكنك وضع ملف alarm.mp3 في public/audio)
        const audio = new Audio('/audio/alarm.mp3'); 
        audio.play().catch(() => {
            // Fallback لو مفيش ملف
            announceNumber(0, 'حالة طوارئ'); 
        });
    } else {
        // صوت تنبيه عادي
        const audio = new Audio('/audio/ding.mp3');
        audio.play().catch(() => {});
    }
  };

  // جلب البيانات والاشتراك
  useEffect(() => {
    const init = async () => {
        // 1. الإعدادات
        const { data: s } = await supabase.from('settings').select('*').single();
        if (s) {
            setScreenTitle(s.center_name);
            setTickerText(s.ticker_text);
        }

        // 2. العيادات
        // التحقق هل الرابط لشاشة مجمعة أم عيادة فردية
        const { data: sc } = await supabase.from('screen_clinics').select('clinic_id').eq('screen_id', params.id);
        let ids: string[] = [];
        
        if (sc && sc.length > 0) {
            ids = sc.map((x: any) => x.clinic_id);
            const { data: cData } = await supabase.from('clinics').select('*').in('id', ids).order('name');
            if (cData) setClinics(cData);
        } else {
            // fallback: اعرض كل العيادات
             const { data: all } = await supabase.from('clinics').select('*').order('name');
             if (all) { setClinics(all); ids = all.map(c => c.id); }
        }
        return ids;
    };

    init().then((myIds) => {
        // اشتراك العيادات (لتحديث الأرقام)
        const cChan = supabase.channel('disp-clinics')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'clinics' }, (payload) => {
                setClinics(prev => {
                    const target = prev.find(c => c.id === payload.new.id);
                    if (!target) return prev;
                    
                    // إذا زاد الرقم، انطق
                    if (hasInteracted && payload.new.current_number > payload.old.current_number) {
                        announceNumber(payload.new.current_number, payload.new.name);
                    }
                    return prev.map(c => c.id === payload.new.id ? payload.new : c);
                });
            }).subscribe();

        // اشتراك التنبيهات (Notification Table)
        const nChan = supabase.channel('disp-notifs')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                const n = payload.new;
                // هل التنبيه يخصني؟ (عام للكل OR موجه لعيادة في شاشتي)
                const isForMe = !n.target_clinic_id || myIds.includes(n.target_clinic_id);
                
                if (isForMe) {
                    // تشغيل الصوت
                    playSoundEffect(n.type, n.payload);

                    // عرض البانر والنطق
                    if (['alert', 'emergency', 'transfer'].includes(n.type)) {
                        setBannerMsg(n.message);
                        setBannerType(n.type === 'emergency' ? 'emergency' : 'alert');
                        setShowBanner(true);
                        
                        // نطق الرسالة النصية
                        if (hasInteracted && 'speechSynthesis' in window) {
                            const u = new SpeechSynthesisUtterance(n.message);
                            u.lang = 'ar-SA';
                            window.speechSynthesis.speak(u);
                        }
                    }
                }
            }).subscribe();

        return () => { supabase.removeChannel(cChan); supabase.removeChannel(nChan); };
    });
  }, [params.id, hasInteracted, announceNumber]); ///page.tsx]

  // --- شاشة البدء (لحل مشكلة الصوت) ---
  if (!hasInteracted) {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center text-white">
            <button 
                onClick={() => {
                    setHasInteracted(true);
                    // تشغيل صوت صامت لفتح الـ AudioContext
                    new Audio('/audio/ding.mp3').play().catch(() => {});
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold py-6 px-12 rounded-full shadow-2xl flex items-center gap-4 transition transform hover:scale-105"
            >
                <Play fill="currentColor" /> اضغط هنا لبدء الشاشة
            </button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-12 flex flex-col overflow-hidden relative">
      
      {/* البانر */}
      <NotificationBanner 
        isVisible={showBanner} 
        message={bannerMsg} 
        type={bannerType}
        onClose={() => setShowBanner(false)} 
      />

      {/* الرأس */}
      <header className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-lg z-10">
        <h1 className="text-2xl font-bold">{screenTitle}</h1>
        <div className="text-3xl font-mono font-bold text-yellow-400">{toArabicNums(time)}</div>
      </header>

      {/* المحتوى */}
      <div className="flex-1 p-6 flex gap-6 overflow-hidden">
        {/* الفيديو */}
        <div className="flex-[3] bg-black rounded-xl overflow-hidden relative border border-gray-700 flex items-center justify-center">
             <iframe 
                width="100%" height="100%" 
                src="https://www.youtube.com/embed/videoseries?list=PLYouR_List_ID_Here&autoplay=1&mute=1&loop=1" 
                title="Video" className="w-full h-full object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
             ></iframe>
        </div>

        {/* العيادات */}
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
             <p className="text-sm font-bold">تابع دورك</p>
          </div>
        </div>
      </div>
      
      <Ticker text={tickerText} />
    </div>
  );
}
