import React from 'react';
import { HopSpace } from '../utils/types';
import { FluidArtSpace } from './fluid-art/FluidArtSpace';
import { MusicSpace } from './music/MusicSpace';
import { IdeasSpace } from './ideas/IdeasSpace';
import { WorldSpace } from './world/WorldSpace';
import { AnimaSpace } from './anima/AnimaSpace';

export const SpaceInterior = ({ space }: { space: HopSpace }) => {
  switch (space.type) {
    case 'fluid_art':
      return <FluidArtSpace space={space} />;
    case 'music':
      return <MusicSpace space={space} />;
    case 'ideas':
      return <IdeasSpace space={space} />;
    case 'world':
      return <WorldSpace space={space} />;
    case 'anima':
      return <AnimaSpace space={space} />;
    default:
      return <div className="text-white">Unknown Space Type</div>;
  }
};
