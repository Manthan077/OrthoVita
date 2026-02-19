import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI } from '@google/genai';
import { useStore } from '../store/useStore';
import { EXERCISES } from '../utils/exerciseDetectors';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const SessionSummary = () => {
  const { currentExercise, reps, sessionData, sessionStartTime } = useStore();
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  if (!sessionStartTime || sessionData.length === 0) return null;

  const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  const durationStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  const avgAccuracy = sessionData.length > 0
    ? Math.round(sessionData.reduce((sum, d) => sum + d.accuracy, 0) / sessionData.length)
    : 0;

  const chartData = sessionData.map((d) => ({ rep: d.rep, accuracy: d.accuracy }));

  const grade = avgAccuracy >= 90 ? { label: 'Excellent', color: '#00ff9d' }
    : avgAccuracy >= 75 ? { label: 'Good', color: '#00e5ff' }
    : avgAccuracy >= 60 ? { label: 'Fair', color: '#ff6b35' }
    : { label: 'Keep Practicing', color: '#ff3366' };

  const getAIAnalysis = async () => {
    if (aiAnalysis || loadingAI) return;
    setLoadingAI(true);
    try {
      const chat = ai.chats.create({
        model: 'gemini-2.0-flash-exp',
        config: { temperature: 0.7, maxOutputTokens: 300 },
      });
      const prompt = `You are a physiotherapy expert. Analyze this rehabilitation session and provide actionable feedback.

Session Data:
- Exercise: ${EXERCISES[currentExercise]?.name}
- Total Reps: ${reps}
- Average Accuracy: ${avgAccuracy}%
- Duration: ${durationStr}

Provide exactly 3 bullet points:
• Performance assessment (1 sentence)
• Specific improvement tip (1 sentence)
• Next step recommendation (1 sentence)

Be encouraging and specific.`;
      const response = await chat.sendMessage({ message: prompt });
      const text = response.text || 'Analysis complete. Keep up the good work!';
      setAiAnalysis(text);
    } catch (err) {
      console.error('AI analysis error:', err);
      setAiAnalysis(`Great session! You completed ${reps} reps with ${avgAccuracy}% accuracy. Keep practicing to improve your form and increase reps gradually.`);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="mt-8 bg-[#0d1526] border border-[#1c2e50] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-[#e8f0ff]" style={{ fontFamily: "'Syne', sans-serif" }}>
          Session Summary
        </h2>
        <span
          className="text-sm font-bold px-3 py-1 rounded-lg border"
          style={{ color: grade.color, borderColor: `${grade.color}40`, background: `${grade.color}10` }}
        >
          {grade.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#060b14] border border-[#1c2e50] rounded-xl p-4 text-center">
          <div className="text-xs text-[#4a5e80] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            EXERCISE
          </div>
          <div className="text-base font-bold text-[#00e5ff]">
            {EXERCISES[currentExercise]?.name || '—'}
          </div>
        </div>
        <div className="bg-[#060b14] border border-[#1c2e50] rounded-xl p-4 text-center">
          <div className="text-xs text-[#4a5e80] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            TOTAL REPS
          </div>
          <div className="text-2xl font-black text-[#e8f0ff]" style={{ fontFamily: "'Syne', sans-serif" }}>
            {reps}
          </div>
        </div>
        <div className="bg-[#060b14] border border-[#1c2e50] rounded-xl p-4 text-center">
          <div className="text-xs text-[#4a5e80] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            AVG ACCURACY
          </div>
          <div className="text-2xl font-black" style={{ fontFamily: "'Syne', sans-serif", color: grade.color }}>
            {avgAccuracy}%
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-[#060b14] border border-[#00e5ff]/20 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <span className="text-sm font-bold text-[#00e5ff]" style={{ fontFamily: "'Syne', sans-serif" }}>
              AI Analysis
            </span>
          </div>
          {!aiAnalysis && !loadingAI && (
            <button
              onClick={getAIAnalysis}
              className="text-xs px-3 py-1 bg-[#00e5ff] text-[#060b14] rounded-lg font-bold
                hover:bg-[#00ccee] transition-all"
            >
              Analyze
            </button>
          )}
        </div>
        {loadingAI && (
          <div className="flex items-center gap-2 text-[#4a5e80] text-sm">
            <div className="w-4 h-4 border-2 border-[#1c2e50] border-t-[#00e5ff] rounded-full animate-spin" />
            Analyzing your performance...
          </div>
        )}
        {aiAnalysis && (
          <div className="text-sm text-[#c8d8f0] whitespace-pre-wrap leading-relaxed">
            {aiAnalysis}
          </div>
        )}
        {!aiAnalysis && !loadingAI && (
          <p className="text-sm text-[#4a5e80]">Click "Analyze" for personalized AI recommendations</p>
        )}
      </div>

      {chartData.length > 1 && (
        <div className="bg-[#060b14] border border-[#1c2e50] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#00e5ff] mb-4 flex items-center gap-2"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <span className="w-1 h-4 bg-[#00e5ff] rounded-full" />
            ACCURACY PER REP
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#00ff9d" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2e50" vertical={false} />
              <XAxis
                dataKey="rep"
                stroke="#2d3f5c"
                tick={{ fill: '#6b7fa8', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                label={{ value: 'Rep Number', position: 'insideBottom', offset: -5, fill: '#4a5e80', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#2d3f5c' }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#2d3f5c"
                tick={{ fill: '#6b7fa8', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: '#4a5e80', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#2d3f5c' }}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(6, 11, 20, 0.95)',
                  border: '1px solid #00e5ff',
                  borderRadius: 12,
                  color: '#e8f0ff',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 13,
                  padding: '8px 12px',
                  boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)'
                }}
                formatter={(v) => [`${v}%`, 'Accuracy']}
                labelFormatter={(v) => `Rep ${v}`}
                cursor={{ stroke: '#00e5ff', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: '#00e5ff', r: 4, strokeWidth: 2, stroke: '#060b14' }}
                activeDot={{ r: 6, fill: '#00ff9d', stroke: '#060b14', strokeWidth: 2 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00e5ff]" />
              <span className="text-[#6b7fa8]">Accuracy Trend</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00ff9d]" />
              <span className="text-[#6b7fa8]">Target: 80%+</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};