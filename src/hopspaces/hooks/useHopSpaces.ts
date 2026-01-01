import { useState, useEffect } from 'react';
import { HopSpace, HopSpaceType, HopSpaceMood } from '../utils/types';
import { api } from '../../services/mockApi';

export const useHopSpaces = () => {
    const [spaces, setSpaces] = useState<HopSpace[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGalaxy = async () => {
            setLoading(true);
            const data = await api.getPublicSpaces();
            
            // Transform linear data into galaxy coordinates
            const galaxyData: HopSpace[] = data.map((s, i) => ({
                id: s.id,
                name: s.name,
                type: ['music', 'fluid_art', 'ideas', 'world', 'anima'][i % 5] as HopSpaceType,
                mood: ['calm', 'dreamy', 'intense', 'ethereal'][i % 4] as HopSpaceMood,
                created_at: new Date().toISOString(),
                cover_image_url: s.image,
                background_url: s.image,
                orbit_links: [],
                galaxy_position: {
                    x: 50 + Math.cos(i) * (20 + i * 2),
                    y: 50 + Math.sin(i) * (20 + i * 2),
                    layer: 1
                },
                glow_intensity: 1 + Math.random(),
                metadata: {}
            }));
            
            setSpaces(galaxyData);
            setLoading(false);
        };
        loadGalaxy();
    }, []);

    const createSpace = (data: { name: string; type: HopSpaceType; mood: HopSpaceMood }) => {
        const newSpace: HopSpace = {
            id: `new-${Date.now()}`,
            name: data.name,
            type: data.type,
            mood: data.mood,
            created_at: new Date().toISOString(),
            cover_image_url: `https://picsum.photos/seed/${data.name}/400/400`,
            background_url: `https://picsum.photos/seed/${data.name}-bg/800/600`,
            orbit_links: [],
            galaxy_position: { x: 50, y: 50, layer: 1 },
            glow_intensity: 2,
            metadata: {}
        };

        setSpaces(prev => [...prev, newSpace]);
        
        // Animate to position
        setTimeout(() => {
            setSpaces(prev => prev.map(s => s.id === newSpace.id ? { 
                ...s, 
                galaxy_position: { 
                    ...s.galaxy_position,
                    x: 50 + (Math.random() * 20 - 10), 
                    y: 50 + (Math.random() * 20 - 10) 
                } 
            } : s));
        }, 100);
    };

    return { spaces, loading, createSpace };
};
