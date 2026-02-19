import { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export const useHandDetection = (onResults) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const handLandmarkerRef = useRef(null);
  const videoRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const initializeHandDetection = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        setIsReady(true);
      } catch (err) {
        setError(err.message);
        console.error('Failed to initialize hand detection:', err);
      }
    };

    initializeHandDetection();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startDetection = async (videoElement) => {
    if (!handLandmarkerRef.current || !videoElement) return;

    videoRef.current = videoElement;

    const detectHands = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const startTimeMs = performance.now();
        const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
        
        if (results.landmarks && results.landmarks.length > 0) {
          onResults(results.landmarks);
        }
      }
      animationFrameRef.current = requestAnimationFrame(detectHands);
    };

    detectHands();
  };

  const stopDetection = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  return { isReady, error, startDetection, stopDetection };
};
