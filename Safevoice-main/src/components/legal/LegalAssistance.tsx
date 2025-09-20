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
    setActiveQuickAction('cases');
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
      case 'high': return 'secondary';
      case 'medium': return 'default';
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
    <div className="w-[95%] ml-[2%]" style={{width: '95%'}}>
      {/* Header */}
      <div className="mt-6 mb-6">
        <div className="rounded-lg border border-primary bg-primary/10 px-6 py-4 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            {t('legal_assistance')}
          </h1>
          <p className="text-muted-foreground">
            Access legal resources, guidance, and connect with attorneys
          </p>
        </div>
      </div>

      {/* Emergency Legal Help */}
      <Card className="border-destructive/20 bg-gradient-emergency shadow-emergency mb-4">
      <CardHeader className="px-2">
          <CardTitle className="text-destructive-foreground flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Emergency Legal Help
          </CardTitle>
          <CardDescription className="text-destructive-foreground/80">
            Immediate legal assistance available 24/7
          </CardDescription>
        </CardHeader>
      <CardContent className="px-2">
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
      <Card className="mb-4">
        <CardHeader className="px-2">
          <CardTitle>Quick Legal Actions</CardTitle>
          <CardDescription>Common legal procedures and forms</CardDescription>
        </CardHeader>
        <CardContent className="px-2">
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
        <Card className="mb-4">
          <CardHeader className="px-2">
            <CardTitle>Request Legal Assistance</CardTitle>
            <CardDescription>Fill out the form to get help from a legal advocate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-2">
            <form onSubmit={e => { e.preventDefault(); submitLegalRequest(); }} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Type of Legal Assistance</label>
                <Select value={request.type} onValueChange={value => handleRequestChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="protection_order">Protection Order</SelectItem>
                    <SelectItem value="legal_advice">Legal Advice</SelectItem>
                    <SelectItem value="court_support">Court Support</SelectItem>
                    <SelectItem value="document_drafting">Document Drafting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Urgency</label>
                <Select value={request.urgency} onValueChange={value => handleRequestChange('urgency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Preferred Language</label>
                <Select value={request.language} onValueChange={value => handleRequestChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Afrikaans">Afrikaans</SelectItem>
                    <SelectItem value="isiXhosa">isiXhosa</SelectItem>
                    <SelectItem value="isiZulu">isiZulu</SelectItem>
                    <SelectItem value="Sesotho">Sesotho</SelectItem>
                    <SelectItem value="Setswana">Setswana</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Your Name</label>
                <Input
                  type="text"
                  value={request.name}
                  onChange={e => handleRequestChange('name', e.target.value)}
                  placeholder="Full Name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Preferred Contact Method</label>
                <Select value={request.contactMethod} onValueChange={value => handleRequestChange('contactMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Case Background</label>
                <Textarea
                  value={request.caseBackground}
                  onChange={e => handleRequestChange('caseBackground', e.target.value)}
                  placeholder="Briefly describe your legal issue"
                  required
                />
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={request.consent.ngo} onChange={e => handleRequestChange('consent', { ...request.consent, ngo: e.target.checked })} />
                  Share with trusted NGO
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={request.consent.vault} onChange={e => handleRequestChange('consent', { ...request.consent, vault: e.target.checked })} />
                  Store in Evidence Vault
                </label>
              </div>
              <div>
                <label className="text-sm font-medium">Upload Documents (optional)</label>
                <Input type="file" multiple onChange={handleDocumentUpload} />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Submitting...' : 'Submit Request'}</Button>
              {caseRef && <div className="text-green-600 font-medium mt-2">Case Reference: {caseRef}</div>}
            </form>
          </CardContent>
        </Card>
      )}
      {activeQuickAction === 'resources' && (
        <Card className="mb-4">
          <CardHeader className="px-2">
            <CardTitle>Legal Resources</CardTitle>
            <CardDescription>
              Educational materials and forms to help you understand your rights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map(resource => (
                <Card key={resource.id} className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {resource.title}
                    </CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      <Badge variant={getUrgencyColor(resource.urgency)}>{resource.urgency}</Badge>
                      <Badge>{resource.category.replace('_', ' ')}</Badge>
                    </div>
                    {resource.downloadUrl && (
                      <Button size="sm" onClick={() => downloadResource(resource)}>
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    )}
                    {resource.externalUrl && (
                      <Button size="sm" variant="outline" onClick={() => openExternalLink(resource.externalUrl)}>
                        <ExternalLink className="h-4 w-4 mr-1" /> Open Link
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {activeQuickAction === 'contacts' && (
        <Card className="mb-4">
          <CardHeader className="px-2">
            <CardTitle>Legal Contacts & Support</CardTitle>
            <CardDescription>
              Connect with legal professionals and support organizations
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {legalContacts.map(contact => (
                <Card key={contact.id} className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getContactTypeIcon(contact.type)}
                      {contact.name}
                    </CardTitle>
                    <CardDescription>{contact.specialization.join(', ')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      <Badge>{contact.type.replace('_', ' ')}</Badge>
                      <Badge>{contact.availability}</Badge>
                      <Badge>{contact.freeConsultation ? 'Free Consultation' : 'Paid'}</Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline" onClick={() => callContact(contact.phone)}>
                        <Phone className="h-4 w-4 mr-1" /> Call
                      </Button>
                      {contact.email && (
                        <Button size="sm" variant="outline" onClick={() => emailContact(contact.email!)}>
                          <MessageCircle className="h-4 w-4 mr-1" /> Email
                        </Button>
                      )}
                      <Button size="sm" onClick={() => scheduleConsultation(contact.id)}>
                        <Calendar className="h-4 w-4 mr-1" /> Schedule Consultation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {(activeQuickAction === 'cases' || activeQuickAction === null) && (
        <Card className="mb-4">
          <CardHeader className="px-2">
            <CardTitle>My Legal Cases</CardTitle>
            <CardDescription>Track your legal assistance requests and case progress</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-3">
              {legalRequests.length === 0 ? (
                <div className="text-muted-foreground">No legal cases found.</div>
              ) : (
                legalRequests.map(req => (
                  <Card key={req.id} className="border-primary/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5" />
                        {req.type} <span className="text-xs text-muted-foreground">({req.status})</span>
                      </CardTitle>
                      <CardDescription>Requested on {new Date(req.dateRequested).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 items-center mb-2">
                        <Badge variant={getUrgencyColor(req.urgency)}>{req.urgency}</Badge>
                        <Badge>{req.language}</Badge>
                        <Badge>{req.contactMethod}</Badge>
                      </div>
                      <div className="mb-2">{req.caseBackground}</div>
                      <Button size="sm" variant="outline" onClick={() => setSelectedCase(req)}>
                        View Details
                      </Button>
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDeleteCase(req.id)}>
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            {/* Case Details Modal */}
            {selectedCase && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-[95%]" style={{width: '95%'}}>
                  <h2 className="text-xl font-bold mb-2">Case Details</h2>
                  <div className="mb-2"><b>Type:</b> {selectedCase.type}</div>
                  <div className="mb-2"><b>Status:</b> {selectedCase.status}</div>
                  <div className="mb-2"><b>Urgency:</b> {selectedCase.urgency}</div>
                  <div className="mb-2"><b>Language:</b> {selectedCase.language}</div>
                  <div className="mb-2"><b>Contact Method:</b> {selectedCase.contactMethod}</div>
                  <div className="mb-2"><b>Case Background:</b> {selectedCase.caseBackground}</div>
                  <div className="mb-2"><b>Date Requested:</b> {new Date(selectedCase.dateRequested).toLocaleString()}</div>
                  <div className="mb-2"><b>Progress:</b> {selectedCase.progress}%</div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => setSelectedCase(null)}>Close</Button>
                    <Button variant="destructive" onClick={() => handleDeleteCase(selectedCase.id)}>Delete Case</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Your Consultation Requests */}
      {consultationRequests.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="px-2">
            <CardTitle>Your Consultation Requests</CardTitle>
            <CardDescription>Track your legal consultation requests</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-3">
              {/* ...existing code... */}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consultation Form Dialog */}
      <Dialog open={showConsultationForm} onOpenChange={setShowConsultationForm}>
        <DialogContent className="w-[96%]" style={{width: '96%'}}>
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
      <div className="h-6" />
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
