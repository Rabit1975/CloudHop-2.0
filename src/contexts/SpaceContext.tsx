import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Space {
  id: string;
  name: string;
  role: 'Admin' | 'Member' | 'Guest';
}

interface SpaceContextType {
  currentSpace: Space;
  setCurrentSpace: (space: Space) => void;
}

const defaultSpace: Space = {
  id: 'global-space',
  name: 'Global Workspace',
  role: 'Member'
};

const SpaceContext = createContext<SpaceContextType>({
  currentSpace: defaultSpace,
  setCurrentSpace: () => {}
});

export const SpaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSpace, setCurrentSpace] = useState<Space>(defaultSpace);

  return (
    <SpaceContext.Provider value={{ currentSpace, setCurrentSpace }}>
      {children}
    </SpaceContext.Provider>
  );
};

export const useSpace = () => useContext(SpaceContext);