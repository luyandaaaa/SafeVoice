import { useState, useEffect } from "react";
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
  const [filters, setFilters] = useState({ type: 'all', time: '24h', demographic: 'all' });
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportType, setReportType] = useState('physical');
  const [reportDesc, setReportDesc] = useState('');
  const [proximityAlert, setProximityAlert] = useState('');
  const [routeSafety, setRouteSafety] = useState('');
  const [geoAlert, setGeoAlert] = useState('');
  const [predictiveRisk, setPredictiveRisk] = useState('');

  useEffect(() => {
    // Mock incidents
    setIncidents([
      { id: '1', type: 'physical assault', date: '2025-08-05 18:30', location: 'Main St', risk: 'high', tips: 'Stay in well-lit areas, call for help.' },
      { id: '2', type: 'stalking', date: '2025-08-06 07:15', location: 'Park Ave', risk: 'medium', tips: 'Travel in groups, report suspicious activity.' },
      { id: '3', type: 'harassment', date: '2025-08-06 09:00', location: 'Mall Entrance', risk: 'low', tips: 'Avoid confrontation, seek assistance.' }
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

  // Filter incidents
  const filteredIncidents = incidents.filter(i =>
    (filters.type === 'all' || i.type === filters.type) &&
    (filters.time === '24h' || filters.time === '7d' || filters.time === '30d') // Mock: all incidents shown
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Safety Map</h1>
      {/* 1. Live GBV Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Live GBV Heatmap</CardTitle>
          <CardDescription>Colour-coded risk levels, updated in real time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-2">
            <Badge variant="secondary">Green = Low Risk</Badge>
            <Badge variant="outline">Orange = Elevated Risk</Badge>
            <Badge variant="destructive">Red = High Risk</Badge>
          </div>
          <div className="mb-2">{predictiveRisk}</div>
          <div className="grid gap-2 md:grid-cols-3">
            {filteredIncidents.map(i => (
              <Card key={i.id} className={`p-4 border-${i.risk === 'high' ? 'red-500' : i.risk === 'medium' ? 'orange-500' : 'green-500'}`}>
                <div className="font-semibold mb-1">{i.type}</div>
                <div className="text-xs mb-1">{i.date} | {i.location}</div>
                <div className="mb-1">Risk: <Badge variant={i.risk === 'high' ? 'destructive' : i.risk === 'medium' ? 'outline' : 'secondary'}>{i.risk}</Badge></div>
                <div className="mb-1">Tips: {i.tips}</div>
                <Button size="sm" variant="outline" onClick={() => setSelectedIncident(i)}>Details</Button>
              </Card>
            ))}
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

      {/* 2. Safe Zones */}
      <Card>
        <CardHeader>
          <CardTitle>Safe Zones</CardTitle>
          <CardDescription>Shelters, police, legal aid, guardian homes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {safeZones.map(z => (
              <Card key={z.id} className="p-4">
                <div className="font-semibold mb-1">{z.name}</div>
                <div className="text-xs mb-1">{z.type} | {z.location}</div>
                <div className="mb-1">Contact: {z.contact}</div>
                {z.beds !== undefined && <div className="mb-1">Beds: {z.beds} {z.available ? '(Available)' : '(Full)'}</div>}
                <Button size="sm" variant="outline" onClick={() => setSelectedZone(z)}>Get Directions</Button>
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

      {/* 4. Layers & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Layers & Filters</CardTitle>
          <CardDescription>Filter by type, time, demographic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-2">
            <Select value={filters.type} onValueChange={v => setFilters(f => ({ ...f, type: v }))}>
              <SelectTrigger><SelectValue placeholder="Incident type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="physical assault">Physical Assault</SelectItem>
                <SelectItem value="stalking">Stalking</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="digital abuse">Digital Abuse</SelectItem>
                <SelectItem value="theft">Theft</SelectItem>
                <SelectItem value="kidnapping">Kidnapping</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.time} onValueChange={v => setFilters(f => ({ ...f, time: v }))}>
              <SelectTrigger><SelectValue placeholder="Time filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.demographic} onValueChange={v => setFilters(f => ({ ...f, demographic: v }))}>
              <SelectTrigger><SelectValue placeholder="Demographic" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="children">Children</SelectItem>
                <SelectItem value="elderly">Elderly</SelectItem>
                <SelectItem value="LGBTQ+">LGBTQ+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 5. Community Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Community Integration</CardTitle>
          <CardDescription>Guardian tracking, escort, community reports, safety score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2">Guardian Live Tracking:</div>
          <div className="flex gap-2 mb-2">
            {guardians.map(g => (
              <Badge key={g.id} variant={g.tracking ? 'secondary' : 'outline'}>{g.name} ({g.location})</Badge>
            ))}
          </div>
          <Button variant="secondary">Request Escort (Demo)</Button>
          <div className="mb-2 mt-2">Community Reports:</div>
          <Button variant="outline" onClick={() => setShowReportDialog(true)}>Add Report</Button>
          <div className="mb-2 mt-2">Safety Score per Street: <Badge variant="secondary">Main St: 40</Badge> <Badge variant="outline">Park Ave: 70</Badge></div>
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
    </div>
  );
};