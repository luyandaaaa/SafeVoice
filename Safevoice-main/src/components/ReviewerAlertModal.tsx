import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AlertModal = ({ open, onOpenChange }: AlertModalProps) => {
  const { toast } = useToast();

  const handleRespond = () => {
    toast({
      title: "Response Initiated",
      description: "Emergency response team has been notified and is responding.",
    });
    onOpenChange(false);
  };

  const handleDismiss = () => {
    toast({
      title: "Alert Dismissed",
      description: "Alert has been dismissed and logged.",
      variant: "destructive",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-critical">
            <AlertTriangle className="h-5 w-5" />
            <span>🚨 Emergency Alert</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <strong>Case ID:</strong>
            <span>GBV-2023-0015</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <strong>Location:</strong>
            <span>Johannesburg, Gauteng</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <strong>Time:</strong>
            <span>{new Date().toLocaleString()}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <strong>Priority:</strong>
            <Badge variant="destructive">Critical</Badge>
          </div>
          
          <DialogDescription className="text-base">
            A panic button has been activated. Immediate response required.
          </DialogDescription>
        </div>
        
        <DialogFooter className="flex space-x-2">
          <Button variant="default" onClick={handleRespond} className="flex-1">
            Respond
          </Button>
          <Button variant="destructive" onClick={handleDismiss} className="flex-1">
            Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};