'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toArabicNums } from '@/lib/utils';
import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';

export default function ControlPage({ params }: { params: { id: string } }) {
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // جلب بيانات العيادة
  useEffect(() => {
    const fetchClinic = async () => {
      const { data } = await supabase.from('clinics').select('*').eq('id', params.id).single();
      if (data) setClinic(data);
    };
    fetchClinic();
  }, [params.id]);

  const updateNumber = async (action: 'next' | 'prev' | 'reset') => {
    if (!clinic) return;
    setLoading(true);
    
    let newNumber = clinic.current_number;
    if (action === 'next') newNumber++;
    if (action === 'prev') newNumber = Math.max(0, newNumber - 1);
    if (action === 'reset') newNumber = 0;

    const { error } = await supabase
      .from('clinics')
      .update({ current_number: newNumber, last_call_time: new Date() })
      .eq('id', params.id);

    if (!error) {
        setClinic({ ...clinic, current_number: newNumber });
    }
    setLoading(false);
  };

  const toggleStatus = async () => {
      const newStatus = clinic.status === 'active' ? 'paused' : 'active';
      const { error } = await supabase.from('clinics').update({ status: newStatus }).eq('id', params.id);
      if(!error) setClinic({...clinic, status: newStatus});
  };

  if (!clinic) return <div className="p-10 text-center">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{clinic.name}</h1>
        <div className={`inline-block px-3 py-1 rounded-full text-sm mb-6 ${clinic.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {clinic.status === 'active' ? 'نشطة' : 'متوقفة'}
        </div>

        <div className="text-8xl font-black text-blue-600 mb-8 font-mono">
            {toArabicNums(clinic.current_number)}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => updateNumber('next')}
                disabled={loading}
                className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition">
                <StepForward /> التالي
            </button>

            <button 
                onClick={toggleStatus}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                {clinic.status === 'active' ? <><Pause size={20}/> إيقاف</> : <><Play size={20}/> استئناف</>}
            </button>

            <button 
                onClick={() => updateNumber('reset')}
                className="bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                <RotateCcw size={20}/> تصفير
            </button>
        </div>
      </div>
    </div>
  );
}
