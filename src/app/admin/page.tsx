'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Trash2, Save, Activity, Stethoscope, Settings, 
  Monitor, Radio, Mic 
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('clinics');
  
  // --- States ---
  const [clinics, setClinics] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [screens, setScreens] = useState<any[]>([]);

  // Form Inputs
  const [newClinicName, setNewClinicName] = useState('');
  const [newDoc, setNewDoc] = useState({ name: '', specialty: '', image_url: '' });
  const [newScreenName, setNewScreenName] = useState('');
  
  // Broadcast States
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [selectedTargetClinic, setSelectedTargetClinic] = useState('');

  // 1. Fetch Data
  const fetchData = async () => {
    // Clinics
    const { data: cData } = await supabase.from('clinics').select('*').order('created_at');
    if (cData) setClinics(cData);

    // Doctors
    const { data: dData } = await supabase.from('doctors').select('*').order('created_at');
    if (dData) setDoctors(dData);

    // Settings
    const { data: sData } = await supabase.from('settings').select('*').single();
    if (sData) setSettings(sData);
    else {
        await supabase.from('settings').insert([{}]);
        const { data: retryS } = await supabase.from('settings').select('*').single();
        if(retryS) setSettings(retryS);
    }

    // Screens (with linked clinics)
    const { data: scData } = await supabase.from('screens').select('*, screen_clinics(clinic_id)');
    if (scData) setScreens(scData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Logic Functions ---

  // 1. Clinics
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

  // 2. Doctors
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

  // 3. Settings
  const saveSettings = async () => {
    if (!settings.id) return;
    await supabase.from('settings').update({
        center_name: settings.center_name,
        ticker_text: settings.ticker_text,
        alert_duration: settings.alert_duration
    }).eq('id', settings.id);
    alert('تم حفظ الإعدادات!');
  };

  // 4. Screens
  const addScreen = async () => {
      if(!newScreenName) return;
      await supabase.from('screens').insert([{ name: newScreenName }]);
      setNewScreenName(''); 
      fetchData();
  };
  const deleteScreen = async (id: string) => {
      if(!confirm('حذف الشاشة؟')) return;
      await supabase.from('screens').delete().eq('id', id);
      fetchData();
  };
  const toggleScreenClinic = async (screenId: string, clinicId: string, isLinked: boolean) => {
      if (isLinked) {
          await supabase.from('screen_clinics').delete().match({ screen_id: screenId, clinic_id: clinicId });
      } else {
          await supabase.from('screen_clinics').insert([{ screen_id: screenId, clinic_id: clinicId }]);
      }
      fetchData();
  };

  // 5. Broadcast (Audio & Alerts)
  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: any[] = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const fileName = `voice-${Date.now()}.webm`;
            const { error } = await supabase.storage.from('qms-assets').upload(fileName, blob);
            
            if (error) {
                alert('خطأ في رفع الصوت: تأكد من إنشاء Bucket باسم qms-assets في Supabase');
                return;
            }

            const { data } = supabase.storage.from('qms-assets').getPublicUrl(fileName);
            
            await supabase.from('notifications').insert([{
                type: 'voice',
                message: 'نداء صوتي',
                payload: data.publicUrl,
                target_clinic_id: selectedTargetClinic || null
            }]);
            alert('تم إرسال النداء الصوتي');
        };
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
    } catch (err) {
        alert('لا يمكن الوصول للميكروفون');
        console.error(err);
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  const sendBroadcast = async (type: string) => {
    await supabase.from('notifications').insert([{
        type: type,
        message: broadcastMsg,
        target_clinic_id: selectedTargetClinic || null
    }]);
    setBroadcastMsg('');
    alert('تم الإرسال');
  };

  // --- Render ---
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
        
        <button onClick={() => setActiveTab('screens')} 
          className={`flex items-center gap-3 p-3 rounded transition ${activeTab === 'screens' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
          <Monitor size={20}/> الشاشات
        </button>

        <button onClick={() => setActiveTab('broadcast')} 
          className={`flex items-center gap-3 p-3 rounded transition ${activeTab === 'broadcast' ? 'bg-red-900' : 'hover:bg-slate-800'}`}>
          <Radio size={20}/> الإذاعة
        </button>
        
        <button onClick={() => setActiveTab('settings')} 
          className={`flex items-center gap-3 p-3 rounded transition ${activeTab === 'settings' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
          <Settings size={20}/> الإعدادات
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* === Tab: Clinics === */}
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

        {/* === Tab: Doctors === */}
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

        {/* === Tab: Screens === */}
        {activeTab === 'screens' && (
          <div className="animate-in fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">تخصيص الشاشات</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 flex gap-4">
              <input type="text" placeholder="اسم الشاشة (مثال: شاشة الاستقبال)" className="flex-1 p-3 border rounded-lg text-black"
                value={newScreenName} onChange={(e) => setNewScreenName(e.target.value)} />
              <button onClick={addScreen} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold">إنشاء شاشة</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {screens.map((screen) => (
                <div key={screen.id} className="bg-white p-4 rounded-xl shadow border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-black">{screen.name}</h3>
                        <a href={`/display/${screen.id}`} target="_blank" className="text-blue-500 text-xs hover:underline">فتح الشاشة ↗</a>
                    </div>
                    <button onClick={() => deleteScreen(screen.id)} className="text-red-400"><Trash2 size={16}/></button>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-sm font-bold mb-2 text-gray-600">العيادات الظاهرة:</p>
                    <div className="flex flex-wrap gap-2">
                        {clinics.map(clinic => {
                            const isLinked = screen.screen_clinics?.some((sc: any) => sc.clinic_id === clinic.id);
                            return (
                                <button key={clinic.id} 
                                    onClick={() => toggleScreenClinic(screen.id, clinic.id, isLinked)}
                                    className={`px-2 py-1 rounded text-xs border ${isLinked ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-500 border-gray-300'}`}
                                >
                                    {clinic.name}
                                </button>
                            )
                        })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === Tab: Broadcast (الإذاعة) === */}
        {activeTab === 'broadcast' && (
          <div className="animate-in fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">غرفة التحكم والإذاعة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="font-bold mb-4 text-black">توجيه الرسالة إلى:</h3>
                    <select className="w-full p-3 border rounded mb-4 text-black" onChange={e => setSelectedTargetClinic(e.target.value)}>
                        <option value="">-- جميع العيادات والممرات --</option>
                        {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    
                    <textarea className="w-full p-3 border rounded mb-4 h-24 text-black" placeholder="اكتب رسالة التنبيه أو اسم المريض..."
                        value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}></textarea>
                    
                    <div className="flex gap-2">
                        <button onClick={() => sendBroadcast('alert')} className="flex-1 bg-blue-600 text-white p-3 rounded font-bold">إرسال تنبيه نصي</button>
                        <button onClick={() => sendBroadcast('emergency')} className="flex-1 bg-red-600 text-white p-3 rounded font-bold">🚨 طوارئ</button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center justify-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-100'}`}>
                        <Mic size={40} className={isRecording ? 'text-white' : 'text-gray-500'} />
                    </div>
                    
                    {!isRecording ? (
                        <button onClick={startRecording} className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold">تسجيل نداء صوتي</button>
                    ) : (
                        <button onClick={stopRecording} className="bg-red-600 text-white px-8 py-3 rounded-full font-bold">إيقاف وإرسال</button>
                    )}
                    
                    <p className="mt-4 text-sm text-gray-500">سيتم إذاعة التسجيل فوراً</p>
                    
                    <div className="mt-6 w-full border-t pt-4">
                        <h4 className="font-bold mb-2 text-black">أصوات جاهزة</h4>
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={() => { setBroadcastMsg('ding.mp3'); sendBroadcast('sound_file'); }} className="bg-gray-200 px-3 py-1 rounded text-sm text-black">جرس</button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* === Tab: Settings === */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">إعدادات المركز</h2>
            <div className="bg-white p-8 rounded-xl shadow space-y-6 max-w-2xl text-black">
              <div>
                <label className="block font-bold mb-2">اسم المركز</label>
                <input type="text" className="w-full p-3 border rounded-lg bg-gray-50"
                  value={settings.center_name || ''} 
                  onChange={(e) => setSettings({...settings, center_name: e.target.value})} />
              </div>
              <div>
                <label className="block font-bold mb-2">شريط الأخبار</label>
                <textarea className="w-full p-3 border rounded-lg bg-gray-50 h-24"
                  value={settings.ticker_text || ''} 
                  onChange={(e) => setSettings({...settings, ticker_text: e.target.value})} />
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
