import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Location } from '../types';

interface LocationContextType {
  location: Location;
  setLocation: (loc: Location) => void;
}

// Default to Haldia, West Bengal
export const defaultLocation: Location = {
  id: 'in-wb-purba-medinipur-haldia',
  label: 'Haldia, West Bengal',
  country: 'IN',
  state: 'West Bengal',
  district: 'Purba Medinipur',
  lat: 22.0667,
  lon: 88.0698,
  timezone: 'Asia/Kolkata',
  place_kind: 'place',
  place_name: 'Haldia'
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location>(defaultLocation);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
