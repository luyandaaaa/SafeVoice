import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

// Types
interface SafetyCircle {
  id: string;
  name: string;
  geo: string;
  members: string[];
  alerts: string[];
}
interface Mentor {
  id: string;
  name: string;
  languages: string[];
  badge: string;
  type: 'survivor' | 'advocate';
  available: boolean;
}
interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  type: string;
}
interface Petition {
  id: string;
  title: string;
  description: string;
  signed: boolean;
}
interface Reward {
  id: string;
  name: string;
  points: number;
}

export const Community = () => {
  // Safety Circles
  const [circles, setCircles] = useState<SafetyCircle[]>([]);
  const [joinedCircle, setJoinedCircle] = useState<string | null>(null);
  const [circleAlert, setCircleAlert] = useState("");

  // Multi-Modal Support
  const [activeRoom, setActiveRoom] = useState<'text' | 'voice' | 'video' | 'listen'>('text');
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMsg, setInputMsg] = useState("");

  // Mentor Directory
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  // Events & Activism
  const [events, setEvents] = useState<Event[]>([]);
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [crowdfundAmount, setCrowdfundAmount] = useState("");

  // Reputation & Rewards
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    // Mock data initialization
    setCircles([
      { id: '1', name: 'District 6', geo: 'Cape Town', members: ['user1'], alerts: ['Safe house 2 streets away is open'] },
      { id: '2', name: 'Soweto Block B', geo: 'Johannesburg', members: [], alerts: [] }
    ]);
    setMentors([
      { id: '1', name: 'Thandi M.', languages: ['isiZulu', 'English'], badge: 'Verified Survivor Mentor', type: 'survivor', available: true },
      { id: '2', name: 'Adv. Sipho N.', languages: ['isiXhosa', 'English'], badge: 'Community Advocate', type: 'advocate', available: true }
    ]);
    setEvents([
      { id: '1', title: 'Self-Defense Workshop', location: 'Community Hall', date: '2025-08-10', type: 'self-defense' },
      { id: '2', title: 'Mental Health Talk', location: 'Clinic', date: '2025-08-12', type: 'mental-health' }
    ]);
    setPetitions([
      { id: '1', title: 'End GBV in Schools', description: 'Petition to improve safety in schools.', signed: false },
      { id: '2', title: 'Support Survivor Shelters', description: 'Increase funding for shelters.', signed: false }
    ]);
    setRewards([
      { id: '1', name: 'Airtime Bundle', points: 50 },
      { id: '2', name: 'Safety Gadget', points: 100 },
      { id: '3', name: 'Legal Consultation Voucher', points: 150 }
    ]);
    // Load points from localStorage
    const savedPoints = localStorage.getItem('community_points');
    if (savedPoints) setPoints(Number(savedPoints));
  }, []);

  // Safety Circle join/leave
  const handleJoinCircle = (id: string) => {
    setJoinedCircle(id);
    setPoints(p => { const newP = p + 5; localStorage.setItem('community_points', String(newP)); return newP; });
  };
  const handleLeaveCircle = () => setJoinedCircle(null);
  const handleSendAlert = () => {
    if (!circleAlert) return;
    setCircles(circles.map(c => c.id === joinedCircle ? { ...c, alerts: [...c.alerts, circleAlert] } : c));
    setCircleAlert("");
    setPoints(p => { const newP = p + 2; localStorage.setItem('community_points', String(newP)); return newP; });
  };

  // Multi-modal chat
  const handleSendMsg = () => {
    if (!inputMsg) return;
    setMessages([...messages, inputMsg]);
    setInputMsg("");
    setPoints(p => { const newP = p + 1; localStorage.setItem('community_points', String(newP)); return newP; });
  };

  // Mentor booking
  const handleBookMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowBooking(true);
    setPoints(p => { const newP = p + 3; localStorage.setItem('community_points', String(newP)); return newP; });
  };

  // Petition signing
  const handleSignPetition = (id: string) => {
    setPetitions(petitions.map(p => p.id === id ? { ...p, signed: true } : p));
    setPoints(p => { const newP = p + 2; localStorage.setItem('community_points', String(newP)); return newP; });
  };

  // Crowdfunding
  const handleCrowdfund = () => {
    setCrowdfundAmount("");
    setPoints(p => { const newP = p + 1; localStorage.setItem('community_points', String(newP)); return newP; });
  };

  // Redeem reward
  const handleRedeem = (reward: Reward) => {
    if (points >= reward.points) {
      setPoints(p => { const newP = p - reward.points; localStorage.setItem('community_points', String(newP)); return newP; });
      alert(`Redeemed: ${reward.name}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Community</h1>
      {/* 1. Hyperlocal Safety Circles */}
      <Card>
        <CardHeader>
          <CardTitle>Hyperlocal Safety Circles</CardTitle>
          <CardDescription>Neighbourhood Watch 2.0</CardDescription>
        </CardHeader>
        <CardContent>
          {joinedCircle ? (
            <div>
              <p>You are in: <strong>{circles.find(c => c.id === joinedCircle)?.name}</strong></p>
              <Button variant="outline" onClick={handleLeaveCircle}>Leave Circle</Button>
              <div className="mt-4">
                <Input value={circleAlert} onChange={e => setCircleAlert(e.target.value)} placeholder="Send a circle alert (e.g. Safe house open)" />
                <Button className="mt-2" onClick={handleSendAlert}>Send Alert</Button>
                <div className="mt-2">
                  <strong>Circle Alerts:</strong>
                  <ul className="list-disc ml-4">
                    {circles.find(c => c.id === joinedCircle)?.alerts.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p>Join a safety circle in your area (geo-verified members only):</p>
              <div className="flex gap-2 mt-2">
                {circles.map(c => (
                  <Button key={c.id} onClick={() => handleJoinCircle(c.id)}>{c.name} ({c.geo})</Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Multi-Modal Support */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Modal Support</CardTitle>
          <CardDescription>Text, Voice, Video, Listening Rooms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-2">
            <Button variant={activeRoom === 'text' ? 'secondary' : 'outline'} onClick={() => setActiveRoom('text')}>Text</Button>
            <Button variant={activeRoom === 'voice' ? 'secondary' : 'outline'} onClick={() => setActiveRoom('voice')}>Voice</Button>
            <Button variant={activeRoom === 'video' ? 'secondary' : 'outline'} onClick={() => setActiveRoom('video')}>Video</Button>
            <Button variant={activeRoom === 'listen' ? 'secondary' : 'outline'} onClick={() => setActiveRoom('listen')}>Listening Room</Button>
          </div>
          {activeRoom === 'text' && (
            <div>
              <div className="mb-2">Text chat (anonymous):</div>
              <div className="border p-2 h-32 overflow-y-auto mb-2">
                {messages.map((msg, i) => <div key={i} className="mb-1">{msg}</div>)}
              </div>
              <div className="flex gap-2">
                <Input value={inputMsg} onChange={e => setInputMsg(e.target.value)} placeholder="Type your message..." />
                <Button onClick={handleSendMsg}>Send</Button>
              </div>
            </div>
          )}
          {activeRoom === 'voice' && (
            <div>Voice group support (isiZulu, isiXhosa, Sesotho, etc.)<br /><Badge variant="secondary">Encrypted</Badge></div>
          )}
          {activeRoom === 'video' && (
            <div>Video healing circle (optional face-to-face)<br /><Badge variant="secondary">Encrypted</Badge></div>
          )}
          {activeRoom === 'listen' && (
            <div>Drop-in Listening Room: Just listen to survivor stories or expert advice.</div>
          )}
        </CardContent>
      </Card>

      {/* 3. Mentor & Advocate Directory */}
      <Card>
        <CardHeader>
          <CardTitle>Mentor & Advocate Directory</CardTitle>
          <CardDescription>Verified survivor mentors and advocates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {mentors.map(m => (
              <div key={m.id} className="flex items-center gap-2 border p-2 rounded">
                <span className="font-semibold">{m.name}</span>
                <Badge variant="secondary">{m.badge}</Badge>
                <span className="text-xs">{m.languages.join(', ')}</span>
                <Button size="sm" onClick={() => handleBookMentor(m)} disabled={!m.available}>Book</Button>
              </div>
            ))}
          </div>
          <Dialog open={showBooking} onOpenChange={setShowBooking}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book Mentor/Advocate</DialogTitle>
                <DialogDescription>Schedule a private call with {selectedMentor?.name}</DialogDescription>
              </DialogHeader>
              <Input type="date" placeholder="Select date" />
              <Button className="mt-2" onClick={() => setShowBooking(false)}>Confirm Booking</Button>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* 4. Safe Events & Activism */}
      <Card>
        <CardHeader>
          <CardTitle>Safe Events & Activism</CardTitle>
          <CardDescription>Workshops, petitions, crowdfunding</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <strong>Workshops Map:</strong>
            <ul className="list-disc ml-4">
              {events.map(e => (
                <li key={e.id}>{e.title} - {e.location} ({e.date})</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <strong>Petition Hub:</strong>
            <ul className="list-disc ml-4">
              {petitions.map(p => (
                <li key={p.id}>
                  {p.title} <Button size="sm" variant={p.signed ? 'secondary' : 'outline'} onClick={() => handleSignPetition(p.id)} disabled={p.signed}>{p.signed ? 'Signed' : 'Sign'}</Button>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <strong>Crowdfunding:</strong>
            <Input value={crowdfundAmount} onChange={e => setCrowdfundAmount(e.target.value)} placeholder="Enter amount to donate (ZAR)" />
            <Button className="mt-2" onClick={handleCrowdfund}>Donate</Button>
          </div>
        </CardContent>
      </Card>

      {/* 5. Community Reputation & Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Community Reputation & Rewards</CardTitle>
          <CardDescription>Earn Good Guardian Points & redeem rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2">Points: <Badge variant="secondary">{points}</Badge></div>
          <div className="mb-2">
            <strong>Earn points for:</strong>
            <ul className="list-disc ml-4">
              <li>Checking in daily</li>
              <li>Sharing useful resources</li>
              <li>Helping others in chat</li>
            </ul>
          </div>
          <div>
            <strong>Redeemable Rewards:</strong>
            <ul className="list-disc ml-4">
              {rewards.map(r => (
                <li key={r.id}>{r.name} ({r.points} pts)
                  <Button size="sm" className="ml-2" onClick={() => handleRedeem(r)} disabled={points < r.points}>Redeem</Button>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};