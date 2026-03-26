export const MOCK_ROUTES = [
  {
    id: 'safe-1',
    name: 'Safest Route',
    type: 'safe',
    score: 88,
    distance: '3.2 km',
    duration: '12 min',
    path: [
      [77.5946, 12.9716], // Bangalore center
      [77.5956, 12.9726],
      [77.5966, 12.9736],
      [77.5976, 12.9746],
      [77.5986, 12.9756]
    ]
  },
  {
    id: 'fast-1',
    name: 'Fastest Route',
    type: 'fast',
    score: 52,
    distance: '2.8 km',
    duration: '8 min',
    path: [
      [77.5946, 12.9716],
      [77.5936, 12.9706],
      [77.5926, 12.9696],
      [77.5916, 12.9686],
      [77.5906, 12.9676]
    ]
  }
];

export const RISK_ZONES = [
  {
    id: 'z1',
    type: 'high-crime',
    center: [77.5936, 12.9706],
    radius: 100, // meters
    intensity: 0.8,
    message: '⚠️ High crime area'
  },
  {
    id: 'z2',
    type: 'low-lighting',
    center: [77.5926, 12.9696],
    radius: 150,
    intensity: 0.6,
    message: '💡 Low lighting zone'
  }
];

export const COMMUNITY_REPORTS = [
  {
    id: 'r1',
    type: 'danger',
    location: [77.5976, 12.9746],
    comment: 'Suspicious activity reported last night.',
    timestamp: new Date().toISOString()
  }
];
