import { useState } from 'react';
import { aiService } from '../services/aiService';

export const InjuryConfirmation = ({ onConfirm, onSkip }) => {
  const [step, setStep] = useState('input');
  const [injuryInput, setInjuryInput] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!injuryInput.trim()) return;
    setLoading(true);
    const result = await aiService.confirmInjury(injuryInput);
    setAiResponse(result);
    setStep('questions');
    setLoading(false);
  };

  const handleAnswer = async (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    if (newAnswers.length === aiResponse.confirmationQuestions.length) {
      setLoading(true);
      const recommendations = await aiService.getExerciseRecommendations(
        aiResponse.suspectedInjury,
        newAnswers
      );
      setLoading(false);
      onConfirm({ 
        injury: aiResponse.suspectedInjury, 
        answers: newAnswers,
        recommendations 
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="max-w-2xl w-full bg-[#0d1526] border border-[#1c2e50] rounded-2xl p-8">
        <h2 className="text-2xl font-black text-[#e8f0ff] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          Injury Assessment (Optional)
        </h2>
        <p className="text-[#4a5e80] text-sm mb-6">Get AI-powered personalized exercise recommendations</p>

        {step === 'input' && (
          <>
            <p className="text-[#c8d8f0] mb-4">Describe your injury or pain:</p>
            <textarea
              value={injuryInput}
              onChange={(e) => setInjuryInput(e.target.value)}
              placeholder="e.g., I have pain in my right knee when walking..."
              className="w-full bg-[#060b14] border border-[#1c2e50] text-[#e8f0ff] rounded-xl p-4 mb-4
                focus:outline-none focus:border-[#00e5ff]/50 resize-none"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading || !injuryInput.trim()}
                className="flex-1 px-6 py-3 bg-[#00e5ff] text-[#060b14] rounded-xl font-bold
                  hover:bg-[#00ccee] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Analyzing...' : 'Get AI Recommendations'}
              </button>
              <button
                onClick={onSkip}
                className="flex-1 px-6 py-3 bg-[#1c2e50] text-[#e8f0ff] rounded-xl font-bold
                  hover:bg-[#2d3f5c] transition-all"
              >
                Skip - Show All Exercises
              </button>
            </div>
          </>
        )}

        {step === 'questions' && aiResponse && (
          <>
            <div className="bg-[#060b14] border border-[#00e5ff]/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-[#4a5e80] mb-1">AI Detected:</p>
              <p className="text-lg font-bold text-[#00e5ff]">{aiResponse.suspectedInjury}</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="w-8 h-8 border-2 border-[#1c2e50] border-t-[#00e5ff] rounded-full animate-spin" />
                <p className="text-[#00e5ff] text-sm">AI is analyzing safe exercises for you...</p>
              </div>
            ) : (
              <>
                <p className="text-[#c8d8f0] mb-4">
                  Question {answers.length + 1} of {aiResponse.confirmationQuestions.length}:
                </p>
                <p className="text-lg text-[#e8f0ff] mb-6">
                  {aiResponse.confirmationQuestions[answers.length]}
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleAnswer('Yes')}
                    className="flex-1 px-6 py-3 bg-[#00e5ff] text-[#060b14] rounded-xl font-bold
                      hover:bg-[#00ccee] transition-all"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleAnswer('No')}
                    className="flex-1 px-6 py-3 bg-[#1c2e50] text-[#e8f0ff] rounded-xl font-bold
                      hover:bg-[#2d3f5c] transition-all"
                  >
                    No
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
