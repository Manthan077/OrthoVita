// Map injuries to recommended exercises (safe exercises that won't aggravate the injury)
export const INJURY_EXERCISE_MAP = {
  'knee pain': {
    safe: ['bicepCurl', 'shoulderPress', 'lateralRaise', 'armCircle'],
    caution: ['squat', 'calfRaise'],
    avoid: ['lunge', 'kneeRaise']
  },
  'lower back pain': {
    safe: ['bicepCurl', 'shoulderPress', 'lateralRaise', 'armCircle', 'calfRaise'],
    caution: ['kneeRaise'],
    avoid: ['squat', 'lunge']
  },
  'shoulder pain': {
    safe: ['squat', 'lunge', 'calfRaise', 'kneeRaise'],
    caution: [],
    avoid: ['bicepCurl', 'shoulderPress', 'lateralRaise', 'armCircle']
  },
  'hip pain': {
    safe: ['bicepCurl', 'shoulderPress', 'lateralRaise', 'armCircle', 'calfRaise'],
    caution: [],
    avoid: ['squat', 'lunge', 'kneeRaise']
  },
  'ankle pain': {
    safe: ['bicepCurl', 'shoulderPress', 'lateralRaise', 'armCircle', 'kneeRaise'],
    caution: ['squat'],
    avoid: ['lunge', 'calfRaise']
  },
  'wrist pain': {
    safe: ['squat', 'lunge', 'calfRaise', 'kneeRaise', 'lateralRaise'],
    caution: [],
    avoid: ['bicepCurl', 'shoulderPress', 'armCircle']
  },
  'elbow pain': {
    safe: ['squat', 'lunge', 'calfRaise', 'kneeRaise', 'lateralRaise'],
    caution: ['shoulderPress'],
    avoid: ['bicepCurl', 'armCircle']
  },
  'general': {
    safe: ['squat', 'lunge', 'calfRaise', 'bicepCurl', 'shoulderPress', 'lateralRaise', 'armCircle', 'kneeRaise'],
    caution: [],
    avoid: []
  }
};

export const getRecommendedExercises = (injury) => {
  if (!injury) return INJURY_EXERCISE_MAP['general'].safe;
  
  const lowerInjury = injury.toLowerCase();
  
  let injuryType = 'general';
  
  if (lowerInjury.includes('knee')) injuryType = 'knee pain';
  else if (lowerInjury.includes('back') || lowerInjury.includes('spine') || lowerInjury.includes('lumbar')) injuryType = 'lower back pain';
  else if (lowerInjury.includes('shoulder') || lowerInjury.includes('rotator')) injuryType = 'shoulder pain';
  else if (lowerInjury.includes('hip') || lowerInjury.includes('pelvis')) injuryType = 'hip pain';
  else if (lowerInjury.includes('ankle') || lowerInjury.includes('foot') || lowerInjury.includes('achilles')) injuryType = 'ankle pain';
  else if (lowerInjury.includes('wrist') || lowerInjury.includes('hand')) injuryType = 'wrist pain';
  else if (lowerInjury.includes('elbow') || lowerInjury.includes('forearm')) injuryType = 'elbow pain';
  
  const mapping = INJURY_EXERCISE_MAP[injuryType];
  // Return only safe exercises for the injury
  return mapping.safe;
};

export const getInjuryInfo = (injury) => {
  if (!injury) return null;
  
  const lowerInjury = injury.toLowerCase();
  let injuryType = 'general';
  
  if (lowerInjury.includes('knee')) injuryType = 'knee pain';
  else if (lowerInjury.includes('back') || lowerInjury.includes('spine')) injuryType = 'lower back pain';
  else if (lowerInjury.includes('shoulder')) injuryType = 'shoulder pain';
  else if (lowerInjury.includes('hip')) injuryType = 'hip pain';
  else if (lowerInjury.includes('ankle') || lowerInjury.includes('foot')) injuryType = 'ankle pain';
  else if (lowerInjury.includes('wrist')) injuryType = 'wrist pain';
  else if (lowerInjury.includes('elbow')) injuryType = 'elbow pain';
  
  return INJURY_EXERCISE_MAP[injuryType];
};
