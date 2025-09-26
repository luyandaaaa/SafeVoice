import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, MessageSquare, Shield, UserPlus } from "lucide-react";

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'report' | 'response' | 'evidence' | 'assignment' | 'update';
  title: string;
  description: string;
  user: string;
}

export const HistorySection = () => {
  const [selectedCase, setSelectedCase] = useState("GBV-2023-0012");

  const timelineEvents: Record<string, TimelineEvent[]> = {
    "GBV-2023-0012": [
      {
        id: "1",
        timestamp: "2023-10-15 14:30",
        type: "report",
        title: "Incident Reported",
        description: "Survivor submitted incident report through mobile app.",
        user: "System"
      },
      {
        id: "2",
        timestamp: "2023-10-15 14:32",
        type: "response",
        title: "Initial Response",
        description: "Responder initiated secure chat conversation.",
        user: "Responder RS"
      },
      {
        id: "3",
        timestamp: "2023-10-15 14:35",
        type: "evidence",
        title: "Evidence Uploaded",
        description: "Survivor uploaded photos of injuries to secure vault.",
        user: "Survivor"
      },
      {
        id: "4",
        timestamp: "2023-10-15 15:00",
        type: "assignment",
        title: "Case Assigned",
        description: "Case assigned to Senior Responder for priority handling.",
        user: "Supervisor"
      },
      {
        id: "5",
        timestamp: "2023-10-15 15:30",
        type: "update",
        title: "Status Update",
        description: "Case status changed to 'In Progress' - support services contacted.",
        user: "Responder RS"
      }
    ],
    "GBV-2023-0011": [
      {
        id: "1",
        timestamp: "2023-10-14 10:15",
        type: "report",
        title: "Incident Reported",
        description: "Anonymous report received via hotline.",
        user: "System"
      },
      {
        id: "2",
        timestamp: "2023-10-14 10:30",
        type: "response",
        title: "Initial Assessment",
        description: "Case reviewed and prioritized as urgent.",
        user: "Responder ML"
      },
      {
        id: "3",
        timestamp: "2023-10-14 16:20",
        type: "update",
        title: "Support Provided",
        description: "Connected survivor with legal aid services.",
        user: "Responder ML"
      }
    ]
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'report':
        return <FileText className="h-4 w-4" />;
      case 'response':
        return <MessageSquare className="h-4 w-4" />;
      case 'evidence':
        return <Shield className="h-4 w-4" />;
      case 'assignment':
        return <UserPlus className="h-4 w-4" />;
      case 'update':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      report: "default",
      response: "secondary",
      evidence: "outline",
      assignment: "secondary",
      update: "outline"
    };
    
    return (
      <Badge variant={variants[type] || "secondary"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const currentEvents = timelineEvents[selectedCase] || [];

  return (
    <div className="bg-card rounded-lg shadow-custom p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Case History Log</h2>
        <Button variant="default">
          <FileText className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Case Selection */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="max-w-sm">
            <Label>Select Case</Label>
            <Select value={selectedCase} onValueChange={setSelectedCase}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GBV-2023-0012">GBV-2023-0012</SelectItem>
                <SelectItem value="GBV-2023-0011">GBV-2023-0011</SelectItem>
                <SelectItem value="GBV-2023-0010">GBV-2023-0010</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {currentEvents.map((event, index) => (
          <div key={event.id} className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                {getEventIcon(event.type)}
              </div>
              {index < currentEvents.length - 1 && (
                <div className="w-px h-12 bg-border mt-2" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.timestamp}</p>
                    </div>
                    {getEventTypeBadge(event.type)}
                  </div>
                  
                  <p className="text-sm text-foreground mb-2">{event.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">By: {event.user}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
        
        {currentEvents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No history available for this case</p>
          </div>
        )}
      </div>
    </div>
  );
};