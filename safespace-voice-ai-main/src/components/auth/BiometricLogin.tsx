import { useState } from "react";
import { Fingerprint, Scan, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const BiometricLogin = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<'face' | 'fingerprint' | null>(null);
  const { loginWithBiometric } = useAuth();
  const { t } = useLanguage();
  const { speak, isVoiceEnabled } = useVoice();
  const { toast } = useToast();

  const handleBiometricLogin = async (type: 'face' | 'fingerprint') => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: t("biometric_not_supported"),
        description: t("biometric_not_available"),
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    setScanType(type);

    if (isVoiceEnabled) {
      speak(t(type === 'face' ? 'scanning_face' : 'scanning_fingerprint'));
    }

    try {
      // Simulate biometric scanning delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const success = await loginWithBiometric(type);
      
      if (success) {
        toast({
          title: t("biometric_success"),
          description: t("login_successful"),
          variant: "default"
        });
        if (isVoiceEnabled) {
          speak(t("biometric_login_successful"));
        }
      } else {
        toast({
          title: t("biometric_failed"),
          description: t("biometric_not_recognized"),
          variant: "destructive"
        });
        if (isVoiceEnabled) {
          speak(t("biometric_authentication_failed"));
        }
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("biometric_error"),
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setScanType(null);
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5 text-primary" />
          {t("biometric_authentication")}
        </CardTitle>
        <CardDescription>
          {t("quick_secure_access")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Face ID */}
        <Button
          variant="outline"
          className={cn(
            "w-full h-16 flex-col gap-2 relative overflow-hidden",
            isScanning && scanType === 'face' && "border-primary bg-primary/5"
          )}
          onClick={() => handleBiometricLogin('face')}
          disabled={isScanning}
        >
          {isScanning && scanType === 'face' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
          )}
          <Camera className={cn(
            "h-6 w-6",
            isScanning && scanType === 'face' ? "text-primary animate-pulse" : "text-muted-foreground"
          )} />
          <span className="font-medium">
            {isScanning && scanType === 'face' ? t("scanning_face") : t("face_id")}
          </span>
          {isScanning && scanType === 'face' && (
            <div className="text-xs text-muted-foreground animate-pulse">
              {t("look_at_camera")}
            </div>
          )}
        </Button>

        {/* Fingerprint */}
        <Button
          variant="outline"
          className={cn(
            "w-full h-16 flex-col gap-2 relative overflow-hidden",
            isScanning && scanType === 'fingerprint' && "border-primary bg-primary/5"
          )}
          onClick={() => handleBiometricLogin('fingerprint')}
          disabled={isScanning}
        >
          {isScanning && scanType === 'fingerprint' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
          )}
          <Fingerprint className={cn(
            "h-6 w-6",
            isScanning && scanType === 'fingerprint' ? "text-primary animate-pulse" : "text-muted-foreground"
          )} />
          <span className="font-medium">
            {isScanning && scanType === 'fingerprint' ? t("scanning_fingerprint") : t("fingerprint")}
          </span>
          {isScanning && scanType === 'fingerprint' && (
            <div className="text-xs text-muted-foreground animate-pulse">
              {t("place_finger_on_sensor")}
            </div>
          )}
        </Button>

        {/* Status Message */}
        {isScanning && (
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
              {t("authenticating")}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};