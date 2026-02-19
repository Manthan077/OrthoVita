export const InjuryAssessment = ({ onComplete, onSkip }) => {
  const injuries = [
    { id: 'knee', label: '🦵 Knee Pain', exercises: ['squat', 'kneeRaise', 'calfRaise'] },
    { id: 'shoulder', label: '💪 Shoulder Pain', exercises: ['shoulderPress', 'lateralRaise', 'armCircle'] },
    { id: 'back', label: '🧍 Back Pain', exercises: ['squat', 'kneeRaise', 'calfRaise'] },
    { id: 'neck', label: '🧑 Neck Pain', exercises: ['neckTilt', 'armCircle'] },
    { id: 'wrist', label: '✋ Wrist Pain', exercises: ['wristRotation', 'armCircle'] },
    { id: 'elbow', label: '💪 Elbow Pain', exercises: ['bicepCurl', 'lateralRaise'] },
    { id: 'ankle', label: '🦶 Ankle Pain', exercises: ['calfRaise', 'kneeRaise'] },
  ];

  const handleSelect = (injury) => {
    onComplete({
      injury: injury.label,
      exercises: injury.exercises
    });
  };

  return (
    <div className="bg-gradient-to-br from-[#00e5ff]/10 to-[#00ff9d]/5 border border-[#00e5ff]/30 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black text-[#e8f0ff]" style={{ fontFamily: "'Syne', sans-serif" }}>
            🩺 Injury Assessment
          </h3>
          <p className="text-sm text-[#c8d8f0] mt-1">
            Select your injury area for personalized exercise recommendations
          </p>
        </div>
        <button
          onClick={onSkip}
          className="text-xs text-[#4a5e80] hover:text-[#e8f0ff] transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {injuries.map((injury) => (
          <button
            key={injury.id}
            onClick={() => handleSelect(injury)}
            className="p-4 bg-[#0d1526] border-2 border-[#1c2e50] rounded-xl
              hover:border-[#00e5ff] hover:bg-[#00e5ff]/5 transition-all duration-200
              text-center group"
          >
            <div className="text-2xl mb-2">{injury.label.split(' ')[0]}</div>
            <div className="text-sm font-semibold text-[#e8f0ff] group-hover:text-[#00e5ff]">
              {injury.label.split(' ').slice(1).join(' ')}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-[#4a5e80]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Exercises will be filtered based on your selection</span>
      </div>
    </div>
  );
};
