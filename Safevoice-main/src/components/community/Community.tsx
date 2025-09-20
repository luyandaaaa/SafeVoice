import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Shield, 
  MessageCircle, 
  Video, 
  Phone, 
  Headphones,
  MapPin,
  Calendar,
  Star,
  Trophy,
  Gift,
  Bell,
  Heart,
  UserCheck,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Zap
} from "lucide-react";

// Types
interface SafetyCircle {
  id: string;
  name: string;
  geo: string;
  members: string[];
  alerts: Alert[];
  activeMembers: number;
  lastActivity: string;
}

interface Alert {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'emergency';
  timestamp: string;
  author: string;
}

interface Mentor {
  id: string;
  name: string;
  languages: string[];
  badge: string;
  type: 'survivor' | 'advocate' | 'counselor';
  available: boolean;
  rating: number;
  sessions: number;
  bio: string;
  specialization: string[];
}

interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  type: string;
  attendees: number;
  maxAttendees: number;
  description: string;
  registered: boolean;
}

interface Petition {
  id: string;
  title: string;
  description: string;
  signed: boolean;
  signatures: number;
  target: number;
  category: string;
}

interface Reward {
  id: string;
  name: string;
  points: number;
  category: string;
  description: string;
  available: boolean;
}

interface Message {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  reactions: { emoji: string; count: number }[];
}

export const Community = () => {
  // Safety Circles
  const [circles, setCircles] = useState<SafetyCircle[]>([]);
  const [joinedCircle, setJoinedCircle] = useState<string | null>(null);
  const [circleAlert, setCircleAlert] = useState("");
  const [alertType, setAlertType] = useState<'info' | 'warning' | 'emergency'>('info');

  // Multi-Modal Support
  const [activeRoom, setActiveRoom] = useState<'text' | 'voice' | 'video' | 'listen'>('text');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [activeUsers, setActiveUsers] = useState(24);

  // Mentor Directory
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'survivor' | 'advocate' | 'counselor'>('all');

  // Events & Activism
  const [events, setEvents] = useState<Event[]>([]);
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [crowdfundAmount, setCrowdfundAmount] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<'all' | 'workshop' | 'support' | 'advocacy'>('all');

  // Reputation & Rewards
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);

  // UI State
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  useEffect(() => {
    // Enhanced mock data initialization
    setCircles([
      { 
        id: '1', 
        name: 'District 6 Guardians', 
        geo: 'Cape Town', 
        members: ['user1', 'user2', 'user3'], 
        alerts: [
          { id: '1', message: 'Safe house on Hanover Street is open 24/7', type: 'info', timestamp: '2 hours ago', author: 'Community Admin' },
          { id: '2', message: 'Extra patrols tonight - stay safe everyone', type: 'warning', timestamp: '4 hours ago', author: 'Safety Coordinator' }
        ],
        activeMembers: 12,
        lastActivity: '5 minutes ago'
      },
      { 
        id: '2', 
        name: 'Soweto Unity Circle', 
        geo: 'Johannesburg', 
        members: [], 
        alerts: [],
        activeMembers: 8,
        lastActivity: '1 hour ago'
      },
      {
        id: '3',
        name: 'Khayelitsha Support Network',
        geo: 'Cape Town',
        members: [],
        alerts: [],
        activeMembers: 15,
        lastActivity: '30 minutes ago'
      }
    ]);

    setMentors([
      { 
        id: '1', 
        name: 'Thandi M.', 
        languages: ['isiZulu', 'English'], 
        badge: 'Verified Survivor Mentor', 
        type: 'survivor', 
        available: true,
        rating: 4.9,
        sessions: 127,
        bio: 'Survivor advocate with 5 years of community support experience.',
        specialization: ['Trauma Recovery', 'Legal Guidance', 'Emotional Support']
      },
      { 
        id: '2', 
        name: 'Adv. Sipho N.', 
        languages: ['isiXhosa', 'English'], 
        badge: 'Community Advocate', 
        type: 'advocate', 
        available: true,
        rating: 4.8,
        sessions: 89,
        bio: 'Legal advocate specializing in GBV cases and community empowerment.',
        specialization: ['Legal Support', 'Rights Education', 'Court Preparation']
      },
      {
        id: '3',
        name: 'Dr. Nomsa K.',
        languages: ['Sesotho', 'English', 'Afrikaans'],
        badge: 'Licensed Counselor',
        type: 'counselor',
        available: false,
        rating: 5.0,
        sessions: 203,
        bio: 'Clinical psychologist with expertise in trauma and PTSD treatment.',
        specialization: ['PTSD Therapy', 'Group Counseling', 'Crisis Intervention']
      }
    ]);

    setEvents([
      { 
        id: '1', 
        title: 'Self-Defense Workshop', 
        location: 'Community Hall, Langa', 
        date: '2025-08-10',
        time: '14:00',
        type: 'workshop',
        attendees: 23,
        maxAttendees: 30,
        description: 'Learn basic self-defense techniques and situational awareness.',
        registered: false
      },
      { 
        id: '2', 
        title: 'Mental Health Circle', 
        location: 'Wellness Center, Mitchells Plain', 
        date: '2025-08-12',
        time: '18:00',
        type: 'support',
        attendees: 15,
        maxAttendees: 20,
        description: 'Group therapy session focused on healing and community support.',
        registered: true
      },
      {
        id: '3',
        title: 'Know Your Rights Workshop',
        location: 'Legal Aid Office, CBD',
        date: '2025-08-15',
        time: '10:00',
        type: 'advocacy',
        attendees: 8,
        maxAttendees: 25,
        description: 'Understanding legal rights and protection orders.',
        registered: false
      }
    ]);

    setPetitions([
      { 
        id: '1', 
        title: 'End GBV in Schools', 
        description: 'Petition to improve safety protocols and support systems in educational institutions.', 
        signed: false,
        signatures: 2847,
        target: 5000,
        category: 'Education Safety'
      },
      { 
        id: '2', 
        title: 'Increase Shelter Funding', 
        description: 'Demand increased government funding for survivor shelters and support services.', 
        signed: false,
        signatures: 4231,
        target: 10000,
        category: 'Government Policy'
      },
      {
        id: '3',
        title: 'Fast-Track Protection Orders',
        description: 'Streamline the legal process for obtaining protection orders.',
        signed: true,
        signatures: 1563,
        target: 2500,
        category: 'Legal Reform'
      }
    ]);

    setRewards([
      { id: '1', name: 'R50 Airtime Voucher', points: 50, category: 'essentials', description: 'Stay connected with loved ones', available: true },
      { id: '2', name: 'Personal Safety Alarm', points: 100, category: 'safety', description: 'Compact emergency alarm device', available: true },
      { id: '3', name: 'Free Legal Consultation', points: 150, category: 'support', description: '1-hour consultation with qualified lawyer', available: true },
      { id: '4', name: 'Wellness Care Package', points: 200, category: 'wellness', description: 'Self-care items and wellness resources', available: false },
      { id: '5', name: 'Skills Training Voucher', points: 300, category: 'development', description: 'Free enrollment in skills development course', available: true }
    ]);

    setMessages([
      { id: '1', text: 'Thank you all for the support during my healing journey ❤️', author: 'Anonymous', timestamp: '5 min ago', reactions: [{ emoji: '❤️', count: 12 }, { emoji: '🤗', count: 8 }] },
      { id: '2', text: 'The legal workshop really helped me understand my rights', author: 'Community Member', timestamp: '15 min ago', reactions: [{ emoji: '👍', count: 15 }] },
      { id: '3', text: 'Stay strong sisters, we are here for each other', author: 'Survivor Advocate', timestamp: '1 hour ago', reactions: [{ emoji: '💪', count: 23 }, { emoji: '❤️', count: 18 }] }
    ]);

    // Calculate level based on points
    const savedPoints = 145; // Mock saved points
    setPoints(savedPoints);
    setLevel(Math.floor(savedPoints / 100) + 1);
    setStreak(7); // Mock 7-day streak
  }, []);

  // Enhanced functions
  const handleJoinCircle = (id: string) => {
    setJoinedCircle(id);
    setPoints(p => p + 10);
    showSuccessToast('Successfully joined safety circle! +10 points');
  };

  const handleLeaveCircle = () => {
    setJoinedCircle(null);
    showSuccessToast('Left safety circle');
  };

  const handleSendAlert = () => {
    if (!circleAlert) return;
    const newAlert: Alert = {
      id: Date.now().toString(),
      message: circleAlert,
      type: alertType,
      timestamp: 'Just now',
      author: 'You'
    };
    setCircles(circles.map(c => 
      c.id === joinedCircle 
        ? { ...c, alerts: [newAlert, ...c.alerts] } 
        : c
    ));
    setCircleAlert("");
    setPoints(p => p + 5);
    showSuccessToast('Alert sent to your safety circle! +5 points');
  };

  const handleSendMsg = () => {
    if (!inputMsg) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMsg,
      author: 'You',
      timestamp: 'Just now',
      reactions: []
    };
    setMessages([newMessage, ...messages]);
    setInputMsg("");
    setPoints(p => p + 2);
  };

  const handleBookMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowBooking(true);
  };

  const confirmBooking = () => {
    setShowBooking(false);
    setPoints(p => p + 5);
    showSuccessToast(`Session booked with ${selectedMentor?.name}! +5 points`);
  };

  const handleSignPetition = (id: string) => {
    setPetitions(petitions.map(p => 
      p.id === id 
        ? { ...p, signed: true, signatures: p.signatures + 1 } 
        : p
    ));
    setPoints(p => p + 3);
    showSuccessToast('Petition signed! Your voice matters. +3 points');
  };

  const handleRegisterEvent = (id: string) => {
    setEvents(events.map(e => 
      e.id === id 
        ? { ...e, registered: true, attendees: e.attendees + 1 }
        : e
    ));
    setPoints(p => p + 8);
    showSuccessToast('Successfully registered for event! +8 points');
  };

  const handleRedeem = (reward: Reward) => {
    if (points >= reward.points) {
      setPoints(p => p - reward.points);
      showSuccessToast(`${reward.name} redeemed! Check your messages for details.`);
    }
  };

  const handleCrowdfund = () => {
    setCrowdfundAmount("");
    setPoints(p => p + 5);
    showSuccessToast('Thank you for your contribution! +5 points');
  };

  const filteredMentors = filterType === 'all' 
    ? mentors 
    : mentors.filter(m => m.type === filterType);

  const filteredEvents = selectedEventType === 'all'
    ? events
    : events.filter(e => e.type === selectedEventType);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <Bell className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getProgressWidth = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {successMessage}
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
        {/* Header Section - match Dashboard header style */}
        <div className="rounded-lg border border-primary bg-primary/10 px-6 py-4 shadow-sm mt-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Community</h1>
              <p className="text-muted-foreground text-lg">Your safe space for connection, support, and empowerment</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-6 w-6 text-yellow-400" />
                <span className="text-2xl font-bold text-primary">{points}</span>
                <span className="text-muted-foreground">points</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-muted-foreground">Level {level} • {streak} day streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - match Dashboard stat card style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-soft transition-all hover:shadow-md border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{activeUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft transition-all hover:shadow-md border-success/20 bg-success/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Safety Circles</p>
                  <p className="text-2xl font-bold">{circles.length}</p>
                </div>
                <Shield className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft transition-all hover:shadow-md border-purple-500/20 bg-purple-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Mentors</p>
                  <p className="text-2xl font-bold">{mentors.filter(m => m.available).length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft transition-all hover:shadow-md border-pink-500/20 bg-pink-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Safety Circles */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-xl">Hyperlocal Safety Circles</CardTitle>
              </div>
              <CardDescription>Join your neighborhood's verified safety network</CardDescription>
            </CardHeader>
            <CardContent>
              {joinedCircle ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-blue-900">
                        {circles.find(c => c.id === joinedCircle)?.name}
                      </h3>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <Users className="h-3 w-3 mr-1" />
                        {circles.find(c => c.id === joinedCircle)?.activeMembers} active
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleLeaveCircle}>
                        Leave Circle
                      </Button>
                      <Badge variant="outline" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        {circles.find(c => c.id === joinedCircle)?.geo}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input 
                        value={circleAlert} 
                        onChange={e => setCircleAlert(e.target.value)} 
                        placeholder="Share an alert with your circle..." 
                        className="flex-1"
                      />
                      <Select value={alertType} onValueChange={(value: any) => setAlertType(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleSendAlert} className="bg-blue-600 hover:bg-blue-700">
                        <Bell className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Recent Alerts</h4>
                      {circles.find(c => c.id === joinedCircle)?.alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1 text-sm">
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-gray-500 text-xs">
                              {alert.author} • {alert.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">Connect with verified community members in your area for mutual support and safety.</p>
                  <div className="space-y-3">
                    {circles.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <h3 className="font-semibold">{c.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {c.geo}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {c.activeMembers} active
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {c.lastActivity}
                            </span>
                          </div>
                        </div>
                        <Button onClick={() => handleJoinCircle(c.id)} className="bg-blue-600 hover:bg-blue-700">
                          Join Circle
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Multi-Modal Support */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-xl">Support Spaces</CardTitle>
              </div>
              <CardDescription>Connect through text, voice, video, or just listen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button 
                  variant={activeRoom === 'text' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveRoom('text')}
                  className={activeRoom === 'text' ? 'bg-purple-600' : ''}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Text Chat
                </Button>
                <Button 
                  variant={activeRoom === 'voice' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveRoom('voice')}
                  className={activeRoom === 'voice' ? 'bg-purple-600' : ''}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Voice Room
                </Button>
                <Button 
                  variant={activeRoom === 'video' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveRoom('video')}
                  className={activeRoom === 'video' ? 'bg-purple-600' : ''}
                >
                  <Video className="h-4 w-4 mr-1" />
                  Video Circle
                </Button>
                <Button 
                  variant={activeRoom === 'listen' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveRoom('listen')}
                  className={activeRoom === 'listen' ? 'bg-purple-600' : ''}
                >
                  <Headphones className="h-4 w-4 mr-1" />
                  Listen Only
                </Button>
              </div>

              {activeRoom === 'text' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">{msg.author}</span>
                          <span className="text-xs text-gray-500">{msg.timestamp}</span>
                        </div>
                        <p className="text-sm mb-2">{msg.text}</p>
                        <div className="flex gap-2">
                          {msg.reactions.map((reaction, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {reaction.emoji} {reaction.count}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={inputMsg} 
                      onChange={e => setInputMsg(e.target.value)} 
                      placeholder="Share your thoughts safely..." 
                      className="flex-1"
                      onKeyPress={e => e.key === 'Enter' && handleSendMsg()}
                    />
                    <Button onClick={handleSendMsg} className="bg-purple-600 hover:bg-purple-700">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {activeRoom === 'voice' && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Phone className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Voice Support Group</p>
                    <p className="text-sm text-gray-600">Multi-language support available</p>
                    <Badge variant="secondary" className="mt-2">
                      <Shield className="h-3 w-3 mr-1" />
                      Anonymous Mode Active
                    </Badge>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm">
                      Join Room
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Listen Only
                    </Button>
                  </div>
                </div>
              )}

              {activeRoom === 'video' && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Video className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Video Support Circle</p>
                    <p className="text-sm text-gray-600">Camera optional - your comfort comes first</p>
                    <Badge variant="secondary" className="mt-2">
                      <Shield className="h-3 w-3 mr-1" />
                      End-to-End Encrypted
                    </Badge>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm">
                      Join with Video
                    </Button>
                    <Button>
                      Join without Video
                    </Button>
                  </div>
                </div>
              )}

              {activeRoom === 'listen' && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Headphones className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Listen-Only Mode</p>
                    <p className="text-sm text-gray-600">Hear from others without participating</p>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Start Listening
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mentor Directory */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-pink-600" />
                  <CardTitle className="text-xl">Mentor Directory</CardTitle>
                </div>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="survivor">Survivors</SelectItem>
                    <SelectItem value="advocate">Advocates</SelectItem>
                    <SelectItem value="counselor">Counselors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>Connect with verified mentors who understand your journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMentors.map(mentor => (
                  <div key={mentor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{mentor.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {mentor.badge}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 mb-2">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {mentor.rating} ({mentor.sessions} sessions)
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Globe className="h-3 w-3" />
                            {mentor.languages.join(', ')}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{mentor.bio}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {mentor.specialization.map(spec => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant={mentor.available ? 'default' : 'secondary'} className="text-xs">
                            {mentor.available ? 'Available now' : 'Currently unavailable'}
                          </Badge>
                          <Button 
                            size="sm" 
                            disabled={!mentor.available}
                            onClick={() => handleBookMentor(mentor)}
                          >
                            Book Session
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Events & Activism */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-green-600" />
                  <CardTitle className="text-xl">Events & Activism</CardTitle>
                </div>
                <Select value={selectedEventType} onValueChange={(value: any) => setSelectedEventType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="workshop">Workshops</SelectItem>
                    <SelectItem value="support">Support Groups</SelectItem>
                    <SelectItem value="advocacy">Advocacy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>Join local events and support meaningful causes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4 mb-4">
                  <h3 className="font-medium mb-3">Upcoming Events</h3>
                  <div className="space-y-3">
                    {filteredEvents.map(event => (
                      <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{event.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {event.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.date} • {event.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{event.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 ml-2">
                            {event.attendees}/{event.maxAttendees}
                          </span>
                        </div>
                        <div className="mt-3">
                          <Button 
                            variant={event.registered ? 'outline' : 'default'}
                            size="sm"
                            disabled={event.registered}
                            onClick={() => handleRegisterEvent(event.id)}
                          >
                            {event.registered ? 'Registered' : 'Register'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Active Petitions</h3>
                  <div className="space-y-3">
                    {petitions.map(petition => (
                      <div key={petition.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{petition.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {petition.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{petition.description}</p>
                        <div className="flex justify-between items-center mb-3">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-pink-600 h-2.5 rounded-full" 
                              style={{ width: `${getProgressWidth(petition.signatures, petition.target)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 ml-2">
                            {petition.signatures}/{petition.target}
                          </span>
                        </div>
                        <Button 
                          variant={petition.signed ? 'outline' : 'default'}
                          size="sm"
                          disabled={petition.signed}
                          onClick={() => handleSignPetition(petition.id)}
                        >
                          {petition.signed ? 'Signed' : 'Sign Petition'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium mb-3">Community Crowdfunding</h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-3">Support our community shelter expansion project</p>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        placeholder="Amount (ZAR)" 
                        value={crowdfundAmount}
                        onChange={e => setCrowdfundAmount(e.target.value)}
                      />
                      <Button onClick={handleCrowdfund}>
                        Contribute
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Mentor Booking Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Session with {selectedMentor?.name}</DialogTitle>
            <DialogDescription>
              {selectedMentor?.bio}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Specializations</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMentor?.specialization.map(spec => (
                  <Badge key={spec} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Available Languages</h4>
              <p className="text-sm">{selectedMentor?.languages.join(', ')}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Session Rating</h4>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{selectedMentor?.rating} ({selectedMentor?.sessions} sessions)</span>
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Preferred Date</label>
              <Input type="date" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Session Type</label>
              <Select defaultValue="video">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="voice">Voice Call</SelectItem>
                  <SelectItem value="text">Text Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Additional Notes</label>
              <Textarea placeholder="Anything you'd like the mentor to know beforehand..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowBooking(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBooking}>
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};