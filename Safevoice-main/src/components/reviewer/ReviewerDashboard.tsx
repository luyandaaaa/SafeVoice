import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Volume2, VolumeX, AlertTriangle, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewerSidebar } from '../ReviewerSidebar';
import { DashboardStats } from '../ReviewerDashboardStats';
import { AnalyticsSection } from '../ReviewerAnalyticsSection';
import { IncidentTable } from '../ReviewerIncidentTable';
import { EvidenceSection } from '../ReviewerEvidenceSection';
import { LiveAlertsSection } from './LiveAlertsSection';
import { useReviewer } from '@/contexts/ReviewerContext';
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const ReviewerDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const { incidents, updateIncidents } = useReviewer();
  const { user, logout } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const { isVoiceEnabled, toggleVoice, speak } = useVoice();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'reviewer') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (isVoiceEnabled) {
      speak(t('welcome_message', { name: user?.name || 'Reviewer' }));
    }
  }, [currentLanguage, isVoiceEnabled, speak, t, user?.name]);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardStats incidents={incidents} />;
      case 'incidents':
        return <IncidentTable incidents={incidents} updateIncidents={updateIncidents} showFilters={true} />;
      case 'analytics':
        return <AnalyticsSection incidents={incidents} />;
      case 'evidence':
        return <EvidenceSection />;
      case 'alerts':
        return <LiveAlertsSection />;
      default:
        return <DashboardStats incidents={incidents} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b shadow-soft">
        <div className="flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2 font-bold text-xl">
            <img src="/logo.png" alt="SafeVoice Logo" className="h-8 w-8" />
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              SafeVoice AI
            </span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {/* Voice Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoice}
              className={cn(
                "transition-colors",
                isVoiceEnabled ? "text-primary" : "text-muted-foreground"
              )}
              title={t(isVoiceEnabled ? 'voice_enabled' : 'voice_disabled')}
            >
              {isVoiceEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>

            {/* User Info */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t('welcome')}</span>
              <span className="font-medium">{user?.name}</span>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title={t('logout')}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <ReviewerSidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {activeSection === 'dashboard' && (
            <>
              {/* Welcome Section */}
              <div className="mt-6 mb-6">
                <div className="rounded-lg border border-primary bg-primary/10 px-6 py-4 shadow-sm">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {t('welcome_back')}, {user?.name || t('reviewer')}
                  </h1>
                  <p className="text-muted-foreground">
                    {t('dashboard_subtitle')}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className={cn(
                  "shadow-soft transition-all hover:shadow-md",
                  "border-destructive/20 bg-destructive/5"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Critical Incidents</p>
                        <p className="text-2xl font-bold">2</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                  </CardContent>
                </Card>

                <Card className={cn(
                  "shadow-soft transition-all hover:shadow-md",
                  "border-warning/20 bg-warning/5"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Urgent Cases</p>
                        <p className="text-2xl font-bold">2</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-warning" />
                    </div>
                  </CardContent>
                </Card>

                <Card className={cn(
                  "shadow-soft transition-all hover:shadow-md",
                  "border-primary/20 bg-primary/5"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">New Reports</p>
                        <p className="text-2xl font-bold">2</p>
                      </div>
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card className={cn(
                  "shadow-soft transition-all hover:shadow-md",
                  "border-success/20 bg-success/5"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Resolved Cases</p>
                        <p className="text-2xl font-bold">2</p>
                      </div>
                      <Shield className="h-8 w-8 text-success" />
                    </div>
                  </CardContent>
                </Card>
              </div>

            {/* Recent Incidents */}
            <Card className="shadow-soft mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Incidents
                </CardTitle>
                <CardDescription>
                  Overview of the latest reported incidents requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-3 text-sm text-muted-foreground font-medium">Case ID</th>
                    <th className="pb-3 text-sm text-muted-foreground font-medium">Date</th>
                    <th className="pb-3 text-sm text-muted-foreground font-medium">Type</th>
                    <th className="pb-3 text-sm text-muted-foreground font-medium">Location</th>
                    <th className="pb-3 text-sm text-muted-foreground font-medium">Priority</th>
                    <th className="pb-3 text-sm text-muted-foreground font-medium">Status</th>
                    <th className="pb-3 text-sm text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {incidents.slice(0, 5).map((incident) => (
                    <tr key={incident.id} className="hover:bg-muted/50">
                      <td className="py-4 px-2">{incident.id}</td>
                      <td className="py-4 px-2">{new Date(incident.date).toLocaleDateString()}</td>
                      <td className="py-4 px-2">{incident.type}</td>
                      <td className="py-4 px-2">{incident.location}</td>
                      <td className="py-4 px-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          incident.priority === 'critical' && "bg-destructive/10 text-destructive",
                          incident.priority === 'urgent' && "bg-warning/10 text-warning",
                          incident.priority === 'follow-up' && "bg-muted text-muted-foreground"
                        )}>
                          {incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          incident.status === 'new' && "bg-primary/10 text-primary",
                          incident.status === 'in-progress' && "bg-warning/10 text-warning",
                          incident.status === 'resolved' && "bg-success/10 text-success"
                        )}>
                          {incident.status === 'new'
                            ? 'New'
                            : incident.status === 'in-progress'
                            ? 'In Progress'
                            : incident.status === 'resolved'
                            ? 'Resolved'
                            : ''
                          }
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-primary"
                          >
                            View
                          </Button>
                          {incident.status === 'new' && (
                            <Button
                              size="sm"
                              variant="default"
                            >
                              Assign
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end mt-4">
                <Button variant="outline">
                  View All Incidents
                </Button>
              </div>
              </CardContent>
            </Card>
          </>
          )}

          {/* Other Sections */}
          {activeSection !== 'dashboard' && (
            <div className="container mx-auto">
              {/* Section Headers */}
              {activeSection === 'incidents' && (
                <div className="mb-6">
                  <div className="rounded-lg border border-primary bg-primary/10 px-6 py-4 shadow-sm">
                    <h1 className="text-3xl font-bold tracking-tight">
                      Reported Incidents
                    </h1>
                    <p className="text-muted-foreground">
                      Review and manage all reported incidents in the system
                    </p>
                  </div>
                </div>
              )}
              {activeSection === 'alerts' && (
                <div className="mb-6">
                  <div className="rounded-lg border border-primary bg-primary/10 px-6 py-4 shadow-sm">
                    <h1 className="text-3xl font-bold tracking-tight">
                      Live Alerts
                    </h1>
                    <p className="text-muted-foreground">
                      Monitor and respond to active emergency situations
                    </p>
                  </div>
                </div>
              )}
              {activeSection === 'evidence' && (
                <div className="mb-6">
                  <div className="rounded-lg border border-primary bg-primary/10 px-6 py-4 shadow-sm">
                    <h1 className="text-3xl font-bold tracking-tight">
                      Evidence Management
                    </h1>
                    <p className="text-muted-foreground">
                      Securely manage and review submitted evidence materials
                    </p>
                  </div>
                </div>
              )}
              {activeSection === 'analytics' && (
                <div className="mb-6">
                  <div className="rounded-lg border border-primary bg-primary/10 px-6 py-4 shadow-sm">
                    <h1 className="text-3xl font-bold tracking-tight">
                      Analytics Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                      Analyze trends and insights from reported incidents
                    </p>
                  </div>
                </div>
              )}
              {renderActiveSection()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};