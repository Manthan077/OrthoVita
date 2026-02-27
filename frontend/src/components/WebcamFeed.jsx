import { useEffect, useRef, useState, useCallback } from 'react';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { useHandDetection } from '../hooks/useHandDetection';
import { useVoiceCoach } from '../hooks/useVoiceCoach';
import { drawSkeleton, drawHandSkeleton } from '../utils/poseUtils';
import { EXERCISES } from '../utils/exerciseDetectors';
import { validateSafety, SAFETY_RULES } from '../utils/safetyRules';
import { useStore } from '../store/useStore';

export const WebcamFeed = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);          // keep stream in ref so cleanup always works
  const exerciseStateRef = useRef({});

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [safetyStatus, setSafetyStatus] = useState(null);

  const { currentExercise, isActive, updateStats, stopSession, reps } = useStore();
  const { speak, enabled: voiceEnabled, language, toggle: toggleVoice, toggleLanguage, isSpeaking } = useVoiceCoach();
  const lastRepSpoken = useRef(0);
  const prevAngle = useRef(0);
  const lastFeedbackMessage = useRef('');
  const lastFeedbackTime = useRef(0);

  // ── Pose detection callback ────────────────────────────────────────────────
  const onPoseResults = useCallback((landmarks) => {
    if (!isActive || !currentExercise || EXERCISES[currentExercise]?.usesHands) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const detector = EXERCISES[currentExercise]?.detector;
    if (detector) {
      const result = detector(landmarks, exerciseStateRef.current);
      exerciseStateRef.current = result;
      updateStats(result.reps, result.accuracy, result.feedback, result.angle);
      
      drawSkeleton(ctx, landmarks, canvas.width, canvas.height, result);

      // Safety validation with angle tracking
      if (result.angle !== undefined) {
        const safety = validateSafety(currentExercise, result.angle, prevAngle.current);
        setSafetyStatus(safety);
        
        // Voice feedback with heavy throttling (20 seconds minimum)
        const now = Date.now();
        if (safety.voice && 
            (safety.voice !== lastFeedbackMessage.current || now - lastFeedbackTime.current > 20000)) {
          if (!isSpeaking()) {
            speak(safety.voice, safety.priority || false);
            lastFeedbackMessage.current = safety.voice;
            lastFeedbackTime.current = now;
          }
        }
        prevAngle.current = result.angle;
      }

      // Rep milestone voice (every 5 reps)
      if (result.reps > 0 && result.reps % 5 === 0 && result.reps !== lastRepSpoken.current) {
        speak(`${result.reps} reps done. Great work.`, true);
        lastRepSpoken.current = result.reps;
      }

      // First rep encouragement
      if (result.reps === 1 && lastRepSpoken.current === 0) {
        speak('First rep complete. Keep going.', true);
        lastRepSpoken.current = 1;
      }
    } else {
      drawSkeleton(ctx, landmarks, canvas.width, canvas.height);
    }
  }, [isActive, currentExercise, updateStats, speak]);

  // ── Hand detection callback ────────────────────────────────────────────────
  const onHandResults = useCallback((handLandmarks) => {
    if (!isActive || !currentExercise || !EXERCISES[currentExercise]?.usesHands) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const detector = EXERCISES[currentExercise]?.detector;
    if (detector) {
      const result = detector(handLandmarks, exerciseStateRef.current);
      exerciseStateRef.current = result;
      updateStats(result.reps, result.accuracy, result.feedback, result.angle);
      
      drawHandSkeleton(ctx, handLandmarks, canvas.width, canvas.height, result);

      if (result.reps > 0 && result.reps % 5 === 0 && result.reps !== lastRepSpoken.current) {
        speak(`${result.reps} reps done. Great work.`, true);
        lastRepSpoken.current = result.reps;
      }

      if (result.reps === 1 && lastRepSpoken.current === 0) {
        speak('First rep complete. Keep going.', true);
        lastRepSpoken.current = 1;
      }
    } else {
      drawHandSkeleton(ctx, handLandmarks, canvas.width, canvas.height);
    }
  }, [isActive, currentExercise, updateStats, speak]);

  const { isReady, error: poseError, startDetection, stopDetection } = usePoseDetection(onPoseResults);
  const { isReady: isHandReady, error: handError, startDetection: startHandDetection, stopDetection: stopHandDetection } = useHandDetection(onHandResults);

  // ── Start camera ───────────────────────────────────────────────────────────
  const startCamera = async () => {
    setCameraError(null);
    setVideoReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true); // render video element first, THEN assign srcObject in effect below
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Click the camera icon in your browser address bar and allow access.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found. Please connect a webcam.');
      } else {
        setCameraError(`Camera error: ${err.message}`);
      }
    }
  };

  // ── Assign stream to video element once it's mounted ──────────────────────
  // This effect runs when cameraOpen becomes true (video element now in DOM)
  useEffect(() => {
    if (!cameraOpen || !streamRef.current) return;
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = streamRef.current;
    // playsInline + muted are required for autoplay in Chrome
    video.muted = true;
    video.playsInline = true;

    const onPlaying = () => {
      setVideoReady(true);
      // Set canvas dimensions once video is actually rendering frames
      if (canvasRef.current) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
      }
    };

    video.addEventListener('playing', onPlaying);
    video.play().catch(err => {
      console.error('video.play() failed:', err);
      setCameraError('Could not start video. Try refreshing the page.');
    });

    return () => {
      video.removeEventListener('playing', onPlaying);
    };
  }, [cameraOpen]);

  // ── Stop camera ────────────────────────────────────────────────────────────
  const stopCamera = () => {
    stopDetection();
    stopHandDetection();
    if (isActive) stopSession();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setCameraOpen(false);
    setVideoReady(false);
  };

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopDetection();
      stopHandDetection();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // ── Reset exercise state when exercise changes ─────────────────────────────
  useEffect(() => {
    exerciseStateRef.current = {};
    lastRepSpoken.current = 0;
    prevAngle.current = 0;
    lastFeedbackMessage.current = '';
    lastFeedbackTime.current = 0;
    setSafetyStatus(null);
  }, [currentExercise]);

  // ── Start/stop detection when session state changes ───────────────────
  useEffect(() => {
    const usesHands = EXERCISES[currentExercise]?.usesHands;
    
    if (videoReady && isActive && cameraOpen) {
      if (usesHands && isHandReady) {
        startHandDetection(videoRef.current);
      } else if (!usesHands && isReady) {
        startDetection(videoRef.current);
      }
    } else {
      stopDetection();
      stopHandDetection();
    }
  }, [isReady, isHandReady, videoReady, isActive, cameraOpen, currentExercise]);

  // ── Camera closed view ─────────────────────────────────────────────────────
  if (!cameraOpen) {
    return (
      <div className="relative w-full mx-auto">
        <div className="w-full bg-[#0d1526] border border-[#1c2e50] rounded-2xl
          flex flex-col items-center justify-center gap-4 sm:gap-5 py-12 sm:py-16 relative overflow-hidden">

          {/* Corner brackets */}
          {[['top-4 left-4','border-t-2 border-l-2'],['top-4 right-4','border-t-2 border-r-2'],
            ['bottom-4 left-4','border-b-2 border-l-2'],['bottom-4 right-4','border-b-2 border-r-2']
          ].map(([pos, border]) => (
            <div key={pos} className={`absolute ${pos} w-6 sm:w-8 h-6 sm:h-8 ${border} border-[#00e5ff]/20`} />
          ))}

          <div className="text-4xl sm:text-5xl opacity-20">📷</div>
          <div className="text-center px-4">
            <p className="text-[#4a5e80] text-xs sm:text-sm mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              CAMERA IS OFF
            </p>
            <p className="text-[#2d3f5c] text-xs">Select an exercise, then open camera</p>
          </div>

          {cameraError && (
            <div className="mx-4 sm:mx-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs sm:text-sm text-center">
              {cameraError}
            </div>
          )}

          <button
            onClick={startCamera}
            className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#00e5ff] text-[#060b14] rounded-xl font-bold text-sm
              hover:bg-[#00ccee] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]
              transition-all duration-200 active:scale-95"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Open Camera
          </button>
        </div>
      </div>
    );
  }

  // ── Camera open view ───────────────────────────────────────────────────────
  return (
    <div className="relative w-full mx-auto">

      {/* ✕ Close button */}
      <button
        onClick={stopCamera}
        title="Close Camera"
        className="absolute top-2 sm:top-3 right-2 sm:right-3 z-30 w-8 sm:w-9 h-8 sm:h-9 bg-[#060b14]/90 border border-[#1c2e50]
          text-[#4a5e80] rounded-xl flex items-center justify-center text-sm
          hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400
          transition-all duration-200 backdrop-blur-sm"
      >
        ✕
      </button>

      {/* LIVE badge */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-30 flex items-center gap-1.5 sm:gap-2
        bg-[#060b14]/80 border border-[#1c2e50] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg backdrop-blur-sm">
        <span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${isActive ? 'bg-[#00ff9d] animate-pulse' : 'bg-[#4a5e80]'}`} />
        <span className="text-[10px] sm:text-xs" style={{ fontFamily: "'JetBrains Mono', monospace",
          color: isActive ? '#00ff9d' : '#4a5e80' }}>
          {isActive ? 'TRACKING' : 'LIVE'}
        </span>
      </div>

      {/* Voice toggle */}
      <button
        onClick={toggleVoice}
        className="absolute top-2 sm:top-3 right-11 sm:right-14 z-30 w-8 sm:w-9 h-8 sm:h-9 bg-[#060b14]/90 border border-[#1c2e50]
          rounded-xl flex items-center justify-center text-xs sm:text-sm backdrop-blur-sm transition-all"
        style={{ color: voiceEnabled ? '#00e5ff' : '#4a5e80' }}
        title={voiceEnabled ? 'Voice ON' : 'Voice OFF'}
      >
        {voiceEnabled ? '🔊' : '🔇'}
      </button>

      {/* Language toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-11 sm:top-14 right-11 sm:right-14 z-30 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#060b14]/90 border border-[#1c2e50]
          rounded-lg text-[10px] sm:text-xs backdrop-blur-sm transition-all font-bold"
        style={{ color: '#00e5ff' }}
        title="Toggle Language"
      >
        {language === 'en-US' ? 'EN' : 'हि'}
      </button>

      {/* Safety status overlay */}
      {safetyStatus && isActive && (
        <div className="absolute top-12 sm:top-16 left-1/2 -translate-x-1/2 z-30
          px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-sm font-bold text-sm sm:text-lg shadow-lg animate-pulse"
          style={{
            backgroundColor: `${safetyStatus.color}20`,
            border: `2px solid ${safetyStatus.color}`,
            color: safetyStatus.color
          }}>
          {safetyStatus.status === 'risk' && '⚠️ '}
          {safetyStatus.status === 'ideal' && '✓ '}
          {safetyStatus.status === 'adjust' && '△ '}
          {safetyStatus.message}
        </div>
      )}

      {/* Feedback overlay for exercises without angle */}
      {isActive && exerciseStateRef.current?.feedback && exerciseStateRef.current?.angle === 0 && !safetyStatus && (
        <div className="absolute top-12 sm:top-16 left-1/2 -translate-x-1/2 z-30
          px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-sm font-bold text-xs sm:text-base shadow-lg"
          style={{
            backgroundColor: 'rgba(0, 229, 255, 0.1)',
            border: '2px solid #00e5ff',
            color: '#00e5ff'
          }}>
          {exerciseStateRef.current.feedback}
        </div>
      )}

      {/* Angle display */}
      {isActive && exerciseStateRef.current?.angle !== undefined && exerciseStateRef.current.angle > 0 && (
        <div className="absolute bottom-12 sm:bottom-16 left-2 sm:left-4 z-30 bg-[#060b14]/90 border border-[#1c2e50]
          rounded-xl p-2 sm:p-3 backdrop-blur-sm">
          <div className="text-[10px] sm:text-xs text-[#4a5e80] mb-0.5 sm:mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            ANGLE
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#00e5ff]" style={{ fontFamily: "'Syne', sans-serif" }}>
            {exerciseStateRef.current.angle}°
          </div>
          {SAFETY_RULES[currentExercise] && (
            <div className="text-[10px] sm:text-xs text-[#4a5e80] mt-0.5 sm:mt-1">
              Target: {SAFETY_RULES[currentExercise].ideal.min}°-{SAFETY_RULES[currentExercise].ideal.max}°
            </div>
          )}
        </div>
      )}

      {/* Corner brackets decoration */}
      {[['top-3 left-3','border-t-2 border-l-2'],['top-3 right-3','border-t-2 border-r-2'],
        ['bottom-3 left-3','border-b-2 border-l-2'],['bottom-3 right-3','border-b-2 border-r-2']
      ].map(([pos, border]) => (
        <div key={pos} className={`absolute ${pos} w-6 sm:w-8 h-6 sm:h-8 ${border} border-[#00e5ff]/40 z-20 pointer-events-none`} />
      ))}

      {/*
        IMPORTANT: video must be visible (not hidden) for the browser to
        decode frames. We keep it in the DOM always once cameraOpen=true.
        mirror with scaleX(-1) so it feels like a selfie camera.
      */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full rounded-2xl border border-[#1c2e50] block bg-[#0d1526]"
        style={{ transform: 'scaleX(-1)', minHeight: '240px' }}
      />

      {/* Canvas overlaid on top — same mirror transform */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full rounded-2xl pointer-events-none"
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Loading overlay — shown until video is actually playing */}
      {!videoReady && (
        <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center
          bg-[#060b14]/80 backdrop-blur-sm z-10 gap-3">
          <div className="w-6 sm:w-8 h-6 sm:h-8 border-2 border-[#1c2e50] border-t-[#00e5ff] rounded-full animate-spin" />
          <p className="text-[#00e5ff] text-xs sm:text-sm animate-pulse" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            STARTING CAMERA...
          </p>
        </div>
      )}

      {/* Pose model loading overlay */}
      {videoReady && !isReady && !isHandReady && (
        <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center
          bg-[#060b14]/70 backdrop-blur-sm z-10 gap-3">
          <div className="w-6 sm:w-8 h-6 sm:h-8 border-2 border-[#1c2e50] border-t-[#00e5ff] rounded-full animate-spin" />
          <p className="text-[#00e5ff] text-xs sm:text-sm animate-pulse" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            LOADING MODEL...
          </p>
        </div>
      )}

      {/* Error */}
      {(poseError || handError) && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-[#060b14]/80 z-10">
          <p className="text-red-400 text-xs sm:text-sm px-4 sm:px-6 text-center">{poseError || handError}</p>
        </div>
      )}
    </div>
  );
};