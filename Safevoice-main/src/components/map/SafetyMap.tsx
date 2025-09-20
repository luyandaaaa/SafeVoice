import { useState, useEffect } from "react";
// Helper: Haversine formula for distance between two lat/lng points
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Types
interface Incident {
  id: string;
  type: string;
  date: string;
  location: string;
  risk: 'low' | 'medium' | 'high';
  tips: string;
  lat?: number;
  lng?: number;
}
interface SafeZone {
  id: string;
  name: string;
  type: 'shelter' | 'crisis' | 'police' | 'legal' | 'guardian';
  location: string;
  contact: string;
  beds?: number;
  available?: boolean;
}
interface Guardian {
  id: string;
  name: string;
  location: string;
  tracking: boolean;
}

export const SafetyMap = () => {
  // Map Data
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedZone, setSelectedZone] = useState<SafeZone | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
  }, []);
  const [filters, setFilters] = useState({ type: 'all', time: '24h', demographic: 'all' });
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportType, setReportType] = useState('physical');
  const [reportDesc, setReportDesc] = useState('');
  const [proximityAlert, setProximityAlert] = useState('');
  const [routeSafety, setRouteSafety] = useState('');
  const [geoAlert, setGeoAlert] = useState('');
  const [predictiveRisk, setPredictiveRisk] = useState('');

  useEffect(() => {
    // Mock incidents with coordinates (Gauteng area for demo)
    setIncidents([
      { id: '1', type: 'physical assault', date: '2025-08-05 18:30', location: 'Johannesburg CBD', risk: 'high', tips: 'Stay in well-lit areas, call for help.', lat: -26.2041, lng: 28.0473 },
      { id: '2', type: 'stalking', date: '2025-08-06 07:15', location: 'Soweto', risk: 'medium', tips: 'Travel in groups, report suspicious activity.', lat: -26.2485, lng: 27.8540 },
      { id: '3', type: 'harassment', date: '2025-08-06 09:00', location: 'Pretoria', risk: 'low', tips: 'Avoid confrontation, seek assistance.', lat: -25.7479, lng: 28.2293 },
      { id: '4', type: 'theft', date: '2025-08-06 12:00', location: 'Sandton', risk: 'medium', tips: 'Keep valuables hidden, stay alert.', lat: -26.1076, lng: 28.0567 },
      { id: '5', type: 'kidnapping', date: '2025-08-06 15:30', location: 'Tembisa', risk: 'high', tips: 'Avoid isolated areas, inform someone of your whereabouts.', lat: -25.9950, lng: 28.2267 },
      { id: '6', type: 'rape', date: '2025-08-06 20:00', location: 'Alexandra', risk: 'high', tips: 'Seek immediate help, call emergency services.', lat: -26.1036, lng: 28.0896 },
      { id: '7', type: 'domestic violence', date: '2025-08-07 01:30', location: 'Midrand', risk: 'high', tips: 'Contact a trusted person or shelter, call for help.', lat: -25.9992, lng: 28.1260 },
      { id: '8', type: 'sexual harassment', date: '2025-08-07 08:45', location: 'Braamfontein', risk: 'medium', tips: 'Document the incident, seek support.', lat: -26.1926, lng: 28.0341 },
      { id: '9', type: 'abduction', date: '2025-08-07 11:20', location: 'Benoni', risk: 'high', tips: 'Alert authorities immediately, stay visible.', lat: -26.1885, lng: 28.3208 },
      { id: '10', type: 'emotional abuse', date: '2025-08-07 14:00', location: 'Kempton Park', risk: 'medium', tips: 'Reach out to support services, talk to someone you trust.', lat: -26.1337, lng: 28.2225 },
      // More cases in Gauteng and surrounding areas
      { id: '11', type: 'rape', date: '2025-08-07 16:00', location: 'Vereeniging', risk: 'high', tips: 'Seek immediate help, call emergency services.', lat: -26.6736, lng: 27.9310 },
      { id: '12', type: 'domestic violence', date: '2025-08-07 17:30', location: 'Krugersdorp', risk: 'high', tips: 'Contact a trusted person or shelter, call for help.', lat: -26.1108, lng: 27.7752 },
      { id: '13', type: 'sexual harassment', date: '2025-08-07 18:45', location: 'Randburg', risk: 'medium', tips: 'Document the incident, seek support.', lat: -26.0941, lng: 28.0134 },
      { id: '14', type: 'abduction', date: '2025-08-07 19:20', location: 'Springs', risk: 'high', tips: 'Alert authorities immediately, stay visible.', lat: -26.2516, lng: 28.4428 },
      { id: '15', type: 'physical assault', date: '2025-08-07 20:00', location: 'Roodepoort', risk: 'high', tips: 'Stay in well-lit areas, call for help.', lat: -26.1625, lng: 27.8725 },
      { id: '16', type: 'theft', date: '2025-08-07 21:00', location: 'Boksburg', risk: 'medium', tips: 'Keep valuables hidden, stay alert.', lat: -26.2125, lng: 28.2536 },
      { id: '17', type: 'kidnapping', date: '2025-08-07 22:00', location: 'Germiston', risk: 'high', tips: 'Avoid isolated areas, inform someone of your whereabouts.', lat: -26.2172, lng: 28.1706 },
      { id: '18', type: 'rape', date: '2025-08-07 23:00', location: 'Mamelodi', risk: 'high', tips: 'Seek immediate help, call emergency services.', lat: -25.7150, lng: 28.3892 },
      { id: '19', type: 'domestic violence', date: '2025-08-08 00:30', location: 'Randfontein', risk: 'high', tips: 'Contact a trusted person or shelter, call for help.', lat: -26.1833, lng: 27.7000 },
      { id: '20', type: 'sexual harassment', date: '2025-08-08 01:45', location: 'Centurion', risk: 'medium', tips: 'Document the incident, seek support.', lat: -25.8603, lng: 28.1894 },
      { id: '21', type: 'abduction', date: '2025-08-08 02:20', location: 'Carletonville', risk: 'high', tips: 'Alert authorities immediately, stay visible.', lat: -26.3600, lng: 27.3986 },
      { id: '22', type: 'emotional abuse', date: '2025-08-08 03:00', location: 'Heidelberg', risk: 'medium', tips: 'Reach out to support services, talk to someone you trust.', lat: -26.5047, lng: 28.3597 },
      { id: '23', type: 'physical assault', date: '2025-08-08 04:00', location: 'Nigel', risk: 'high', tips: 'Stay in well-lit areas, call for help.', lat: -26.4319, lng: 28.4776 },
      { id: '24', type: 'theft', date: '2025-08-08 05:00', location: 'Alberton', risk: 'medium', tips: 'Keep valuables hidden, stay alert.', lat: -26.2676, lng: 28.1223 },
      { id: '25', type: 'kidnapping', date: '2025-08-08 06:00', location: 'Brakpan', risk: 'high', tips: 'Avoid isolated areas, inform someone of your whereabouts.', lat: -26.2361, lng: 28.3694 }
    ]);
    // Mock safe zones
    setSafeZones([
      { id: '1', name: 'Sunrise Shelter', type: 'shelter', location: '5km', contact: '021-555-1234', beds: 3, available: true },
      { id: '2', name: 'Central Police', type: 'police', location: '2km', contact: '10111' },
      { id: '3', name: 'Legal Aid Centre', type: 'legal', location: '3km', contact: '021-555-5678' },
      { id: '4', name: 'Guardian Home - Mrs. Dlamini', type: 'guardian', location: '1km', contact: '083-555-9999', available: true }
    ]);
    // Mock guardians
    setGuardians([
      { id: '1', name: 'Thandi', location: 'Main St', tracking: true },
      { id: '2', name: 'Sipho', location: 'Park Ave', tracking: false }
    ]);
    // Proximity alert simulation
    setProximityAlert('You are 500m from a recently reported incident — stay alert.');
    setRouteSafety('AI suggests safer route via Oak St.');
    setGeoAlert('Entering high-risk area: Main St.');
    setPredictiveRisk('Forecast: Danger zone on Main St after 6pm.');
  }, []);

  // Filter incidents (all for now)
  const filteredIncidents = incidents;

  // AI-powered safe zone suggestion logic
  // 1. Only show safe zones that are far from high-risk incidents (e.g., >3km from any high-risk incident)
  // 2. Sort by distance to user (if available)
  let suggestedSafeZones = safeZones;
  if (userLocation) {
    // Find high-risk incident locations
    const highRiskIncidents = incidents.filter(i => i.risk === 'high' && i.lat && i.lng);
    suggestedSafeZones = safeZones
      .map(zone => {
        // For demo, assign random lat/lngs to safe zones near Gauteng
        let lat = -26.2 + Math.random() * 0.5;
        let lng = 28.0 + Math.random() * 0.5;
        // If zone already has lat/lng, use it (future-proofing)
        // @ts-ignore
        if (zone.lat && zone.lng) { lat = zone.lat; lng = zone.lng; }
        // Find min distance to any high-risk incident
        let minDistToHighRisk = Math.min(
          ...highRiskIncidents.map(i => getDistance(lat, lng, i.lat!, i.lng!)),
          9999
        );
        // Distance to user
        const distToUser = getDistance(userLocation.lat, userLocation.lng, lat, lng);
        return { ...zone, lat, lng, minDistToHighRisk, distToUser };
      })
      // Only show zones at least 3km from any high-risk incident
      .filter(z => z.minDistToHighRisk > 3)
      // Sort by distance to user
      .sort((a, b) => a.distToUser - b.distToUser)
      // Show top 3
      .slice(0, 3);
  }

  return (
    <div className="w-[95%] ml-[2%] space-y-6" style={{width: '95%'}}>
      <div className="mt-6 mb-6">
        <div className="rounded-lg border border-primary bg-primary/10 px-6 py-4 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Safety Map
          </h1>
        </div>
      </div>
      {/* 1. Live GBV Map */}
      <Card>
        <CardHeader>
          <CardTitle>Live GBV Map</CardTitle>
          <CardDescription>Markers show recent incidents. Click a marker for details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-2">
            <Badge variant="secondary">Green = Low Risk</Badge>
            <Badge variant="outline">Orange = Elevated Risk</Badge>
            <Badge variant="destructive">Red = High Risk</Badge>
            <Button
              size="sm"
              variant="secondary"
              className="ml-4"
              onClick={() => window.open('/AR.html', '_blank')}
            >
              Enable AR
            </Button>
          </div>
          <div className="mb-2">{predictiveRisk}</div>
          <div style={{ height: "350px", width: "100%", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
            <MapContainer center={[-26.2041, 28.0473]} zoom={10} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredIncidents.map(i => i.lat && i.lng && (
                <Marker
                  key={i.id}
                  position={[i.lat, i.lng]}
                  icon={L.icon({
                    iconUrl:
                      i.risk === 'high'
                        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'
                        : i.risk === 'medium'
                        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png'
                        : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
                    shadowSize: [41, 41],
                  })}
                  eventHandlers={{ click: () => setSelectedIncident(i) }}
                >
                  <Popup>
                    <div className="font-semibold mb-1">{i.type}</div>
                    <div className="text-xs mb-1">{i.date} | {i.location}</div>
                    <div className="mb-1">Risk: <Badge variant={i.risk === 'high' ? 'destructive' : i.risk === 'medium' ? 'outline' : 'secondary'}>{i.risk}</Badge></div>
                    <div className="mb-1">Tips: {i.tips}</div>
                    <Button size="sm" variant="outline" onClick={() => setSelectedIncident(i)}>Details</Button>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          {selectedIncident && (
            <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Incident Details</DialogTitle>
                  <DialogDescription>{selectedIncident.type} at {selectedIncident.location}</DialogDescription>
                </DialogHeader>
                <div>Date: {selectedIncident.date}</div>
                <div>Tips: {selectedIncident.tips}</div>
                <Button variant="secondary" onClick={() => setShowReportDialog(true)}>Report Anonymously</Button>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>

      {/* 2. AI-Powered Safe Zones */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Safe Zones</CardTitle>
          <CardDescription>
            {userLocation
              ? 'Suggested safe places based on your location and recent incidents.'
              : 'Enable location to get personalized safe zone suggestions.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {suggestedSafeZones.length === 0 && (
              <div className="text-sm text-muted-foreground">No safe zones found far enough from high-risk incidents.</div>
            )}
            {suggestedSafeZones.map(z => (
              <Card key={z.id} className="p-4">
                <div className="font-semibold mb-1">{z.name}</div>
                <div className="text-xs mb-1">{z.type} | {(z as any).lat?.toFixed(4)}, {(z as any).lng?.toFixed(4)}</div>
                <div className="mb-1">Contact: {z.contact}</div>
                {z.beds !== undefined && <div className="mb-1">Beds: {z.beds} {z.available ? '(Available)' : '(Full)'}</div>}
                {userLocation && <div className="mb-1 text-xs">Distance: {((z as any).distToUser).toFixed(2)} km</div>}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Pass destination info via query string for AR.html
                    const params = new URLSearchParams({
                      dest: z.name,
                      lat: (z as any).lat?.toString() || '',
                      lng: (z as any).lng?.toString() || ''
                    });
                    window.open(`/AR.html?${params.toString()}`, '_blank');
                  }}
                >
                  Get Directions
                </Button>
              </Card>
            ))}
          </div>
          {selectedZone && (
            <Dialog open={!!selectedZone} onOpenChange={() => setSelectedZone(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedZone.name}</DialogTitle>
                  <DialogDescription>{selectedZone.type} at {selectedZone.location}</DialogDescription>
                </DialogHeader>
                <div>Contact: {selectedZone.contact}</div>
                <Button variant="secondary">Open in Maps (Demo)</Button>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>

      {/* 3. Danger Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Danger Alerts</CardTitle>
          <CardDescription>Proximity, route, geo-fencing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2">{proximityAlert}</div>
          <div className="mb-2">{routeSafety}</div>
          <div className="mb-2">{geoAlert}</div>
        </CardContent>
      </Card>


      {/* Anonymous Reporting Dialog */}
      {showReportDialog && (
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Anonymous Report</DialogTitle>
              <DialogDescription>Report an incident or unsafe condition</DialogDescription>
            </DialogHeader>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger><SelectValue placeholder="Incident type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="physical">Physical Assault</SelectItem>
                <SelectItem value="stalking">Stalking</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="digital">Digital Abuse</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea value={reportDesc} onChange={e => setReportDesc(e.target.value)} placeholder="Describe the incident or unsafe condition" />
            <Button className="mt-2" onClick={() => { setShowReportDialog(false); setReportDesc(''); }}>Submit Report</Button>
          </DialogContent>
        </Dialog>
      )}
      <div className="h-6" />
    </div>
  );
};