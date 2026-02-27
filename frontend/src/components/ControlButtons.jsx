import { useStore } from '../store/useStore';

export const ControlButtons = () => {
  const { currentExercise, isActive, startSession, stopSession, resetSession } = useStore();

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
      {!isActive ? (
        <button
          onClick={startSession}
          disabled={!currentExercise}
          className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-sm transition-all duration-200
            bg-[#00e5ff] text-[#060b14]
            hover:bg-[#00ccee] hover:shadow-[0_0_24px_rgba(0,229,255,0.3)]
            disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none
            active:scale-95"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          ▶ Start Exercise
        </button>
      ) : (
        <button
          onClick={stopSession}
          className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-sm transition-all duration-200
            bg-[#ff3366]/10 text-[#ff6b8a] border border-[#ff3366]/30
            hover:bg-[#ff3366]/20 hover:border-[#ff3366]/60
            active:scale-95"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          ■ Stop Exercise
        </button>
      )}

      <button
        onClick={resetSession}
        className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-sm transition-all duration-200
          bg-[#0d1526] text-[#4a5e80] border border-[#1c2e50]
          hover:border-[#2d3f5c] hover:text-[#6b7fa8]
          active:scale-95"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        ↺ Reset
      </button>
    </div>
  );
};