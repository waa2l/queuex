'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toArabicNums } from '@/lib/utils';
import { Printer } from 'lucide-react';

export default function PrintPage() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [startNum, setStartNum] = useState(1);
  const [endNum, setEndNum] = useState(50);
  const [centerName, setCenterName] = useState('المركز الطبي');

  useEffect(() => {
    supabase.from('clinics').select('*').then(({ data }) => { if (data) setClinics(data); });
    supabase.from('settings').select('center_name').single().then(({ data }) => { if (data) setCenterName(data.center_name); });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // توليد مصفوفة الأرقام
  const numbers = Array.from({ length: (endNum - startNum) + 1 }, (_, i) => startNum + i);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* لوحة التحكم (تختفي عند الطباعة) */}
      <div className="no-print bg-white p-6 rounded-xl shadow-md mb-8 max-w-4xl mx-auto flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-bold mb-1">اختر العيادة</label>
          <select className="p-2 border rounded w-48" onChange={(e) => setSelectedClinic(e.target.value)}>
            <option value="">-- اختر --</option>
            {clinics.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">من رقم</label>
          <input type="number" className="p-2 border rounded w-24" value={startNum} onChange={e => setStartNum(Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">إلى رقم</label>
          <input type="number" className="p-2 border rounded w-24" value={endNum} onChange={e => setEndNum(Number(e.target.value))} />
        </div>
        <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-blue-700">
          <Printer size={18} /> طباعة
        </button>
      </div>

      {/* منطقة الطباعة (A4 Grid) */}
      <div className="print-area bg-white mx-auto shadow-lg p-8 grid grid-cols-3 gap-4" style={{ width: '210mm', minHeight: '297mm' }}>
        {numbers.map((num) => (
          <div key={num} className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center h-40 break-inside-avoid">
            <h3 className="text-sm font-bold text-gray-600 mb-2">{centerName}</h3>
            {selectedClinic && <p className="text-xs text-gray-500 mb-1">{selectedClinic}</p>}
            <div className="text-5xl font-black font-mono text-black">{toArabicNums(num)}</div>
            <p className="text-xs text-gray-400 mt-2">{new Date().toLocaleDateString('ar-EG')}</p>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-area { shadow: none; box-shadow: none; margin: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
