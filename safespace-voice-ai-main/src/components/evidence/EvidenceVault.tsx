import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText, Image, Video, Music, Download, Eye, Trash2, Lock, Share, Plus, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types
interface EvidenceFile {
  id: string;
  name: string;
  type: 'photo' | 'video' | 'audio' | 'document';
  incidentId?: string;
  date: string;
  location?: string;
  status: 'submitted' | 'pending' | 'ready';
  hash: string;
  summary: string;
  category: string;
  url: string;
}

export const EvidenceVault = () => {
  // Evidence Dashboard
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [search, setSearch] = useState("");
  const [stealthMode, setStealthMode] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState<'photo' | 'video' | 'audio' | 'document' | 'batch'>('photo');
  const [selectedIncident, setSelectedIncident] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load evidence files from localStorage
    const savedFiles = localStorage.getItem('safevoice_evidence');
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    } else {
      // Initialize with mock data
      initializeMockData();
    }
  }, []);

  const initializeMockData = () => {
    const mockFiles: EvidenceFile[] = [
      {
        id: '1',
        name: 'Injury Photo',
        type: 'photo',
        incidentId: 'INC-001',
        date: '2025-08-01',
        location: 'Cape Town',
        status: 'submitted',
        hash: 'abc123',
        summary: 'Photo of bruise on arm',
        category: 'Medical Evidence',
        url: '/evidence/injury.jpg'
      },
      {
        id: '2',
        name: 'Threat Message',
        type: 'document',
        incidentId: 'INC-002',
        date: '2025-08-02',
        location: 'Johannesburg',
        status: 'pending',
        hash: 'def456',
        summary: 'Screenshot of threatening WhatsApp',
        category: 'Digital Threats',
        url: '/evidence/threat.pdf'
      },
      {
        id: '3',
        name: 'Audio Testimony',
        type: 'audio',
        incidentId: 'INC-001',
        date: '2025-08-03',
        location: 'Cape Town',
        status: 'ready',
        hash: 'ghi789',
        summary: 'Verbal account of incident',
        category: 'Verbal Abuse',
        url: '/evidence/testimony.mp3'
      }
    ];

    setFiles(mockFiles);
    localStorage.setItem('safevoice_evidence', JSON.stringify(mockFiles));
  };

  // Search by keyword
  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.summary.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  // Upload simulation
  const handleUpload = () => {
    setShowUpload(false);
    toast({ title: "Upload", description: "Upload simulated. Blockchain timestamp, hash, and summary generated." });
    // Simulate blockchain timestamp, hash, summary, category
    // Add new file to files (mock)
  };

  // Stealth mode UI
  if (stealthMode) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Calculator</h2>
        <Input placeholder="0" readOnly />
        <Button className="mt-4" onClick={() => setStealthMode(false)}>Exit Stealth Mode</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Evidence Vault</h1>
      {/* 1. Evidence Overview Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Evidence Overview</CardTitle>
          <CardDescription>Dashboard of all stored evidence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2">Evidence Count: <Badge variant="secondary">{files.length}</Badge></div>
          <div className="mb-2">
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by keyword (e.g. gun, threat, bruise)" />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {filteredFiles.map(f => (
              <Card key={f.id} className="p-4">
                <div className="font-semibold mb-1">{f.name}</div>
                <div className="text-xs mb-1">Incident: {f.incidentId || 'Unlinked'} | Date: {f.date} | Location: {f.location || 'N/A'}</div>
                <div className="mb-1">Status: <Badge variant={f.status === 'submitted' ? 'secondary' : f.status === 'pending' ? 'outline' : 'destructive'}>{f.status}</Badge></div>
                <div className="mb-1">Category: <Badge variant="secondary">{f.category}</Badge></div>
                <div className="mb-1">Summary: {f.summary}</div>
                <div className="mb-1">Blockchain: <span className="text-xs">{f.hash}</span></div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline">Share with Lawyer</Button>
                  <Button size="sm" variant="secondary">Court-Ready Export</Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. Upload Options */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Evidence</CardTitle>
          <CardDescription>Quick, batch, scan & store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-2">
            <Select value={uploadType} onValueChange={v => setUploadType(v as typeof uploadType)}>
              <SelectTrigger><SelectValue placeholder="Upload type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="batch">Batch Upload</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowUpload(true)}>Upload</Button>
            <Button variant="outline">Scan & Store</Button>
          </div>
          {showUpload && (
            <Dialog open={showUpload} onOpenChange={setShowUpload}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload {uploadType}</DialogTitle>
                  <DialogDescription>Simulate upload (camera, audio, gallery)</DialogDescription>
                </DialogHeader>
                <Input type="file" multiple={uploadType === 'batch'} />
                <Button className="mt-2" onClick={handleUpload}>Confirm Upload</Button>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>

      {/* 3. Security & Authenticity */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Authenticity</CardTitle>
          <CardDescription>Blockchain timestamping, encryption, stealth mode</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2">All uploads are timestamped, geo-tagged, and hashed for tamper-proof proof.</div>
          <div className="mb-2">End-to-end encryption: Only you and authorised legal contacts can decrypt files.</div>
          <Button variant="outline" onClick={() => setStealthMode(true)}>Enable Stealth Mode</Button>
        </CardContent>
      </Card>

      {/* 4. AI-Powered Organisation */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Organisation</CardTitle>
          <CardDescription>Auto-categorisation, smart summaries, search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2">Files are auto-categorised and summarised for quick review.</div>
          <div className="mb-2">Search by keyword to find evidence instantly.</div>
        </CardContent>
      </Card>

      {/* 5. Legal Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Integration</CardTitle>
          <CardDescription>Direct lawyer share, court-ready export, incident auto-link</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2">Share evidence securely with your assigned advocate.</div>
          <div className="mb-2">Export all files in legal format with chain of custody log.</div>
          <div className="mb-2">Evidence captured during SOS mode is auto-linked to incident reports.</div>
        </CardContent>
      </Card>
    </div>
  );
};