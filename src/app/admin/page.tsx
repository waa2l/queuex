// 1. أضف استيراد الميكروفون
import { Mic, Radio, Volume2 } from 'lucide-react';

// 2. داخل المكون، أضف State للتسجيل
const [isRecording, setIsRecording] = useState(false);
const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
const [broadcastMsg, setBroadcastMsg] = useState('');
const [selectedTargetClinic, setSelectedTargetClinic] = useState('');

// 3. دوال التسجيل والإذاعة
const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: any[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        // رفع الملف لـ Supabase Storage
        const fileName = `voice-${Date.now()}.webm`;
        await supabase.storage.from('qms-assets').upload(fileName, blob);
        const { data } = supabase.storage.from('qms-assets').getPublicUrl(fileName);
        
        // إرسال إشعار لتشغيله
        await supabase.from('notifications').insert([{
            type: 'voice',
            message: 'نداء صوتي',
            payload: data.publicUrl,
            target_clinic_id: selectedTargetClinic || null // null = للكل
        }]);
        alert('تم إرسال النداء الصوتي');
    };
    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
};

const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
};

const sendBroadcast = async (type: string) => {
    await supabase.from('notifications').insert([{
        type: type, // 'alert', 'emergency'
        message: broadcastMsg,
        target_clinic_id: selectedTargetClinic || null
    }]);
    setBroadcastMsg('');
    alert('تم الإرسال');
};

// 4. أضف هذا التبويب في الـ Return
/* <button onClick={() => setActiveTab('broadcast')} ...> <Radio size={20}/> الإذاعة </button> 
*/

// 5. محتوى التبويب الجديد
{activeTab === 'broadcast' && (
  <div className="animate-in fade-in">
    <h2 className="text-3xl font-bold text-gray-800 mb-6">غرفة التحكم والإذاعة</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* قسم التوجيه */}
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

        {/* قسم الصوتيات */}
        <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center justify-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-100'}`}>
                <Mic size={40} className={isRecording ? 'text-white' : 'text-gray-500'} />
            </div>
            
            {!isRecording ? (
                <button onClick={startRecording} className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold">تسجيل نداء صوتي</button>
            ) : (
                <button onClick={stopRecording} className="bg-red-600 text-white px-8 py-3 rounded-full font-bold">إيقاف وإرسال</button>
            )}
            
            <p className="mt-4 text-sm text-gray-500">سيتم إذاعة التسجيل فوراً على الشاشات المحددة</p>
            
            <div className="mt-6 w-full border-t pt-4">
                <h4 className="font-bold mb-2 text-black">ملفات صوتية جاهزة</h4>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => { setBroadcastMsg('ding.mp3'); sendBroadcast('sound_file'); }} className="bg-gray-200 px-3 py-1 rounded text-sm text-black">جرس تنبيه</button>
                    <button onClick={() => { setBroadcastMsg('welcome.mp3'); sendBroadcast('sound_file'); }} className="bg-gray-200 px-3 py-1 rounded text-sm text-black">رسالة ترحيب</button>
                </div>
            </div>
        </div>
    </div>
  </div>
)}
