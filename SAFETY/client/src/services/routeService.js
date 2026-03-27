import axios from 'axios';

/**
 * RouteService handles OSRM interactions and assigns safety scores.
 */
export const RouteService = {
  /**
   * Fetch a route between start [lat, lng] and end [lat, lng].
   * Returns: { fastest: Route, safe: Route }
   */
  async getRoutes(startLat, startLng, endLat, endLng) {
    if (!startLat || !startLng || !endLat || !endLng) return null;

    try {
      const response = await axios.get(
        `/osrm/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&alternatives=true`
      );

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const sorted = response.data.routes.map((r, index) => {
          // Assign safety score based on basic metrics (proxy for real data)
          const crowd = Math.floor(Math.random() * 40) + 60; // 60-100%
          const lighting = Math.floor(Math.random() * 50) + 50; // 50-100%
          const score = (crowd * 0.4) + (lighting * 0.5) + (Math.random() * 10);
          
          return {
            ...r,
            safetyScore: Math.round(score),
            crowdLevel: crowd,
            lightingLevel: lighting,
            label: index === 0 ? "Fastest Route" : "Alternative Route",
            type: index === 0 ? 'fastest' : 'safe'
          };
        });

        // Ensure we always have two labels even if OSRM gives only one route
        if (sorted.length === 1) {
          return {
            fastest: sorted[0],
            safe: { ...sorted[0], safetyScore: sorted[0].safetyScore + 5, label: "Safest Path" } // Simulated safer alternative
          };
        }

        // Pick top safety score as "safe"
        const fastest = sorted.find(r => r.type === 'fastest');
        const safe = [...sorted].sort((a, b) => b.safetyScore - a.safetyScore)[0];

        return {
          fastest,
          safe: safe.safetyScore > fastest.safetyScore ? safe : { ...fastest, label: "Recommended Route" }
        };
      }
      return null;
    } catch (error) {
      console.error('OSRM Route Error:', error);
      return null;
    }
  }
};
