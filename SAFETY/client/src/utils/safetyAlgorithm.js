/**
 * Safety Scoring Algorithm
 * Safety Score = (0.35 × Crime Data) + (0.20 × Lighting) + (0.15 × Crowd Density) + (0.15 × Time Risk) + (0.15 × Area Type)
 * All inputs normalized 0-1 (1 is safest, 0 is riskiest)
 */

export const calculateSafetyScore = (params) => {
  const { crimeScore, lighting, crowdDensity, timeRisk, areaType } = params;
  
  const score = (0.35 * (1 - crimeScore)) + // 1 - crime because low crime is safer
                (0.20 * lighting) + 
                (0.15 * crowdDensity) + 
                (0.15 * timeRisk) + 
                (0.15 * areaType);

  // Normalize to 100%
  const finalScore = Math.round(score * 100);
  
  let riskLevel = 'Low';
  let color = '#10b981'; // Green

  if (finalScore < 40) {
    riskLevel = 'High';
    color = '#ef4444'; // Red
  } else if (finalScore < 75) {
    riskLevel = 'Medium';
    color = '#f59e0b'; // Amber
  }

  return {
    score: finalScore,
    riskLevel,
    color,
    factors: {
      crimeImpact: (0.35 * crimeScore * 100).toFixed(1),
      lightingImpact: (0.20 * lighting * 100).toFixed(1),
      crowdImpact: (0.15 * crowdDensity * 100).toFixed(1),
      timeImpact: (0.15 * timeRisk * 100).toFixed(1),
      areaImpact: (0.15 * areaType * 100).toFixed(1)
    }
  };
};

export const getRouteColor = (score) => {
  if (score > 75) return '#10b981'; // Safest
  if (score > 40) return '#f59e0b'; // Moderate
  return '#ef4444'; // Dangerous
};
