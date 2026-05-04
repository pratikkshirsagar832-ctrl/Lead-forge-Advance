'use client';

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 bg-[linear-gradient(135deg,#3A2D28,#A48374,#CBAD8D,#3A2D28)] bg-[length:400%_400%] animate-gradientShift">
      <div className="absolute inset-0 backdrop-blur-[20px] bg-white/5" />
    </div>
  );
}
