import axios from 'axios';

/**
 * LocationService handles all Nominatim OSM interactions with a focus on Tamil Nadu.
 * High-accuracy version with importance weighting.
 */
const searchCache = new Map();

export const LocationService = {
  /**
   * Fetch city/address suggestions from Nominatim.
   * Prioritize Tamil Nadu, India using importance scores and aggressive filtering.
   * Includes request caching for instantaneous UX.
   */
  async getSuggestions(query) {
    if (!query || query.length < 2) return [];
    
    const cacheKey = query.toLowerCase().trim();
    if (searchCache.has(cacheKey)) {
      return searchCache.get(cacheKey);
    }

    try {
      let searchQuery = query;
      // Filter for TN strictly if query is short or generic
      if (!query.toLowerCase().includes('tamil nadu') && !query.toLowerCase().includes('tn')) {
        searchQuery = `${query}, Tamil Nadu, India`;
      }

      // TN Bounding Box: 76.2, 8.0 to 80.3, 13.5
      // Wait, let's use actual nominatim openstreetmap API since backend proxy might not exist
      const url = `https://nominatim.openstreetmap.org/search`;
      const response = await axios.get(url, {
        params: {
          q: searchQuery,
          format: 'json',
          limit: 15,
          'accept-language': 'en',
          viewbox: '76.2,13.5,80.3,8.0',
          bounded: 1, // High accuracy mode
          addressdetails: 1,
          importance: 1 // Include importance in result
        }
      });
      
      // Sort result by IMPORTANCE (highest first)
      let results = response.data;

      // If no results in TN, fallback to wider search but still prioritize IN
      if (results.length === 0) {
        const fallback = await axios.get(url, {
          params: {
            q: query,
            format: 'json',
            limit: 8,
            countrycodes: 'in'
          }
        });
        results = fallback.data;
      }

      // Sort final set by importance
      results.sort((a, b) => (b.importance || 0) - (a.importance || 0));

      const processedResults = results.map(item => ({
        ...item,
        isTN: item.display_name.toLowerCase().includes('tamil nadu') || item.display_name.toLowerCase().includes('tn'),
        // Calculate a 'Safety Confidence' score based on importance
        confidence: Math.round((item.importance || 0.5) * 100)
      }));

      // Store in cache
      searchCache.set(cacheKey, processedResults);
      return processedResults;
    } catch (error) {
      console.error('Nominatim Suggestion Error:', error);
      return [];
    }
  },

  async geocode(_query) { return []; },
  async reverseGeocode(_lat, _lng) { return null; }
};
