import React, { useState } from 'react';
import { View } from '../types';
import GalaxyHomeScreen from '../hopspaces/galaxy/GalaxyHomeScreen';
import { SpaceShell } from '../hopspaces/spaces/SpaceShell';
import { SpaceInterior } from '../hopspaces/spaces/SpaceInterior';
import { useHopSpaces } from '../hopspaces/hooks/useHopSpaces';
import { HopSpace } from '../hopspaces/utils/types';

interface SpacesProps {
  onNavigate: (view: View) => void;
}

const Spaces: React.FC<SpacesProps> = ({ onNavigate }) => {
  const { spaces, createSpace } = useHopSpaces();
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);

  const handleEnterSpace = (space: HopSpace) => {
      setCurrentSpaceId(space.id);
  };

  const handleExitSpace = () => {
      setCurrentSpaceId(null);
  };

  const currentSpace = spaces.find(s => s.id === currentSpaceId);

  // Render Space Interior if selected
  if (currentSpace) {
      return (
          <SpaceShell space={currentSpace} onBack={handleExitSpace}>
              <SpaceInterior space={currentSpace} />
          </SpaceShell>
      );
  }

  // Render Galaxy View
  return (
      <GalaxyHomeScreen 
          spaces={spaces}
          onCreateSpace={createSpace}
          onEnterSpace={handleEnterSpace}
          galaxyMood="calm" // Ideally dynamic from hook
      />
  );
};

export default Spaces;
