'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toArabicNums } from '@/lib/utils';

export default function CustomerPage() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  
  useEffect(() => {
    // جلب العيادات النشطة فقط
    const fetchClinics = async () => {
        const { data } = await supabase.from('clinics').select('*').eq('status', 'active');
        if(data) setClinics(data);
    };
    fetchClinics();

    // اشتراك في التحديث
    const channel = supabase.channel('customer-view')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'clinics' }, (payload) => {
         setClinics(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
         if (selectedClinic && selectedClinic.id === payload.new.id) {
             setSelectedClinic(payload.new);
         }
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel) };
  }, [selectedClinic]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans text-gray-800">
      <header className="text-center mb-6 mt-4">
        <h1 className="text-2xl font-bold text-blue-900">متابعة الدور</h1>
        <p className="text-gray-500 text-sm">اختر العيادة لمتابعة الرقم الحالي</p>
      </header>

      {!selectedClinic ? (
        <div className="grid gap-3">
          {clinics.map(clinic => (
            <button 
              key={clinic.id}
              onClick={() => setSelectedClinic(clinic)}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-right flex justify-between items-center active:bg-blue-50 transition"
            >
              <span className="font-bold">{clinic.name}</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                {toArabicNums(clinic.current_number)}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center animate-in fade-in zoom-in duration-300">
          <button onClick={() => setSelectedClinic(null)} className="text-sm text-gray-400 mb-4 hover:text-gray-600">
            ← رجوع للقائمة
          </button>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedClinic.name}</h2>
          <p className="text-gray-500 mb-6">الدور الحالي بالعيادة</p>
          
          <div className="text-8xl font-black text-blue-600 font-mono mb-6">
            {toArabicNums(selectedClinic.current_number)}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800">
            يرجى الانتباه للشاشة، سيتم النداء قريباً
          </div>
        </div>
      )}
    </div>
  );
}
