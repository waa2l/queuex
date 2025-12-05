'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Save, Activity } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('clinics');
  const [clinics, setClinics] = useState<any[]>([]);
  const [newClinicName, setNewClinicName] = useState('');
  
  // 1. جلب العيادات
  const fetchClinics = async () => {
    const { data } = await supabase.from('clinics').select('*').order('created_at');
    if (data) setClinics(data);
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  // 2. إضافة عيادة
  const addClinic = async () => {
    if (!newClinicName) return;
    const { error } = await supabase.from('clinics').insert([{ 
        name: newClinicName, 
        control_password: '123' // كلمة سر افتراضية
    }]);
    if (!error) {
        setNewClinicName('');
        fetchClinics();
    }
  };

  // 3. حذف عيادة
  const deleteClinic = async (id: string) => {
    if(!confirm('هل أنت متأكد من حذف العيادة؟')) return;
    await supabase.from('clinics').delete().eq('id', id);
    fetchClinics();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-8 text-yellow-400">لوحة التحكم</h2>
        <nav className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('clinics')} className={`p-3 text-right rounded ${activeTab === 'clinics' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>العيادات</button>
          <button onClick={() => setActiveTab('doctors')} className={`p-3 text-right rounded ${activeTab === 'doctors' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>الأطباء</button>
          <button onClick={() => setActiveTab('settings')} className={`p-3 text-right rounded ${activeTab === 'settings' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>الإعدادات العامة</button>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* قسم العيادات */}
        {activeTab === 'clinics' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Activity /> إدارة العيادات
            </h2>

            {/* إضافة جديد */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 flex gap-4">
              <input 
                type="text" 
                placeholder="اسم العيادة الجديدة..." 
                className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                value={newClinicName}
                onChange={(e) => setNewClinicName(e.target.value)}
              />
              <button onClick={addClinic} className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700">
                <Plus size={20} /> إضافة
              </button>
            </div>

            {/* الجدول */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-4">اسم العيادة</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">الرقم الحالي</th>
                    <th className="p-4">كلمة المرور</th>
                    <th className="p-4">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {clinics.map((clinic) => (
                    <tr key={clinic.id} className="border-b hover:bg-gray-50 text-gray-800">
                      <td className="p-4 font-bold">{clinic.name}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${clinic.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {clinic.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono">{clinic.current_number}</td>
                      <td className="p-4 font-mono text-gray-400">{clinic.control_password}</td>
                      <td className="p-4">
                        <button onClick={() => deleteClinic(clinic.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                          <Trash2 size={18} />
                        </button>
                        <a href={`/control/${clinic.id}`} target="_blank" className="text-blue-500 hover:bg-blue-50 p-2 rounded mr-2 text-sm">
                          لوحة التحكم
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab !== 'clinics' && (
          <div className="text-center py-20 text-gray-400">
            <p>قيد التطوير... يمكن تكرار نفس منطق العيادات هنا.</p>
          </div>
        )}
      </main>
    </div>
  );
}
