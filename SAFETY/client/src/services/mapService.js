import axios from 'axios';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * Fetches route directions from Mapbox.
 * 
 * @param {Array} coords - Array of [lng, lat] for start and end
 * @returns {Promise<Array>} routes
 */
export async function getDirections(start, end) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&alternatives=true&access_token=${MAPBOX_TOKEN}`;
  
  try {
    const response = await axios.get(url);
    return response.data.routes;
  } catch (err) {
    console.error('Error fetching Mapbox directions:', err);
    throw err;
  }
}

/**
 * Geocodes an address to [lng, lat].
 * 
 * @param {string} query
 * @returns {Promise<Array>} [lng, lat]
 */
export async function geocode(query) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}`;
  
  try {
    const response = await axios.get(url);
    if (response.data.features && response.data.features.length > 0) {
      return response.data.features[0].center;
    }
    return null;
  } catch (err) {
    console.error('Error in geocoding:', err);
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
