# SafeRoute AI 🧠 🌍

Production-grade safety navigation system integrating **2D maps**, **3D visualization**, and **AI scoring**.

## 🚀 Key Features
- **2D Map System**: Mapbox GL JS with crime heatmaps and route rendering.
- **3D Visualization**: High-fidelity Three.js (React Three Fiber) immersive route viewing.
- **AI Safety Engine**: Proprietary algorithm for multi-factor safety scoring.
- **Emergency System**: One-tap SOS signal to contacts.
- **Community Reporting**: Pin local hazards directly on both maps.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Lucide React.
- **3D Canvas**: Three.js, R3F, Drei.
- **Backend**: Node.js, Express.
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
Used in this app:
$$Safety Score = (0.35 \times Crime) + (0.20 \times Lighting) + (0.15 \times Crowd) + (0.15 \times Time) + (0.15 \times Area)$$
