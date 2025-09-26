import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Image, Volume2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvidenceItem {
  id: string;
  caseId: string;
  type: 'voice' | 'photo' | 'document' | 'screenshot';
  timestamp: string;
  description: string;
  encrypted: boolean;
}

export const EvidenceSection = () => {
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  
  const evidenceItems: EvidenceItem[] = [
    {
      id: "1",
      caseId: "GBV-2023-0012",
      type: "voice",
      timestamp: "15 Oct 2023, 14:30",
      description: "Voice Note - Survivor testimony",
      encrypted: true
    },
    {
      id: "2",
      caseId: "GBV-2023-0011",
      type: "photo",
      timestamp: "14 Oct 2023, 10:15",
      description: "Photos - Physical evidence",
      encrypted: true
    },
    {
      id: "3",
      caseId: "GBV-2023-0010",
      type: "screenshot",
      timestamp: "13 Oct 2023, 18:45",
      description: "Screenshots - Digital harassment",
      encrypted: true
    },
    {
      id: "4",
      caseId: "GBV-2023-0009",
      type: "document",
      timestamp: "12 Oct 2023, 09:20",
      description: "Medical report - Hospital records",
      encrypted: true
    }
  ];

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return <Volume2 className="h-4 w-4" />;
      case 'photo':
        return <Image className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'screenshot':
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const selectedItem = evidenceItems.find(item => item.id === selectedEvidence);

  return (
    <div className="bg-card rounded-lg shadow-custom p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Evidence Access</h2>
        <Button variant="default">
          <Shield className="h-4 w-4 mr-2" />
          Request Access
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence List */}
        <Card>
          <CardHeader>
            <CardTitle>Evidence Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {evidenceItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedEvidence(item.id)}
                  className={cn(
                    "p-4 border-b border-border cursor-pointer transition-smooth hover:bg-muted",
                    selectedEvidence === item.id && "bg-accent"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getEvidenceIcon(item.type)}
                      <h4 className="font-medium text-foreground">Case {item.caseId}</h4>
                    </div>
                    {item.encrypted && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{item.description}</p>
                  <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evidence Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Evidence Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-96">
            {selectedItem ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  {getEvidenceIcon(selectedItem.type)}
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Evidence for Case {selectedItem.caseId}
                </h3>
                <p className="text-muted-foreground">{selectedItem.description}</p>
                
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Access Level:</span>
                    <span>Authorized Responder</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Encryption:</span>
                    <span>AES-256</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Timestamp:</span>
                    <span>{selectedItem.timestamp}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    This evidence is encrypted and can only be accessed with proper authorization.
                  </p>
                  <Button variant="default" className="w-full">
                    <Lock className="h-4 w-4 mr-2" />
                    Decrypt and View
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an evidence item to preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};