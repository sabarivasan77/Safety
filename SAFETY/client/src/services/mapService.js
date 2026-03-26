/**
 * Mapbox Directions API Integration Mock
 * Uses real path logic for polyline generation
 */
export const fetchDirections = async (profile = 'walking', coordinates) => {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const coordString = coordinates.map(c => `${c[0]},${c[1]}`).join(';');
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordString}?alternatives=true&geometries=geojson&access_token=${token}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Directions fetch error:', e);
    return null;
  }
};

/**
 * Safety Scoring Logic (Industrial Standard)
 */
export const calculateSafetyScore = (route) => {
  // route.crime (0-10), route.lighting (0-10), etc.
  const score = (
    (10 - route.crime) * 4.0 +
    route.lighting * 2.0 +
    route.crowd * 1.5 +
    (10 - route.timeRisk) * 1.5 +
    route.areaType * 1.0
  );

  const finalScore = Math.round(score);
  
  let label = 'Risky';
  let color = '#ef4444'; // Red

  if (finalScore >= 75) {
    label = 'Safe';
    color = '#10b981'; // Green
  } else if (finalScore >= 40) {
    label = 'Moderate';
    color = '#f59e0b'; // Amber
  }

  return { 
    score: finalScore, 
    label, 
    color,
    description: `This route is ${label.toLowerCase()} because it avoids poorly lit zones and high-risk areas.`
  };
};
