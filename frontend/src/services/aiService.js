import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const aiService = {
  async getGreeting(userName, rehabDay, lastSessionSummary) {
    try {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { temperature: 0.8, maxOutputTokens: 100 },
      });
      const prompt = `User: ${userName}, Rehab Day: ${rehabDay}, Last Session: ${lastSessionSummary || 'First session'}. Generate a warm, motivational greeting (2 sentences max).`;
      const response = await chat.sendMessage({ message: prompt });
      return { greetingMessage: response.text };
    } catch (err) {
      return { greetingMessage: `Welcome back ${userName}. Let's continue your recovery journey today.` };
    }
  },

  async confirmInjury(injuryDescription) {
    try {
      const chat = ai.chats.create({
        model: 'gemini-2.0-flash-exp',
        config: { temperature: 0.3, maxOutputTokens: 200 },
      });
      const prompt = `Injury: "${injuryDescription}". Return JSON: {suspectedInjury: string, confirmationQuestions: [string, string]}. Support: knee pain, lower back pain, shoulder pain, hip pain, ankle pain, wrist pain, elbow pain.`;
      const response = await chat.sendMessage({ message: prompt });
      return JSON.parse(response.text.replace(/```json|```/g, '').trim());
    } catch (err) {
      return {
        suspectedInjury: 'General musculoskeletal pain',
        confirmationQuestions: ['Is the pain constant or intermittent?', 'Does movement worsen the pain?']
      };
    }
  },

  async getExerciseRecommendations(injury, answers) {
    const lower = injury.toLowerCase();
    console.log('Analyzing injury:', injury);
    
    let recommendations = [];
    
    // Check for known injury patterns first
    if (lower.includes('knee')) {
      recommendations = ['bicepCurl', 'shoulderPress', 'lateralRaise', 'armCircle'];
      console.log('Knee injury - upper body only');
    }
    else if (lower.includes('shoulder')) {
      recommendations = ['squat', 'lunge', 'calfRaise', 'kneeRaise'];
      console.log('Shoulder injury - lower body only');
    }
    else if (lower.includes('back') || lower.includes('spine') || lower.includes('lumbar')) {
      recommendations = ['bicepCurl', 'shoulderPress', 'lateralRaise', 'armCircle', 'calfRaise'];
      console.log('Back injury - no bending');
    }
    else if (lower.includes('ankle') || lower.includes('foot') || lower.includes('achilles')) {
      recommendations = ['bicepCurl', 'shoulderPress', 'lateralRaise', 'armCircle'];
      console.log('Ankle/foot injury - seated only');
    }
    else if (lower.includes('hip') || lower.includes('pelvis')) {
      recommendations = ['bicepCurl', 'shoulderPress', 'lateralRaise', 'armCircle', 'calfRaise'];
      console.log('Hip injury - no hip movement');
    }
    else if (lower.includes('elbow') || lower.includes('forearm')) {
      recommendations = ['squat', 'lunge', 'calfRaise', 'kneeRaise', 'lateralRaise'];
      console.log('Elbow injury - no elbow bending');
    }
    else if (lower.includes('wrist') || lower.includes('hand')) {
      recommendations = ['squat', 'lunge', 'calfRaise', 'kneeRaise', 'lateralRaise'];
      console.log('Wrist injury - no wrist load');
    }
    else {
      // Unknown injury - use AI
      console.log('Unknown injury type - asking AI...');
      try {
        const chat = ai.chats.create({
          model: 'gemini-2.0-flash-exp',
          config: { temperature: 0.2, maxOutputTokens: 150 },
        });
        const prompt = `Patient injury: "${injury}". Symptoms: ${answers.join(', ')}.

Available exercises:
- squat (standing, knee/hip bending)
- lunge (standing, deep knee bending)
- calfRaise (standing on toes)
- bicepCurl (arm, can sit)
- shoulderPress (shoulder, can sit)
- lateralRaise (shoulder, can sit)
- armCircle (shoulder, can sit)
- kneeRaise (standing, lifting knee)

Return ONLY safe exercises as JSON array:
{"exercises": ["name1", "name2"]}

Be conservative.`;
        
        const response = await chat.sendMessage({ message: prompt });
        const text = response.text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(text);
        recommendations = result.exercises || result.recommendedExercises || [];
        console.log('AI recommended:', recommendations);
      } catch (err) {
        console.error('AI failed:', err);
        // Safe default for unknown injuries
        recommendations = ['bicepCurl', 'shoulderPress', 'lateralRaise', 'armCircle'];
        console.log('Using safe default - upper body only');
      }
    }
    
    console.log('Final recommendations:', recommendations);
    return recommendations;
  },

  async generateRehabPlan(profile) {
    try {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { temperature: 0.5, maxOutputTokens: 300 },
      });
      const prompt = `Profile: Injury=${profile.injury}, Level=${profile.fitnessLevel}, Goal=${profile.goal}, Age=${profile.age}. Return JSON: {exerciseName, day1Plan: {sets, repsOrDuration, intensityLevel}, progressionStrategy, expectedRecoveryTimeline, dailyDuration, safetyInstructions, keyFocusPoints}`;
      const response = await chat.sendMessage({ message: prompt });
      return JSON.parse(response.text.replace(/```json|```/g, '').trim());
    } catch (err) {
      return {
        exerciseName: 'Squat',
        day1Plan: { sets: 2, repsOrDuration: '8 reps', intensityLevel: 'Light' },
        progressionStrategy: 'Increase by 2 reps every 3 days',
        expectedRecoveryTimeline: '4-6 weeks',
        dailyDuration: '10-15 minutes',
        safetyInstructions: 'Stop if sharp pain occurs',
        keyFocusPoints: 'Maintain proper form'
      };
    }
  },

  async getPreExerciseBriefing(exerciseName) {
    try {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { temperature: 0.7, maxOutputTokens: 120 },
      });
      const prompt = `Exercise: ${exerciseName}. Generate motivational + safety briefing (3 sentences). Mention: proper shoes, comfortable clothes, spacious area, stop if sharp pain.`;
      const response = await chat.sendMessage({ message: prompt });
      return response.text;
    } catch (err) {
      return 'Ensure you have proper footwear and comfortable clothing. Make sure you have enough space around you. Stop immediately if you feel sharp pain.';
    }
  },

  async analyzeSession(sessionMetrics, lastSessions, difficultyFeedback) {
    try {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { temperature: 0.6, maxOutputTokens: 250 },
      });
      const prompt = `Current: ${JSON.stringify(sessionMetrics)}. Last 3: ${JSON.stringify(lastSessions)}. Difficulty: ${difficultyFeedback}. Return JSON: {performanceRating, improvementTrend, plateauDetected, nextSessionAdjustment, motivationMessage, shortVoiceSummary}`;
      const response = await chat.sendMessage({ message: prompt });
      return JSON.parse(response.text.replace(/```json|```/g, '').trim());
    } catch (err) {
      return {
        performanceRating: 'Good',
        improvementTrend: 'Steady progress',
        plateauDetected: false,
        nextSessionAdjustment: 'Continue current level',
        motivationMessage: 'Great work! Keep it up.',
        shortVoiceSummary: 'Good session. Keep practicing.'
      };
    }
  },

  async getAdaptivePlan(sessionHistory, difficultyRating, currentPlan) {
    try {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { temperature: 0.5, maxOutputTokens: 200 },
      });
      const prompt = `History: ${JSON.stringify(sessionHistory)}. Difficulty: ${difficultyRating}/5. Current: ${JSON.stringify(currentPlan)}. Decide: increase intensity, reduce reps, add hold time, or maintain? Return updated plan JSON.`;
      const response = await chat.sendMessage({ message: prompt });
      return JSON.parse(response.text.replace(/```json|```/g, '').trim());
    } catch (err) {
      return currentPlan;
    }
  },

  async getNutritionAdvice(injury, effortLevel, recoveryStage) {
    try {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { temperature: 0.6, maxOutputTokens: 200 },
      });
      const prompt = `Injury: ${injury}, Effort: ${effortLevel}, Stage: ${recoveryStage}. Return JSON: {foodsToEat: [string], foodsToAvoid: [string], hydrationAdvice: string, shortVoiceTip: string}`;
      const response = await chat.sendMessage({ message: prompt });
      return JSON.parse(response.text.replace(/```json|```/g, '').trim());
    } catch (err) {
      return {
        foodsToEat: ['Protein-rich foods', 'Leafy greens', 'Berries'],
        foodsToAvoid: ['Processed foods', 'Excess sugar'],
        hydrationAdvice: 'Drink 8-10 glasses of water daily',
        shortVoiceTip: 'Stay hydrated and eat protein-rich foods for recovery.'
      };
    }
  }
};
