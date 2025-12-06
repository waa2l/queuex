'use client';
import { useEffect, useState } from 'react';
import { X, Bell, AlertTriangle } from 'lucide-react';

interface NotificationBannerProps {
  message: string;
  type?: 'alert' | 'emergency';
  onClose: () => void;
  isVisible: boolean;
}

export default function NotificationBanner({ message, type = 'alert', onClose, isVisible }: NotificationBannerProps) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-5xl p-12 rounded-3xl shadow-2xl border-4 relative text-center transform scale-110 ${type === 'emergency' ? 'bg-red-900 border-red-500 text-white' : 'bg-white border-blue-600 text-gray-900'}`}>
        
        {/* زر إغلاق */}
        <button onClick={onClose} className="absolute top-6 left-6 bg-white/20 p-3 rounded-full hover:bg-white/40 transition">
          <X size={32} />
        </button>

        <div className="flex flex-col gap-8 items-center">
          {/* الأيقونة */}
          <div className={`w-32 h-32 rounded-full flex items-center justify-center animate-bounce ${type === 'emergency' ? 'bg-red-700 text-white' : 'bg-blue-100 text-blue-600'}`}>
            {type === 'emergency' ? <AlertTriangle size={64} /> : <Bell size={64} />}
          </div>

          <h2 className="text-5xl md:text-7xl font-black leading-tight">
            {message}
          </h2>

          <div className={`mt-4 px-8 py-3 rounded-full text-2xl font-bold ${type === 'emergency' ? 'bg-red-800 text-red-200' : 'bg-yellow-100 text-yellow-800'}`}>
            وقت التنبيه: {time}
          </div>
        </div>
      </div>
    </div>
  );
}
