import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Industrial User',
    email: 'user@saferoute.ai',
    emergencyContacts: [
      { id: 1, name: 'Main Emergency', phone: '112' },
      { id: 2, name: 'Family Guard', phone: '+123456789' }
    ],
    savedRoutes: []
  });

  const saveRoute = (route) => {
    setUser(prev => ({
      ...prev,
      savedRoutes: [...prev.savedRoutes, route]
    }));
    alert("📍 Route Saved to Travel Log!");
  };

  const addContact = (contact) => {
    setUser(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, contact]
    }));
  };

  return (
    <UserContext.Provider value={{ user, saveRoute, addContact }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
