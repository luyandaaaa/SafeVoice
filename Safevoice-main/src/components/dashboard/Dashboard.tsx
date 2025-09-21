import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  FileText, 
  MapPin, 
  Shield, 
  Phone, 
  MessageSquare,
  Map,
  Users,
  Activity,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DashboardStats {
  activeAlerts: number;
  reportsSubmitted: number;
  safeLocations: number;
  riskAreas: number;
  communityMembers: number;
  responseTime: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  variant: 'default' | 'destructive' | 'secondary';
  urgent?: boolean;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeAlerts: 0,
    reportsSubmitted: 0,
    safeLocations: 0,
    riskAreas: 0,
    communityMembers: 0,
    responseTime: "0 min"
  });

  // Fetch user's stats when dashboard loads
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch user's stats
        const statsResponse = await fetch('http://localhost:5000/api/users/stats', {
          headers: {
            'x-auth-token': token
          }
        });

        // Fetch user's reports count
        const reportsResponse = await fetch('http://localhost:5000/api/incidents/count', {
          headers: {
            'x-auth-token': token
          }
        });

        if (statsResponse.ok && reportsResponse.ok) {
          const statsData = await statsResponse.json();
          const reportsData = await reportsResponse.json();
          
          setStats(prevStats => ({
            ...prevStats,
            activeAlerts: statsData.activeAlerts || 0,
            reportsSubmitted: reportsData.count || 0, // Use actual reports count
            safeLocations: statsData.safeLocations || 0,
            riskAreas: statsData.riskAreas || 0,
            communityMembers: statsData.communityMembers || 0,
            responseTime: statsData.averageResponseTime || "0 min"
          }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user?._id]);

  const { t } = useLanguage();
  const { speak, isVoiceEnabled } = useVoice();
  const navigate = useNavigate();

  useEffect(() => {
    if (isVoiceEnabled) {
      speak(t('dashboard_loaded', { name: user?.name || 'User' }));
    }
  }, [isVoiceEnabled, speak, t, user?.name]);

  const quickActions: QuickAction[] = [
    {
      id: 'emergency',
      label: t('emergency_call'),
      icon: Phone,
      action: () => {
        if (confirm(t('confirm_emergency_call'))) {
          window.location.href = "tel:911";
        }
      },
      variant: 'destructive',
      urgent: true
    },
    {
      id: 'sos',
      label: t('sos_alert'),
      icon: AlertTriangle,
      action: () => triggerSOS(),
      variant: 'destructive',
      urgent: true
    },
    {
      id: 'location',
      label: t('share_location'),
      icon: MapPin,
      action: () => shareLocation(),
      variant: 'secondary'
    },
    {
      id: 'report',
      label: t('quick_report'),
      icon: FileText,
      action: () => navigate('/report'),
      variant: 'default'
    },
    {
      id: 'chat',
      label: t('ai_support'),
      icon: MessageSquare,
      action: () => navigate('/chat'),
      variant: 'default'
    },
    {
      id: 'map',
      label: t('safety_map'),
      icon: Map,
      action: () => navigate('/map'),
      variant: 'default'
    }
  ];

  const triggerSOS = () => {
    // Simulate SOS alert
    if (isVoiceEnabled) {
      speak(t('sos_alert_sent'));
    }
    
    // Update active alerts
    setStats(prev => ({ ...prev, activeAlerts: prev.activeAlerts + 1 }));
    
    // Show confirmation
    alert(t('sos_alert_confirmation'));
  };

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (isVoiceEnabled) {
            speak(t('location_shared'));
          }
          alert(t('location_shared_details', { lat: latitude.toFixed(4), lng: longitude.toFixed(4) }));
        },
        () => {
          if (isVoiceEnabled) {
            speak(t('location_shared'));
          }
          alert(t('location_shared_fallback'));
        }
      );
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, variant = 'default' }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    change?: string;
    variant?: 'default' | 'success' | 'warning' | 'destructive';
  }) => (
    <Card className={cn(
      "shadow-soft transition-all hover:shadow-md",
      variant === 'destructive' && "border-destructive/20 bg-destructive/5",
      variant === 'success' && "border-success/20 bg-success/5",
      variant === 'warning' && "border-warning/20 bg-warning/5"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={cn(
                "text-xs flex items-center gap-1 mt-1",
                variant === 'success' ? "text-success" : "text-muted-foreground"
              )}>
                <TrendingUp className="h-3 w-3" />
                {change}
              </p>
            )}
          </div>
          <Icon className={cn(
            "h-8 w-8",
            variant === 'destructive' && "text-destructive",
            variant === 'success' && "text-success",
            variant === 'warning' && "text-warning",
            variant === 'default' && "text-primary"
          )} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 px-4 md:px-8">
      {/* Welcome Section */}
      <div className="mt-6 mb-6">
        <div className="rounded-lg border border-primary bg-primary/10 px-6 py-4 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('welcome_back')}, {user?.name || t('user')}
          </h1>
          <p className="text-muted-foreground">
            {user ? t('dashboard_subtitle') : t('loading_dashboard')}
          </p>
        </div>
      </div>

      {/* Emergency Quick Actions */}
      <Card className="border-destructive/20 bg-gradient-emergency shadow-emergency">
        <CardHeader>
          <CardTitle className="text-destructive-foreground flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('emergency_actions')}
          </CardTitle>
          <CardDescription className="text-destructive-foreground/80">
            {t('emergency_actions_subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.filter(action => action.urgent).map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="secondary"
                  className="h-16 flex-col gap-2 bg-white/20 hover:bg-white/30 text-white border-white/20"
                  onClick={action.action}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('active_alerts')}
          value={stats.activeAlerts}
          icon={AlertTriangle}
          variant="destructive"
        />
        <StatCard
          title={t('reports_submitted')}
          value={stats.reportsSubmitted}
          icon={FileText}
          change="+2 this week"
        />
        <StatCard
          title={t('safe_locations')}
          value={stats.safeLocations}
          icon={Shield}
          variant="success"
          change="+5 new"
        />
        <StatCard
          title={t('community_members')}
          value={stats.communityMembers}
          icon={Users}
          change="+23 today"
          variant="success"
        />
      </div>

      {/* Quick Actions */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t('quick_actions')}
          </CardTitle>
          <CardDescription>
            {t('quick_actions_subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {quickActions.filter(action => !action.urgent).map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant={action.variant}
                  className="h-16 flex-col gap-2"
                  onClick={action.action}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t('recent_activity')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="h-2 w-2 bg-success rounded-full" />
            <span className="text-sm">{t('report_reviewed')}</span>
            <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="h-2 w-2 bg-warning rounded-full" />
            <span className="text-sm">{t('risk_area_detected')}</span>
            <span className="text-xs text-muted-foreground ml-auto">4h ago</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="h-2 w-2 bg-primary rounded-full" />
            <span className="text-sm">{t('community_update')}</span>
            <span className="text-xs text-muted-foreground ml-auto">1d ago</span>
          </div>
        </CardContent>
      </Card>

      {/* Safety Score */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t('safety_score')}
          </CardTitle>
          <CardDescription>
            {t('safety_score_subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('personal_safety')}</span>
              <span>85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('area_safety')}</span>
              <span>72%</span>
            </div>
            <Progress value={72} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('community_support')}</span>
              <span>91%</span>
            </div>
            <Progress value={91} className="h-2" />
          </div>
        </CardContent>
      </Card>
      <div className="h-6" />
    </div>
  );
};