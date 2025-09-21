import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  FileText, Shield, Upload, Plus, X, Check, Loader2, Search, 
  AlertCircle, Users, Download, Star, ChevronLeft, ChevronRight,
  Image, Video, AudioLines, File, BookOpen, Phone, ExternalLink, 
  Play, Heart, Globe, Award, Trophy, Bell, Lock, Share2, Trash2,
  BarChart2, PieChart, LineChart, Calendar, Clock, MapPin, Wifi,
  Battery, Cloud, FilePlus, FileCheck, FileSearch, FileInput, FileOutput
} from "lucide-react";

// Types
interface EvidenceFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'screenshot' | 'recording';
  size: number;
  uploadDate: Date;
  caseId?: string;
  encrypted: boolean;
  shared: boolean;
  verified: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  description: string;
  aiAnalysis?: AIAnalysis;
  metadata: {
    timestamp?: Date;
    deviceInfo?: string;
    coordinates?: { lat: number; lng: number };
    location?: string;
    weatherConditions?: string;
    networkInfo?: string;
    batteryLevel?: string;
  };
  chainOfCustody: {
    action: string;
    user: string;
    timestamp: Date;
    details?: string;
  }[];
}

interface AIAnalysis {
  sentiment: 'threatening' | 'neutral' | 'concerning' | 'urgent';
  confidence: number;
  keyElements: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  extractedText?: string;
  emotions?: string[];
  persons?: string[];
  locations?: string[];
  timestamps?: string[];
}

interface Case {
  id: string;
  title: string;
  status: 'active' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdDate: Date;
  lastUpdated: Date;
  fileCount: number;
  riskAssessment: 'low' | 'medium' | 'high' | 'critical';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  xp: number;
  unlocked: boolean;
  dateUnlocked?: Date;
}

interface Resource {
  id: string;
  title: string;
  type: 'book' | 'video' | 'podcast' | 'article' | 'organization';
  description: string;
  url: string;
  author?: string;
  duration?: string;
  recommended: boolean;
}

export const EvidenceVault = () => {
  // State management
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'cases' | 'analytics' | 'resources'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<Record<string, boolean>>({});
  const [userXP, setUserXP] = useState(150);
  const [userLevel, setUserLevel] = useState(3);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null);
  const [newFileDescription, setNewFileDescription] = useState('');
  const [newFileTags, setNewFileTags] = useState('');
  const [newFilePriority, setNewFilePriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [modalTab, setModalTab] = useState<'overview' | 'ai' | 'meta' | 'chain'>('overview');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch evidence from vault
  const fetchEvidence = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/incidents/vault/evidence', {
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch evidence');
      }

      const evidence = await response.json();
      
      // Convert the evidence data to match our EvidenceFile interface
      const formattedFiles: EvidenceFile[] = evidence.map((item: any) => ({
        id: item._id,
        name: item.fileData.filename,
        type: inferFileType(item.fileData.mimetype),
        size: item.fileData.size,
        uploadDate: new Date(item.createdAt),
        caseId: item.metadata.caseId,
        encrypted: true,
        shared: false,
        verified: true,
        priority: inferPriority(item.metadata.reportType),
        tags: item.metadata.tags || [],
        description: item.metadata.description || '',
        metadata: {
          timestamp: new Date(item.metadata.uploadDate),
          deviceInfo: item.fileData.deviceInfo,
          location: item.metadata.location
        },
        chainOfCustody: [{
          action: 'File uploaded',
          user: 'You',
          timestamp: new Date(item.createdAt),
          details: 'Added to private vault'
        }]
      }));

      setFiles(formattedFiles);
      console.log('Loaded evidence files:', formattedFiles);
    } catch (error) {
      console.error('Error fetching evidence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to infer file type from mimetype
  const inferFileType = (mimetype: string): EvidenceFile['type'] => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    return 'document';
  };

  // Helper function to infer priority based on report type
  const inferPriority = (reportType: string): EvidenceFile['priority'] => {
    const highPriorityTypes = ['physical-assault', 'sexual-assault'];
    const mediumPriorityTypes = ['stalking', 'verbal-threat'];
    return highPriorityTypes.includes(reportType) ? 'high' 
           : mediumPriorityTypes.includes(reportType) ? 'medium'
           : 'low';
  };

  // Initialize data
  useEffect(() => {
    fetchEvidence();
    const initialCases: Case[] = [];
    const initialAchievements: Achievement[] = [];

    setCases(initialCases);
    setAchievements(initialAchievements);
  }, []);

  // GBV Resources
  const gbvResources: Resource[] = [];

  // Filter files based on search and filters
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || file.type === filterType;
    const matchesPriority = filterPriority === 'all' || file.priority === filterPriority;
    const matchesCase = selectedCase === 'all' || file.caseId === selectedCase;
    return matchesSearch && matchesType && matchesPriority && matchesCase;
  });

  // Calculate stats
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const highPriorityFiles = files.filter(f => f.priority === 'urgent' || f.priority === 'high').length;
  const verifiedFiles = files.filter(f => f.verified).length;
  const sharedFiles = files.filter(f => f.shared).length;
  const activeCases = cases.filter(c => c.status === 'active').length;

  // Helper functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getFileIcon = (type: string, priority?: string) => {
    const isPriority = priority === 'urgent' || priority === 'high';
    let iconClass = 'w-5 h-5 ';
    
    if (isPriority) {
      iconClass += 'text-red-500';
    } else {
      switch (type) {
        case 'image': case 'screenshot': iconClass += 'text-blue-500'; break;
        case 'video': iconClass += 'text-purple-500'; break;
        case 'audio': case 'recording': iconClass += 'text-green-500'; break;
        case 'document': iconClass += 'text-yellow-500'; break;
        default: iconClass += 'text-gray-500';
      }
    }
    
    switch (type) {
      case 'image': return <Image className={iconClass} />;
      case 'video': return <Video className={iconClass} />;
      case 'audio': return <AudioLines className={iconClass} />;
      case 'recording': return <AudioLines className={iconClass} />;
      case 'screenshot': return <Image className={iconClass} />;
      case 'document': return <FileText className={iconClass} />;
      default: return <File className={iconClass} />;
    }
  };

  // File upload functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => 
        file.size <= 100 * 1024 * 1024 // Filter out files larger than 100MB
      );
      setSelectedFiles(newFiles);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    const newUploadProgress: Record<string, number> = {};
    selectedFiles.forEach(file => {
      newUploadProgress[file.name] = 0;
    });
    setUploadProgress(newUploadProgress);
    
    // Simulate upload progress
    selectedFiles.forEach(file => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          clearInterval(interval);
          progress = 100;
          addFileToVault(file);
        }
        setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
      }, 300);
    });
  };

  const addFileToVault = (file: File) => {
    const newFile: EvidenceFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      type: getFileTypeFromName(file.name),
      size: file.size,
      uploadDate: new Date(),
      encrypted: true,
      shared: false,
      verified: false,
      priority: newFilePriority,
      tags: newFileTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      description: newFileDescription,
      metadata: {
        timestamp: new Date(),
        deviceInfo: navigator.userAgent
      },
      chainOfCustody: [
        {
          action: 'File uploaded',
          user: 'Current User',
          timestamp: new Date(),
          details: `Uploaded ${file.name} (${formatFileSize(file.size)})`
        }
      ]
    };

    setFiles(prev => [...prev, newFile]);
    setIsAnalyzing(prev => ({ ...prev, [newFile.id]: true }));
    
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(prev => ({ ...prev, [newFile.id]: false }));
      setFiles(prev => prev.map(f => 
        f.id === newFile.id ? { 
          ...f, 
          verified: true,
          aiAnalysis: generateMockAnalysis(f)
        } : f
      ));
      
      // Award XP for uploading
      setUserXP(prev => prev + 5);
      
      // Check if this unlocks any achievements
      const firstUploadAchievement = achievements.find(a => a.id === 'ach-1');
      if (firstUploadAchievement && !firstUploadAchievement.unlocked) {
        setAchievements(prev => prev.map(a => 
          a.id === 'ach-1' ? { ...a, unlocked: true, dateUnlocked: new Date() } : a
        ));
      }
      
      // Check if this unlocks the Evidence Collector achievement
      if (files.filter(f => f.verified).length + 1 >= 5) {
        const evidenceCollectorAchievement = achievements.find(a => a.id === 'ach-2');
        if (evidenceCollectorAchievement && !evidenceCollectorAchievement.unlocked) {
          setAchievements(prev => prev.map(a => 
            a.id === 'ach-2' ? { ...a, unlocked: true, dateUnlocked: new Date() } : a
          ));
        }
      }
      
      // Check if this unlocks the Verified Evidence achievement
      if (files.filter(f => f.verified).length + 1 >= 5) {
        const verifiedEvidenceAchievement = achievements.find(a => a.id === 'ach-5');
        if (verifiedEvidenceAchievement && !verifiedEvidenceAchievement.unlocked) {
          setAchievements(prev => prev.map(a => 
            a.id === 'ach-5' ? { ...a, unlocked: true, dateUnlocked: new Date() } : a
          ));
        }
      }
    }, 3000);
  };

  const getFileTypeFromName = (filename: string): EvidenceFile['type'] => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return 'image';
    if (['mp4', 'mov', 'avi'].includes(extension || '')) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(extension || '')) return 'audio';
    if (['pdf', 'doc', 'docx'].includes(extension || '')) return 'document';
    return 'document';
  };

  const generateMockAnalysis = (file: EvidenceFile): AIAnalysis => {
    const riskLevels: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
    const sentiments: ('neutral' | 'concerning' | 'threatening' | 'urgent')[] = ['neutral', 'concerning', 'threatening', 'urgent'];
    
    // Generate analysis based on file type
    let analysis: AIAnalysis = {
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
      confidence: 0.7 + Math.random() * 0.3,
      keyElements: [],
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      recommendations: []
    };
    
    // Customize analysis based on file type
    switch(file.type) {
      case 'image':
      case 'screenshot':
        analysis.keyElements = [
          'Visual content analyzed',
          'Patterns detected',
          'Contextual elements identified'
        ];
        analysis.recommendations = [
          'Enhance image quality if possible',
          'Document original timestamps',
          'Correlate with other evidence'
        ];
        if (file.type === 'screenshot') {
          analysis.keyElements.push('Text content extracted');
          analysis.recommendations.push('Verify source of screenshot');
        }
        break;
      case 'video':
        analysis.keyElements = [
          'Audio-visual synchronization verified',
          'Key frames analyzed',
          'Background elements identified'
        ];
        analysis.recommendations = [
          'Enhance audio clarity if possible',
          'Document video metadata',
          'Isolate relevant segments'
        ];
        break;
      case 'audio':
      case 'recording':
        analysis.keyElements = [
          'Voice patterns analyzed',
          'Background noise assessed',
          'Emotional tone detected'
        ];
        analysis.recommendations = [
          'Transcribe audio content',
          'Enhance audio quality if possible',
          'Correlate with timeline of events'
        ];
        if (file.type === 'recording') {
          analysis.keyElements.push('Emergency signals detected');
          analysis.recommendations.push('Verify with authorities if emergency call');
        }
        break;
      case 'document':
        analysis.keyElements = [
          'Text content extracted',
          'Formatting analyzed',
          'Metadata verified'
        ];
        analysis.recommendations = [
          'Verify document authenticity',
          'Correlate with other evidence',
          'Preserve original formatting'
        ];
        break;
    }
    
    // Add some random elements
    if (Math.random() > 0.5) {
      analysis.extractedText = "Sample extracted text from the evidence file...";
    }
    if (Math.random() > 0.5) {
      analysis.emotions = ['anger', 'fear', 'distress'].slice(0, Math.floor(Math.random() * 3) + 1);
    }
    if (Math.random() > 0.5) {
      analysis.persons = ['John Doe', 'Jane Smith'].slice(0, Math.floor(Math.random() * 2) + 1);
    }
    if (Math.random() > 0.5) {
      analysis.locations = ['123 Main St', 'Workplace', 'Park'].slice(0, Math.floor(Math.random() * 3) + 1);
    }
    
    return analysis;
  };

  // Case management functions
  const createNewCase = () => {
    if (!newCaseTitle.trim()) return;
    
    const newCase: Case = {
      id: `case-${Date.now()}`,
      title: newCaseTitle,
      status: 'active',
      priority: 'medium',
      createdDate: new Date(),
      lastUpdated: new Date(),
      fileCount: 0,
      riskAssessment: 'low'
    };
    
    setCases(prev => [...prev, newCase]);
    setNewCaseTitle('');
    
    // Award XP for creating a case
    setUserXP(prev => prev + 15);
    
    // Check if this unlocks the Case Manager achievement
    const caseManagerAchievement = achievements.find(a => a.id === 'ach-3');
    if (caseManagerAchievement && !caseManagerAchievement.unlocked) {
      setAchievements(prev => prev.map(a => 
        a.id === 'ach-3' ? { ...a, unlocked: true, dateUnlocked: new Date() } : a
      ));
    }
  };

  // File modal functions
  const handleDownload = (file: EvidenceFile) => {
    // In a real app, this would trigger an actual download
    alert(`Downloading ${file.name}...`);
  };

  const handleShare = (file: EvidenceFile) => {
    // In a real app, this would trigger a share dialog
    alert(`Sharing ${file.name} with authorized parties...`);
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, shared: true } : f
    ));
  };

  const handleDelete = (fileId: string) => {
    if (confirm("Are you sure you want to delete this evidence file? This action cannot be undone.")) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setSelectedFile(null);
    }
  };

  // Emergency actions
  const handleEmergencyCall = () => {
    alert("Connecting to emergency services...");
    setShowEmergencyModal(false);
  };

  const handleReportIncident = () => {
    alert("Opening incident report form...");
    setShowEmergencyModal(false);
  };

  const handleContactAdvocate = () => {
    alert("Connecting you with a GBV advocate...");
    setShowEmergencyModal(false);
  };

  // Render risk assessment chart
  const renderRiskAssessmentChart = () => {
    const riskLevels = ['critical', 'high', 'medium', 'low'];
    const riskCounts = riskLevels.map(risk => 
      files.filter(f => f.aiAnalysis?.riskLevel === risk).length
    );
    const total = files.length || 1; // Avoid division by zero
    
    return (
      <div className="space-y-4">
        {riskLevels.map((risk, index) => {
          const count = riskCounts[index];
          const percentage = (count / total) * 100;
          
          return (
            <div key={risk} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="capitalize font-medium">{risk} Risk</span>
                <span>{count} files ({percentage.toFixed(1)}%)</span>
              </div>
              <Progress 
                value={percentage} 
                className={`h-2 ${getRiskColor(risk)}`}
              />
            </div>
          );
        })}
      </div>
    );
  };

  // Render evidence types chart
  const renderEvidenceTypesChart = () => {
    const types = ['image', 'video', 'audio', 'document', 'screenshot', 'recording'];
    const typeCounts = types.map(type => 
      files.filter(f => f.type === type).length
    );
    const total = files.length || 1;
    
    return (
      <div className="space-y-4">
        {types.map((type, index) => {
          const count = typeCounts[index];
          if (count === 0) return null;
          
          const percentage = (count / total) * 100;
          
          return (
            <div key={type} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="capitalize font-medium flex items-center gap-2">
                  {getFileIcon(type)}
                  {type}
                </span>
                <span>{count} files ({percentage.toFixed(1)}%)</span>
              </div>
              <Progress 
                value={percentage} 
                className="h-2 bg-blue-500"
              />
            </div>
          );
        })}
      </div>
    );
  };

  // Render common tags
  const renderCommonTags = () => {
    const tagCounts = files.reduce((acc, file) => {
      file.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    const sortedTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    return (
      <div className="space-y-2">
        {sortedTags.map(([tag, count]) => (
          <div key={tag} className="flex justify-between items-center">
            <Badge variant="outline" className="bg-gray-100 text-gray-800">
              {tag}
            </Badge>
            <span className="text-sm font-medium">{count}</span>
          </div>
        ))}
      </div>
    );
  };

  // Render collection timeline
  const renderCollectionTimeline = () => {
    const recentFiles = [...files]
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
      .slice(0, 5);
    
    return (
      <div className="space-y-3 relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200"></div>
        {recentFiles.map((file, index) => (
          <div key={file.id} className="flex items-center gap-3 text-xs">
            <div className="absolute left-0 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium">{file.uploadDate.toLocaleDateString()}</p>
              <p className="text-gray-500">
                {file.type} - {formatFileSize(file.size)}
              </p>
            </div>
            {file.priority === 'urgent' && <AlertCircle className="h-4 w-4 text-red-500" />}
          </div>
        ))}
      </div>
    );
  };

  // Render resource icon
  const renderResourceIcon = (type: string) => {
    switch (type) {
      case 'book': return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'video': return <Video className="w-5 h-5 text-purple-500" />;
      case 'podcast': return <AudioLines className="w-5 h-5 text-green-500" />;
      case 'organization': return <Globe className="w-5 h-5 text-orange-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const [selectedCaseDialog, setSelectedCaseDialog] = useState<any | null>(null);
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <Shield className="text-blue-500 w-8 h-8" />
          GBV Evidence Vault
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              AI Enhanced
            </span>
          </Badge>
        </h1>
        <p className="text-lg text-gray-600">
          Secure evidence management with intelligent analysis for GBV cases
        </p>
      </div>

      {/* Gamification Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Advocacy Progress</CardTitle>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              Level {userLevel} - Advocate
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{userXP} XP</span>
              <span>Next level: {userLevel * 100 - userXP} XP needed</span>
            </div>
            <Progress value={(userXP / (userLevel * 100)) * 100} className="h-2" />
          </div>
          
          <div className="mt-6 grid grid-cols-5 gap-4">
            {achievements.map(achievement => (
              <Card 
                key={achievement.id} 
                className={`text-center p-4 transition-all ${achievement.unlocked ? 'border-blue-200 shadow-md scale-105' : 'opacity-50'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${achievement.unlocked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  {achievement.icon}
                </div>
                <p className="text-sm font-medium">{achievement.title}</p>
                {achievement.unlocked && (
                  <p className="text-xs text-green-600 mt-1">+{achievement.xp} XP</p>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highPriorityFiles}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Verified</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedFiles}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharedFiles}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCases}</div>
          </CardContent>
        </Card>
      </div>



      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Overview
            </span>
          </TabsTrigger>
          <TabsTrigger value="upload">
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </span>
          </TabsTrigger>
          <TabsTrigger value="cases">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Cases
            </span>
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <span className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Analytics
            </span>
          </TabsTrigger>
          <TabsTrigger value="resources">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Resources
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="relative md:col-span-2">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Search files, descriptions, tags..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCase} onValueChange={setSelectedCase}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cases" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cases</SelectItem>
                    {cases.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="recording">Recordings</SelectItem>
                    <SelectItem value="screenshot">Screenshots</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Files Grid */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Evidence Files
                </CardTitle>
                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                  {filteredFiles.length} of {files.length} files
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                  <h3 className="mt-2 text-xl font-semibold">Loading evidence files...</h3>
                  <p className="mt-1 text-gray-500">
                    Please wait while we securely fetch your evidence
                  </p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-xl font-semibold">No evidence files found</h3>
                  <p className="mt-1 text-gray-500">
                    Upload your first evidence file to get started with AI-powered analysis
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab('upload')}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Evidence
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredFiles.map(file => (
                    <Card key={file.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.type, file.priority)}
                            {isAnalyzing[file.id] && (
                              <div className="animate-spin">
                                <Shield className="h-4 w-4 text-blue-500" />
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className={getPriorityBadge(file.priority)}>
                            {file.priority}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{file.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm">
                          {formatFileSize(file.size)} • {file.uploadDate.toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {file.aiAnalysis && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-blue-700">AI Analysis</span>
                              <Badge 
                                className={`text-white ${getRiskColor(file.aiAnalysis.riskLevel)}`}
                              >
                                {file.aiAnalysis.riskLevel}
                              </Badge>
                            </div>
                            <p className="text-sm text-blue-600 mb-1">
                              Confidence: {(file.aiAnalysis.confidence * 100).toFixed(1)}%
                            </p>
                            <p className="text-sm text-blue-600">
                              {file.aiAnalysis.keyElements.slice(0, 2).join(', ')}
                              {file.aiAnalysis.keyElements.length > 2 ? '...' : ''}
                            </p>
                          </div>
                        )}
                        
                        {file.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {file.description}
                          </p>
                        )}
                        
                        {file.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {file.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="bg-gray-100 text-gray-800">
                                {tag}
                              </Badge>
                            ))}
                            {file.tags.length > 2 && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                +{file.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            {file.encrypted && <Lock className="h-3 w-3 text-green-500" />}
                            {file.verified && <Check className="h-3 w-3 text-blue-500" />}
                            {file.shared && <Share2 className="h-3 w-3 text-orange-500" />}
                          </div>
                          {file.caseId && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 text-xs">
                              {cases.find(c => c.id === file.caseId)?.title.slice(0, 15)}...
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedFile(file);
                              setModalTab('overview');
                            }}
                          >
                            <span className="flex items-center gap-1">
                              <FileSearch className="h-3 w-3" />
                              Details
                            </span>
                          </Button>
                          <Button variant="outline" size="icon">
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Evidence Tab */}
        <TabsContent value="upload" className="space-y-6">
          {/* Quick Upload Options */}
          <div className="grid gap-4 md:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = "image/*";
                  fileInputRef.current.click();
                }
              }}
            >
              <Image className="text-blue-500 w-6 h-6" />
              <span className="text-sm">Upload Photos</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = "video/*";
                  fileInputRef.current.click();
                }
              }}
            >
              <Video className="text-purple-500 w-6 h-6" />
              <span className="text-sm">Upload Videos</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = "audio/*";
                  fileInputRef.current.click();
                }
              }}
            >
              <AudioLines className="text-green-500 w-6 h-6" />
              <span className="text-sm">Upload Audio</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = ".pdf,.doc,.docx";
                  fileInputRef.current.click();
                }
              }}
            >
              <FileText className="text-yellow-500 w-6 h-6" />
              <span className="text-sm">Upload Documents</span>
            </Button>
          </div>

          {/* Main Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="text-blue-500 w-5 h-5" />
                Secure Evidence Upload
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <Lock className="mr-1 h-3 w-3" />
                  Auto-Encrypted
                </Badge>
              </CardTitle>
              <CardDescription>
                All files are automatically encrypted and analyzed by AI for evidence integrity and relevance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Drag & Drop Evidence Files</h3>
                <p className="text-gray-500 mb-6">
                  Supported: Images, Videos, Audio, Screenshots, Documents (Max 100MB per file)
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <Select>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="No case assignment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">No case assignment</SelectItem>
                        {cases.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                  />
                  <Button 
                    className="px-6 py-3 text-lg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Select Files to Upload
                  </Button>
                </div>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-medium">Selected Files</h4>
                  <div className="border rounded-lg divide-y">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getFileIcon(getFileTypeFromName(file.name))}
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeSelectedFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Details */}
              {selectedFiles.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-medium">File Details</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        placeholder="Describe the evidence (what, when, where, who involved)"
                        value={newFileDescription}
                        onChange={(e) => setNewFileDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tags (comma separated)</label>
                      <Input
                        placeholder="e.g. threats, messages, screenshot"
                        value={newFileTags}
                        onChange={(e) => setNewFileTags(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Select 
                        value={newFilePriority} 
                        onValueChange={(value) => setNewFilePriority(value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Assign to Case</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="No case assignment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">No case assignment</SelectItem>
                          {cases.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-medium">Upload Progress</h4>
                  <div className="space-y-3">
                    {selectedFiles.map(file => (
                      <div key={file.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {uploadProgress[file.name] === 100 ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Uploading {file.name}
                          </span>
                          <span className="font-medium">{uploadProgress[file.name]?.toFixed(0) || 0}%</span>
                        </div>
                        <Progress value={uploadProgress[file.name] || 0} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  AI-Enhanced Upload Tips
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
                    Clear, high-resolution images provide better analysis results
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
                    Include original timestamps and location data when possible
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
                    Audio recordings with minimal background noise are analyzed more accurately
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
                    Screenshots should include full context (headers, timestamps, etc.)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
                    Documents in text format (PDF, DOC) allow for better content extraction
                  </li>
                </ul>
              </div>

              {/* Upload Button */}
              {selectedFiles.length > 0 && !isUploading && (
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Evidence
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Case Management Tab */}
        <TabsContent value="cases" className="space-y-6">
          {/* Create New Case */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Case
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Case title (e.g. Domestic Violence Case #2024-002)"
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                />
                <Button 
                  onClick={createNewCase} 
                  disabled={!newCaseTitle.trim()}
                >
                  Create Case
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Cases List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Active Cases
              </CardTitle>
              <CardDescription>Manage evidence collections by case</CardDescription>
            </CardHeader>
            <CardContent>
              {cases.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-xl font-semibold">No cases found</h3>
                  <p className="mt-1 text-gray-500">
                    Create your first case to organize your evidence
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {cases.map(caseItem => (
                    <Card key={caseItem.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                            <CardDescription>
                              Created {caseItem.createdDate.toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className={getPriorityBadge(caseItem.priority)}>
                            {caseItem.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 capitalize">
                              {caseItem.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Evidence Files:</span>
                            <span className="font-medium">
                              {files.filter(f => f.caseId === caseItem.id).length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Risk Level:</span>
                            <Badge className={`text-white ${getRiskColor(caseItem.riskAssessment)}`}>
                              {caseItem.riskAssessment}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Updated:</span>
                            <span>{caseItem.lastUpdated.toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => setSelectedCaseDialog(caseItem)}>
                            <span className="flex items-center gap-1">
                              <FileSearch className="h-3 w-3" />
                              View
                            </span>
                          </Button>
                          <Button variant="outline" size="icon">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
      {/* Case Details Dialog */}
      <Dialog open={!!selectedCaseDialog} onOpenChange={(open) => !open && setSelectedCaseDialog(null)}>
        <DialogContent className="max-w-2xl">
          {selectedCaseDialog && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  {selectedCaseDialog.title}
                </DialogTitle>
                <button
                  onClick={() => setSelectedCaseDialog(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 focus:outline-none"
                  aria-label="Close"
                  style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ×
                </button>
              </DialogHeader>
              <div className="space-y-2 mt-2">
                <div className="flex gap-4">
                  <span className="font-medium">Status:</span>
                  <Badge variant="outline" className="bg-gray-100 text-gray-800 capitalize">
                    {selectedCaseDialog.status}
                  </Badge>
                </div>
                <div className="flex gap-4">
                  <span className="font-medium">Created:</span>
                  <span>{selectedCaseDialog.createdDate.toLocaleDateString()}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-medium">Last Updated:</span>
                  <span>{selectedCaseDialog.lastUpdated.toLocaleDateString()}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-medium">Priority:</span>
                  <Badge variant="outline" className={getPriorityBadge(selectedCaseDialog.priority)}>
                    {selectedCaseDialog.priority}
                  </Badge>
                </div>
                <div className="flex gap-4">
                  <span className="font-medium">Risk Level:</span>
                  <Badge className={`text-white ${getRiskColor(selectedCaseDialog.riskAssessment)}`}>{selectedCaseDialog.riskAssessment}</Badge>
                </div>
                <div className="mt-4">
                  <span className="font-medium">Evidence Files:</span>
                  <ul className="list-disc ml-6 mt-1">
                    {files.filter(f => f.caseId === selectedCaseDialog.id).map(f => (
                      <li key={f.id}>{f.name} <span className="text-xs text-gray-500">({f.type}, {formatFileSize(f.size)})</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Dashboard */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="text-blue-500 w-5 h-5" />
                  Risk Assessment Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderRiskAssessmentChart()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="text-blue-500 w-5 h-5" />
                  Evidence Types Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderEvidenceTypesChart()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="text-blue-500 w-5 h-5" />
                  AI Analysis Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Confidence Score</span>
                    <span className="text-lg font-bold text-green-600">87.5%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Files Analyzed</span>
                    <span className="text-lg font-bold text-blue-600">{verifiedFiles}/{files.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Urgent Cases Detected</span>
                    <span className="text-lg font-bold text-red-600">
                      {files.filter(f => f.priority === 'urgent').length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Verified Evidence</span>
                    <span className="text-lg font-bold text-green-600">{verifiedFiles}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="text-blue-500 w-5 h-5" />
                  Recent Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderCollectionTimeline()}
              </CardContent>
            </Card>
          </div>

          {/* Advanced Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="text-blue-500 w-5 h-5" />
                AI Pattern Analysis
              </CardTitle>
              <CardDescription>
                Advanced insights from evidence analysis patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">Most Common Evidence Tags</h4>
                  {renderCommonTags()}
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Evidence Collection Timeline</h4>
                  {renderCollectionTimeline()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export and Reporting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="text-blue-500 w-5 h-5" />
                Export & Reporting
              </CardTitle>
              <CardDescription>
                Generate comprehensive reports and export evidence collections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <FileText className="text-blue-500 w-6 h-6" />
                  <span className="text-sm">Evidence Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <BarChart2 className="text-blue-500 w-6 h-6" />
                  <span className="text-sm">Analytics Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <FileOutput className="text-blue-500 w-6 h-6" />
                  <span className="text-sm">Case Summary</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-blue-500 w-5 h-5" />
                GBV Resources & Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {/* Books */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <BookOpen className="text-blue-500 w-5 h-5" />
                    Recommended Books
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {gbvResources
                      .filter(r => r.type === 'book' && r.recommended)
                      .map(resource => (
                        <li key={resource.id}>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-start gap-2"
                          >
                            <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>
                              {resource.title}
                              {resource.author && <span className="text-gray-500 block text-xs">by {resource.author}</span>}
                            </span>
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
                
                {/* Videos */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Video className="text-blue-500 w-5 h-5" />
                    Educational Videos
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {gbvResources
                      .filter(r => r.type === 'video')
                      .map(resource => (
                        <li key={resource.id}>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-start gap-2"
                          >
                            <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>
                              {resource.title}
                              {resource.duration && <span className="text-gray-500 block text-xs">{resource.duration}</span>}
                            </span>
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
                
                {/* Organizations */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Globe className="text-blue-500 w-5 h-5" />
                    Support Organizations
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {gbvResources
                      .filter(r => r.type === 'organization')
                      .map(resource => (
                        <li key={resource.id}>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-start gap-2"
                          >
                            <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>
                              {resource.title}
                              <span className="text-gray-500 block text-xs">{resource.description}</span>
                            </span>
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* File Details Modal */}
      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedFile && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getFileIcon(selectedFile.type, selectedFile.priority)}
                  {selectedFile.name}
                  <Badge variant="outline" className={getPriorityBadge(selectedFile.priority)}>
                    {selectedFile.priority}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className={getPriorityBadge(selectedFile.priority)}>
                  {selectedFile.priority}
                </Badge>
                {selectedFile.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="bg-gray-100 text-gray-800">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <Button 
                  variant={modalTab === 'overview' ? 'default' : 'ghost'} 
                  className="py-2 px-3 text-sm" 
                  onClick={() => setModalTab('overview')}
                >
                  Overview
                </Button>
                <Button 
                  variant={modalTab === 'ai' ? 'default' : 'ghost'} 
                  className="py-2 px-3 text-sm" 
                  onClick={() => setModalTab('ai')}
                >
                  AI Analysis
                </Button>
                <Button 
                  variant={modalTab === 'meta' ? 'default' : 'ghost'} 
                  className="py-2 px-3 text-sm" 
                  onClick={() => setModalTab('meta')}
                >
                  Metadata
                </Button>
                <Button 
                  variant={modalTab === 'chain' ? 'default' : 'ghost'} 
                  className="py-2 px-3 text-sm" 
                  onClick={() => setModalTab('chain')}
                >
                  Chain of Custody
                </Button>
              </div>
              
              {/* Tab content */}
              {modalTab === 'overview' && (
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="font-medium">File Type</p>
                    <p className="text-gray-600 capitalize">{selectedFile.type}</p>
                  </div>
                  <div>
                    <p className="font-medium">File Size</p>
                    <p className="text-gray-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Upload Date</p>
                    <p className="text-gray-600">{selectedFile.uploadDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-medium">Status</p>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Encrypted
                      </Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                        Verified
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="col-span-2 mb-4">
                    <p className="font-medium text-sm mb-2">Description</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedFile.description}
                    </p>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="font-medium text-sm mb-2">Case Assignment</p>
                    <p className="text-sm text-gray-600">
                      {selectedFile.caseId ? cases.find(c => c.id === selectedFile.caseId)?.title : 'No case assigned'}
                    </p>
                  </div>
                </div>
              )}
              
              {modalTab === 'ai' && (
                <div className="space-y-4">
                  {selectedFile.aiAnalysis ? (
                    <>
                      <div className="p-3 bg-red-100 border-l-4 border-red-500 rounded flex items-start gap-2">
                        <Shield className="text-red-500 mt-1 w-5 h-5" />
                        <div>
                          <strong>Risk Assessment: {selectedFile.aiAnalysis.riskLevel.toUpperCase()}</strong><br />
                          Analysis confidence: {(selectedFile.aiAnalysis.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border rounded-lg p-3">
                          <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                            <BarChart2 className="text-blue-500 w-5 h-5" />
                            Key Elements Detected
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {selectedFile.aiAnalysis.keyElements.map((element, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                {element}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="bg-white border rounded-lg p-3">
                          <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                            <Shield className="text-blue-500 w-5 h-5" />
                            AI Recommendations
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {selectedFile.aiAnalysis.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-blue-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {selectedFile.aiAnalysis.extractedText && (
                        <div className="bg-white border rounded-lg p-3">
                          <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                            <FileText className="text-blue-500 w-5 h-5" />
                            Extracted Content
                          </h4>
                          <p className="text-sm bg-yellow-50 p-3 rounded border-l-4 border-yellow-400 font-mono">
                            {selectedFile.aiAnalysis.extractedText}
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedFile.aiAnalysis.persons && selectedFile.aiAnalysis.persons.length > 0 && (
                          <div className="bg-white border rounded-lg p-3">
                            <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
                              <Users className="text-blue-500 w-5 h-5" />
                              Persons
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedFile.aiAnalysis.persons.map((person, idx) => (
                                <Badge key={idx} variant="outline" className="bg-gray-100 text-gray-800">
                                  {person}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {selectedFile.aiAnalysis.locations && selectedFile.aiAnalysis.locations.length > 0 && (
                          <div className="bg-white border rounded-lg p-3">
                            <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
                              <MapPin className="text-blue-500 w-5 h-5" />
                              Locations
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedFile.aiAnalysis.locations.map((location, idx) => (
                                <Badge key={idx} variant="outline" className="bg-gray-100 text-gray-800">
                                  {location}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {selectedFile.aiAnalysis.emotions && selectedFile.aiAnalysis.emotions.length > 0 && (
                          <div className="bg-white border rounded-lg p-3">
                            <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
                              <Heart className="text-blue-500 w-5 h-5" />
                              Emotions
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedFile.aiAnalysis.emotions.map((emotion, idx) => (
                                <Badge key={idx} variant="outline" className="bg-gray-100 text-gray-800">
                                  {emotion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500">No AI analysis available for this file.</div>
                  )}
                </div>
              )}
              
              {modalTab === 'meta' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-3">Technical Information</h4>
                    <div className="space-y-2 text-sm">
                      {selectedFile.metadata.deviceInfo && (
                        <div>
                          <p className="font-medium text-xs text-gray-500">Device</p>
                          <p className="text-gray-800">{selectedFile.metadata.deviceInfo}</p>
                        </div>
                      )}
                      {selectedFile.metadata.timestamp && (
                        <div>
                          <p className="font-medium text-xs text-gray-500">Original Timestamp</p>
                          <p className="text-gray-800">{selectedFile.metadata.timestamp.toLocaleString()}</p>
                        </div>
                      )}
                      {selectedFile.metadata.coordinates && (
                        <div>
                          <p className="font-medium text-xs text-gray-500">GPS Coordinates</p>
                          <p className="text-gray-800 font-mono">
                            {selectedFile.metadata.coordinates.lat}, {selectedFile.metadata.coordinates.lng}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-3">Additional Metadata</h4>
                    <div className="space-y-2 text-sm">
                      {selectedFile.metadata.location && (
                        <div>
                          <p className="font-medium text-xs text-gray-500">Location</p>
                          <p className="text-gray-800">{selectedFile.metadata.location}</p>
                        </div>
                      )}
                      {selectedFile.metadata.networkInfo && (
                        <div>
                          <p className="font-medium text-xs text-gray-500">Network</p>
                          <p className="text-gray-800">{selectedFile.metadata.networkInfo}</p>
                        </div>
                      )}
                      {selectedFile.metadata.batteryLevel && (
                        <div>
                          <p className="font-medium text-xs text-gray-500">Battery Level</p>
                          <p className="text-gray-800">{selectedFile.metadata.batteryLevel}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {modalTab === 'chain' && (
                <div className="space-y-3">
                  {selectedFile.chainOfCustody.length > 0 ? (
                    selectedFile.chainOfCustody.map((entry, idx) => (
                      <div key={idx} className="bg-white border rounded-lg border-l-4 border-l-blue-500 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{entry.action}</h4>
                            <p className="text-sm text-gray-500">by {entry.user}</p>
                            {entry.details && (
                              <p className="text-xs text-gray-500 mt-1">{entry.details}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{entry.timestamp.toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{entry.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No chain of custody records available.</div>
                  )}
                </div>
              )}
              
              <div className="mt-6 border-t pt-4 flex justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleDownload(selectedFile)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleShare(selectedFile)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDelete(selectedFile.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


    </div>
  );
};