import { useState, useEffect, useRef } from 'react';

type AudioItem = {
  text: string;
  type: 'ding' | 'number' | 'clinic';
  file?: string;
};

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const queue = useRef<AudioItem[]>([]);
  
  // دالة النطق (Fallback) في حال عدم وجود ملف
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;
    utterance.onend = () => playNext();
    window.speechSynthesis.speak(utterance);
  };

  const playFile = (fileName: string) => {
    const audio = new Audio(`/audio/${fileName}`);
    audio.onended = () => playNext();
    audio.onerror = () => {
      // لو الملف مش موجود، انطق الاسم بدلاً منه
      const item = queue.current[0]; // العنصر الحالي
      speak(item?.text || "نداء"); 
    };
    audio.play().catch(() => playNext()); // لو حصل خطأ تجاوز
  };

  const playNext = () => {
    if (queue.current.length > 0) {
      queue.current.shift(); // حذف اللي خلص
    }

    if (queue.current.length === 0) {
      setIsPlaying(false);
      return;
    }

    const nextItem = queue.current[0];
    
    if (nextItem.type === 'ding') {
        playFile('ding.mp3');
    } else if (nextItem.type === 'number') {
        // محاولة تشغيل ملف الرقم، لو مش موجود الـ error handler هينطقه
        playFile(`${nextItem.text}.mp3`);
    } else {
        // للعيادات، نستخدم النطق الآلي لأنه أضمن حالياً
        speak(nextItem.text);
    }
  };

  const announceNumber = (number: number, clinicName: string) => {
    // إضافة التسلسل للقائمة
    queue.current.push({ type: 'ding', text: 'ding' });
    queue.current.push({ type: 'number', text: number.toString() });
    queue.current.push({ type: 'clinic', text: `عيادة ${clinicName}` });

    if (!isPlaying) {
      setIsPlaying(true);
      // نبدأ التشغيل (بدون حذف أول عنصر يدوياً لأن playNext هتعمل ده)
      // هنا نحتاج "تريك" بسيط لبدء الدورة
      const firstItem = queue.current[0]; 
      if(firstItem.type === 'ding') playFile('ding.mp3');
    }
  };

  return { announceNumber, isPlaying };
}
