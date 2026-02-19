import { useState, useEffect } from 'react';
import { WebcamFeed } from './components/WebcamFeed';
import { ExerciseSelector } from './components/ExerciseSelector';
import { StatsPanel } from './components/StatsPanel';
import { ControlButtons } from './components/ControlButtons';
import { SessionSummary } from './components/SessionSummary';
import { LandingPage } from './components/LandingPage';
import { GeminiChatbot } from './components/GeminiChatbot';
import { AIGreeting } from './components/AIGreeting';
import { InjuryConfirmation } from './components/InjuryConfirmation';
import { PreExerciseBriefing } from './components/PreExerciseBriefing';
import { NutritionAdvice } from './components/NutritionAdvice';
import { useStore } from './store/useStore';
import { EXERCISES } from './utils/exerciseDetectors';

function App() {
  const { user, setUser, rehabDay, confirmedInjury, setInjury, currentExercise, isActive } = useStore();
  const [flow, setFlow] = useState('landing');
  const [showBriefing, setShowBriefing] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);

  useEffect(() => {
    if (!user) {
      setFlow('landing');
    } else if (!confirmedInjury) {
      setFlow('injury');
    } else {
      setFlow('dashboard');
    }
  }, [user, confirmedInjury]);

  const handleAuth = (userData) => {
    setUser(userData);
    setFlow('greeting');
  };

  const handleInjuryConfirm = (injuryData) => {
    setInjury(injuryData.injury);
    setFlow('dashboard');
  };

  if (flow === 'landing') {
    return <LandingPage onAuth={handleAuth} />;
  }

  if (flow === 'greeting') {
    return <AIGreeting user={user} rehabDay={rehabDay} onContinue={() => setFlow('injury')} />;
  }

  if (flow === 'injury') {
    return <InjuryConfirmation onConfirm={handleInjuryConfirm} />;
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Ortho<span className="text-[#00e5ff]">Vita</span>
            </h1>
            <p className="text-[#4a5e80] text-sm mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              AI-POWERED REHABILITATION • DAY {rehabDay}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNutrition(true)}
              className="text-sm border border-[#1c2e50] text-[#00e5ff] px-4 py-2 rounded-xl
                hover:border-[#00e5ff]/50 hover:bg-[#00e5ff]/5 transition-all duration-200"
            >
              🥗 Nutrition
            </button>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#e8f0ff]">👋 {user.name}</p>
              <p className="text-xs text-[#4a5e80]">{confirmedInjury}</p>
            </div>
            <button
              onClick={() => { 
                setUser(null); 
                setInjury(null);
                setFlow('landing');
              }}
              className="text-sm border border-[#1c2e50] text-[#4a5e80] px-4 py-2 rounded-xl
                hover:border-red-500/50 hover:text-red-400 transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Setup Guide ── */}
        <div className="bg-[#0d1526] border border-[#00e5ff]/10 border-l-2 border-l-[#00e5ff] p-4 mb-6 rounded-xl">
          <p className="font-semibold text-[#00e5ff] text-sm mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            📹 SETUP GUIDE
          </p>
          <p className="text-[#6b7fa8] text-sm">
            Stand 6–8 feet from camera &bull; Ensure full body is visible &bull; Good lighting required
          </p>
        </div>

        {/* ── Exercise Selection ── */}
        <ExerciseSelector />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Webcam Feed */}
          <div className="lg:col-span-2">
            <WebcamFeed />
            <div className="mt-4">
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
    </div>
  );
}

export default App;