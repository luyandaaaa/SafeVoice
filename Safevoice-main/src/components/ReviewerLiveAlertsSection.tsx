import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin, Clock, Bell, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiveAlert {
  id: string;
  caseId: string;
  location: string;
  timestamp: string;
  priority: 'critical' | 'urgent' | 'medium';
  type: 'panic_button' | 'emergency_call' | 'location_alert';
  description: string;
  coordinates?: [number, number];
}

interface LiveAlertsSectionProps {
  onShowAlert: () => void;
}

export const LiveAlertsSection = ({ onShowAlert }: LiveAlertsSectionProps) => {
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const { toast } = useToast();

  // Sample alerts
  const sampleAlerts: LiveAlert[] = [
    {
      id: "1",
      caseId: "GBV-2023-0015",
      location: "Johannesburg, Gauteng",
      timestamp: new Date().toISOString(),
      priority: "critical",
      type: "panic_button",
      description: "Panic button activated - immediate response required",
      coordinates: [-26.2041, 28.0473]
    },
    {
      id: "2",
      caseId: "GBV-2023-0016",
      location: "Cape Town, Western Cape",
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      priority: "urgent",
      type: "emergency_call",
      description: "Emergency call received - domestic violence in progress",
      coordinates: [-33.9249, 18.4241]
    }
  ];

  useEffect(() => {
    // Load alerts from localStorage
    const savedAlerts = localStorage.getItem('gbv-live-alerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    } else {
      setAlerts(sampleAlerts);
      localStorage.setItem('gbv-live-alerts', JSON.stringify(sampleAlerts));
    }
  }, []);

  const handleTestAlert = () => {
    const testAlert: LiveAlert = {
      id: Date.now().toString(),
      caseId: `GBV-2023-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
      location: "Test Location, GP",
      timestamp: new Date().toISOString(),
      priority: "critical",
      type: "panic_button",
      description: "Test alert - panic button simulation",
      coordinates: [-26.2041, 28.0473]
    };

    const updatedAlerts = [testAlert, ...alerts];
    setAlerts(updatedAlerts);
    localStorage.setItem('gbv-live-alerts', JSON.stringify(updatedAlerts));
    
    toast({
      title: "Test Alert Generated",
      description: "A test alert has been created and added to the live feed.",
    });
    
    onShowAlert();
  };

  const handleRespond = (alertId: string) => {
    toast({
      title: "Emergency Response Initiated",
      description: "Response team has been notified and is en route.",
    });
    
    // Update alert status
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, description: alert.description + " - RESPONSE INITIATED" }
        : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('gbv-live-alerts', JSON.stringify(updatedAlerts));
  };

  const handleDismiss = (alertId: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
    setAlerts(updatedAlerts);
    localStorage.setItem('gbv-live-alerts', JSON.stringify(updatedAlerts));
    
    toast({
      title: "Alert Dismissed",
      description: "Alert has been dismissed and logged.",
      variant: "destructive",
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'urgent':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Urgent</Badge>;
      case 'medium':
        return <Badge variant="outline">Medium</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'panic_button':
        return <AlertTriangle className="h-5 w-5" />;
      case 'emergency_call':
        return <Phone className="h-5 w-5" />;
      case 'location_alert':
        return <MapPin className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg shadow-custom p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Live Alerts</h2>
          <Button variant="destructive" onClick={handleTestAlert}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Test Alert
          </Button>
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-l-4 border-l-critical">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Alerts</p>
                  <p className="text-2xl font-bold text-foreground">
                    {alerts.filter(a => a.priority === 'critical').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-critical" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-foreground">{alerts.length}</p>
                </div>
                <Bell className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Response Time</p>
                  <p className="text-2xl font-bold text-foreground">2.3m</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Alerts Feed */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Active Alerts</h3>
          
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No active alerts</p>
                <p className="text-sm text-muted-foreground">All clear - monitoring for new alerts</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${
                alert.priority === 'critical' ? 'border-l-critical' :
                alert.priority === 'urgent' ? 'border-l-warning' : 'border-l-primary'
              } transition-smooth hover:shadow-custom-lg`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        alert.priority === 'critical' ? 'bg-critical/10 text-critical' :
                        alert.priority === 'urgent' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                      }`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Case {alert.caseId}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{alert.location}</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{formatTimestamp(alert.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    {getPriorityBadge(alert.priority)}
                  </div>
                  
                  <p className="text-foreground mb-4">{alert.description}</p>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleRespond(alert.id)}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Respond
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDismiss(alert.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Interactive map showing alert locations</p>
              <p className="text-sm">Would integrate with mapping service (Google Maps, Mapbox, etc.)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};