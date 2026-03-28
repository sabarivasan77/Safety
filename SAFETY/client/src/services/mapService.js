import axios from 'axios';

/**
 * Fetches route directions from OSRM (Free Open Source Routing Machine).
 * 
 * @param {Array} start - [lng, lat]
 * @param {Array} end - [lng, lat]
 * @returns {Promise<Array>} routes
 */
export async function getDirections(start, end) {
  const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson&alternatives=true`;
  
  try {
    const response = await axios.get(url, {
       headers: { 'Accept': 'application/json' }
    });
    return response.data.routes;
  } catch (err) {
    console.error('Error fetching OSRM directions:', err);
    throw err;
  }
}

/**
 * Geocodes an address to [lng, lat] using Nominatim (OSM Search).
 * 
 * @param {string} query
 * @returns {Promise<Array>} [lng, lat]
 */
export async function geocode(query) {
  const url = `/nominatim/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  
  try {
    const response = await axios.get(url);
    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      return [parseFloat(location.lon), parseFloat(location.lat)];
    }
    return null;
  } catch (err) {
    console.error('Error in geocoding (Nominatim):', err);
    throw err;
  }
}

/**
 * Fetches community reports from our backend API.
 */
export async function getCommunityReports() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  try {
    const response = await axios.get(`${API_URL}/reports`);
    return response.data;
  } catch (err) {
    console.error('Error fetching reports:', err);
    return [];
  }
}
