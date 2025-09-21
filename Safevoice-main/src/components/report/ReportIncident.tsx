import { useState, useEffect, useRef } from "react";
import { AlertTriangle, FileText, MapPin, Camera, Upload, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";
import { useToast } from "@/hooks/use-toast";
import { AttachmentViewer } from "./AttachmentViewer";

interface IncidentReport {
  id: string;
  _id?: string;
  type: string;
  urgency: string;
  date: string;
  time: string;
  location: string;
  description: string;
  perpetrator?: string;
  witnesses?: string;
  notes?: string;
  anonymous: boolean;
  attachments: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
    uploadedAt: Date;
  }>;
  status: 'draft' | 'submitted' | 'under_review' | 'resolved';
  submittedAt?: Date;
  createdAt?: string;
  consent?: {
    vault: boolean;
    ngo: boolean;
    court: boolean;
  };
  progress?: number;
}

export const ReportIncident = () => {
  const [report, setReport] = useState<IncidentReport>({
    id: '',
    type: '',
    urgency: '',
    date: '',
    time: '',
    location: '',
    description: '',
    perpetrator: '',
    witnesses: '',
    notes: '',
    anonymous: false,
    attachments: [],
    status: 'draft',
    consent: { vault: false, ngo: false, court: false },
    progress: 0
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedReports, setSavedReports] = useState<IncidentReport[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [caseId, setCaseId] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [showPreviousReportsModal, setShowPreviousReportsModal] = useState(false);
  const [loadedDraftId, setLoadedDraftId] = useState<string | null>(null);
  
  const { t } = useLanguage();
  const { speak, isVoiceEnabled } = useVoice();
  const { toast } = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-fill date & time
    const now = new Date();
    setReport(prev => ({
      ...prev,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5)
    }));
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        () => {
          setCurrentLocation('Location access denied');
        }
      );
    }
    // Load initial reports
    loadReports();
  }, []);

  const incidentTypes = [
    { value: 'verbal-threat', label: 'Verbal Threat' },
    { value: 'physical-assault', label: 'Physical Assault' },
    { value: 'sexual-assault', label: 'Sexual Assault' },
    { value: 'stalking', label: 'Stalking' },
    { value: 'financial-abuse', label: 'Financial Abuse' },
    { value: 'digital-abuse', label: 'Digital Abuse' },
    { value: 'other', label: 'Other' }
  ];

  const urgencyLevels = [
    { value: 'immediate', label: 'Immediate Danger', color: 'destructive' },
    { value: 'high', label: 'High Priority', color: 'warning' },
    { value: 'medium', label: 'Medium Priority', color: 'secondary' },
    { value: 'low', label: 'Low Priority', color: 'default' }
  ];

  const handleInputChange = (field: keyof IncidentReport, value: string | boolean | File[] | IncidentReport['consent'] | number) => {
    setReport(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf', '.doc', '.docx'];
      const maxSize = 100 * 1024 * 1024; // 100MB
      
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 100MB limit`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('http://localhost:5000/api/uploads', {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const uploadedFiles = await response.json();

      setReport(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadedFiles]
      }));

      toast({
        title: "Files uploaded",
        description: `${uploadedFiles.length} file(s) added to report`,
        variant: "default"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeAttachment = (index: number) => {
    setReport(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const saveAsDraft = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const draftReport = {
        ...report,
        id: report.id || `draft-${Date.now()}`,
        status: 'draft'
      };

      const response = await fetch('http://localhost:5000/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(draftReport)
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      setShowNewReportForm(false);
      setLoadedDraftId(null);
      toast({
        title: "Draft saved",
        description: "Your report has been saved as a draft",
        variant: "default"
      });

      // Refresh reports list
      loadReports();
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      });
    }
  };

  const submitReport = async () => {
    if (!report.type || !report.urgency || !report.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    const chainId = `INC-2025-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
    
    try {
      // Get token for authentication
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Prepare report data
      const submittedReport: IncidentReport = {
        ...report,
        id: chainId,
        status: 'submitted',
        submittedAt: new Date(),
        consent: report.consent,
        progress: report.progress
      };

      // Submit to backend
      const response = await fetch('http://localhost:5000/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(submittedReport)
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      toast({
        title: "Report submitted",
        description: "Your report has been successfully submitted",
        variant: "default"
      });

      // Reset form
      setReport({
        id: '',
        type: '',
        urgency: '',
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toTimeString().slice(0, 5),
        location: '',
        description: '',
        perpetrator: '',
        witnesses: '',
        notes: '',
        anonymous: false,
        attachments: [],
        status: 'draft',
        consent: { vault: false, ngo: false, court: false },
        progress: 0
      });

      // Close the form and refresh reports
      setShowNewReportForm(false);
      loadReports(); // Fetch updated reports

      if (isVoiceEnabled) {
        speak("Your report has been submitted successfully. Case ID: " + chainId);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load user's reports from database
  const loadReports = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      if (!token) return;

      // Decode token to check userId
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const tokenData = JSON.parse(window.atob(base64));
        console.log('Token data:', tokenData);
      } catch (e) {
        console.error('Error decoding token:', e);
      }

      // Get all reports (both submitted and drafts) from incidents collection
      const response = await fetch('http://localhost:5000/api/incidents/user', {
        headers: {
          'x-auth-token': token
        }
      });

      console.log('API Response status:', response.status);
      const responseText = await response.text();
      console.log('API Response body:', responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        
        // Convert the data to match our IncidentReport interface
        const formattedReports = data.map((report: any) => ({
          ...report,
          id: report._id,
          type: report.type,
          urgency: report.urgency,
          date: report.date,
          time: report.time,
          location: report.location?.address || report.location,
          description: report.description,
          perpetrator: report.perpetrator || '',
          witnesses: report.witnesses || '',
          notes: report.notes || '',
          anonymous: report.anonymous || false,
          attachments: report.attachments?.map(attachment => ({
            filename: attachment.filename,
            originalName: attachment.originalName,
            mimetype: attachment.mimetype,
            size: attachment.size,
            path: attachment.path,
            uploadedAt: new Date(attachment.uploadedAt)
          })) || [],
          status: report.status || 'submitted',
          submittedAt: report.submittedAt ? new Date(report.submittedAt) : undefined,
          createdAt: report.createdAt,
          consent: report.consent || { vault: false, ngo: false, court: false },
          progress: report.progress || 0
        }));

        console.log('Loaded reports:', formattedReports); // Debug log
        
        // Sort reports by creation date
        setSavedReports(formattedReports.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    }
  };

  // Load reports when component mounts
  useEffect(() => {
    loadReports();
  }, []);

  const loadDraft = async (draftId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/incidents/${draftId}`, {
        headers: {
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const draft = await response.json();
        setReport(draft);
        setShowNewReportForm(true);
        setLoadedDraftId(draft.id);
        toast({
          title: "Draft loaded",
          description: "Draft report loaded for editing",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      toast({
        title: "Error",
        description: "Failed to load draft",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (report: any) => {
    // Convert MongoDB document to our interface format
    const formattedReport: IncidentReport = {
      id: report._id,
      type: report.type,
      urgency: report.urgency,
      date: report.date,
      time: report.time,
      location: report.location?.address || report.location,
      description: report.description,
      perpetrator: report.perpetrator,
      witnesses: report.witnesses,
      notes: report.notes,
      anonymous: report.anonymous,
      attachments: report.attachments?.map(attachment => ({
        filename: attachment.filename,
        originalName: attachment.originalName,
        mimetype: attachment.mimetype,
        size: attachment.size,
        path: attachment.path,
        uploadedAt: new Date(attachment.uploadedAt)
      })) || [],
      status: report.status || 'submitted',
      submittedAt: new Date(report.createdAt),
      consent: report.consent,
      progress: report.progress
    };
    setSelectedReport(formattedReport);
    setShowDetails(true);
  };

  const handleDeleteReport = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/incidents/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      if (response.ok) {
        // Remove from UI state
        setSavedReports(prev => prev.filter(r => r.id !== id));
        setShowNewReportForm(false);
        setLoadedDraftId(null);
        setShowDetails(false);
        toast({
          title: "Report deleted",
          description: `Case ID ${id} deleted.`,
          variant: "default"
        });

        // Refresh reports list
        loadReports();
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-[95%] ml-[2%] space-y-6" style={{width: '95%'}}>
      {/* Header */}
      <div className="mt-6 mb-6">
        <div className="rounded-lg border border-primary bg-primary/10 px-6 py-4 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            {t('report_incident')}
          </h1>
          <p className="text-muted-foreground">
            Submit a confidential report about an incident. All information is encrypted and secure.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 md:px-8 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Start a new report or manage drafts</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={() => setShowNewReportForm(true)} className="flex-1" variant="destructive">
              + New Report
            </Button>
            <Button
              onClick={() => setShowPreviousReportsModal(true)}
              className="flex-1"
              variant="secondary"
            >
              View Previous Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <div className="px-4 md:px-8 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Your most recent submitted reports</CardDescription>
          </CardHeader>
          <CardContent>
            {savedReports.filter(r => r.status === 'submitted' || r.status === 'under_review' || r.status === 'resolved').length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold">No reports yet</p>
                <p className="text-muted-foreground">Your submitted reports will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedReports
                  .filter(r => r.status === 'submitted' || r.status === 'under_review' || r.status === 'resolved')
                  .sort((a, b) => new Date(b.submittedAt || b.createdAt || 0).getTime() - new Date(a.submittedAt || a.createdAt || 0).getTime())
                  .map((report) => (
                    <div key={report._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Type: {incidentTypes.find(t => t.value === report.type)?.label}</p>
                          <Badge variant={report.urgency === 'immediate' ? 'destructive' : report.urgency === 'high' ? 'secondary' : 'default'}>
                            {report.urgency.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {report.description.substring(0, 100)}{report.description.length > 100 ? '...' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Reported: {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(report)}>View</Button>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Form Container */}
      <div className="space-y-6 px-4 md:px-8">
        {/* Saved Drafts */}
        {savedReports.filter(r => r.status === 'draft').length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saved Drafts</CardTitle>
              <CardDescription>Continue working on a saved draft</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {savedReports.filter(r => r.status === 'draft').map((draft) => (
                  <div key={draft.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{draft.type || 'Untitled Draft'}</p>
                      <p className="text-sm text-muted-foreground">
                        {draft.description ? `${draft.description.substring(0, 50)}...` : 'No description'}
                      </p>
                    </div>
                    <Button onClick={() => loadDraft(draft.id)} variant="outline" size="sm">
                      Load Draft
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Report Form - only show when New Report is clicked */}
        {showNewReportForm && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Incident Details</CardTitle>
                <CardDescription>
                  Please provide as much detail as you feel comfortable sharing
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setShowNewReportForm(false); setLoadedDraftId(null); }}>
                <X className="h-5 w-5" /> Cancel
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Safety Quick Actions removed as requested */}

              {/* Consent Checkboxes */}
              <div className="space-y-2">
                <Label>Consent Options</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="consent-vault" checked={report.consent?.vault} onCheckedChange={checked => handleInputChange('consent', { ...report.consent, vault: !!checked })} />
                    <Label htmlFor="consent-vault" className="text-sm">Save to my private vault only</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="consent-ngo" checked={report.consent?.ngo} onCheckedChange={checked => handleInputChange('consent', { ...report.consent, ngo: !!checked })} />
                    <Label htmlFor="consent-ngo" className="text-sm">Share with NGO Advocate</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="consent-court" checked={report.consent?.court} onCheckedChange={checked => handleInputChange('consent', { ...report.consent, court: !!checked })} />
                    <Label htmlFor="consent-court" className="text-sm">Prepare court-ready pack</Label>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="incident-type">Incident Type *</Label>
                  <Select value={report.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      {incidentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level *</Label>
                  <Select value={report.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date of Incident</Label>
                  <Input
                    type="date"
                    value={report.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time of Incident</Label>
                  <Input
                    type="time"
                    value={report.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Where did this occur?"
                    value={report.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleInputChange('location', currentLocation)}
                    disabled={!currentLocation}
                    title="Use current location"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                {currentLocation && (
                  <p className="text-xs text-muted-foreground">
                    Current location: {currentLocation}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Incident Description *</Label>
                <Textarea
                  placeholder={t('Describe what happened…') || 'Describe what happened…'}
                  value={report.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-32"
                />
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="perpetrator">Perpetrator Information (if known)</Label>
                  <Textarea
                    placeholder="Any information about the person(s) involved (name, description, relationship to you, etc.)"
                    value={report.perpetrator}
                    onChange={(e) => handleInputChange('perpetrator', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="witnesses">Witnesses</Label>
                  <Input
                    placeholder="Were there any witnesses?"
                    value={report.witnesses}
                    onChange={(e) => handleInputChange('witnesses', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    placeholder="Any additional information you'd like to share"
                    value={report.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </div>
              </div>

              {/* File Attachments & Direct Record */}
              <div className="space-y-4">
                <Label>Evidence/Attachments</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag & drop files here, or use the options below
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Supported: Images, Videos, Audio, Documents (Max 100MB per file)
                  </p>
                  {/* Take Photo and Record Voice Note functionality */}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={photoInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <input
                    type="file"
                    accept="audio/*"
                    ref={audioInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="flex gap-2 justify-center mt-4">
                    <Button variant="outline" onClick={() => photoInputRef.current?.click()}>Select Photo</Button>
                    <Button variant="outline" onClick={() => audioInputRef.current?.click()}>Select Audio</Button>
                  </div>
                </div>

                {/* Display attached files */}
                {report.attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Attached Files:</p>
                    <div className="space-y-2">
                      {report.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.filename}</span>
                            <Badge variant="secondary" className="text-xs">
                              {(file.size / (1024 * 1024)).toFixed(1)}MB
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={report.anonymous}
                  onCheckedChange={(checked) => handleInputChange('anonymous', checked)}
                />
                <Label htmlFor="anonymous" className="text-sm">
                  Submit this report anonymously
                </Label>
              </div>

              {/* Evidence Sealed Message */}
              {report.attachments.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">✔️ Evidence sealed</Badge>
                  <span className="text-xs text-muted-foreground">Auto-hash & timestamp applied</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={saveAsDraft} variant="outline" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button onClick={submitReport} disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
                {loadedDraftId && (
                  <Button variant="destructive" className="flex-1" onClick={() => handleDeleteReport(loadedDraftId)}>
                    <X className="h-4 w-4 mr-2" /> Delete Draft
                  </Button>
                )}
              </div>

              {/* Confirmation message */}
              {caseId && (
                <div className="mt-4 p-4 border rounded-lg bg-green-50 text-green-900">
                  <strong>Your report has been saved securely.</strong><br />
                  Case ID: {caseId}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Previous Reports Modal */}
        {showPreviousReportsModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Previous Reports</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowPreviousReportsModal(false)}>
                  <X className="h-5 w-5" /> Close
                </Button>
              </div>
              {savedReports.filter(r => r.status !== 'draft').length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold">You have no previous reports.</p>
                  <p className="text-muted-foreground">All your submitted reports will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedReports
                    .filter(r => r.status !== 'draft')
                    .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())
                    .map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Case ID: {report.id}</p>
                            <Badge variant={report.status === 'submitted' ? 'secondary' : report.status === 'under_review' ? 'destructive' : 'default'}>
                              {report.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {incidentTypes.find(t => t.value === report.type)?.label} - {report.urgency}
                          </p>
                          {report.submittedAt && (
                            <p className="text-xs text-muted-foreground">
                              Date reported: {new Date(report.submittedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(report)}>View</Button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Report Details Modal */}
      {showDetails && selectedReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Report Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                <X className="h-5 w-5" /> Close
              </Button>
            </div>
            <div className="space-y-2">
              <p><strong>Case ID:</strong> {selectedReport.id}</p>
              <p><strong>Status:</strong> {selectedReport.status.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Type:</strong> {incidentTypes.find(t => t.value === selectedReport.type)?.label}</p>
              <p><strong>Urgency:</strong> {selectedReport.urgency}</p>
              <p><strong>Date:</strong> {selectedReport.date}</p>
              <p><strong>Time:</strong> {selectedReport.time}</p>
              <p><strong>Location:</strong> {selectedReport.location}</p>
              <p><strong>Description:</strong> {selectedReport.description}</p>
              {selectedReport.perpetrator && <p><strong>Perpetrator:</strong> {selectedReport.perpetrator}</p>}
              {selectedReport.witnesses && <p><strong>Witnesses:</strong> {selectedReport.witnesses}</p>}
              {selectedReport.notes && <p><strong>Notes:</strong> {selectedReport.notes}</p>}
              <p><strong>Anonymous:</strong> {selectedReport.anonymous ? 'Yes' : 'No'}</p>
              {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                <div>
                  <strong>Attachments:</strong>
                  <div className="space-y-4 mt-4">
                    {selectedReport.attachments.map((attachment, idx) => (
                      <AttachmentViewer key={attachment.filename || idx} attachment={attachment} />
                    ))}
                  </div>
                </div>
              )}
              {selectedReport.consent && (
                <div>
                  <strong>Consent:</strong>
                  <ul className="list-disc ml-6">
                    <li>Vault: {selectedReport.consent.vault ? 'Yes' : 'No'}</li>
                    <li>NGO: {selectedReport.consent.ngo ? 'Yes' : 'No'}</li>
                    <li>Court: {selectedReport.consent.court ? 'Yes' : 'No'}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="h-6" />
    </div>
  );
};