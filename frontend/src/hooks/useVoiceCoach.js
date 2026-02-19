import { useRef, useState, useCallback } from 'react';

export const useVoiceCoach = () => {
  const [enabled, setEnabled] = useState(true);
  const [language, setLanguage] = useState('en-US'); // 'en-US' or 'hi-IN'
  const lastSpeakTime = useRef(0);
  const lastMessage = useRef('');
  const isSpeaking = useRef(false);

  const speak = useCallback((text, priority = false) => {
    if (!enabled || !text) return;
    
    // Translate to Hindi if needed BEFORE checking for duplicates
    const translatedText = language === 'hi-IN' ? translateToHindi(text) : text;
    
    if (translatedText === lastMessage.current && !priority) return;
    
    const now = Date.now();
    const cooldown = priority ? 5000 : 20000;

    if (now - lastSpeakTime.current < cooldown || isSpeaking.current) {
      return;
    }

    if (window.speechSynthesis.speaking) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = language;

    // Wait for voices to load
    const speakWithVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (language === 'hi-IN') {
        const hindiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'));
        if (hindiVoice) utterance.voice = hindiVoice;
      }

      utterance.onstart = () => {
        isSpeaking.current = true;
        lastSpeakTime.current = now;
        lastMessage.current = translatedText;
      };

      utterance.onend = () => {
        isSpeaking.current = false;
      };

      utterance.onerror = () => {
        isSpeaking.current = false;
      };

      window.speechSynthesis.speak(utterance);
    };

    // Ensure voices are loaded
    if (window.speechSynthesis.getVoices().length > 0) {
      speakWithVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = speakWithVoice;
    }
  }, [enabled, language]);

  const toggle = () => setEnabled(!enabled);
  const toggleLanguage = () => setLanguage(lang => lang === 'en-US' ? 'hi-IN' : 'en-US');
  const stop = () => {
    window.speechSynthesis.cancel();
    isSpeaking.current = false;
  };

  const checkIsSpeaking = () => isSpeaking.current;

  return { speak, enabled, language, toggle, toggleLanguage, stop, isSpeaking: checkIsSpeaking };
};

// Hindi translations for common phrases
const translateToHindi = (text) => {
  const translations = {
    // Squat feedback - NEW
    '✓ Good depth! Stand up': '✓ अच्छी गहराई! खड़े हो जाएं',
    '✓ Rep counted!': '✓ गिना गया!',
    'Squat down': 'स्क्वाट करें',
    'Stand up fully': 'पूरा खड़े हो जाएं',
    
    // Bicep Curl feedback - NEW
    '✓ Good curl! Lower down': '✓ अच्छा कर्ल! नीचे करें',
    'Extend arm fully': 'हाथ पूरा फैलाएं',
    
    // Knee Raise feedback - NEW
    '✓ Good height! Lower leg': '✓ अच्छी ऊंचाई! पैर नीचे करें',
    'Raise your knee': 'घुटना उठाएं',
    'Lower leg completely': 'पैर पूरा नीचे करें',
    
    // Shoulder Press feedback - NEW
    'Press arms overhead': 'हाथ सिर के ऊपर दबाएं',
    'Lower to shoulders': 'कंधों तक नीचे करें',
    
    // Lateral Raise feedback - NEW
    '✓ Good raise! Lower slowly': '✓ अच्छा उठाव! धीरे नीचे करें',
    'Raise arms to sides': 'हाथ बगल में उठाएं',
    'Lower arms down': 'हाथ नीचे करें',
    
    // Lunge feedback - NEW
    '✓ Good lunge! Stand up': '✓ अच्छा लंज! खड़े हो जाएं',
    'Lunge down': 'लंज करें',
    'Stand up': 'खड़े हो जाएं',
    
    // Calf Raise feedback - NEW
    '✓ Good raise! Lower heels': '✓ अच्छा उठाव! एड़ी नीचे करें',
    'Rise on toes': 'पंजों पर उठें',
    'Lower heels': 'एड़ी नीचे करें',
    
    // Squat feedback
    'Stand ready': 'तैयार खड़े रहें',
    '✓ Perfect depth! Now stand up': '✓ बिल्कुल सही गहराई! अब खड़े हो जाएं',
    '✓ Rep counted! Go down again': '✓ गिना गया! फिर से नीचे जाएं',
    '✗ Too deep! Come up slightly (80-100°)': '✗ बहुत गहरा! थोड़ा ऊपर आएं (80-100°)',
    '✗ Go lower! Reach 80-100° angle': '✗ और नीचे जाएं! 80-100° तक पहुंचें',
    'Squat down to 90°': '90° तक स्क्वाट करें',
    
    // Bicep Curl feedback
    'Arm at side': 'हाथ बगल में',
    '✓ Perfect curl! Lower down': '✓ बिल्कुल सही! नीचे करें',
    '✓ Rep counted! Curl again': '✓ गिना गया! फिर से कर्ल करें',
    '✗ Too much curl! Relax slightly': '✗ बहुत ज्यादा कर्ल! थोड़ा ढीला करें',
    '✗ Curl more! Reach 50-70°': '✗ और कर्ल करें! 50-70° तक पहुंचें',
    'Curl arm up': 'हाथ ऊपर कर्ल करें',
    '✗ Extend arm fully (160°+)': '✗ हाथ पूरा फैलाएं (160°+)',
    
    // Knee Raise feedback
    'Stand straight': 'सीधे खड़े रहें',
    '✓ Perfect height! Lower leg': '✓ बिल्कुल सही ऊंचाई! पैर नीचे करें',
    '✗ Too high! Lower slightly': '✗ बहुत ऊंचा! थोड़ा नीचे करें',
    '✗ Raise higher! Reach hip level': '✗ और ऊपर उठाएं! कूल्हे तक पहुंचें',
    'Raise your knee to hip level': 'घुटना कूल्हे तक उठाएं',
    '✗ Lower leg completely': '✗ पैर पूरा नीचे करें',
    
    // Shoulder Press feedback
    'Start position': 'शुरुआती स्थिति',
    '✓ Full extension! Lower down': '✓ पूरा फैलाव! नीचे करें',
    '✗ Press higher! Fully extend arms': '✗ और ऊपर दबाएं! हाथ पूरे फैलाएं',
    '✗ Lower to shoulder level (80-100°)': '✗ कंधे तक नीचे करें (80-100°)',
    'Press arms overhead': 'हाथ सिर के ऊपर दबाएं',
    'Lower to shoulders': 'कंधों तक नीचे करें',
    
    // Old feedback (keeping for compatibility)
    '✓ Good depth! Now stand up': '✓ अच्छी गहराई! अब खड़े हो जाएं',
    '✓ Rep complete! Go down again': '✓ एक पूरा! फिर से नीचे जाएं',
    '△ Go lower (below 100°)': '△ और नीचे जाएं (100° से नीचे)',
    '✗ Too deep - risk of injury': '✗ बहुत गहरा - चोट का खतरा',
    'Squat down': 'स्क्वाट करें',
    'Good curl! Lower down': 'अच्छा कर्ल! नीचे करें',
    'Rep complete! Curl again': 'एक पूरा! फिर से कर्ल करें',
    'Extend arm fully': 'हाथ पूरा फैलाएं',
    'Curl up more': 'और ऊपर कर्ल करें',
    'Good! Lower leg': 'अच्छा! पैर नीचे करें',
    'Rep done! Raise again': 'एक पूरा! फिर से उठाएं',
    'Raise your knee': 'घुटना उठाएं',
    'Lower your leg': 'पैर नीचे करें',
    'Great press! Lower down': 'बढ़िया प्रेस! नीचे करें',
    'Rep complete! Press again': 'एक पूरा! फिर से प्रेस करें',
    'Press arms up': 'हाथ ऊपर दबाएं',
    
    // Lateral Raise feedback
    'Arms at sides': 'हाथ बगल में',
    'Hold! Lower slowly': 'रुकें! धीरे नीचे करें',
    'Rep done! Raise again': 'एक पूरा! फिर से उठाएं',
    
    // Lunge feedback
    'Good lunge! Return up': 'अच्छा लंज! वापस ऊपर आएं',
    'Rep complete! Lunge again': 'एक पूरा! फिर से लंज करें',
    
    // Calf Raise feedback
    'Rise on toes': 'पंजों पर उठें',
    'Hold! Lower heels': 'रुकें! एड़ी नीचे करें',
    'Rep done! Raise again': 'एक पूरा! फिर से उठाएं',
    
    // Arm Circle feedback
    'Make slow circles': 'धीरे-धीरे गोल घुमाएं',
    
    // Safety messages from safetyRules.js
    'Too deep. Come up slightly.': 'बहुत नीचे। थोड़ा ऊपर आएं।',
    'Bend your knees more. Go lower.': 'घुटने और मोड़ें। नीचे जाएं।',
    'Perfect squat depth. Hold it.': 'बिल्कुल सही गहराई। पकड़ें।',
    'Keep your back straight.': 'पीठ सीधी रखें।',
    'Not too deep. Come up.': 'बहुत नीचे नहीं। ऊपर आएं।',
    'Lower your back knee more.': 'पिछला घुटना और नीचे करें।',
    'Great lunge form. Hold steady.': 'बढ़िया लंज। स्थिर रहें।',
    'Keep torso upright.': 'धड़ सीधा रखें।',
    'Curl up more. Bring weight to shoulder.': 'और ऊपर कर्ल करें। कंधे तक लाएं।',
    'Lower your arm. Extend fully.': 'हाथ नीचे करें। पूरा फैलाएं।',
    'Perfect curl. Squeeze at the top.': 'बिल्कुल सही। ऊपर दबाएं।',
    'Keep elbow stable. Don\'t swing.': 'कोहनी स्थिर रखें। झूलें नहीं।',
    'Slow and controlled movement.': 'धीरे और नियंत्रित गति।',
    'Press arms up higher. Full extension.': 'हाथ और ऊपर दबाएं। पूरा फैलाएं।',
    'Lower to shoulder level.': 'कंधे के स्तर तक नीचे करें।',
    'Perfect press. Arms fully extended.': 'बिल्कुल सही। हाथ पूरे फैले।',
    'Engage your core. Don\'t arch back.': 'पेट कसें। पीठ मोड़ें नहीं।',
    'Breathe out as you press up.': 'ऊपर दबाते समय सांस छोड़ें।',
    'Raise arms higher. To shoulder level.': 'हाथ और ऊपर उठाएं। कंधे तक।',
    'Lower slightly. Don\'t go above shoulders.': 'थोड़ा नीचे करें। कंधे से ऊपर नहीं।',
    'Perfect height. Arms parallel to floor.': 'सही ऊंचाई। हाथ जमीन के समानांतर।',
    'Slow down. Control the movement.': 'धीरे करें। गति नियंत्रित करें।',
    'Keep arms slightly bent.': 'हाथ थोड़े मुड़े रखें।',
    'Lift knee higher. To hip level.': 'घुटना और ऊपर उठाएं। कूल्हे तक।',
    'Lower your knee slightly.': 'घुटना थोड़ा नीचे करें।',
    'Perfect knee height. Hold balance.': 'सही ऊंचाई। संतुलन बनाएं।',
    'Focus on balance. Engage core.': 'संतुलन पर ध्यान दें। पेट कसें।',
    'Stand tall. Don\'t lean back.': 'सीधे खड़े रहें। पीछे झुकें नहीं।',
    'Rise higher on your toes.': 'पंजों पर और ऊपर उठें।',
    'Good height. Hold at the top.': 'अच्छी ऊंचाई। ऊपर रुकें।',
    'Perfect calf raise. Squeeze at top.': 'बिल्कुल सही। ऊपर दबाएं।',
    'Keep your balance. Use wall if needed.': 'संतुलन बनाएं। जरूरत हो तो दीवार का सहारा लें।',
    'Slow descent. Control the movement.': 'धीरे नीचे आएं। गति नियंत्रित करें।',
    'Make bigger circles. Full range.': 'बड़े गोले बनाएं। पूरी रेंज।',
    'Good range of motion.': 'अच्छी गति रेंज।',
    'Perfect circles. Keep arms straight.': 'बिल्कुल सही गोले। हाथ सीधे रखें।',
    'Slow and smooth circles.': 'धीरे और सुचारू गोले।',
    'Keep arms extended. Don\'t bend elbows.': 'हाथ फैले रखें। कोहनी मोड़ें नहीं।',
    'Shift weight to your left leg.': 'वजन बाएं पैर पर डालें।',
    'Shift weight to your right leg.': 'वजन दाएं पैर पर डालें।',
    'Balance on your left side.': 'बाईं ओर संतुलन बनाएं।',
    'Balance on your right side.': 'दाईं ओर संतुलन बनाएं।',
    'Adjust slightly. Keep your posture aligned.': 'थोड़ा समायोजित करें। मुद्रा सीधी रखें।',
    'Adjust your depth.': 'गहराई समायोजित करें।',
    'Adjust your knee angle.': 'घुटने का कोण समायोजित करें।',
    'Adjust your arm angle.': 'हाथ का कोण समायोजित करें।',
    
    // Rep milestones
    'First rep complete. Keep going.': 'पहला पूरा हुआ। जारी रखें।',
    'Great work.': 'बहुत बढ़िया।',
    'Keep going.': 'जारी रखें।',
  };

  // Check for rep count messages (e.g., "5 reps done. Great work.")
  const repMatch = text.match(/(\d+) reps? (done|completed)\.? ?(.*)/);
  if (repMatch) {
    const count = repMatch[1];
    return `${count} बार पूरे हुए। बहुत बढ़िया।`;
  }

  // Return translated text or original if not found
  return translations[text] || text;
};
