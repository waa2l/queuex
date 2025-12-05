import { toArabicNums } from "@/lib/utils";

interface ClinicCardProps {
  name: string;
  number: number;
  status: string;
}

export default function ClinicCard({ name, number, status }: ClinicCardProps) {
  const isActive = status === 'active';
  
  return (
    <div className={`
      relative overflow-hidden rounded-xl border-r-8 shadow-lg p-6 transition-all duration-300
      ${isActive ? 'bg-white border-green-500' : 'bg-gray-100 border-red-500 opacity-60'}
    `}>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{name}</h2>
          <span className={`px-2 py-1 rounded text-xs text-white ${isActive ? 'bg-green-600' : 'bg-red-600'}`}>
            {isActive ? 'نادي الآن' : 'متوقفة'}
          </span>
        </div>
        <div className="text-left">
          <p className="text-gray-500 text-sm mb-1">الرقم الحالي</p>
          <p className="text-6xl font-black text-blue-900 font-mono tracking-tighter">
            {toArabicNums(number)}
          </p>
        </div>
      </div>
    </div>
  );
}
