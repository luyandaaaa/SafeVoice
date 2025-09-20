import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, Phone, Download, ExternalLink, Play, Video, FileText, Heart, Users, Globe, 
  Search, Filter, Award, Trophy, Star, Shield, Brain, MapPin, Calendar, Clock, 
  CheckCircle, AlertTriangle, Zap, Target, Gift, Medal, Gamepad2, MessageCircle,
  Volume2, VolumeX, Settings, User, Lock, Eye, EyeOff, ChevronRight, Home
} from "lucide-react";

// Types
interface Resource {
  id: string;
  title: string;
  type: 'legal' | 'self-defense' | 'mental-health' | 'guide' | 'video' | 'audio' | 'emergency' | 'educational';
  urgency?: boolean;
  languages: string[];
  content: string;
  audioUrl?: string;
  videoUrl?: string;
  downloadUrl?: string;
  points?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
}

interface SafetyBadge {
  id: string;
  name: string;
  unlocked: boolean;
  description: string;
  icon: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  category: string;
  questions: QuizQuestion[];
  points: number;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface UserProgress {
  totalPoints: number;
  level: number;
  completedQuizzes: string[];
  unlockedBadges: string[];
  streak: number;
  lastActivity: string;
}

const mockShelters = [
  { name: "Safe Haven Shelter", address: "123 Main St, Cityville", phone: "555-1234" },
  { name: "Hope Center", address: "456 Oak Ave, Townsville", phone: "555-5678" },
  { name: "Courage House", address: "789 Pine Rd, Villagetown", phone: "555-9012" },
];

const supportGroups = [
  { name: "Survivors United", contact: "survivors@email.com", phone: "555-2222" },
  { name: "Empowerment Circle", contact: "empower@email.com", phone: "555-3333" },
];

const safetyPlanUrl = "/public/safety-plan-template.pdf";
const protectionOrderGuideUrl = "/public/protection-order-guide.pdf";

export const Resources = () => {
  // Core state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLang, setSelectedLang] = useState('english');
  const [stressLevel, setStressLevel] = useState('medium');
  const [mobility, setMobility] = useState('normal');
  const [province, setProvince] = useState('Western Cape');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Gamification state
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalPoints: 0,
    level: 1,
    completedQuizzes: [],
    unlockedBadges: [],
    streak: 0,
    lastActivity: new Date().toISOString()
  });

  // Data state
  const [resources, setResources] = useState<Resource[]>([]);
  const [badges, setBadges] = useState<SafetyBadge[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [answerWasCorrect, setAnswerWasCorrect] = useState<boolean | null>(null);
  const [timer, setTimer] = useState(60); // 60 seconds per quiz by default
  const [timerActive, setTimerActive] = useState(false);

  // UI state
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showShelter, setShowShelter] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [showGroups, setShowGroups] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    // Initialize resources
    setResources([
      {
        id: '1',
        title: 'Understanding Your Legal Rights',
        type: 'legal',
        languages: ['english', 'afrikaans', 'zulu', 'xhosa'],
        content: 'Comprehensive guide to legal protections and rights for GBV survivors.',
        points: 50,
        difficulty: 'beginner',
        duration: '15 min'
      },
      {
        id: '2',
        title: 'Self-Defense Techniques for Everyone',
        type: 'self-defense',
        languages: ['english', 'zulu'],
        content: 'Learn practical self-defense moves adapted for all mobility levels.',
        points: 75,
        difficulty: 'intermediate',
        duration: '25 min'
      },
      {
        id: '3',
        title: 'Trauma Recovery & Mental Health',
        type: 'mental-health',
        languages: ['english', 'xhosa'],
        content: 'Evidence-based strategies for healing and building resilience.',
        points: 60,
        difficulty: 'intermediate',
        duration: '20 min'
      },
      {
        id: '4',
        title: 'Emergency Safety Planning',
        type: 'emergency',
        urgency: true,
        languages: ['english', 'afrikaans', 'zulu', 'xhosa'],
        content: 'Create a personalized safety plan for emergency situations.',
        points: 100,
        difficulty: 'advanced',
        duration: '30 min'
      },
      {
        id: '5',
        title: 'Financial Independence Guide',
        type: 'educational',
        languages: ['english', 'afrikaans'],
        content: 'Steps to achieve economic empowerment and financial security.',
        points: 80,
        difficulty: 'intermediate',
        duration: '35 min'
      }
    ]);

    // Initialize badges
    setBadges([
      {
        id: '1',
        name: 'Legal Eagle',
        unlocked: false,
        description: 'Complete all legal resources',
        icon: '⚖️',
        points: 200
      },
      {
        id: '2',
        name: 'Safety Champion',
        unlocked: false,
        description: 'Master self-defense techniques',
        icon: '🛡️',
        points: 250
      },
      {
        id: '3',
        name: 'Mental Health Advocate',
        unlocked: false,
        description: 'Complete mental health resources',
        icon: '🧠',
        points: 150
      },
      {
        id: '4',
        name: 'Quiz Master',
        unlocked: false,
        description: 'Score 100% on 5 quizzes',
        icon: '🏆',
        points: 300
      },
      {
        id: '5',
        name: 'Streak Keeper',
        unlocked: false,
        description: 'Maintain 7-day learning streak',
        icon: '⚡',
        points: 500
      }
    ]);

    // Initialize quizzes
    setQuizzes([
      {
        id: '1',
        title: 'Legal Rights Basics',
        points: 100,
        completed: false,
        category: 'Legal',
        difficulty: 'easy',
        questions: [
          {
            id: '1',
            question: 'What is the first step to take when experiencing domestic violence?',
            options: ['Call the police', 'Leave immediately', 'Document the incident', 'Call the GBV hotline'],
            correct: 3,
            explanation: 'The GBV hotline (0800 428 428) provides immediate support and guidance on next steps.'
          },
          {
            id: '2',
            question: 'Which document is most important for a protection order?',
            options: ['Birth certificate', 'Affidavit', 'ID document', 'Medical report'],
            correct: 1,
            explanation: 'An affidavit detailing the abuse is crucial evidence for obtaining a protection order.'
          },
          {
            id: '3',
            question: 'Who can apply for a protection order?',
            options: ['Only the victim', 'Anyone on behalf of the victim', 'Only police', 'Only lawyers'],
            correct: 1,
            explanation: 'Anyone, including a friend or family member, can apply on behalf of the victim.'
          },
          {
            id: '4',
            question: 'What is the legal age to give consent in South Africa?',
            options: ['16', '18', '21', '15'],
            correct: 0,
            explanation: 'The legal age of consent in South Africa is 16.'
          },
          {
            id: '5',
            question: 'What number should you call for the GBV Command Centre?',
            options: ['10111', '112', '0800 428 428', '12345'],
            correct: 2,
            explanation: '0800 428 428 is the GBV Command Centre number.'
          }
        ]
      },
      {
        id: '2',
        title: 'Self-Defense Fundamentals',
        points: 150,
        completed: false,
        category: 'Safety',
        difficulty: 'medium',
        questions: [
          {
            id: '1',
            question: 'What is the most effective way to break free from a wrist grab?',
            options: ['Pull directly away', 'Twist toward the thumb', 'Use your other hand', 'Scream loudly'],
            correct: 1,
            explanation: 'Twisting toward the thumb exploits the weakest point of the grip.'
          },
          {
            id: '2',
            question: 'Which body part should you target in a frontal attack?',
            options: ['Face', 'Chest', 'Knees', 'Arms'],
            correct: 2,
            explanation: 'Targeting the knees can disable an attacker and create escape opportunity.'
          },
          {
            id: '3',
            question: 'What should you do if you are followed on the street?',
            options: ['Ignore them', 'Go to a public place', 'Confront them', 'Run home'],
            correct: 1,
            explanation: 'Going to a public place increases your safety and deters the follower.'
          },
          {
            id: '4',
            question: 'Which item can be used for self-defense?',
            options: ['Keys', 'Pen', 'Bag', 'All of the above'],
            correct: 3,
            explanation: 'Everyday items like keys, pens, or bags can be used for self-defense.'
          },
          {
            id: '5',
            question: 'What is the best way to call for help?',
            options: ['Yell "fire"', 'Yell "help"', 'Stay silent', 'Whistle'],
            correct: 0,
            explanation: 'Yelling "fire" often attracts more attention than "help".'
          }
        ]
      },
      {
        id: '3',
        title: 'Mental Health & Recovery',
        points: 120,
        completed: false,
        category: 'Wellness',
        difficulty: 'medium',
        questions: [
          {
            id: '1',
            question: 'What is a common symptom of PTSD?',
            options: ['Increased appetite', 'Better sleep', 'Flashbacks', 'Improved concentration'],
            correct: 2,
            explanation: 'Flashbacks are intrusive memories that are a hallmark symptom of PTSD.'
          },
          {
            id: '2',
            question: 'Which technique helps manage anxiety attacks?',
            options: ['Hold your breath', 'Deep breathing', 'Run quickly', 'Eat something'],
            correct: 1,
            explanation: 'Deep breathing activates the parasympathetic nervous system, reducing anxiety.'
          },
          {
            id: '3',
            question: 'What is mindfulness?',
            options: ['Ignoring your feelings', 'Being present in the moment', 'Thinking about the past', 'Multitasking'],
            correct: 1,
            explanation: 'Mindfulness is about being present and aware of your thoughts and feelings.'
          },
          {
            id: '4',
            question: 'Who can you talk to for mental health support?',
            options: ['Friends', 'Family', 'Therapist', 'All of the above'],
            correct: 3,
            explanation: 'Support can come from friends, family, or professionals.'
          },
          {
            id: '5',
            question: 'Which activity can help improve mood?',
            options: ['Exercise', 'Isolation', 'Skipping meals', 'Overworking'],
            correct: 0,
            explanation: 'Exercise is proven to help improve mood and reduce stress.'
          }
        ]
      },
      // Additional quiz cards
      {
        id: '4',
        title: 'Digital Safety Awareness',
        points: 90,
        completed: false,
        category: 'Digital',
        difficulty: 'easy',
        questions: [
          {
            id: '1',
            question: 'What is a strong password?',
            options: ['123456', 'password', 'A mix of letters, numbers, and symbols', 'Your name'],
            correct: 2,
            explanation: 'A strong password uses a mix of letters, numbers, and symbols.'
          },
          {
            id: '2',
            question: 'What should you do if you receive a suspicious email?',
            options: ['Open it', 'Click all links', 'Delete or report it', 'Reply with your info'],
            correct: 2,
            explanation: 'Delete or report suspicious emails to avoid scams.'
          },
          {
            id: '3',
            question: 'What is phishing?',
            options: ['A type of fishing', 'A cyber attack to steal info', 'A password', 'A safe website'],
            correct: 1,
            explanation: 'Phishing is a cyber attack to steal personal information.'
          },
          {
            id: '4',
            question: 'How often should you update your passwords?',
            options: ['Never', 'Every year', 'Every month', 'Every 3-6 months'],
            correct: 3,
            explanation: 'It is recommended to update passwords every 3-6 months.'
          },
          {
            id: '5',
            question: 'What should you do before clicking a link?',
            options: ['Check the URL', 'Click quickly', 'Ignore it', 'Forward to friends'],
            correct: 0,
            explanation: 'Always check the URL to ensure it is safe.'
          }
        ]
      },
      {
        id: '5',
        title: 'Healthy Relationships',
        points: 110,
        completed: false,
        category: 'Relationships',
        difficulty: 'medium',
        questions: [
          {
            id: '1',
            question: 'Which is a sign of a healthy relationship?',
            options: ['Control', 'Respect', 'Jealousy', 'Isolation'],
            correct: 1,
            explanation: 'Respect is a key sign of a healthy relationship.'
          },
          {
            id: '2',
            question: 'What should you do if you feel unsafe?',
            options: ['Stay silent', 'Reach out for help', 'Blame yourself', 'Ignore it'],
            correct: 1,
            explanation: 'Always reach out for help if you feel unsafe.'
          },
          {
            id: '3',
            question: 'Which of these is NOT a healthy relationship trait?',
            options: ['Trust', 'Communication', 'Isolation', 'Support'],
            correct: 2,
            explanation: 'Isolation is not a healthy relationship trait.'
          },
          {
            id: '4',
            question: 'How can you resolve conflicts in a relationship?',
            options: ['Yell', 'Ignore', 'Communicate openly', 'Blame'],
            correct: 2,
            explanation: 'Open communication is key to resolving conflicts.'
          },
          {
            id: '5',
            question: 'What is an example of emotional abuse?',
            options: ['Support', 'Criticism', 'Encouragement', 'Respect'],
            correct: 1,
            explanation: 'Constant criticism is a form of emotional abuse.'
          }
        ]
      },
      {
        id: '6',
        title: 'Financial Empowerment',
        points: 130,
        completed: false,
        category: 'Finance',
        difficulty: 'medium',
        questions: [
          {
            id: '1',
            question: 'What is a budget?',
            options: ['A spending plan', 'A type of food', 'A holiday', 'A friend'],
            correct: 0,
            explanation: 'A budget is a spending plan for your money.'
          },
          {
            id: '2',
            question: 'Why is saving important?',
            options: ['For emergencies', 'For fun', 'For nothing', 'For spending'],
            correct: 0,
            explanation: 'Saving helps you prepare for emergencies and future needs.'
          },
          {
            id: '3',
            question: 'What is an emergency fund?',
            options: ['Money for fun', 'Money for emergencies', 'Money for shopping', 'Money for travel'],
            correct: 1,
            explanation: 'An emergency fund is money set aside for unexpected expenses.'
          },
          {
            id: '4',
            question: 'Which is a good way to track expenses?',
            options: ['Guessing', 'Writing them down', 'Ignoring them', 'Spending more'],
            correct: 1,
            explanation: 'Writing down expenses helps you track your spending.'
          },
          {
            id: '5',
            question: 'What is a safe way to store money?',
            options: ['Under the mattress', 'In a bank account', 'With a friend', 'In your wallet'],
            correct: 1,
            explanation: 'A bank account is the safest way to store money.'
          }
        ]
      }
    ]);
  };

  const calculateLevel = (points: number) => {
    return Math.floor(points / 500) + 1;
  };

  const getProgressToNextLevel = (points: number) => {
    const currentLevel = calculateLevel(points);
    const pointsForCurrentLevel = (currentLevel - 1) * 500;
    const pointsForNextLevel = currentLevel * 500;
    return ((points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;
  };

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowQuizResult(false);
    setQuizScore(0);
    setShowQuizDialog(true);
    setShowAnswerFeedback(false);
    setAnswerWasCorrect(null);
    setTimer(quiz.questions.length * 20); // 20 seconds per question
    setTimerActive(true);
  };

  // Timer effect (no dialog flicker)
  useEffect(() => {
    if (!showQuizDialog || !timerActive) return;
    if (timer <= 0) {
      setTimerActive(false);
      setShowQuizResult(true);
      return;
    }
    const intervalRef = { current: null as NodeJS.Timeout | null };
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setTimerActive(false);
          setShowQuizResult(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [showQuizDialog, timerActive]);

  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null || !currentQuiz) return;
    const isCorrect = selectedAnswer === currentQuiz.questions[currentQuestionIndex].correct;
    setAnswerWasCorrect(isCorrect);
    setShowAnswerFeedback(true);
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    setShowAnswerFeedback(false);
    setAnswerWasCorrect(null);
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    if (!currentQuiz) return;
    setTimerActive(false);
    const finalScore = quizScore;
    const percentage = (finalScore / currentQuiz.questions.length) * 100;
    const pointsEarned = Math.floor((percentage / 100) * currentQuiz.points);
    setUserProgress(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + pointsEarned,
      level: calculateLevel(prev.totalPoints + pointsEarned),
      completedQuizzes: [...prev.completedQuizzes, currentQuiz.id],
      streak: prev.streak + 1,
      lastActivity: new Date().toISOString()
    }));
    setQuizzes(prev => prev.map(q => 
      q.id === currentQuiz.id ? { ...q, completed: true } : q
    ));
    setShowQuizResult(true);
  };

  // Filter and search resources (excluding 'emergency')
  const filteredResources = resources.filter(res => {
    if (res.type === 'emergency') return false;
    // Filter by type
    if (filterType !== 'all' && res.type !== filterType) return false;
    // Search by title/content (case-insensitive)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.trim().toLowerCase();
      if (!res.title.toLowerCase().includes(term) && !res.content.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  // NavigationTabs removed


  // Shared User Stats Card and Quick Actions
  const UserStatsAndQuickActions = () => (
    <>
      <div className="rounded-lg border border-primary bg-primary/10 px-6 py-4 shadow-sm mt-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary">Welcome Back!</h2>
            <p className="text-muted-foreground">Level {userProgress.level} • {userProgress.totalPoints} Points</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{userProgress.streak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
        </div>
        <Progress 
          value={getProgressToNextLevel(userProgress.totalPoints)} 
          className="mt-4"
        />
        <p className="text-sm mt-2 text-muted-foreground">
          {500 - (userProgress.totalPoints % 500)} points to next level
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-red-200"
              onClick={() => setShowEmergencyDialog(true)}>
          <CardContent className="p-4 text-center">
            <Phone className="mx-auto text-red-500 mb-2" size={24} />
            <h3 className="font-semibold text-red-600">Emergency Help</h3>
            <p className="text-sm text-gray-600">Get immediate assistance</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200"
              onClick={() => setActiveTab('resources')}>
          <CardContent className="p-4 text-center">
            <BookOpen className="mx-auto text-green-500 mb-2" size={24} />
            <h3 className="font-semibold text-green-600">Resources</h3>
            <p className="text-sm text-gray-600">Explore resources</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-yellow-200"
              onClick={() => setActiveTab('progress')}>
          <CardContent className="p-4 text-center">
            <Trophy className="mx-auto text-yellow-500 mb-2" size={24} />
            <h3 className="font-semibold text-yellow-600">Progress</h3>
            <p className="text-sm text-gray-600">Track your progress</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200"
              onClick={() => setActiveTab('quizzes')}>
          <CardContent className="p-4 text-center">
            <Brain className="mx-auto text-blue-500 mb-2" size={24} />
            <h3 className="font-semibold text-blue-600">Take Quiz</h3>
            <p className="text-sm text-gray-600">Earn points and learn</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200"
              onClick={() => setActiveTab('dashboard')}>
          <CardContent className="p-4 text-center">
            <Home className="mx-auto text-purple-500 mb-2" size={24} />
            <h3 className="font-semibold text-purple-600">Home</h3>
            <p className="text-sm text-gray-600">Back to home</p>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const DashboardContent = () => (
    <div className="space-y-6">
      <UserStatsAndQuickActions />

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {badges.slice(0, 3).map(badge => (
              <div key={badge.id} className={`flex items-center justify-between p-3 rounded-lg ${
                userProgress.unlockedBadges.includes(badge.id) 
                  ? 'bg-yellow-50 border border-yellow-200' 
                  : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <h4 className="font-semibold">{badge.name}</h4>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                  </div>
                </div>
                <Badge variant={userProgress.unlockedBadges.includes(badge.id) ? "default" : "secondary"}>
                  {badge.points} pts
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const handleRead = (resource: Resource) => {
    toast.success(`Opening "${resource.title}" for reading.`);
    // Optionally, open a modal or navigate to a detail page
  };
  const handleListen = (resource: Resource) => {
    if (resource.audioUrl) {
      window.open(resource.audioUrl, '_blank');
      toast.success('Audio resource opened.');
    } else {
      toast.error('Audio not available for this resource.');
    }
  };
  const handleWatch = (resource: Resource) => {
    if (resource.videoUrl) {
      window.open(resource.videoUrl, '_blank');
      toast.success('Video resource opened.');
    } else {
      toast.error('Video not available for this resource.');
    }
  };
  const handleSave = (resource: Resource) => {
    if (resource.downloadUrl) {
      window.open(resource.downloadUrl, '_blank');
      toast.success('Resource download started.');
    } else {
      toast.error('Download not available for this resource.');
    }
  };

  const ResourcesContent = () => (
    <div className="space-y-6">
      <UserStatsAndQuickActions />
      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                aria-label="Search resources"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48" aria-label="Filter by type">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="self-defense">Self-Defense</SelectItem>
                <SelectItem value="mental-health">Mental Health</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map(resource => {
          // Remove duplicate languages for each resource
          const uniqueLanguages = Array.from(new Set(resource.languages));
          return (
            <Card key={resource.id} className={`hover:shadow-lg transition-shadow ${
              resource.urgency ? 'border-red-300 bg-red-50' : ''
            }`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  {resource.urgency && <AlertTriangle className="text-red-500" size={20} />}
                </div>
                <div className="flex gap-2 flex-wrap mt-2">
                  <Badge variant={resource.urgency ? "destructive" : "secondary"}>
                    {resource.type.replace('-', ' ')}
                  </Badge>
                  <Badge variant="outline">{resource.difficulty}</Badge>
                  {resource.duration && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock size={12} />
                      {resource.duration}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{resource.content}</p>
                {resource.points && (
                  <div className="mt-2 flex items-center gap-1">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star size={12} />
                      {resource.points} pts
                    </Badge>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button size="sm" variant="default" aria-label={`Read ${resource.title}`} onClick={() => handleRead(resource)} className="w-full">
                    <BookOpen size={14} className="mr-1" />
                    Read
                  </Button>
                  <Button size="sm" variant="outline" aria-label={`Listen to ${resource.title}`} onClick={() => handleListen(resource)} className="w-full">
                    <Volume2 size={14} className="mr-1" />
                    Listen
                  </Button>
                  <Button size="sm" variant="outline" aria-label={`Watch ${resource.title}`} onClick={() => handleWatch(resource)} className="w-full">
                    <Video size={14} className="mr-1" />
                    Watch
                  </Button>
                  <Button size="sm" variant="outline" aria-label={`Save ${resource.title}`} onClick={() => handleSave(resource)} className="w-full">
                    <Download size={14} className="mr-1" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const QuizzesContent = () => (
    <div className="space-y-6">
      <UserStatsAndQuickActions />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map(quiz => {
          // Choose border color by difficulty
          let borderColor = 'border-gray-300';
          if (quiz.difficulty === 'easy') borderColor = 'border-green-400';
          else if (quiz.difficulty === 'medium') borderColor = 'border-yellow-400';
          else if (quiz.difficulty === 'hard') borderColor = 'border-red-400';
          return (
            <Card
              key={quiz.id}
              className={`bg-white text-gray-900 hover:shadow-lg transition-shadow border-2 ${borderColor}` + (quiz.completed ? ' opacity-80' : '')}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  {quiz.completed && <CheckCircle className="text-green-400" size={20} />}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {quiz.questions.length} questions
                  </span>
                  <Badge className="flex items-center gap-1 bg-gray-100 text-gray-800 border-none">
                    <Zap size={12} />
                    {quiz.points} pts
                  </Badge>
                </div>
                <Button 
                  onClick={() => startQuiz(quiz)}
                  disabled={quiz.completed}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold hover:bg-pink-600"
                  variant="default"
                >
                  {quiz.completed ? "Completed" : "Start Quiz"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quiz Dialog */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="max-w-2xl">
          {/* Accessibility: DialogTitle required for screen readers */}
          <DialogHeader>
            <DialogTitle>{currentQuiz ? currentQuiz.title : 'Quiz'}</DialogTitle>
          </DialogHeader>
          {currentQuiz && !showQuizResult && (
            <div>
              <div className="flex justify-between items-center mb-2">
                {/* Title is now in DialogTitle above for accessibility */}
                <span />
                <Badge className={timer < 10 ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}>
                  <Clock size={14} className="mr-1" /> {timer}s
                </Badge>
              </div>
              <Progress value={((currentQuestionIndex) / currentQuiz.questions.length) * 100} className="mb-2" />
              <div className="mb-4">
                <span className="text-sm">Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}</span>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{currentQuiz.questions[currentQuestionIndex].question}</h3>
              </div>
              <div className="space-y-3">
                {currentQuiz.questions[currentQuestionIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    disabled={selectedAnswer !== null || showAnswerFeedback}
                    className={`w-full p-4 text-left rounded-lg border transition-colors ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setShowQuizDialog(false)}>
                  Exit Quiz
                </Button>
                <Button 
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null || showAnswerFeedback}
                >
                  Submit
                </Button>
              </div>
              {/* Feedback after answer */}
              {showAnswerFeedback && (
                <div className="mt-6 p-4 rounded-lg border bg-gray-50">
                  {answerWasCorrect ? (
                    <div className="text-green-600 font-semibold flex items-center gap-2">
                      <CheckCircle size={20} /> Correct!
                    </div>
                  ) : (
                    <div className="text-red-600 font-semibold flex items-center gap-2">
                      <AlertTriangle size={20} /> Incorrect. <span className="ml-2">Correct answer: <b>{currentQuiz.questions[currentQuestionIndex].options[currentQuiz.questions[currentQuestionIndex].correct]}</b></span>
                    </div>
                  )}
                  <div className="mt-2 text-gray-700 text-sm">
                    {currentQuiz.questions[currentQuestionIndex].explanation}
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={nextQuestion}>
                      {currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Quiz Result */}
          {currentQuiz && showQuizResult && (
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold">Quiz Complete!</h2>
              <div className="text-6xl font-bold text-green-500">
                {Math.round((quizScore / currentQuiz.questions.length) * 100)}%
              </div>
              <div>
                <p className="text-lg">You scored {quizScore} out of {currentQuiz.questions.length}</p>
                <p className="text-sm text-gray-600">Earned {Math.floor((quizScore / currentQuiz.questions.length) * currentQuiz.points)} points</p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => { setShowQuizDialog(false); setShowQuizResult(false); }}>
                  Back to Quizzes
                </Button>
                <Button variant="outline" onClick={() => { setShowQuizDialog(false); setShowQuizResult(false); setActiveTab('dashboard'); }}>
                  Dashboard
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  // QuizContent is now handled in the Dialog in QuizzesContent

  const ProgressContent = () => (
    <div className="space-y-6">
      <UserStatsAndQuickActions />
      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <div>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-blue-600">Level {userProgress.level}</div>
                <div className="text-gray-600">{userProgress.totalPoints} Total Points</div>
              </div>
              <Progress value={getProgressToNextLevel(userProgress.totalPoints)} className="mb-2" />
              <p className="text-sm text-center text-gray-600">
                {500 - (userProgress.totalPoints % 500)} points to Level {userProgress.level + 1}
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Completed Quizzes:</span>
                <span className="font-semibold">{userProgress.completedQuizzes.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Learning Streak:</span>
                <span className="font-semibold flex items-center gap-1">
                  <Zap className="text-yellow-500" size={16} />
                  {userProgress.streak} days
                </span>
              </div>
              <div className="flex justify-between">
                <span>Badges Earned:</span>
                <span className="font-semibold">{userProgress.unlockedBadges.length} / {badges.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="text-purple-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {badges.map(badge => (
              <div key={badge.id} className={`p-4 rounded-lg border ${
                userProgress.unlockedBadges.includes(badge.id)
                  ? 'bg-yellow-50 border-yellow-300'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{badge.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold">{badge.name}</h4>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                    <Badge variant={userProgress.unlockedBadges.includes(badge.id) ? "default" : "outline"}>
                      {badge.points} points
                    </Badge>
                  </div>
                  {userProgress.unlockedBadges.includes(badge.id) && (
                    <CheckCircle className="text-green-500" size={24} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <BookOpen className="mx-auto text-blue-500 mb-2" size={24} />
              <div className="text-2xl font-bold text-blue-600">
                {resources.filter(r => r.type === 'legal').length}
              </div>
              <div className="text-sm text-gray-600">Legal Resources</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Shield className="mx-auto text-green-500 mb-2" size={24} />
              <div className="text-2xl font-bold text-green-600">
                {resources.filter(r => r.type === 'self-defense').length}
              </div>
              <div className="text-sm text-gray-600">Safety Resources</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Heart className="mx-auto text-purple-500 mb-2" size={24} />
              <div className="text-2xl font-bold text-purple-600">
                {resources.filter(r => r.type === 'mental-health').length}
              </div>
              <div className="text-sm text-gray-600">Wellness Resources</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const EmergencyContent = () => (
    <div className="space-y-6">
      {/* Emergency Contacts */}
      <Card className="border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>
            If you are in immediate danger, call these numbers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Button 
              variant="destructive" 
              size="lg"
              onClick={() => window.location.href = 'tel:10111'}
              className="h-16 text-lg"
            >
              <Phone className="mr-2" size={20} />
              Police: 10111
            </Button>
            <Button 
              variant="destructive" 
              size="lg"
              onClick={() => window.location.href = 'tel:0800428428'}
              className="h-16 text-lg"
            >
              <Phone className="mr-2" size={20} />
              GBV Hotline: 0800 428 428
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Safety Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Safety Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Dialog open={showShelter} onOpenChange={setShowShelter}>
              <DialogTrigger asChild>
                <Button className="w-full flex items-center gap-2 p-3 border rounded hover:bg-blue-50 transition">
                  <MapPin className="w-5 h-5 text-blue-600" /> Find Nearest Shelter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nearby Shelters</DialogTitle>
                  <DialogDescription>Contact or visit a safe location near you.</DialogDescription>
                </DialogHeader>
                <div className="my-2">
                  {/* Mocked map placeholder */}
                  <div className="w-full h-40 bg-gray-200 rounded flex items-center justify-center text-gray-500 mb-4">[Map Placeholder]</div>
                  <ul className="space-y-2">
                    {mockShelters.map((shelter, i) => (
                      <li key={i} className="border rounded p-2 flex flex-col">
                        <span className="font-semibold">{shelter.name}</span>
                        <span className="text-sm text-gray-600">{shelter.address}</span>
                        <span className="text-sm text-blue-700">{shelter.phone}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showPlan} onOpenChange={setShowPlan}>
              <DialogTrigger asChild>
                <Button className="w-full flex items-center gap-2 p-3 border rounded hover:bg-green-50 transition">
                  <FileText className="w-5 h-5 text-green-600" /> Safety Plan Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Safety Plan Template</DialogTitle>
                  <DialogDescription>Download or view a safety plan template to help you prepare.</DialogDescription>
                </DialogHeader>
                <div className="my-2 flex flex-col gap-2">
                  <a href={safetyPlanUrl} download className="text-blue-600 underline">Download PDF</a>
                  <iframe src={safetyPlanUrl} className="w-full h-64 border rounded" title="Safety Plan Template" />
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showOrder} onOpenChange={setShowOrder}>
              <DialogTrigger asChild>
                <Button className="w-full flex items-center gap-2 p-3 border rounded hover:bg-yellow-50 transition">
                  <Shield className="w-5 h-5 text-yellow-600" /> Protection Order Guide
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Protection Order Guide</DialogTitle>
                  <DialogDescription>Step-by-step instructions and resources for obtaining a protection order.</DialogDescription>
                </DialogHeader>
                <div className="my-2 flex flex-col gap-2">
                  <a href={protectionOrderGuideUrl} download className="text-blue-600 underline">Download Guide</a>
                  <iframe src={protectionOrderGuideUrl} className="w-full h-64 border rounded" title="Protection Order Guide" />
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showGroups} onOpenChange={setShowGroups}>
              <DialogTrigger asChild>
                <Button className="w-full flex items-center gap-2 p-3 border rounded hover:bg-purple-50 transition">
                  <Users className="w-5 h-5 text-purple-600" /> Support Groups
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Support Groups</DialogTitle>
                  <DialogDescription>Connect with others for support and community.</DialogDescription>
                </DialogHeader>
                <ul className="space-y-2 my-2">
                  {supportGroups.map((group, i) => (
                    <li key={i} className="border rounded p-2 flex flex-col">
                      <span className="font-semibold">{group.name}</span>
                      <span className="text-sm text-gray-600">{group.contact}</span>
                      <span className="text-sm text-blue-700">{group.phone}</span>
                    </li>
                  ))}
                </ul>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* ...existing resources list code... */}
    </div>
  );

  // Emergency Dialog
  const EmergencyDialog = () => (
    <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Emergency Help
          </DialogTitle>
          <DialogDescription>
            Are you in immediate danger? Choose the appropriate option below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Button 
            variant="destructive" 
            size="lg"
            onClick={() => window.location.href = 'tel:10111'}
            className="w-full h-16 text-lg"
          >
            <Phone className="mr-2" size={20} />
            Call Police (10111)
          </Button>
          <Button 
            variant="destructive" 
            size="lg"
            onClick={() => window.location.href = 'tel:0800428428'}
            className="w-full h-16 text-lg"
          >
            <Phone className="mr-2" size={20} />
            GBV Hotline (0800 428 428)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Only allow quiz dialog to be controlled by showQuizDialog, not by activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'resources':
        return <ResourcesContent />;
      case 'quizzes':
        return <QuizzesContent />;
      case 'progress':
        return <ProgressContent />;
      case 'emergency':
        return <EmergencyContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>

      {/* Emergency Dialog */}
      <EmergencyDialog />

      {/* Floating Emergency Button */}
      {activeTab !== 'emergency' && (
        <button
          onClick={() => setShowEmergencyDialog(true)}
          className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg z-50 transition-colors"
        >
          <AlertTriangle size={24} />
        </button>
      )}
    </div>
  );
};

export default Resources;