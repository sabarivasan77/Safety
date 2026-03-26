/**
 * Analyzes route data and assigns safety scores.
 * 
 * @param {Object} routeData - Data containing crime, lighting, crowd, etc.
 * @returns {Object} { score, label, factors }
 */
export function calculateSafety(routeData) {
  const weights = {
    crime: 0.4,
    lighting: 0.2,
    crowd: 0.15,
    time: 0.15,
    area: 0.1,
  };

  // Ensure default values if data is missing
  const data = {
    crime: routeData.crime ?? 20, // 0-100 (lower is safer)
    lighting: routeData.lighting ?? 80, // 0-100 (higher is better)
    crowd: routeData.crowd ?? 50, // 0-100 (higher is better for safety)
    time: routeData.time ?? 30, // 0-100 (lower is better, e.g. daylight)
    area: routeData.area ?? 40, // 0-100 (lower is safer)
  };

  // Convert lighting and crowd to "risk" factors (higher is worse)
  const normLighting = 100 - data.lighting;
  const normCrowd = 100 - data.crowd;

  const score =
    data.crime * weights.crime +
    normLighting * weights.lighting +
    normCrowd * weights.crowd +
    data.time * weights.time +
    data.area * weights.area;

  return {
    score: Math.round(score),
    label:
      score < 30 ? "Safe" :
      score < 60 ? "Moderate" :
      "Risky",
    color:
      score < 30 ? "#10B981" : // emerald-500
      score < 60 ? "#F59E0B" : // amber-500
      "#EF4444" // red-500
  };
}
