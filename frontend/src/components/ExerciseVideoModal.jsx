import { EXERCISE_VIDEOS } from '../utils/exerciseVideos';

export const ExerciseVideoModal = ({ exerciseKey, onSkip, onStart }) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0d1526] border border-[#1c2e50] rounded-2xl max-w-3xl w-full my-8">
        <div className="p-4 border-b border-[#1c2e50] flex items-center justify-between">
          <h2 className="text-xl font-black text-[#e8f0ff]" style={{ fontFamily: "'Syne', sans-serif" }}>
            {EXERCISE_VIDEOS[exerciseKey]?.title || 'Exercise Tutorial'}
          </h2>
          <button
            onClick={onSkip}
            className="text-[#4a5e80] hover:text-[#e8f0ff] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {/* Video */}
          <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
            <iframe
              width="100%"
              height="100%"
              src={`${EXERCISE_VIDEOS[exerciseKey]?.url}?autoplay=1`}
              title="Exercise Tutorial"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Key Points */}
          <div className="bg-[#060b14] border border-[#1c2e50] rounded-xl p-3 mb-4">
            <h3 className="text-sm font-bold text-[#00e5ff] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              Key Points
            </h3>
            <ul className="space-y-1.5">
              {EXERCISE_VIDEOS[exerciseKey]?.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-[#c8d8f0]">
                  <span className="text-[#00ff9d] mt-0.5">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="flex-1 px-4 py-2.5 border border-[#1c2e50] text-[#e8f0ff] rounded-xl
                hover:border-[#00e5ff]/50 hover:bg-[#00e5ff]/5 transition-all font-semibold text-sm"
            >
              Skip Tutorial
            </button>
            <button
              onClick={onStart}
              className="flex-1 px-4 py-2.5 bg-[#00e5ff] text-[#060b14] rounded-xl
                hover:bg-[#00ccee] transition-all font-bold text-sm"
            >
              Start Exercise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
