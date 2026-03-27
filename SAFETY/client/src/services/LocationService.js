import axios from 'axios';

/**
 * LocationService handles all Nominatim OSM interactions with a focus on Tamil Nadu.
 * High-accuracy version.
 */
export const LocationService = {
  /**
   * Fetch city/address suggestions from Nominatim.
   * Prioritize Tamil Nadu, India using aggressive filtering and viewbox.
   */
  async getSuggestions(query) {
    if (!query || query.length < 2) return [];
    try {
      // Append Tamil Nadu if query is a simple name to increase accuracy for local villages
      let searchQuery = query;
      if (!query.toLowerCase().includes('tamil nadu') && !query.toLowerCase().includes('tn')) {
        searchQuery = `${query}, Tamil Nadu, India`;
      }

      // TN Bounding Box: 76.2, 8.0 to 80.3, 13.5
      const response = await axios.get(`/nominatim/search`, {
        params: {
          q: searchQuery,
          format: 'json',
          limit: 10,
          'accept-language': 'en',
          viewbox: '76.2,13.5,80.3,8.0',
          bounded: 1, // High accuracy mode: ONLY return results in TN
          addressdetails: 1,
          featuretype: 'settlement,street,place'
        }
      });
      
      // If no results in TN, fallback to wider search but still prioritize IN
      if (response.data.length === 0) {
        const fallback = await axios.get(`/nominatim/search`, {
          params: {
            q: query,
            format: 'json',
            limit: 5,
            countrycodes: 'in'
          }
        });
        return fallback.data.map(item => ({
          ...item,
          isTN: item.display_name.toLowerCase().includes('tamil nadu')
        }));
      }

      return response.data.map(item => ({
        ...item,
        isTN: true
      }));
    } catch (error) {
      console.error('Nominatim Suggestion Error:', error);
      return [];
    }
  },

  /**
   * Geocode a single query to [lat, lng].
   */
  async geocode(query) {
    try {
      const response = await axios.get(`/nominatim/search`, {
        params: {
          q: query.includes('Tamil Nadu') ? query : `${query}, Tamil Nadu, India`,
          format: 'json',
          limit: 1
        }
      });
      if (response.data && response.data.length > 0) {
        const item = response.data[0];
        return { 
          lat: parseFloat(item.lat), 
          lng: parseFloat(item.lon), 
          displayName: item.display_name 
        };
      }
      return null;
    } catch (error) {
      console.error('Geocode Error:', error);
      return null;
    }
  },

  /**
   * Reverse Geocode [lat, lng] to address.
   */
  async reverseGeocode(lat, lng) {
    try {
      const response = await axios.get(`/nominatim/reverse`, {
        params: {
          lat,
          lon: lng,
          format: 'json',
          zoom: 18,
          addressdetails: 1
        }
      });
      return response.data;
    } catch (error) {
      console.error('Reverse Geocode Error:', error);
      return null;
    }
  }
};
