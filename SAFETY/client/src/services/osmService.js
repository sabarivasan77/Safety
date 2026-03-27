import axios from 'axios';

/**
 * osmService fetches real-world features (buildings, roads) from OpenStreetMap.
 * Uses the Overpass API (Free).
 */
export const osmService = {
  /**
   * Fetch buildings in a small bounding box around a point.
   */
  async getBuildings(lat, lon, radius = 500) {
    // bbox: [min_lat, min_lon, max_lat, max_lon]
    const delta = radius / 111320; // roughly convert meters to degrees
    const bbox = `${lat - delta},${lon - delta},${lat + delta},${lon + delta}`;
    
    const query = `
      [out:json][timeout:25];
      (
        way["building"](${bbox});
        relation["building"](${bbox});
        way["highway"](${bbox});
      );
      out body;
      >;
      out skel qt;
    `;
    
    try {
      const response = await axios.post('https://overpass-api.de/api/interpreter', query);
      return this.processOSMData(response.data);
    } catch (error) {
      console.error('Overpass Data Error:', error);
      return { buildings: [], roads: [] };
    }
  },

  processOSMData(data) {
    if (!data || !data.elements) return { buildings: [], roads: [] };
    
    const nodes = {};
    data.elements.filter(e => e.type === 'node').forEach(node => {
      nodes[node.id] = [node.lon, node.lat];
    });

    const buildings = data.elements
      .filter(e => e.type === 'way' && e.tags && e.tags.building)
      .map(way => ({
        id: way.id,
        coords: way.nodes.map(nodeId => nodes[nodeId]).filter(c => !!c),
        height: way.tags['building:levels'] ? parseInt(way.tags['building:levels']) * 3 : 10,
        type: way.tags.building
      }));

    const roads = data.elements
      .filter(e => e.type === 'way' && e.tags && e.tags.highway)
      .map(way => ({
        id: way.id,
        coords: way.nodes.map(nodeId => nodes[nodeId]).filter(c => !!c),
        type: way.tags.highway,
        lanes: way.tags.lanes ? parseInt(way.tags.lanes) : 2
      }));

    return { buildings, roads };
  }
};
