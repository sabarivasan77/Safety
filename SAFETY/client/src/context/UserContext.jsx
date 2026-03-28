import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userState, setUserState] = useState({
    currentLocation: { lat: 13.0827, lng: 80.2707 }, // Default Chennai
    start: null,
    destination: null,
    routes: null,
    selectedRoute: null, // 'fastest' or 'safe'
    nearbyHelp: [],
    monitoringActive: false,
    status: 'Safe', // 'Safe', 'Warning', 'Emergency'
    lastCheckIn: null,
    emergencyContacts: [
      { id: 1, name: 'Main Emergency', phone: '112' },
      { id: 2, name: 'Family Guard', phone: '+123456789' }
    ],
    mode: '2d' // '2d' or '3d'
  });

  const [timer, setTimer] = useState(0);
  const [isSOSActive, setIsSOSActive] = useState(false);

  /**
   * Safety Loop System:
   * EVERY 5 MINUTES (reduced for demo/testing but logic remains same)
   */
  const CHECK_IN_INTERVAL = 300; // 5 mins = 300s
  const WARNING_DELAY = 60;     // Reminder delay = 60s
  const ALERT_DELAY = 120;      // Alert delay = 120s
  const ALARM_DELAY = 180;      // Alarm delay = 180s
  const SOS_AUTO_DELAY = 240;   // Auto SOS = 240s

  useEffect(() => {
    let interval;
    if (userState.monitoringActive && userState.status !== 'Emergency') {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [userState.monitoringActive, userState.status]);

  /**
   * Monitor timer to trigger alerts
   */
  useEffect(() => {
    if (timer >= CHECK_IN_INTERVAL && userState.status === 'Safe') {
      setUserState(prev => ({ ...prev, status: 'Warning' }));
      // Notification logic here
    }

    if (userState.status === 'Warning') {
      const waitTime = timer - CHECK_IN_INTERVAL;
      if (waitTime >= SOS_AUTO_DELAY) {
        activateSOS();
      }
    }
  }, [timer, userState.status]);

  const resetSafetyTimer = useCallback(() => {
    setTimer(0);
    setUserState(prev => ({ ...prev, status: 'Safe', lastCheckIn: new Date() }));
  }, []);

  const activateSOS = useCallback(() => {
    setIsSOSActive(true);
    setUserState(prev => ({ ...prev, status: 'Emergency' }));
    // Logic to send location to nearby stations
    console.log("🚨 SOS ACTIVATED - Sending live location to nearest help points...");
  }, []);

  const updateLocation = (lat, lng) => {
    setUserState(prev => ({ ...prev, currentLocation: { lat, lng } }));
  };

  const setStart = (point) => {
    setUserState(prev => ({ ...prev, start: point }));
  };

  const setDestination = (point) => {
    setUserState(prev => ({ ...prev, destination: point }));
  };

  const setMode = (mode) => {
    setUserState(prev => ({ ...prev, mode }));
  };

  const toggleMonitoring = () => {
    setUserState(prev => ({ 
      ...prev, 
      monitoringActive: !prev.monitoringActive,
      status: 'Safe',
      lastCheckIn: new Date()
    }));
    setTimer(0);
  };

  return (
    <UserContext.Provider value={{ 
      userState, 
      setUserState,
      updateLocation,
      setStart,
      setDestination,
      setMode,
      toggleMonitoring,
      resetSafetyTimer,
      activateSOS,
      timer,
      isSOSActive
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
