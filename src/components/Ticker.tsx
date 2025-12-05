interface TickerProps {
  text: string;
}

export default function Ticker({ text }: TickerProps) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-red-800 text-white h-12 flex items-center overflow-hidden z-50">
      <div className="whitespace-nowrap animate-marquee text-lg font-bold px-4">
        {text}
      </div>
    </div>
  );
}
