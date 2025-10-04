"use client"

import * as React from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type Marker = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  status: string;
  icon: React.ReactNode;
};

type MapComponentProps = {
  markers: Marker[];
};

const mapImage = PlaceHolderImages.find(img => img.id === 'map-background');

const MapPositioner = ({ marker, mapSize }: { marker: Marker, mapSize: { width: number, height: number } }) => {
    const [position, setPosition] = React.useState({ x: 0, y: 0 });

    React.useEffect(() => {
        if (mapSize.width > 0 && mapSize.height > 0) {
            const x = ((marker.lng + 180) / 360) * mapSize.width;
            const y = ((90 - marker.lat) / 180) * mapSize.height;
            setPosition({ x, y });
        }
    }, [marker, mapSize]);

    if (position.x === 0 && position.y === 0) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 transform transition-transform duration-300 hover:scale-150"
                        style={{ left: `${position.x}px`, top: `${position.y}px` }}
                    >
                        <div className="relative animate-pulse">
                            <div className="absolute inset-0 rounded-full bg-primary/30"></div>
                            <div className="relative">{marker.icon}</div>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-bold">{marker.name}</p>
                    <p>{marker.status}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function MapComponent({ markers }: MapComponentProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const [mapSize, setMapSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setMapSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <Card className="w-full h-full overflow-hidden shadow-lg relative" ref={mapContainerRef}>
      {mapImage && (
        <Image
          src={mapImage.imageUrl}
          alt={mapImage.description}
          layout="fill"
          objectFit="cover"
          className="opacity-70 dark:opacity-50"
          data-ai-hint={mapImage.imageHint}
        />
      )}
      <div className="absolute inset-0">
        {markers.map((marker) => (
          <MapPositioner key={marker.id} marker={marker} mapSize={mapSize} />
        ))}
      </div>
    </Card>
  );
}
