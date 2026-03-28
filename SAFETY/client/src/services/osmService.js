import axios from 'axios';

/**
 * osmService fetches real-world features (buildings, roads) from OpenStreetMap.
 * Uses the Overpass API (Free).
 */
export const osmService = {
  /**
   * Fetch buildings in a small bounding box around a point.
   */
  async getBuildings(lat, lon, radius = 2500) {
    // bbox: [min_lat, min_lon, max_lat, max_lon]
    const delta = radius / 111320; // roughly convert meters to degrees
    const bbox = `${lat - delta},${lon - delta},${lat + delta},${lon + delta}`;
    
    // Optimization: Add node["natural"="tree"] to fetch vegetation, reduce timeout
    const query = `
      [out:json][timeout:25];
      (
        way["building"](${bbox});
        relation["building"](${bbox});
        way["highway"](${bbox});
        node["highway"="traffic_signals"](${bbox});
        node["natural"="tree"](${bbox});
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
      .map(way => {
        const type = way.tags.highway;
        // Estimate width based on road type
        let width = 4;
        if (['motorway', 'trunk', 'primary'].includes(type)) width = 12;
        else if (['secondary', 'tertiary'].includes(type)) width = 8;
        else if (['residential', 'unclassified'].includes(type)) width = 6;
        
        return {
          id: way.id,
          coords: way.nodes.map(nodeId => nodes[nodeId]).filter(c => !!c),
          type,
          lanes: way.tags.lanes ? parseInt(way.tags.lanes) : 2,
          width
        };
      });

    const trafficSignals = data.elements
      .filter(e => e.type === 'node' && e.tags && e.tags.highway === 'traffic_signals')
      .map(node => ({
        id: node.id,
        lat: node.lat,
        lon: node.lon
      }));

    // Trees / vegetation
    const trees = data.elements
      .filter(e => e.type === 'node' && e.tags && e.tags.natural === 'tree')
      .map(node => ({
        id: node.id,
        lat: node.lat,
        lon: node.lon
      }));

    return { buildings, roads, trafficSignals, trees };
  }
};
