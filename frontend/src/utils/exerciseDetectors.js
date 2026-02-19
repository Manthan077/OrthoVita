import { calculateAngle, getLandmark, POSE_LANDMARKS } from './poseUtils';

// Exercise detector for Squat
export const detectSquat = (landmarks, prevState) => {
  const leftHip = getLandmark(landmarks, POSE_LANDMARKS.LEFT_HIP);
  const leftKnee = getLandmark(landmarks, POSE_LANDMARKS.LEFT_KNEE);
  const leftAnkle = getLandmark(landmarks, POSE_LANDMARKS.LEFT_ANKLE);
  const rightHip = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_HIP);
  const rightKnee = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_KNEE);
  const rightAnkle = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_ANKLE);

  // Check visibility
  const minVisibility = 0.6;
  const leftVisible = leftHip.visibility > minVisibility && leftKnee.visibility > minVisibility && leftAnkle.visibility > minVisibility;
  const rightVisible = rightHip.visibility > minVisibility && rightKnee.visibility > minVisibility && rightAnkle.visibility > minVisibility;
  
  if (!leftVisible && !rightVisible) {
    return {
      reps: prevState?.reps || 0,
      stage: prevState?.stage || 'up',
      feedback: 'Position yourself in frame',
      accuracy: 0,
      angle: 0,
      status: 'incorrect',
      repAccuracy: prevState?.repAccuracy || []
    };
  }

  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  const kneeAngle = Math.min(leftKneeAngle, rightKneeAngle);

  const isDown = kneeAngle < 110;
  const isUp = kneeAngle > 160;

  let feedback = 'Stand ready';
  let reps = prevState?.reps || 0;
  let stage = prevState?.stage || 'up';
  let status = 'neutral';
  let accuracy = 70;
  let repAccuracy = prevState?.repAccuracy || [];

  if (stage === 'up' && isDown) {
    stage = 'down';
    feedback = '✓ Good depth! Stand up';
    status = 'correct';
    if (kneeAngle >= 80 && kneeAngle <= 100) {
      accuracy = 100;
    } else if (kneeAngle >= 70 && kneeAngle < 80) {
      accuracy = 85;
    } else if (kneeAngle > 100 && kneeAngle <= 110) {
      accuracy = 90;
    } else {
      accuracy = 75;
    }
    repAccuracy = [accuracy];
  } else if (stage === 'down' && isUp) {
    stage = 'up';
    reps++;
    feedback = '✓ Rep counted!';
    status = 'correct';
    repAccuracy.push(95);
    accuracy = Math.round(repAccuracy.reduce((sum, a) => sum + a, 0) / repAccuracy.length);
    repAccuracy = [];
  } else if (stage === 'up') {
    feedback = 'Squat down';
    accuracy = 70;
  } else if (stage === 'down') {
    feedback = 'Stand up fully';
    accuracy = 75;
    if (repAccuracy.length > 0) {
      repAccuracy.push(75);
    }
  }

  return { reps, stage, feedback, accuracy, angle: Math.round(kneeAngle), status, repAccuracy };
};

// Exercise detector for Bicep Curl
export const detectBicepCurl = (landmarks, prevState) => {
  const leftShoulder = getLandmark(landmarks, POSE_LANDMARKS.LEFT_SHOULDER);
  const leftElbow = getLandmark(landmarks, POSE_LANDMARKS.LEFT_ELBOW);
  const leftWrist = getLandmark(landmarks, POSE_LANDMARKS.LEFT_WRIST);
  const rightShoulder = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_SHOULDER);
  const rightElbow = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_ELBOW);
  const rightWrist = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_WRIST);

  // Check visibility - require high confidence for all key points
  const minVisibility = 0.6;
  const leftVisible = leftShoulder.visibility > minVisibility && leftElbow.visibility > minVisibility && leftWrist.visibility > minVisibility;
  const rightVisible = rightShoulder.visibility > minVisibility && rightElbow.visibility > minVisibility && rightWrist.visibility > minVisibility;
  
  if (!leftVisible && !rightVisible) {
    return {
      reps: prevState?.reps || 0,
      stage: prevState?.stage || 'down',
      feedback: 'Position yourself in frame',
      accuracy: 0,
      angle: 0,
      status: 'incorrect',
      repAccuracy: prevState?.repAccuracy || []
    };
  }

  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  const elbowAngle = Math.min(leftElbowAngle, rightElbowAngle);
  
  const isCurled = elbowAngle < 70;
  const isExtended = elbowAngle > 160;

  let feedback = 'Arm at side';
  let reps = prevState?.reps || 0;
  let stage = prevState?.stage || 'down';
  let status = 'neutral';
  let accuracy = 70;
  let repAccuracy = prevState?.repAccuracy || [];

  if (stage === 'down' && isCurled) {
    stage = 'up';
    feedback = '✓ Good curl! Lower down';
    status = 'correct';
    if (elbowAngle >= 40 && elbowAngle <= 60) {
      accuracy = 100;
    } else if (elbowAngle >= 30 && elbowAngle < 40) {
      accuracy = 90;
    } else if (elbowAngle > 60 && elbowAngle <= 70) {
      accuracy = 85;
    } else {
      accuracy = 75;
    }
    repAccuracy = [accuracy];
  } else if (stage === 'up' && isExtended) {
    stage = 'down';
    reps++;
    feedback = '✓ Rep counted!';
    status = 'correct';
    repAccuracy.push(100);
    accuracy = Math.round(repAccuracy.reduce((sum, a) => sum + a, 0) / repAccuracy.length);
    repAccuracy = [];
  } else if (stage === 'down') {
    feedback = 'Curl arm up';
    accuracy = 70;
  } else if (stage === 'up') {
    feedback = 'Extend arm fully';
    accuracy = 75;
    if (repAccuracy.length > 0) {
      repAccuracy.push(75);
    }
  }

  return { reps, stage, feedback, accuracy, angle: Math.round(elbowAngle), status, repAccuracy };
};

// Exercise detector for Knee Raise
export const detectKneeRaise = (landmarks, prevState) => {
  const leftHip = getLandmark(landmarks, POSE_LANDMARKS.LEFT_HIP);
  const leftKnee = getLandmark(landmarks, POSE_LANDMARKS.LEFT_KNEE);
  const rightHip = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_HIP);
  const rightKnee = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_KNEE);

  const leftHipAngle = calculateAngle(
    { x: leftHip.x, y: leftHip.y - 0.3 },
    leftHip,
    leftKnee
  );
  const rightHipAngle = calculateAngle(
    { x: rightHip.x, y: rightHip.y - 0.3 },
    rightHip,
    rightKnee
  );
  const hipAngle = Math.min(leftHipAngle, rightHipAngle);

  const isRaised = hipAngle < 110;
  const isDown = hipAngle > 160;

  let feedback = 'Stand straight';
  let reps = prevState?.reps || 0;
  let stage = prevState?.stage || 'down';
  let status = 'neutral';
  let accuracy = 100;

  if (stage === 'down' && isRaised) {
    stage = 'up';
    feedback = '✓ Good height! Lower leg';
    status = 'correct';
    accuracy = hipAngle >= 70 && hipAngle <= 95 ? 100 : 85;
  } else if (stage === 'up' && isDown) {
    stage = 'down';
    reps++;
    feedback = '✓ Rep counted!';
    status = 'correct';
    accuracy = 100;
  } else if (stage === 'down') {
    feedback = 'Raise your knee';
  } else if (stage === 'up') {
    feedback = 'Lower leg completely';
  }

  return { reps, stage, feedback, accuracy, angle: Math.round(hipAngle), status };
};

// Exercise detector for Shoulder Press
export const detectShoulderPress = (landmarks, prevState) => {
  const leftShoulder = getLandmark(landmarks, POSE_LANDMARKS.LEFT_SHOULDER);
  const leftElbow = getLandmark(landmarks, POSE_LANDMARKS.LEFT_ELBOW);
  const leftWrist = getLandmark(landmarks, POSE_LANDMARKS.LEFT_WRIST);
  const rightShoulder = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_SHOULDER);
  const rightElbow = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_ELBOW);
  const rightWrist = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_WRIST);

  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  const elbowAngle = Math.min(leftElbowAngle, rightElbowAngle);
  
  const isPressed = elbowAngle > 160;
  const isDown = elbowAngle < 110;

  let feedback = 'Start position';
  let reps = prevState?.reps || 0;
  let stage = prevState?.stage || 'down';
  let status = 'neutral';
  let accuracy = 100;

  if (stage === 'down' && isPressed) {
    stage = 'up';
    feedback = '✓ Full extension! Lower down';
    status = 'correct';
    accuracy = 100;
  } else if (stage === 'up' && isDown) {
    stage = 'down';
    reps++;
    feedback = '✓ Rep counted!';
    status = 'correct';
    accuracy = elbowAngle >= 80 && elbowAngle <= 100 ? 100 : 85;
  } else if (stage === 'down') {
    feedback = 'Press arms overhead';
  } else if (stage === 'up') {
    feedback = 'Lower to shoulders';
  }

  return { reps, stage, feedback, accuracy, angle: Math.round(elbowAngle), status };
};

// Exercise detector for Lateral Raise
export const detectLateralRaise = (landmarks, prevState) => {
  const leftShoulder = getLandmark(landmarks, POSE_LANDMARKS.LEFT_SHOULDER);
  const leftElbow = getLandmark(landmarks, POSE_LANDMARKS.LEFT_ELBOW);
  const leftHip = getLandmark(landmarks, POSE_LANDMARKS.LEFT_HIP);
  const rightShoulder = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_SHOULDER);
  const rightElbow = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_ELBOW);
  const rightHip = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_HIP);

  const leftShoulderAngle = calculateAngle(leftHip, leftShoulder, leftElbow);
  const rightShoulderAngle = calculateAngle(rightHip, rightShoulder, rightElbow);
  const shoulderAngle = Math.max(leftShoulderAngle, rightShoulderAngle);
  
  const isRaised = shoulderAngle > 70;
  const isDown = shoulderAngle < 30;

  let feedback = 'Arms at sides';
  let reps = prevState?.reps || 0;
  let stage = prevState?.stage || 'down';
  let status = 'neutral';
  let accuracy = 100;

  if (stage === 'down' && isRaised) {
    stage = 'up';
    feedback = '✓ Good raise! Lower slowly';
    status = 'correct';
    accuracy = shoulderAngle >= 75 && shoulderAngle <= 105 ? 100 : 85;
  } else if (stage === 'up' && isDown) {
    stage = 'down';
    reps++;
    feedback = '✓ Rep counted!';
    status = 'correct';
    accuracy = 100;
  } else if (stage === 'down') {
    feedback = 'Raise arms to sides';
  } else if (stage === 'up') {
    feedback = 'Lower arms down';
  }

  return { reps, stage, feedback, accuracy, angle: Math.round(shoulderAngle), status };
};

// Exercise detector for Lunges
export const detectLunge = (landmarks, prevState) => {
  const leftHip = getLandmark(landmarks, POSE_LANDMARKS.LEFT_HIP);
  const leftKnee = getLandmark(landmarks, POSE_LANDMARKS.LEFT_KNEE);
  const leftAnkle = getLandmark(landmarks, POSE_LANDMARKS.LEFT_ANKLE);
  const rightHip = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_HIP);
  const rightKnee = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_KNEE);
  const rightAnkle = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_ANKLE);

  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  const kneeAngle = Math.min(leftKneeAngle, rightKneeAngle);
  
  const isLunged = kneeAngle < 110;
  const isStanding = kneeAngle > 160;

  let feedback = 'Stand ready';
  let reps = prevState?.reps || 0;
  let stage = prevState?.stage || 'up';
  let status = 'neutral';
  let accuracy = 100;

  if (stage === 'up' && isLunged) {
    stage = 'down';
    feedback = '✓ Good lunge! Return up';
    status = 'correct';
    accuracy = kneeAngle >= 80 && kneeAngle <= 100 ? 100 : 85;
  } else if (stage === 'down' && isStanding) {
    stage = 'up';
    reps++;
    feedback = '✓ Rep counted!';
    status = 'correct';
    accuracy = 100;
  } else if (stage === 'up') {
    feedback = 'Lunge down';
  } else if (stage === 'down') {
    feedback = 'Stand up';
  }

  return { reps, stage, feedback, accuracy, angle: Math.round(kneeAngle), status };
};

// Exercise detector for Arm Circles
export const detectArmCircle = (landmarks, prevState) => {
  const leftShoulder = getLandmark(landmarks, POSE_LANDMARKS.LEFT_SHOULDER);
  const leftWrist = getLandmark(landmarks, POSE_LANDMARKS.LEFT_WRIST);
  const rightShoulder = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_SHOULDER);
  const rightWrist = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_WRIST);

  const leftArmAngle = calculateAngle(
    { x: leftShoulder.x, y: leftShoulder.y + 0.2 },
    leftShoulder,
    leftWrist
  );
  const rightArmAngle = calculateAngle(
    { x: rightShoulder.x, y: rightShoulder.y + 0.2 },
    rightShoulder,
    rightWrist
  );
  const armAngle = Math.max(leftArmAngle, rightArmAngle);

  const isTop = leftWrist.y < leftShoulder.y - 0.15 || rightWrist.y < rightShoulder.y - 0.15;
  const isBottom = leftWrist.y > leftShoulder.y + 0.15 || rightWrist.y > rightShoulder.y + 0.15;

  let reps = prevState?.reps || 0;
  let stage = prevState?.stage || 'start';
  let lastPosition = prevState?.lastPosition || 'none';

  if (isTop && lastPosition !== 'top') {
    lastPosition = 'top';
    if (stage === 'bottom') {
      reps++;
      stage = 'top';
    } else {
      stage = 'top';
    }
  } else if (isBottom && lastPosition !== 'bottom') {
    lastPosition = 'bottom';
    stage = 'bottom';
  }

  const feedback = 'Make slow circles';
  const accuracy = 85;
  return { reps, stage, feedback, accuracy, angle: Math.round(armAngle), lastPosition };
};

// Exercise detector for Wrist Rotation
export const detectWristRotation = (landmarks, prevState) => {
  const leftElbow = getLandmark(landmarks, POSE_LANDMARKS.LEFT_ELBOW);
  const leftWrist = getLandmark(landmarks, POSE_LANDMARKS.LEFT_WRIST);

  const wristX = leftWrist.x;
  const elbowX = leftElbow.x;
  const relativeX = wristX - elbowX;

  const isLeft = relativeX < -0.08;
  const isRight = relativeX > 0.08;
  const isCenter = relativeX >= -0.03 && relativeX <= 0.03;

  let feedback = 'Extend arm forward';
  let reps = prevState?.reps || 0;
  let stage = prevState?.stage || 'center';
  let status = 'neutral';
  let accuracy = 100;

  if (stage === 'center' && (isLeft || isRight)) {
    if (isLeft) {
      stage = 'left';
      feedback = '✓ Good! Now move right';
      status = 'correct';
      accuracy = 100;
    } else if (isRight) {
      stage = 'right';
      feedback = '✓ Good! Now move left';
      status = 'correct';
      accuracy = 100;
    }
  } else if (stage === 'left' && isRight) {
    stage = 'right';
    reps++;
    feedback = '✓ Rep counted! Move left again';
    status = 'correct';
    accuracy = 100;
  } else if (stage === 'right' && isLeft) {
    stage = 'left';
    feedback = '✓ Good! Move right';
    status = 'correct';
    accuracy = 100;
  } else if (stage === 'center') {
    feedback = 'Move wrist side to side';
  } else if (stage === 'left' && !isRight && !isCenter) {
    feedback = '✗ Move wrist to the right';
    status = 'incorrect';
    accuracy = 70;
  } else if (stage === 'right' && !isLeft && !isCenter) {
    feedback = '✗ Move wrist to the left';
    status = 'incorrect';
    accuracy = 70;
  }

  return { reps, stage, feedback, accuracy, angle: 0, status };
};

// Exercise detector for Neck Tilt
export const detectNeckTilt = (landmarks, prevState) => {
  const nose = getLandmark(landmarks, POSE_LANDMARKS.NOSE);
  const leftShoulder = getLandmark(landmarks, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_SHOULDER);

  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
  const noseY = nose.y;
  const relativeY = noseY - shoulderMidY;

  const isUp = relativeY < -0.25;
  const isDown = relativeY > -0.10;
  const isNeutral = relativeY >= -0.20 && relativeY <= -0.15;

  let feedback = 'Face camera';
  let reps = prevState?.reps || 0;
  let stage = prevState?.stage || 'neutral';
  let status = 'neutral';
  let accuracy = 100;

  if (stage === 'neutral' && isUp) {
    stage = 'up';
    feedback = '✓ Good tilt up! Now look down';
    status = 'correct';
    accuracy = 100;
  } else if (stage === 'up' && isDown) {
    stage = 'down';
    reps++;
    feedback = '✓ Rep counted! Look up again';
    status = 'correct';
    accuracy = 100;
  } else if (stage === 'down' && isUp) {
    stage = 'up';
    feedback = '✓ Good! Now look down';
    status = 'correct';
    accuracy = 100;
  } else if (stage === 'neutral') {
    feedback = 'Tilt head up and down';
  } else if (stage === 'up' && !isDown && !isNeutral) {
    feedback = '✗ Tilt head down';
    status = 'incorrect';
    accuracy = 70;
  } else if (stage === 'down' && !isUp && !isNeutral) {
    feedback = '✗ Tilt head up';
    status = 'incorrect';
    accuracy = 70;
  }

  return { reps, stage, feedback, accuracy, angle: 0, status };
};



// Exercise detector for Calf Raises
export const detectCalfRaise = (landmarks, prevState) => {
  const leftKnee = getLandmark(landmarks, POSE_LANDMARKS.LEFT_KNEE);
  const leftAnkle = getLandmark(landmarks, POSE_LANDMARKS.LEFT_ANKLE);
  const rightKnee = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_KNEE);
  const rightAnkle = getLandmark(landmarks, POSE_LANDMARKS.RIGHT_ANKLE);

  const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
  const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
  const baselineY = prevState?.baselineY || avgAnkleY;
  
  const isRaised = avgAnkleY < baselineY - 0.04;
  const isDown = avgAnkleY >= baselineY - 0.015;

  let feedback = 'Rise on toes';
  let reps = prevState?.reps || 0;
  let stage = prevState?.stage || 'down';
  let status = 'neutral';
  let accuracy = 100;

  if (stage === 'down' && isRaised) {
    stage = 'up';
    feedback = '✓ Good raise! Lower heels';
    status = 'correct';
    accuracy = 100;
  } else if (stage === 'up' && isDown) {
    stage = 'down';
    reps++;
    feedback = '✓ Rep counted!';
    status = 'correct';
    accuracy = 100;
  } else if (stage === 'down') {
    feedback = 'Rise on toes';
  } else if (stage === 'up') {
    feedback = 'Lower heels';
  }

  return { reps, stage, feedback, accuracy, baselineY, angle: 0, status };
};

// Exercise registry
export const EXERCISES = {
  squat: {
    name: 'Squat',
    detector: detectSquat,
    description: 'Lower body strength - Full body visible',
    category: 'Lower Body',
  },
  lunge: {
    name: 'Lunge',
    detector: detectLunge,
    description: 'Leg strength & balance - Side profile',
    category: 'Lower Body',
  },
  bicepCurl: {
    name: 'Bicep Curl',
    detector: detectBicepCurl,
    description: 'Arm strength - Side profile',
    category: 'Upper Body',
  },
  shoulderPress: {
    name: 'Shoulder Press',
    detector: detectShoulderPress,
    description: 'Shoulder strength - Side profile',
    category: 'Upper Body',
  },
  lateralRaise: {
    name: 'Lateral Raise',
    detector: detectLateralRaise,
    description: 'Shoulder mobility - Face camera',
    category: 'Upper Body',
  },
  wristRotation: {
    name: 'Wrist Side to Side',
    detector: detectWristRotation,
    description: 'Wrist mobility - Face camera',
    category: 'Upper Body',
  },
  kneeRaise: {
    name: 'Knee Raise',
    detector: detectKneeRaise,
    description: 'Hip flexor strength - Face camera',
    category: 'Core & Balance',
  },
  neckTilt: {
    name: 'Neck Tilt',
    detector: detectNeckTilt,
    description: 'Neck mobility - Face camera',
    category: 'Core & Balance',
  },
};
