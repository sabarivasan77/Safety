# SafeRoute AI 🧠 🌍

Production-grade safety navigation system integrating **2D maps**, **3D visualization**, and **AI scoring**.

## 🚀 Key Features
- **Safest Route Navigation**: Multi-factor analysis for optimal personal security.
- **2D Map System**: Mapbox GL JS with crime heatmaps and real-time routing.
- **3D Visualization**: Immersive Three.js (React Three Fiber) route viewing.
- **AI Safety Engine**: Proprietary algorithm for multi-factor safety scoring.
- **Emergency System**: Instant SOS signal to backend and contacts.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Lucide React, Framer Motion.
- **3D Canvas**: Three.js, R3F, Drei.
- **Backend**: Node.js, Express, Mongoose, Helmet.
- **Database**: MongoDB (Reports & Users).

## 📦 Getting Started

### 1. Installation
Run in both `client` and `server` folders:
```bash
npm install
```

### 2. Configuration
Create a `.env` in the client folder with your **Mapbox Token**:
```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
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

## 🧠 Safety Score Algorithm
$$Safety Score = (0.4 \times Crime) + (0.2 \times Lighting) + (0.15 \times Crowd) + (0.15 \times Time) + (0.1 \times Area)$$
Used in this app to classify routes as **Safe**, **Moderate**, or **Risky**.

## 📍 Deployment
- **Frontend**: Deploy `client` folder to Vercel (Production configuration included in `vercel.json`).
- **Backend**: Deploy `server` folder to Render or Heroku.
