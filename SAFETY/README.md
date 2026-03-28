# SafeRoute AI 🧠 🌍 (100% FREE Edition)

Production-grade safety navigation system integrating **2D maps**, **3D visualization**, and **AI scoring** using **100% Free & Open-Source Tools**.

## 🚀 Key Features
- **Safest Route Navigation**: Multi-factor analysis for personal security (Free Routing Engine).
- **2D Map System**: Leaflet.js + OpenStreetMap + OSRM Routing.
- **3D Visualization**: MapLibre GL JS (Open-source Mapbox alternative) for vector 3D buildings.
- **Free Search**: Nominatim OSM API for geocoding and autocomplete.
- **AI Safety Engine**: Procedural scoring for crowd, lighting, and crime patterns.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Lucide React, Framer Motion.
- **Mapping Engine**: Leaflet.js (2D), MapLibre GL JS (3D).
- **Data APIs**: OpenStreetMap (Tiles), OSRM (Routing), Nominatim (Geocoding).
- **Backend**: Node.js, Express, MongoDB.

## 📦 Getting Started

### 1. Installation
Run in both `client` and `server` folders:
```bash
npm install
```

### 2. Configuration (NO PAID API KEYS REQUIRED)
Create a `.env` in the client folder for backend URL:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Locally
**Server**:
```bash
cd server
npm run dev
```

**Client**:
```bash
cd client
npm run dev
```

## 🧠 Safety Score Algorithm (Free Model)
$$Safety Score = (0.4 \times Crime) + (0.2 \times Lighting) + (0.15 \times Crowd) + (0.15 \times Time) + (0.1 \times Area)$$
Used in this app to classify routes as **Safe**, **Moderate**, or **Risky**.

## 📍 Deployment
- **Frontend**: Deploy `client` folder to Vercel.
- **Backend**: Deploy `server` folder to Render or Heroku.
