import { useState } from 'react';
import { signUp, login } from '../utils/auth';

const FEATURES = [
  {
    icon: '🎯',
    title: 'AI Pose Detection',
    desc: 'MediaPipe tracks 33 body landmarks in real-time to ensure perfect form on every rep.',
  },
  {
    icon: '📊',
    title: 'Live Form Scoring',
    desc: 'Instant accuracy feedback and rep counting so you never waste a session.',
  },
  {
    icon: '🔊',
    title: 'Voice Coaching',
    desc: 'Hands-free audio cues guide you through every movement without looking at the screen.',
  },
  {
    icon: '📈',
    title: 'Session Reports',
    desc: 'Per-rep score charts help you track rehabilitation progress over time.',
  },
  {
    icon: '🦴',
    title: 'Multi-Exercise Support',
    desc: 'Squats, Bicep Curls, Knee Raises, Shoulder Press — all with guided feedback.',
  },
  {
    icon: '⚡',
    title: 'Zero Install',
    desc: 'Runs entirely in your browser. No app, no backend, no account required to try.',
  },
];

export function LandingPage({ onAuth }) {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('login');

  function openLogin()  { setModalMode('login');  setShowModal(true); }
  function openSignup() { setModalMode('signup'); setShowModal(true); }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 h-16
                      bg-[#0d1117]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <img src="/OrthoVita.png" alt="OrthoVita Logo" className="h-12 w-auto object-contain rounded-lg" />
          <span className="text-3xl font-bold tracking-tight">
            Ortho<span className="text-cyan-400">Vita</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openLogin}
            className="text-sm font-medium text-gray-400 border border-white/10 px-4 py-2
                       rounded-lg hover:text-white hover:border-white/25 transition-all"
          >
            Sign In
          </button>
          <button
            onClick={openSignup}
            className="text-sm font-semibold bg-cyan-400 text-gray-950 px-4 py-2
                       rounded-lg hover:bg-cyan-300 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-20">

        {/* Eyebrow badge */}
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold
                        tracking-widest uppercase border border-cyan-400/25 bg-cyan-400/5
                        px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          AI-Powered · Real-Time · Browser-Native
        </div>

        {/* Headline — clean, proportionate, like MediRoute */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight
                       leading-tight text-white max-w-3xl mb-5">
          Smart Rehabilitation &{' '}
          <span className="text-cyan-400">AI Physical Therapy</span>
        </h1>

        {/* Sub */}
        <p className="text-gray-400 text-base sm:text-lg max-w-xl leading-relaxed mb-10">
          Real-time pose tracking with intelligent form correction.
          Recover faster by getting guided through every rep — no clinician required.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <button
            onClick={openSignup}
            className="bg-cyan-400 text-gray-950 font-semibold text-sm px-6 py-3
                       rounded-xl hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-400/20"
          >
            Get Started Free
          </button>
          <button
            onClick={openLogin}
            className="border border-white/15 text-white font-medium text-sm px-6 py-3
                       rounded-xl hover:bg-white/5 transition-all"
          >
            Sign In
          </button>
        </div>

        {/* Stats strip */}
        <div className="flex divide-x divide-white/[0.07] border border-white/[0.07]
                        rounded-2xl overflow-hidden bg-white/[0.02] w-full max-w-lg">
          {[
            { val: '9',    label: 'Exercises'  },
            { val: '33',   label: 'Landmarks'  },
            { val: '100%', label: 'Browser'    },
            { val: '0ms',  label: 'Latency'    },
          ].map(({ val, label }) => (
            <div key={label} className="flex-1 py-4 text-center">
              <div className="text-cyan-400 text-xl font-bold">{val}</div>
              <div className="text-gray-500 text-xs mt-0.5 uppercase tracking-wide font-medium">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* divider */}
      <div className="h-px mx-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Why OrthoVita
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Everything you need to recover right
          </h2>
          <p className="text-gray-400 text-base mt-3 max-w-md mx-auto">
            Built for patients who need consistent, accessible rehabilitation guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6
                         hover:bg-white/[0.055] hover:border-white/[0.12] transition-all"
            >
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* divider */}
      <div className="h-px mx-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Start your session in 3 steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: '01',
              title: 'Choose an exercise',
              desc:  'Select from squats, bicep curls, knee raises, or shoulder press.',
            },
            {
              step: '02',
              title: 'Allow camera access',
              desc:  'Stand 6–8 feet away, full body in frame, good lighting.',
            },
            {
              step: '03',
              title: 'Get real-time feedback',
              desc:  'AI tracks your pose and coaches every rep with voice and visual cues.',
            },
          ].map((s) => (
            <div
              key={s.step}
              className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-7"
            >
              <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
                Step {s.step}
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="max-w-6xl mx-auto px-8 pb-20">
        <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-2xl px-8 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Ready to start your rehabilitation?
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            No downloads. No clinic visits. Just open your browser and begin.
          </p>
          <button
            onClick={openSignup}
            className="bg-cyan-400 text-gray-950 font-semibold text-sm px-8 py-3.5
                       rounded-xl hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-400/20"
          >
            Create Free Account →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] px-8 py-6 flex items-center
                         justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <img src="/OrthoVita.png" alt="OrthoVita Logo" className="h-6 w-auto object-contain rounded-md" />
          <span className="text-sm font-semibold">
            Ortho<span className="text-cyan-400">Vita</span>
          </span>
        </div>
        <span className="text-gray-600 text-xs">
          MediaPipe · React + Vite · Web Speech API · Zero Backend
        </span>
      </footer>

      {/* ── AUTH MODAL ── */}
      {showModal && (
        <AuthModal
          mode={modalMode}
          onSwitchMode={setModalMode}
          onClose={() => setShowModal(false)}
          onAuth={onAuth}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────
   AUTH MODAL (pure Tailwind)
───────────────────────────────── */
function AuthModal({ mode, onSwitchMode, onClose, onAuth }) {
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const isLogin               = mode === 'login';

  function update(field, val) { setForm((f) => ({ ...f, [field]: val })); setError(''); }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      let result;
      
      if (isLogin) {
        result = login(form.email, form.password);
      } else {
        result = signUp(form.name, form.email, form.password);
      }

      setLoading(false);

      if (result.success) {
        onAuth(result.user);
      } else {
        setError(result.error);
      }
    }, 400);
  }

  const inputClass = `w-full bg-white/[0.04] border border-white/[0.09] text-white text-sm
    rounded-xl px-4 py-3 outline-none placeholder-gray-600
    focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 transition-all`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/70 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-[#161b27] border border-white/[0.09]
                      rounded-2xl p-8 relative shadow-2xl">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 text-sm
                     w-8 h-8 flex items-center justify-center rounded-lg
                     hover:bg-white/[0.07] transition-all"
        >
          ✕
        </button>

        {/* Heading */}
        <h2 className="text-xl font-bold text-white mb-1">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-gray-400 text-sm mb-7">
          {isLogin
            ? 'Sign in to continue your rehab journey.'
            : 'Start your AI-guided rehabilitation today.'}
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="Alex Johnson"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className={inputClass}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs
                            rounded-xl px-4 py-3">
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-400 text-gray-950 font-semibold text-sm py-3
                       rounded-xl hover:bg-cyan-300 transition-all mt-1
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? (isLogin ? 'Signing in...' : 'Creating account...')
              : (isLogin ? 'Sign In →' : 'Create Account →')}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => onSwitchMode(isLogin ? 'signup' : 'login')}
            className="text-cyan-400 hover:text-cyan-300 font-medium underline
                       underline-offset-2 transition-colors"
          >
            {isLogin ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}