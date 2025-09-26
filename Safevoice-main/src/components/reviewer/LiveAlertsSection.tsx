import { AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  location: string;
  timestamp: string;
  description: string;
  priority: 'Critical' | 'Urgent';
}

interface LiveAlertsSectionProps {
  alerts?: Alert[];
}

export const LiveAlertsSection = ({ alerts = [] }: LiveAlertsSectionProps) => {
  // Example data - replace with real data from your backend
  const statsData = {
    criticalAlerts: 1,
    activeAlerts: 2,
    responseTime: "2.3m"
  };

  const demoAlerts: Alert[] = [
    {
      id: "GBV-2023-0015",
      location: "Johannesburg, Gauteng",
      timestamp: "Just now",
      description: "Panic button activated - immediate response required",
      priority: "Critical"
    },
    {
      id: "GBV-2023-0016",
      location: "Cape Town, Western Cape",
      timestamp: "5m ago",
      description: "Emergency call received - domestic violence in progress",
      priority: "Urgent"
    }
  ];

  const activeAlerts = alerts.length > 0 ? alerts : demoAlerts;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={cn(
          "shadow-soft transition-all hover:shadow-md",
          "border-destructive/20 bg-destructive/5"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold">{statsData.criticalAlerts}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{statsData.activeAlerts}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">{statsData.responseTime}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Active Alerts</h2>
        <div className="space-y-4">
          {activeAlerts.map((alert) => (
            <Card key={alert.id} className={cn(
              "shadow-soft transition-all hover:shadow-md",
              alert.priority === 'Critical' ? "border-destructive/20" : "border-warning/20"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn(
                        "h-4 w-4",
                        alert.priority === 'Critical' ? "text-destructive" : "text-warning"
                      )} />
                      <p className="font-semibold">{alert.id}</p>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        alert.priority === 'Critical' 
                          ? "bg-destructive/10 text-destructive" 
                          : "bg-warning/10 text-warning"
                      )}>
                        {alert.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>📍 {alert.location}</span>
                      <span>⏰ {alert.timestamp}</span>
                    </div>
                    <p className="text-sm mt-2">{alert.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary"
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      variant={alert.priority === 'Critical' ? "destructive" : "default"}
                    >
                      Respond
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};