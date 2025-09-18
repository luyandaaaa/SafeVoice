import { useState, useEffect } from "react";
import { Scale, Phone, Calendar, FileText, Users, MessageCircle, Download, ExternalLink, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";
import { useToast } from "@/hooks/use-toast";

interface LegalResource {
  id: string;
  title: string;
  type: 'guide' | 'form' | 'contact' | 'process';
  category: 'rights' | 'restraining_order' | 'legal_process' | 'emergency' | 'domestic_violence';
  description: string;
  downloadUrl?: string;
  externalUrl?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
}

interface LegalContact {
  id: string;
  name: string;
  type: 'attorney' | 'legal_aid' | 'hotline' | 'organization';
  specialization: string[];
  phone: string;
  email?: string;
  address?: string;
  availability: string;
  rating: number;
  freeConsultation: boolean;
  languages: string[];
}

interface ConsultationRequest {
  id: string;
  type: 'phone' | 'video' | 'in_person';
  preferredDate: Date;
  urgency: string;
  description: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface LegalRequest {
  id: string;
  type: string;
  urgency: string;
  language: string;
  name: string;
  contactMethod: string;
  caseBackground: string;
  consent: {
    ngo: boolean;
    vault: boolean;
  };
  documents: File[];
  callbackTime?: string;
  chatHistory?: string[];
  status: 'pending' | 'in_progress' | 'resolved';
  assignedAdvocate?: string;
  dateRequested: string;
  progress: number;
}

// Define ConsultationFormData type for consultation form
interface ConsultationFormData {
  type: 'phone' | 'video' | 'in_person';
  date: string;
  urgency: string;
  description: string;
}

export const LegalAssistance = () => {
  const [legalResources, setLegalResources] = useState<LegalResource[]>([]);
  const [legalContacts, setLegalContacts] = useState<LegalContact[]>([]);
  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
  const [legalRequests, setLegalRequests] = useState<LegalRequest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [request, setRequest] = useState<LegalRequest>({
    id: '',
    type: '',
    urgency: '',
    language: '',
    name: '',
    contactMethod: '',
    caseBackground: '',
    consent: { ngo: false, vault: false },
    documents: [],
    status: 'pending',
    dateRequested: '',
    progress: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caseRef, setCaseRef] = useState('');
  const [selectedCase, setSelectedCase] = useState<LegalRequest | null>(null);
  const [showDecoy, setShowDecoy] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showLegalResources, setShowLegalResources] = useState(false);
  const [showLegalContacts, setShowLegalContacts] = useState(false);

  // Track active quick action
  const [activeQuickAction, setActiveQuickAction] = useState<'request' | 'resources' | 'contacts' | 'cases' | null>(null);

  const { t } = useLanguage();
  const { speak, isVoiceEnabled } = useVoice();
  const { toast } = useToast();

  useEffect(() => {
    initializeMockData();
    loadConsultationRequests();
  }, []);

  const initializeMockData = () => {
    const mockResources: LegalResource[] = [
      {
        id: '1',
        title: 'Know Your Rights: A Guide for Survivors',
        type: 'guide',
        category: 'rights',
        description: 'Comprehensive guide explaining your legal rights as a survivor of gender-based violence in South Africa.',
        downloadUrl: '/resources/legal-rights-guide.pdf',
        urgency: 'medium'
      },
      {
        id: '2',
        title: 'Protection Order Application Form',
        type: 'form',
        category: 'restraining_order',
        description: 'Official form to apply for a protection order against domestic violence. Includes step-by-step instructions.',
        downloadUrl: '/forms/protection-order-form.pdf',
        urgency: 'high'
      },
      {
        id: '3',
        title: 'Domestic Violence Act Overview',
        type: 'guide',
        category: 'domestic_violence',
        description: 'Overview of the Domestic Violence Act and how it protects survivors.',
        downloadUrl: '/resources/domestic-violence-act.pdf',
        urgency: 'medium'
      },
      {
        id: '4',
        title: 'Criminal Case Process Guide',
        type: 'process',
        category: 'legal_process',
        description: 'Step-by-step guide through the criminal justice process for gender-based violence cases.',
        downloadUrl: '/resources/criminal-process-guide.pdf',
        urgency: 'medium'
      },
      {
        id: '5',
        title: 'Emergency Legal Contacts',
        type: 'contact',
        category: 'emergency',
        description: 'List of emergency legal contacts available 24/7 for urgent situations.',
        urgency: 'urgent'
      }
    ];

    const mockContacts: LegalContact[] = [
      {
        id: '1',
        name: 'Legal Aid South Africa - Cape Town',
        type: 'legal_aid',
        specialization: ['domestic violence', 'sexual assault', 'protection orders'],
        phone: '+27214268282',
        email: 'info@legal-aid.co.za',
        address: '1st Floor, 32 Spin Street, Cape Town',
        availability: 'Mon-Fri 8:00-16:30',
        rating: 4.3,
        freeConsultation: true,
        languages: ['English', 'Afrikaans', 'isiXhosa', 'isiZulu']
      },
      {
        id: '2',
        name: 'Women\'s Legal Centre',
        type: 'organization',
        specialization: ['gender-based violence', 'women\'s rights', 'family law'],
        phone: '+27214242104',
        email: 'info@wlce.co.za',
        address: '7th Floor, Constitution House, 124 Adderley Street, Cape Town',
        availability: 'Mon-Fri 9:00-17:00',
        rating: 4.8,
        freeConsultation: true,
        languages: ['English', 'Afrikaans', 'isiXhosa']
      },
      {
        id: '3',
        name: 'Adv. Sarah Johnson',
        type: 'attorney',
        specialization: ['domestic violence', 'restraining orders', 'criminal law'],
        phone: '+27215551234',
        email: 'sarah@lawfirm.co.za',
        address: '15th Floor, ABSA Centre, 2 Riebeek Street, Cape Town',
        availability: 'Mon-Fri 8:00-17:00, Emergency 24/7',
        rating: 4.9,
        freeConsultation: false,
        languages: ['English', 'Afrikaans']
      },
      {
        id: '4',
        name: 'GBV Command Centre Helpline',
        type: 'hotline',
        specialization: ['crisis intervention', 'immediate support', 'referrals'],
        phone: '0800428428',
        availability: '24/7',
        rating: 4.6,
        freeConsultation: true,
        languages: ['English', 'Afrikaans', 'isiZulu', 'isiXhosa', 'Sesotho', 'Setswana']
      },
      {
        id: '5',
        name: 'Rape Crisis Cape Town Trust',
        type: 'organization',
        specialization: ['sexual violence', 'counseling', 'court support'],
        phone: '+27214479762',
        email: 'info@rapecrisis.org.za',
        address: '17 Trill Road, Observatory, Cape Town',
        availability: 'Crisis Line: 24/7, Office: Mon-Fri 8:00-16:30',
        rating: 4.7,
        freeConsultation: true,
        languages: ['English', 'Afrikaans', 'isiXhosa']
      }
    ];

    setLegalResources(mockResources);
    setLegalContacts(mockContacts);
  };

  const loadConsultationRequests = () => {
    const saved = localStorage.getItem('safevoice_consultations');
    if (saved) {
      setConsultationRequests(JSON.parse(saved));
    }
  };

  const downloadResource = (resource: LegalResource) => {
    toast({
      title: "Download started",
      description: `Downloading ${resource.title}`,
      variant: "default"
    });

    if (isVoiceEnabled) {
      speak(`Downloading ${resource.title}`);
    }
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  const callContact = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const emailContact = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const scheduleConsultation = (contactId: string) => {
    const contact = legalContacts.find(c => c.id === contactId);
    if (contact) {
      toast({
        title: "Consultation request",
        description: `Preparing consultation request with ${contact.name}`,
        variant: "default"
      });
      setShowConsultationForm(true);
    }
  };

  const submitConsultationRequest = (formData: ConsultationFormData) => {
    const newRequest: ConsultationRequest = {
      id: `consultation-${Date.now()}`,
      type: formData.type,
      preferredDate: new Date(formData.date),
      urgency: formData.urgency,
      description: formData.description,
      status: 'pending'
    };

    const updatedRequests = [...consultationRequests, newRequest];
    setConsultationRequests(updatedRequests);
    localStorage.setItem('safevoice_consultations', JSON.stringify(updatedRequests));

    toast({
      title: "Consultation requested",
      description: "Your consultation request has been submitted. You will be contacted within 24 hours.",
      variant: "default"
    });

    setShowConsultationForm(false);
  };

  const handleRequestChange = (field: keyof LegalRequest, value: string | boolean | File[] | LegalRequest['consent'] | number | undefined) => {
    setRequest(prev => ({ ...prev, [field]: value }));
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setRequest(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
  };

  const submitLegalRequest = () => {
    setIsSubmitting(true);
    const ref = `LEG-2025-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
    const newRequest: LegalRequest = {
      ...request,
      id: ref,
      dateRequested: new Date().toISOString(),
      status: 'pending',
      progress: 1
    };
    const updatedRequests = [...legalRequests, newRequest];
    setLegalRequests(updatedRequests);
    localStorage.setItem('safevoice_legal_requests', JSON.stringify(updatedRequests));
    setCaseRef(ref);
    setRequest({
      id: '', type: '', urgency: '', language: '', name: '', contactMethod: '', caseBackground: '', consent: { ngo: false, vault: false }, documents: [], status: 'pending', dateRequested: '', progress: 0
    });
    setIsSubmitting(false);
    toast({ title: "Legal request submitted", description: `Case Ref: ${ref}` });
  };

  const handleDeleteCase = (caseId: string) => {
    const updatedRequests = legalRequests.filter(req => req.id !== caseId);
    setLegalRequests(updatedRequests);
    localStorage.setItem('safevoice_legal_requests', JSON.stringify(updatedRequests));
    setSelectedCase(null);
    toast({ title: "Case deleted", description: "The legal case has been deleted." });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getContactTypeIcon = (type: string) => {
    switch (type) {
      case 'attorney': return <Scale className="h-5 w-5" />;
      case 'legal_aid': return <Shield className="h-5 w-5" />;
      case 'hotline': return <Phone className="h-5 w-5" />;
      case 'organization': return <Users className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const filteredResources = legalResources.filter(resource => 
    selectedCategory === 'all' || resource.category === selectedCategory
  );

  const handleEmergencyExit = () => {
    setShowDecoy(true);
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Scale className="h-8 w-8 text-primary" />
          {t('legal_assistance')}
        </h1>
        <p className="text-muted-foreground">
          Access legal resources, guidance, and connect with attorneys
        </p>
      </div>

      {/* Emergency Legal Help */}
      <Card className="border-destructive/20 bg-gradient-emergency shadow-emergency">
        <CardHeader>
          <CardTitle className="text-destructive-foreground flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Emergency Legal Help
          </CardTitle>
          <CardDescription className="text-destructive-foreground/80">
            Immediate legal assistance available 24/7
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="secondary" 
              className="h-16 flex-col gap-2 bg-white/20 hover:bg-white/30 text-white border-white/20"
              onClick={() => callContact('0800428428')}
            >
              <Phone className="h-5 w-5" />
              <span className="text-sm">GBV Helpline: 0800 428 428</span>
            </Button>
            <Button 
              variant="secondary" 
              className="h-16 flex-col gap-2 bg-white/20 hover:bg-white/30 text-white border-white/20"
              onClick={() => callContact('10111')}
            >
              <Shield className="h-5 w-5" />
              <span className="text-sm">Police Emergency: 10111</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Legal Actions</CardTitle>
          <CardDescription>Common legal procedures and forms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant={activeQuickAction === 'request' ? 'secondary' : 'outline'} className="h-16 flex-col gap-2" onClick={() => setActiveQuickAction('request')}>
              <FileText className="h-5 w-5" />
              <span className="text-xs">Request Legal Assistance</span>
            </Button>
            <Button variant={activeQuickAction === 'resources' ? 'secondary' : 'outline'} className="h-16 flex-col gap-2" onClick={() => setActiveQuickAction('resources')}>
              <Phone className="h-5 w-5" />
              <span className="text-xs">Legal Resources</span>
            </Button>
            <Button variant={activeQuickAction === 'contacts' ? 'secondary' : 'outline'} className="h-16 flex-col gap-2" onClick={() => setActiveQuickAction('contacts')}>
              <Users className="h-5 w-5" />
              <span className="text-xs">Legal Contacts & Support</span>
            </Button>
            <Button variant={activeQuickAction === 'cases' ? 'secondary' : 'outline'} className="h-16 flex-col gap-2" onClick={() => setActiveQuickAction('cases')}>
              <Scale className="h-5 w-5" />
              <span className="text-xs">My Cases</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section rendering based on activeQuickAction */}
      {activeQuickAction === 'request' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Request Legal Assistance</CardTitle>
            <CardDescription>Fill out the form to get help from a legal advocate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Intake Form */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label>Type of Legal Help</label>
                <Select value={request.type} onValueChange={v => handleRequestChange('type', v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="protection-order">Protection Order / Restraining Order</SelectItem>
                    <SelectItem value="divorce">Divorce or Separation</SelectItem>
                    <SelectItem value="custody">Child Custody</SelectItem>
                    <SelectItem value="workplace">Workplace Harassment</SelectItem>
                    <SelectItem value="criminal">Criminal Case (GBV-related)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>Urgency Level</label>
                <Select value={request.urgency} onValueChange={v => handleRequestChange('urgency', v)}>
                  <SelectTrigger><SelectValue placeholder="Select urgency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate (within 24h)</SelectItem>
                    <SelectItem value="soon">Soon (within a week)</SelectItem>
                    <SelectItem value="advice">General Advice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>Preferred Language</label>
                <Select value={request.language} onValueChange={v => handleRequestChange('language', v)}>
                  <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="zulu">isiZulu</SelectItem>
                    <SelectItem value="xhosa">isiXhosa</SelectItem>
                    <SelectItem value="afrikaans">Afrikaans</SelectItem>
                    <SelectItem value="sesotho">Sesotho</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Personal & Case Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label>Full Name / Alias</label>
                <Input value={request.name} onChange={e => handleRequestChange('name', e.target.value)} placeholder="Enter your name or alias" />
              </div>
              <div className="space-y-2">
                <label>Contact Method</label>
                <Select value={request.contactMethod} onValueChange={v => handleRequestChange('contactMethod', v)}>
                  <SelectTrigger><SelectValue placeholder="Select contact method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="app">App Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label>Case Background</label>
              <Textarea value={request.caseBackground} onChange={e => handleRequestChange('caseBackground', e.target.value)} placeholder="Describe your case (multilingual supported)" />
            </div>
            {/* Consent Checkboxes */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={request.consent.ngo} onChange={e => handleRequestChange('consent', { ...request.consent, ngo: e.target.checked })} />
                <label>Share details with partnered legal NGO</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={request.consent.vault} onChange={e => handleRequestChange('consent', { ...request.consent, vault: e.target.checked })} />
                <label>Keep copy in my encrypted vault</label>
              </div>
            </div>
            {/* Document Upload */}
            <div className="space-y-2">
              <label>Upload Supporting Files</label>
              <Input type="file" multiple onChange={handleDocumentUpload} />
              <div className="flex flex-wrap gap-2 mt-2">
                {request.documents.map((file, i) => (
                  <Badge key={i} variant="secondary">{file.name}</Badge>
                ))}
              </div>
            </div>
            {/* Live Assistance Options */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label>Request Call Back</label>
                <Input type="time" value={request.callbackTime || ''} onChange={e => handleRequestChange('callbackTime', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label>Instant Chat with Advocate</label>
                <Button variant="secondary" onClick={() => toast({ title: 'Chat', description: 'Secure chat not implemented in demo.' })}>Start Chat</Button>
              </div>
              <div className="space-y-2">
                <label>USSD Request</label>
                <Button variant="outline" onClick={() => toast({ title: 'USSD', description: 'Send *120*SAFE# to trigger callback.' })}>Send USSD</Button>
              </div>
            </div>
            {/* Submit Button */}
            <Button onClick={submitLegalRequest} disabled={isSubmitting} className="mt-4">
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
            {/* Confirmation */}
            {caseRef && (
              <div className="mt-4 p-4 border rounded-lg bg-green-50 text-green-900">
                <strong>Your legal assistance request has been recorded.</strong><br />
                Case Ref: {caseRef}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {activeQuickAction === 'resources' && (
        <Card>
          <CardHeader>
            <CardTitle>Legal Resources</CardTitle>
            <CardDescription>
              Educational materials and forms to help you understand your rights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="rights">Legal Rights</SelectItem>
                <SelectItem value="restraining_order">Protection Orders</SelectItem>
                <SelectItem value="legal_process">Legal Process</SelectItem>
                <SelectItem value="domestic_violence">Domestic Violence</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>

            <div className="grid gap-4">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{resource.title}</h3>
                        <Badge variant={getUrgencyColor(resource.urgency) as "default" | "destructive" | "secondary" | "outline"}>
                          {resource.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                      <div className="flex gap-2">
                        {resource.downloadUrl && (
                          <Button size="sm" onClick={() => downloadResource(resource)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                        {resource.externalUrl && (
                          <Button size="sm" variant="outline" onClick={() => openExternalLink(resource.externalUrl!)}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Online
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {activeQuickAction === 'contacts' && (
        <Card>
          <CardHeader>
            <CardTitle>Legal Contacts & Support</CardTitle>
            <CardDescription>
              Connect with legal professionals and support organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {legalContacts.map((contact) => (
                <Card key={contact.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getContactTypeIcon(contact.type)}
                          <h3 className="font-semibold">{contact.name}</h3>
                          {contact.freeConsultation && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Free Consultation
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {contact.specialization.join(', ')}
                        </p>
                        {contact.address && (
                          <p className="text-xs text-muted-foreground">{contact.address}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-sm">{contact.rating}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-xs ${i < Math.floor(contact.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{contact.availability}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {contact.languages.map((lang, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => callContact(contact.phone)}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      {contact.email && (
                        <Button size="sm" variant="outline" onClick={() => emailContact(contact.email!)}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => scheduleConsultation(contact.id)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {(activeQuickAction === 'cases' || activeQuickAction === null) && (
        <Card>
          <CardHeader>
            <CardTitle>My Legal Cases</CardTitle>
            <CardDescription>Track your legal assistance requests and case progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {legalRequests.length === 0 ? (
                <p className="text-muted-foreground">No legal cases found.</p>
              ) : (
                legalRequests.sort((a, b) => new Date(b.dateRequested).getTime() - new Date(a.dateRequested).getTime()).map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Case Ref: {req.id}</p>
                        <Badge variant={req.status === 'pending' ? 'secondary' : req.status === 'in_progress' ? 'destructive' : 'default'}>
                          {req.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{req.type} - {req.language}</p>
                      <p className="text-xs text-muted-foreground">Date requested: {new Date(req.dateRequested).toLocaleDateString()}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs">Progress:</span>
                        <div className="w-32 h-2 bg-gray-200 rounded">
                          <div className="h-2 bg-green-500 rounded" style={{ width: `${(req.progress/5)*100}%` }}></div>
                        </div>
                        <span className="ml-2 text-xs">{Math.round((req.progress/5)*100)}%</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedCase(req)}>View</Button>
                  </div>
                ))
              )}
            </div>
            {/* Case Details Modal */}
            {selectedCase && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                  <h2 className="text-xl font-bold mb-2">Case Details</h2>
                  <p><strong>Case Ref:</strong> {selectedCase.id}</p>
                  <p><strong>Type:</strong> {selectedCase.type}</p>
                  <p><strong>Status:</strong> {selectedCase.status.replace('_', ' ')}</p>
                  <p><strong>Date:</strong> {new Date(selectedCase.dateRequested).toLocaleString()}</p>
                  <p><strong>Language:</strong> {selectedCase.language}</p>
                  <p><strong>Name/Alias:</strong> {selectedCase.name}</p>
                  <p><strong>Contact Method:</strong> {selectedCase.contactMethod}</p>
                  <p><strong>Case Background:</strong> {selectedCase.caseBackground}</p>
                  <p><strong>Consent:</strong> {[selectedCase.consent.ngo && 'NGO', selectedCase.consent.vault && 'Vault'].filter(Boolean).join(', ') || 'None'}</p>
                  <div className="mt-2">
                    <strong>Uploaded Documents:</strong>
                    {selectedCase.documents.length > 0 ? (
                      <ul className="list-disc ml-4">
                        {selectedCase.documents.map((file, i) => (
                          <li key={i}>{file.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <span> None</span>
                    )}
                  </div>
                  <div className="mt-2">
                    <strong>Progress:</strong>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`inline-block w-4 h-4 rounded-full ${i < (selectedCase.progress || 0) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      ))}
                      <span className="ml-2 text-xs">{selectedCase.progress || 0}/5 steps done</span>
                    </div>
                  </div>
                  {selectedCase.assignedAdvocate && (
                    <div className="mt-2">
                      <strong>Assigned Advocate:</strong> {selectedCase.assignedAdvocate}<br />
                      <strong>Contact:</strong> <span className="text-blue-600">advocate@email.com</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => setSelectedCase(null)}>Close</Button>
                    <Button variant="default" onClick={() => toast({ title: 'Update', description: 'Update not implemented in demo.' })}>Update</Button>
                    <Button variant="destructive" onClick={() => handleDeleteCase(selectedCase.id)}>Delete</Button>
                    <Button variant="secondary" onClick={() => toast({ title: 'Share', description: 'Share not implemented in demo.' })}>Share</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Your Consultation Requests */}
      {consultationRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Consultation Requests</CardTitle>
            <CardDescription>Track your legal consultation requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consultationRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{request.type} consultation</p>
                    <p className="text-sm text-muted-foreground">
                      {request.preferredDate.toLocaleDateString()} - {request.urgency} priority
                    </p>
                  </div>
                  <Badge variant={
                    request.status === 'confirmed' ? 'secondary' :
                    request.status === 'pending' ? 'secondary' :
                    request.status === 'completed' ? 'outline' : 'destructive'
                  }>
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consultation Form Dialog */}
      <Dialog open={showConsultationForm} onOpenChange={setShowConsultationForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Legal Consultation</DialogTitle>
            <DialogDescription>
              Please provide details about your consultation needs
            </DialogDescription>
          </DialogHeader>
          {/* Use handleConsultationFormSubmit for ConsultationForm */}
          <ConsultationForm onSubmit={handleConsultationFormSubmit} onCancel={() => setShowConsultationForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ConsultationForm = ({ onSubmit, onCancel }: { onSubmit: (data: ConsultationFormData) => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    type: '',
    date: '',
    urgency: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allowedTypes: ConsultationFormData['type'][] = ['phone', 'video', 'in_person'];
    const safeType = allowedTypes.includes(formData.type as ConsultationFormData['type'])
      ? (formData.type as ConsultationFormData['type'])
      : 'phone';
    const safeFormData: ConsultationFormData = {
      ...formData,
      type: safeType
    };
    onSubmit(safeFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Consultation Type</label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select consultation type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="phone">Phone Consultation</SelectItem>
            <SelectItem value="video">Video Consultation</SelectItem>
            <SelectItem value="in_person">In-Person Meeting</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Preferred Date</label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Urgency</label>
        <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select urgency level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low - General questions</SelectItem>
            <SelectItem value="medium">Medium - Important matter</SelectItem>
            <SelectItem value="high">High - Urgent legal issue</SelectItem>
            <SelectItem value="urgent">Urgent - Immediate danger</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Briefly describe your legal matter or questions"
          required
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Submit Request
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

// Fix: restrict type field to allowed values in ConsultationFormData
const handleConsultationFormSubmit = (form: { type: string; date: string; urgency: string; description: string }) => {
  const allowedTypes: ConsultationFormData['type'][] = ['phone', 'video', 'in_person'];
  const safeType = allowedTypes.includes(form.type as ConsultationFormData['type']) ? (form.type as ConsultationFormData['type']) : 'phone';
  const safeForm: ConsultationFormData = {
    type: safeType,
    date: form.date,
    urgency: form.urgency,
    description: form.description
  };
  submitConsultationRequest(safeForm);
};
function submitConsultationRequest(safeForm: ConsultationFormData) {
  const newRequest: ConsultationRequest = {
    id: `consultation-${Date.now()}`,
    type: safeForm.type,
    preferredDate: new Date(safeForm.date),
    urgency: safeForm.urgency,
    description: safeForm.description,
    status: 'pending'
  };

  // Load existing requests from localStorage
  const saved = localStorage.getItem('safevoice_consultations');
  const existingRequests: ConsultationRequest[] = saved ? JSON.parse(saved) : [];

  // Add new request and save
  const updatedRequests = [...existingRequests, newRequest];
  localStorage.setItem('safevoice_consultations', JSON.stringify(updatedRequests));

  // Optionally, show a toast notification (if available in context)
  // Example: toast({ title: "Consultation requested", description: "Your consultation request has been submitted." });

  // You may want to update state or close dialog if this is used in a React component
}
