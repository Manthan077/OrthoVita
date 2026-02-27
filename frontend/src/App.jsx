import { useState, useEffect } from 'react';
import { WebcamFeed } from './components/WebcamFeed';
import { ExerciseSelector } from './components/ExerciseSelector';
import { StatsPanel } from './components/StatsPanel';
import { ControlButtons } from './components/ControlButtons';
import { SessionSummary } from './components/SessionSummary';
import { ExerciseHistory } from './components/ExerciseHistory';
import { InjuryAssessment } from './components/InjuryAssessment';
import { LandingPage } from './components/LandingPage';
import { GeminiChatbot } from './components/GeminiChatbot';
import { AIGreeting } from './components/AIGreeting';
import { InjuryConfirmation } from './components/InjuryConfirmation';
import { PreExerciseBriefing } from './components/PreExerciseBriefing';
import { NutritionAdvice } from './components/NutritionAdvice';
import { ProfileDropdown } from './components/ProfileDropdown';
import { ProfileModal } from './components/ProfileModal';
import { useStore } from './store/useStore';
import { EXERCISES } from './utils/exerciseDetectors';
import { getRecommendedExercises } from './utils/injuryMapping';

function App() {
  const { user, setUser, rehabDay, confirmedInjury, setInjury, currentExercise, isActive } = useStore();
  const [flow, setFlow] = useState('landing');
  const [showBriefing, setShowBriefing] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showInjuryAssessment, setShowInjuryAssessment] = useState(false);
  const [recommendedExercises, setRecommendedExercises] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [injurySkipped, setInjurySkipped] = useState(false);

  useEffect(() => {
    if (!user) {
      setFlow('landing');
    } else {
      setFlow('dashboard');
      // Only use fallback mapping if no AI recommendations
      if (confirmedInjury && recommendedExercises.length === 0) {
        setRecommendedExercises(getRecommendedExercises(confirmedInjury));
      }
    }
  }, [user, confirmedInjury]);

  const handleAuth = (userData) => {
    setUser(userData);
    setFlow('dashboard');
  };

  const handleInjurySelect = (injuryData) => {
    setInjury(injuryData.injury);
    setRecommendedExercises(injuryData.exercises);
    setInjurySkipped(false);
  };

  const handleInjuryConfirm = (injuryData) => {
    setInjury(injuryData.injury);
    setRecommendedExercises(injuryData.recommendations || []);
    setShowInjuryAssessment(false);
  };

  const handleSkipInjury = () => {
    setInjury(null);
    setRecommendedExercises([]);
    setShowInjuryAssessment(false);
  };

  const handleSaveProfile = (profileData) => {
    setUser({ ...user, ...profileData });
  };

  if (flow === 'landing') {
    return <LandingPage onAuth={handleAuth} />;
  }



  return (
    <div className="min-h-screen bg-[#060b14] text-[#e8f0ff]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Subtle grid overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src="/OrthoVita.png" alt="OrthoVita Logo" className="h-12 sm:h-16 w-auto object-contain rounded-lg" />
          <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                Ortho<span className="text-[#00e5ff]">Vita</span>
              </h1>
              <p className="text-[#4a5e80] text-xs sm:text-sm mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                AI-POWERED REHAB • DAY {rehabDay}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <button
              onClick={() => setShowHistory(true)}
              className="text-xs sm:text-sm border border-[#1c2e50] text-[#00e5ff] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl
                hover:border-[#00e5ff]/50 hover:bg-[#00e5ff]/5 transition-all duration-200"
            >
              📊 <span className="hidden sm:inline">History</span>
            </button>
            <button
              onClick={() => setShowNutrition(true)}
              className="text-xs sm:text-sm border border-[#1c2e50] text-[#00e5ff] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl
                hover:border-[#00e5ff]/50 hover:bg-[#00e5ff]/5 transition-all duration-200"
            >
              🥗 <span className="hidden sm:inline">Nutrition</span>
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#e8f0ff]">👋 {user.name}</p>
              {confirmedInjury && (
                <p className="text-xs text-[#4a5e80]">{confirmedInjury}</p>
              )}
            </div>
            <ProfileDropdown 
              user={user} 
              onOpenProfile={() => setShowProfile(true)}
              onSignOut={() => { 
                setUser(null); 
                setInjury(null);
                setFlow('landing');
              }}
            />
          </div>
        </div>

        {/* Injury Assessment */}
        {!confirmedInjury && !injurySkipped && (
          <InjuryAssessment
            onComplete={handleInjurySelect}
            onSkip={() => {
              setRecommendedExercises([]);
              setInjurySkipped(true);
            }}
          />
        )}

        {/* Collapsed Injury Assessment */}
        {!confirmedInjury && injurySkipped && (
          <div className="bg-[#0d1526] border border-[#1c2e50] rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🩺</span>
                <span className="text-sm text-[#c8d8f0]">No injury selected - Showing all exercises</span>
              </div>
              <button
                onClick={() => setInjurySkipped(false)}
                className="text-xs px-3 py-1.5 bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 rounded-lg
                  hover:bg-[#00e5ff]/20 transition-all"
              >
                Select Injury
              </button>
            </div>
          </div>
        )}

        {/* Injury-based recommendation banner */}
        {confirmedInjury && (
          <div className="bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <span className="text-sm font-bold text-[#00e5ff]" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Personalized Recommendations
                </span>
              </div>
              <button
                onClick={() => {
                  setInjury(null);
                  setInjurySkipped(false);
                }}
                className="text-xs px-3 py-1.5 bg-[#1c2e50] text-[#00e5ff] rounded-lg
                  hover:bg-[#2d3f5c] transition-all"
              >
                Change Injury
              </button>
            </div>
            <p className="text-sm text-[#c8d8f0]">
              Based on your {confirmedInjury}, we've selected exercises that are safe and beneficial for your recovery.
            </p>
          </div>
        )}

        {/* ── Setup Guide ── */}
        <div className="bg-[#0d1526] border border-[#00e5ff]/10 border-l-2 border-l-[#00e5ff] p-3 sm:p-4 mb-4 sm:mb-6 rounded-xl">
          <p className="font-semibold text-[#00e5ff] text-xs sm:text-sm mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            📹 SETUP GUIDE
          </p>
          <p className="text-[#6b7fa8] text-xs sm:text-sm">
            Stand 6–8 feet from camera &bull; Full body visible &bull; Good lighting
          </p>
        </div>

        {/* ── Exercise Selection ── */}
        <ExerciseSelector recommendedExercises={recommendedExercises} />

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Webcam Feed */}
          <div className="lg:col-span-2" id="webcam-section">
            <WebcamFeed />
            <div className="mt-3 sm:mt-4">
              <ControlButtons />
            </div>
          </div>

          {/* Stats Panel */}
          <div className="lg:col-span-1">
            <StatsPanel />
          </div>
        </div>

        {/* Session Summary */}
        <SessionSummary />
      </div>

      {/* ── Floating Gemini Chatbot ── */}
      <GeminiChatbot userName={user.name} />

      {/* Modals */}
      {showBriefing && currentExercise && (
        <PreExerciseBriefing
          exerciseName={EXERCISES[currentExercise]?.name}
          onStart={() => setShowBriefing(false)}
        />
      )}

      {showNutrition && (
        <NutritionAdvice
          injury={confirmedInjury}
          effortLevel="moderate"
          onClose={() => setShowNutrition(false)}
        />
      )}

      {showInjuryAssessment && (
        <div className="fixed inset-0 bg-[#060b14]/95 backdrop-blur-sm z-50">
          <InjuryConfirmation
            onConfirm={handleInjuryConfirm}
            onSkip={handleSkipInjury}
          />
        </div>
      )}

      {showProfile && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfile(false)}
          onSave={handleSaveProfile}
        />
      )}

      {showHistory && (
        <ExerciseHistory onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}

export default App;