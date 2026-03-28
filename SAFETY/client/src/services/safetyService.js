import axios from 'axios';

/**
 * SafetyService handles crowd/safety proxy data, safety scoring, and nearby help.
 * Uses Nominatim/OSM for nearby discovery.
 */
export const SafetyService = {
  /**
   * Calculate a safety score for a coordinate [lat, lng].
   * Uses real-world approximations for crowd, lighting, and area type.
   */
  async calculateSafetyScore(lat, lng) {
    if (!lat || !lng) return { score: 70, crowd: 60, lighting: 60, emergency: 80 };

    try {
      // Proxy for real data - In a real app, this would query a safety database/heatmap.
      // Here, use area type as a proxy for safety.
      const address = await axios.get(`/nominatim/reverse`, {
        params: { lat, lon: lng, format: 'json' }
      });
      const data = address.data;
      const type = data.type || (data.address ? Object.keys(data.address)[0] : 'residential');
      
      const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown';
      const isUrban = city !== 'Unknown';
      
      const hour = new Date().getHours();
      const isNight = hour >= 18 || hour <= 6;
      
      // Heuristics
      const baseScore = isUrban ? 80 : 60;
      const lightingScore = isNight ? (isUrban ? 70 : 40) : 100;
      const crowdScore = isUrban ? (isNight ? 65 : 100) : (isNight ? 30 : 60);
      const emergencyAccess = isUrban ? 90 : 50;
      
      const finalScore = (baseScore * 0.3) + (lightingScore * 0.3) + (crowdScore * 0.2) + (emergencyAccess * 0.2);
      
      return {
        score: Math.round(finalScore),
        crowd: crowdScore,
        lighting: lightingScore,
        emergency: emergencyAccess,
        type: type,
        isNight: isNight
      };
    } catch (error) {
      console.error('Safety Score Error:', error);
      return { score: 70, crowd: 60, lighting: 60, emergency: 80 };
    }
  },

  /**
   * Search for nearby help points: police, hospitals, petrol.
   */
  async getNearbyHelp(lat, lng, type = 'police') {
    if (!lat || !lng) return [];

    try {
      // Map category to OSM tags
      const tagMap = {
        police: 'police',
        hospital: 'hospital',
        petrol: 'fuel'
      };
      
      const tag = tagMap[type] || 'police';
      
      // Use overpass API for advanced queries (or just nominatim search)
      // For simplicity/reliability, using Nominatim search within proximity
      const response = await axios.get(`/nominatim/search`, {
        params: {
          q: type,
          format: 'json',
          limit: 10,
          viewbox: `${lng-0.05},${lat+0.05},${lng+0.05},${lat-0.05}`,
          bounded: 1
        }
      });
      
      return response.data.map(item => ({
        id: item.place_id,
        name: item.display_name.split(',')[0],
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: type
      }));
    } catch (error) {
      console.error('Nearby Help Error:', error);
      return [];
    }
  }
};
