'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function BookingPage() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '', phone: '', clinic_id: '', date: '', shift: 'morning'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.from('clinics').select('id, name').then(({data}) => {
        if(data) setClinics(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.from('appointments').insert([{
        customer_name: formData.name,
        phone: formData.phone,
        clinic_id: formData.clinic_id,
        appointment_date: formData.date,
        shift_type: formData.shift,
        status: 'pending'
    }]);

    setLoading(false);
    if (!error) setSuccess(true);
  };

  if (success) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-3xl">✓</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">تم استلام طلبك بنجاح</h2>
      <p className="text-gray-600 mb-6">سنتواصل معك قريباً لتأكيد الموعد</p>
      <a href="/" className="text-blue-600 hover:underline">عودة للرئيسية</a>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg text-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">حجز موعد جديد</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">الاسم الثلاثي</label>
            <input required type="text" className="w-full p-3 border rounded-lg" 
              onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">رقم الهاتف</label>
            <input required type="tel" className="w-full p-3 border rounded-lg"
              onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">العيادة المطلوبة</label>
            <select required className="w-full p-3 border rounded-lg"
              onChange={e => setFormData({...formData, clinic_id: e.target.value})}>
                <option value="">اختر العيادة...</option>
                {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-bold mb-1">التاريخ</label>
               <input required type="date" className="w-full p-3 border rounded-lg"
                 onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
               <label className="block text-sm font-bold mb-1">الفترة</label>
               <select className="w-full p-3 border rounded-lg"
                 onChange={e => setFormData({...formData, shift: e.target.value})}>
                   <option value="morning">صباحي (8 - 2)</option>
                   <option value="evening">مسائي (2 - 8)</option>
               </select>
            </div>
          </div>
        </div>

        <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-8 hover:bg-blue-700 transition">
          {loading ? 'جاري الحجز...' : 'تأكيد الحجز'}
        </button>
      </form>
    </div>
  );
}
