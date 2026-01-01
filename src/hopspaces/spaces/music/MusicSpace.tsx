import React from 'react';
import { HopSpace } from '../../utils/types';

export const MusicSpace = ({ space }: { space: HopSpace }) => (
    <div className="flex items-center justify-center h-full text-white">
        <h1 className="text-4xl font-black uppercase italic">Music Space: {space.name}</h1>
    </div>
);
