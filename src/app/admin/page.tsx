'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Save, Activity, Stethoscope, Settings, Monitor } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('clinics');
  
  // States
  const [clinics, setClinics] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  
  // Form Inputs
  const [newClinicName, setNewClinicName] = useState('');
  const [newDoc, setNewDoc] = useState({ name: '', specialty: '', image_url: '' });

  // 1. Fetch Data (جلب البيانات)
  const fetchData = async () => {
    // جلب العيادات
    const { data: cData } = await supabase.from('clinics').select('*').order('created_at');
    if (cData) setClinics(cData);

    // جلب الأطباء
    const { data: dData } = await supabase.from('doctors').select('*').order('created_at');
    if (dData) setDoctors(dData);

    // جلب الإعدادات
    const { data: sData } = await supabase.from('settings').select('*').single();
    if (sData) setSettings(sData);
    else {
        // إنشاء إعدادات افتراضية إذا لم تكن موجودة
        await supabase.from('settings').insert([{}]);
        // إعادة المحاولة
        const { data: retryS } = await supabase.from('settings').select('*').single();
        if(retryS) setSettings(retryS);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Clinic Logic ---
  const addClinic = async () => {
    if (!newClinicName) return;
    await supabase.from('clinics').insert([{ name: newClinicName, control_password: '123' }]);
    setNewClinicName('');
    fetchData();
  };
  const deleteClinic = async (id: string) => {
    if(!confirm('حذف العيادة؟')) return;
    await supabase.from('clinics').delete().eq('id', id);
    fetchData();
  };

  // --- Doctor Logic ---
  const addDoctor = async () => {
    if (!newDoc.name) return;
    await supabase.from('doctors').insert([newDoc]);
    setNewDoc({ name: '', specialty: '', image_url: '' });
    fetchData();
  };
  const deleteDoctor = async (id: string) => {
    await supabase.from('doctors').delete().eq('id', id);
    fetchData();
  };

  // --- Settings Logic ---
  const saveSettings = async () => {
    if (!settings.id) return;
    await supabase.from('settings').update({
        center_name: settings.center_name,
        ticker_text: settings.ticker_text,
        alert_duration: settings.alert_duration
    }).eq('id', settings.id);
    alert('تم حفظ الإعدادات!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-6 text-yellow-400">لوحة التحكم</h2>
        
        <button onClick={() => setActiveTab('clinics')} 
          className={`flex items-center gap-3 p-3 rounded transition ${activeTab === 'clinics' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
          <Activity size={20}/> العيادات
        </button>
        
        <button onClick={() => setActiveTab('doctors')} 
          className={`flex items-center gap-3 p-3 rounded transition ${activeTab === 'doctors' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
          <Stethoscope size={20}/> الأطباء
        </button>
        
        <button onClick={() => setActiveTab('settings')} 
          className={`flex items-center gap-3 p-3 rounded transition ${activeTab === 'settings' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
          <Settings size={20}/> الإعدادات العامة
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* === تبويب العيادات === */}
        {activeTab === 'clinics' && (
          <div className="animate-in fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">إدارة العيادات</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 flex gap-4">
              <input type="text" placeholder="اسم العيادة..." className="flex-1 p-3 border rounded-lg text-black"
                value={newClinicName} onChange={(e) => setNewClinicName(e.target.value)} />
              <button onClick={addClinic} className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold">إضافة</button>
            </div>
            <div className="bg-white rounded-xl shadow overflow-hidden">
              {clinics.map((clinic) => (
                <div key={clinic.id} className="p-4 border-b flex justify-between items-center text-black">
                  <div>
                    <span className="font-bold text-lg ml-4">{clinic.name}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">باسورد: {clinic.control_password}</span>
                  </div>
                  <button onClick={() => deleteClinic(clinic.id)} className="text-red-500 bg-red-50 p-2 rounded hover:bg-red-100"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === تبويب الأطباء === */}
        {activeTab === 'doctors' && (
          <div className="animate-in fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">قائمة الأطباء</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 grid grid-cols-3 gap-4">
              <input type="text" placeholder="اسم الطبيب" className="p-3 border rounded-lg text-black"
                value={newDoc.name} onChange={(e) => setNewDoc({...newDoc, name: e.target.value})} />
              <input type="text" placeholder="التخصص" className="p-3 border rounded-lg text-black"
                value={newDoc.specialty} onChange={(e) => setNewDoc({...newDoc, specialty: e.target.value})} />
              <button onClick={addDoctor} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">إضافة طبيب</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center border-r-4 border-blue-500 text-black">
                  <div>
                    <h3 className="font-bold">{doc.name}</h3>
                    <p className="text-sm text-gray-500">{doc.specialty}</p>
                  </div>
                  <button onClick={() => deleteDoctor(doc.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === تبويب الإعدادات === */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">إعدادات المركز</h2>
            <div className="bg-white p-8 rounded-xl shadow space-y-6 max-w-2xl text-black">
              <div>
                <label className="block font-bold mb-2">اسم المركز (يظهر أعلى الشاشة)</label>
                <input type="text" className="w-full p-3 border rounded-lg bg-gray-50"
                  value={settings.center_name || ''} 
                  onChange={(e) => setSettings({...settings, center_name: e.target.value})} />
              </div>
              
              <div>
                <label className="block font-bold mb-2">نص شريط الأخبار المتحرك</label>
                <textarea className="w-full p-3 border rounded-lg bg-gray-50 h-24"
                  value={settings.ticker_text || ''} 
                  onChange={(e) => setSettings({...settings, ticker_text: e.target.value})} />
              </div>

              <div>
                <label className="block font-bold mb-2">مدة التنبيه الصوتي (ثواني)</label>
                <input type="number" className="w-full p-3 border rounded-lg bg-gray-50"
                  value={settings.alert_duration || 5} 
                  onChange={(e) => setSettings({...settings, alert_duration: parseInt(e.target.value)})} />
              </div>

              <button onClick={saveSettings} className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900 flex justify-center gap-2">
                <Save /> حفظ التغييرات
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
