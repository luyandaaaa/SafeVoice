import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Phone, Download, ExternalLink, Play, Video, FileText, Heart, Users, Globe, Search, Filter } from "lucide-react";

// Types
interface Resource {
  id: string;
  title: string;
  type: 'legal' | 'self-defense' | 'mental-health' | 'guide' | 'video' | 'audio';
  urgency?: boolean;
  languages: string[];
  content: string;
  audioUrl?: string;
  videoUrl?: string;
  downloadUrl?: string;
}
interface SafetyBadge {
  id: string;
  name: string;
  unlocked: boolean;
}
interface Document {
  id: string;
  name: string;
  url: string;
}

export const Resources = () => {
  // AI-Personalised Learning Paths
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedLang, setSelectedLang] = useState('english');
  const [stressLevel, setStressLevel] = useState('medium');
  const [mobility, setMobility] = useState('normal');
  const [province, setProvince] = useState('Western Cape');

  // Action First
  const [showShelterMap, setShowShelterMap] = useState(false);

  // Interactive Learning
  const [badges, setBadges] = useState<SafetyBadge[]>([]);
  const [lessonComplete, setLessonComplete] = useState(false);

  // Evidence & Documentation Hub
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showVault, setShowVault] = useState(false);

  // Expert Knowledge Streams
  const [showLawyerQA, setShowLawyerQA] = useState(false);

  useEffect(() => {
    // Mock resources
    setResources([
      { id: '1', title: 'Legal Steps in Your Province', type: 'legal', languages: ['english', 'afrikaans', 'zulu', 'xhosa'], content: 'Step-by-step legal process for GBV cases in your province.' },
      { id: '2', title: 'Self-Defense for All Mobility Levels', type: 'self-defense', languages: ['english', 'zulu'], content: 'Learn moves suited to your mobility.' },
      { id: '3', title: 'Mental Health Tools', type: 'mental-health', languages: ['english', 'xhosa'], content: 'Stress management and healing resources.' }
    ]);
    setBadges([
      { id: '1', name: 'Legal Rights Explorer', unlocked: false },
      { id: '2', name: 'Self-Defense Starter', unlocked: false },
      { id: '3', name: 'Mental Health Ally', unlocked: false }
    ]);
    setDocuments([
      { id: '1', name: 'Safety Plan', url: '/docs/safety-plan.pdf' },
      { id: '2', name: 'ID Copy', url: '/docs/id.pdf' }
    ]);
  }, []);

  // Unlock badge on lesson complete
  useEffect(() => {
    if (lessonComplete) {
      setBadges(badges => badges.map(b => b.id === '1' ? { ...b, unlocked: true } : b));
    }
  }, [lessonComplete]);

  // Download for later
  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  // USSD Resource Menu
  const handleUSSD = () => {
    alert('Dial *120*SAFE# for safety tips via text.');
  };

  // Bluetooth Share
  const handleBluetoothShare = () => {
    alert('Bluetooth sharing not implemented in demo.');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Resources</h1>
      {/* 1. AI-Personalised Learning Paths */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Personalised Learning Paths</CardTitle>
          <CardDescription>Adaptive content and multi-language narration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger><SelectValue placeholder="Select province" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Western Cape">Western Cape</SelectItem>
                <SelectItem value="Gauteng">Gauteng</SelectItem>
                <SelectItem value="KZN">KwaZulu-Natal</SelectItem>
                <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                <SelectItem value="Free State">Free State</SelectItem>
                <SelectItem value="Limpopo">Limpopo</SelectItem>
                <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                <SelectItem value="North West">North West</SelectItem>
                <SelectItem value="Northern Cape">Northern Cape</SelectItem>
              </SelectContent>
            </Select>
            <Select value={mobility} onValueChange={setMobility}>
              <SelectTrigger><SelectValue placeholder="Mobility level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="limited">Limited</SelectItem>
                <SelectItem value="wheelchair">Wheelchair</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stressLevel} onValueChange={setStressLevel}>
              <SelectTrigger><SelectValue placeholder="Stress level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {resources.map(r => (
              <Card key={r.id} className="p-4">
                <div className="font-semibold mb-2">{r.title}</div>
                <div className="mb-2">{r.content}</div>
                <div className="flex gap-2">
                  <Button size="sm">Text</Button>
                  <Button size="sm">Audio</Button>
                  <Button size="sm">Video</Button>
                </div>
                <div className="mt-2 flex gap-2">
                  {r.languages.map(lang => <Badge key={lang} variant="secondary">{lang}</Badge>)}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. Action First Resource Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Action First</CardTitle>
          <CardDescription>Urgent help at your fingertips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={() => window.location.href = 'tel:0800428428'}>Call GBV Hotline</Button>
            <Button variant="secondary">Generate Restraining Order Draft</Button>
            <Button variant="outline" onClick={() => setShowShelterMap(true)}>Find Nearest Shelter</Button>
          </div>
          {showShelterMap && (
            <div className="mt-4">[Map placeholder: Nearest shelters based on GPS]</div>
          )}
        </CardContent>
      </Card>

      {/* 3. Interactive Learning */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Learning</CardTitle>
          <CardDescription>Simulations, AR training, gamification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2">
            <Button variant="secondary" onClick={() => setLessonComplete(true)}>Start Rights & Law Simulation</Button>
            <Button variant="outline">Self-Defense AR Training (Demo)</Button>
          </div>
          <div className="mb-2">
            <strong>Safety Badges:</strong>
            <div className="flex gap-2 mt-2">
              {badges.map(b => <Badge key={b.id} variant={b.unlocked ? 'secondary' : 'outline'}>{b.name}</Badge>)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Evidence & Documentation Hub */}
      <Card>
        <CardHeader>
          <CardTitle>Evidence & Documentation Hub</CardTitle>
          <CardDescription>Printable plans, encrypted vault</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2">
            <Button variant="secondary" onClick={() => handleDownload('/docs/safety-plan.pdf')}>Download Safety Plan</Button>
            <Button variant="outline" onClick={() => setShowVault(true)}>Access Encrypted Vault</Button>
          </div>
          {showVault && (
            <div className="mt-2">
              <strong>Vault Documents:</strong>
              <ul className="list-disc ml-4">
                {documents.map(d => <li key={d.id}><a href={d.url} target="_blank" rel="noopener noreferrer">{d.name}</a></li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Expert Knowledge Streams */}
      <Card>
        <CardHeader>
          <CardTitle>Expert Knowledge Streams</CardTitle>
          <CardDescription>Live Q&A, health info, empowerment guides</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2">
            <Button variant="secondary" onClick={() => setShowLawyerQA(true)}>Ask a Lawyer (Live Session)</Button>
            <Button variant="outline">Health Corner</Button>
            <Button variant="outline">Economic Empowerment Guide</Button>
          </div>
          {showLawyerQA && (
            <div className="mt-2">[Live Q&A placeholder: Lawyer answers questions here]</div>
          )}
        </CardContent>
      </Card>

      {/* 6. Offline & Low-Data Friendly */}
      <Card>
        <CardHeader>
          <CardTitle>Offline & Low-Data Friendly</CardTitle>
          <CardDescription>Download, USSD, Bluetooth share</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => handleDownload('/docs/legal-guide.pdf')}>Download Guide</Button>
            <Button variant="outline" onClick={handleUSSD}>USSD Resource Menu</Button>
            <Button variant="outline" onClick={handleBluetoothShare}>Bluetooth Share</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};