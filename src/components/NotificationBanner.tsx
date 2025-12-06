'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface NotificationBannerProps {
  message: string;
  onClose: () => void;
  isVisible: boolean;
}

export default function NotificationBanner({ message, onClose, isVisible }: NotificationBannerProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    if (isVisible) {
      setTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
      // إخفاء تلقائي بعد 10 ثواني
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
      <div className="bg-white w-full max-w-4xl p-10 rounded-3xl shadow-2xl border-4 border-blue-600 relative text-center">
        
        {/* زر إغلاق يدوي */}
        <button onClick={onClose} className="absolute top-4 left-4 bg-gray-200 p-2 rounded-full hover:bg-red-100 hover:text-red-600 transition">
          <X size={32} />
        </button>

        <div className="flex flex-col gap-6">
          {/* أيقونة جرس أو تنبيه */}
          <div className="mx-auto bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center text-blue-600 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">
            {message}
          </h2>

          <div className="mt-4 bg-yellow-100 text-yellow-800 px-6 py-2 rounded-full inline-block mx-auto text-xl font-bold">
            وقت التنبيه: {time}
          </div>
        </div>
      </div>
    </div>
  );
}
