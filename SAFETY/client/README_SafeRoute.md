# SafeRoute TN - Smart Safety Navigation System

SafeRoute TN is a production-grade, mobile-first safety navigation web application focused on Tamil Nadu, India. It provides real-time location search, intelligent route suggestions, continuous safety monitoring, SOS automation, and contextual safety insights.

## 🔥 Key Features

- **🌍 Tamil Nadu Optimized Search**: Smart search bar with auto-suggestions prioritized for Tamil Nadu villages, towns, and cities using Nominatim API.
- **🗺️ Hybrid 2D/3D Navigation**: 
  - **2D Map**: high-visibility Leaflet.js map with OSRM routing.
  - **3D Sim**: Procedural 3D simulation mode for route visualization using React Three Fiber.
- **🚨 Intelligent Safety Loop**: Automated 5-minute check-in system that escalates to mobile alarms and SOS activation if the user doesn't respond.
- **🆘 SOS Automation**: One-tap and automated emergency activation that broadcasts live location to nearby police stations, petrol bunks, and emergency contacts.
- **🧠 Safety Score System**: Real-time calculation of safety scores based on crowd density, public lighting (proxy), area type, and emergency accessibility.
- **🏥 Nearby Help Discovery**: Intelligent discovery of nearby hospitals, police stations, and petrol bunks along your route.
- **💬 Safety Chatbot**: AI-like assistant with pre-built safety questions for quick advice and routing info.

## 🛠️ Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS 4.0
- **Mapping**: Leaflet.js + OpenStreetMap (HOT tiles)
- **3D Engine**: Three.js + React Three Fiber
- **Data APIs**: 
  - OSRM (Routing)
  - Nominatim (Geocoding/Search)
  - Overpass/Nominatim (Nearby Search)
- **State Management**: React Context API
- **Animations**: Framer Motion

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Run dev server**:
   ```bash
   npm run dev
   ```
3. **Visit**: `http://localhost:5174`

## 📱 Mobile-First Design
The UI is built with a "mobile-first" philosophy, featuring large touch targets, premium glassmorphism aesthetics, and high-visibility status indicators for critical safety information.
