"use client";

import * as React from 'react';
import Link from 'next/link';
import { Flower, Leaf, MapPin, Search, LogIn } from 'lucide-react';
import { Header } from '@/components/app/header';
import { MapComponent, type Marker } from '@/components/app/map';
import { MonitorPanel } from '@/components/app/monitor-panel';
import { ForecastPanel } from '@/components/app/forecast-panel';
import { CitizenSciencePanel } from '@/components/app/citizen-science-panel';
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Initial hotspots to display on the map
const initialHotspots: Marker[] = [
  { id: '1', lat: 34.724, lng: -118.39, name: 'California Poppy Reserve', status: 'High Probability', icon: <Flower className="text-accent" /> },
  { id: '2', lat: 43.593, lng: -116.195, name: 'Boise National Forest', status: 'Moderate Bloom', icon: <Leaf className="text-primary" /> },
  { id: '3', lat: -3.465, lng: -62.215, name: 'Amazon Rainforest', status: 'Active Bloom', icon: <Flower className="text-destructive" /> },
  { id: '4', lat: 35.689, lng: 139.691, name: 'Tokyo, Japan', status: 'Upcoming Season', icon: <Leaf className="text-yellow-500" /> },
];

export default function Home() {
  const [markers, setMarkers] = React.useState<Marker[]>(initialHotspots);
  const { user } = useUser();

  const addMarker = (marker: Omit<Marker, 'id'>) => {
    setMarkers(prev => [...prev, { ...marker, id: String(Date.now()) }]);
  };

  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        className="flex flex-col bg-card border-r"
      >
        <SidebarHeader className="p-4">
          <Link href="/" className="font-headline text-2xl font-bold tracking-tight text-primary">
            BloomWatch AI
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-0 flex-1">
          <Tabs defaultValue="monitor" className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3 px-4">
              <TabsTrigger value="monitor">
                <Search className="h-4 w-4 mr-2" /> Monitor
              </TabsTrigger>
              <TabsTrigger value="forecast">
                <Flower className="h-4 w-4 mr-2" /> Forecast
              </TabsTrigger>
              <TabsTrigger value="citizen">
                <MapPin className="h-4 w-4 mr-2" /> Report
              </TabsTrigger>
            </TabsList>
            <Separator />
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="monitor" className="mt-0 p-4">
                <MonitorPanel addMarker={addMarker} />
              </TabsContent>
              <TabsContent value="forecast" className="mt-0 p-4">
                <ForecastPanel addMarker={addMarker} />
              </TabsContent>
              <TabsContent value="citizen" className="mt-0 p-4">
                {user ? (
                  <CitizenSciencePanel addMarker={addMarker} />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Join the Community</CardTitle>
                      <CardDescription>
                        Sign in to report sightings and help map bloom events. Guests can also report.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CitizenSciencePanel addMarker={addMarker} />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t">
          <Button variant="outline" onClick={() => setMarkers(initialHotspots)}>
            Reset Markers
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6 relative">
          <MapComponent markers={markers} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
