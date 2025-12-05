import React from 'react';

interface TickerProps {
  text: string;
}

const Ticker: React.FC<TickerProps> = ({ text }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-red-900 text-white h-12 flex items-center overflow-hidden z-50 border-t-4 border-yellow-500 shadow-lg">
      <div className="whitespace-nowrap animate-marquee text-xl font-bold px-4">
        {/* نكرر النص لضمان استمرارية الشريط */}
        <span className="mx-8">{text}</span>
        <span className="mx-8">{text}</span>
        <span className="mx-8">{text}</span>
      </div>
    </div>
  );
};

export default Ticker;
