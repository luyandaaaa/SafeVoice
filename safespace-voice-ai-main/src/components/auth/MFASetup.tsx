import { useState } from "react";
import { Shield, Smartphone, QrCode, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface MFASetupProps {
  onComplete: () => void;
}

export const MFASetup = ({ onComplete }: MFASetupProps) => {
  const [step, setStep] = useState(1);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaType, setMfaType] = useState<'sms' | 'app' | 'email'>('sms');
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleMFAVerification = () => {
    if (mfaCode.length === 6) {
      toast({
        title: t("mfa_setup_complete"),
        description: t("mfa_security_enhanced"),
        variant: "default"
      });
      onComplete();
    } else {
      toast({
        title: t("invalid_code"),
        description: t("enter_6_digit_code"),
        variant: "destructive"
      });
    }
  };

  const sendMFACode = () => {
    // Simulate sending MFA code
    setStep(2);
    toast({
      title: t("code_sent"),
      description: t(`code_sent_${mfaType}`),
      variant: "default"
    });
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          {t("setup_mfa")}
        </CardTitle>
        <CardDescription>
          {t("enhance_account_security")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <Tabs value={mfaType} onValueChange={(value) => setMfaType(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sms" className="flex-col gap-1 h-16">
                <Smartphone className="h-5 w-5" />
                <span className="text-xs">{t("sms")}</span>
              </TabsTrigger>
              <TabsTrigger value="app" className="flex-col gap-1 h-16">
                <QrCode className="h-5 w-5" />
                <span className="text-xs">{t("app")}</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex-col gap-1 h-16">
                <Key className="h-5 w-5" />
                <span className="text-xs">{t("email")}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sms" className="mt-4 space-y-4">
              <div className="text-center space-y-2">
                <Smartphone className="h-12 w-12 text-primary mx-auto" />
                <h3 className="font-semibold">{t("sms_verification")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("sms_verification_description")}
                </p>
              </div>
              <Button onClick={sendMFACode} className="w-full">
                {t("send_sms_code")}
              </Button>
            </TabsContent>

            <TabsContent value="app" className="mt-4 space-y-4">
              <div className="text-center space-y-2">
                <QrCode className="h-12 w-12 text-primary mx-auto" />
                <h3 className="font-semibold">{t("authenticator_app")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("authenticator_app_description")}
                </p>
              </div>
              {/* QR Code Placeholder */}
              <div className="bg-muted rounded-lg p-8 text-center">
                <QrCode className="h-24 w-24 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t("scan_qr_code")}
                </p>
              </div>
              <Button onClick={sendMFACode} className="w-full">
                {t("verify_app_setup")}
              </Button>
            </TabsContent>

            <TabsContent value="email" className="mt-4 space-y-4">
              <div className="text-center space-y-2">
                <Key className="h-12 w-12 text-primary mx-auto" />
                <h3 className="font-semibold">{t("email_verification")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("email_verification_description")}
                </p>
              </div>
              <Button onClick={sendMFACode} className="w-full">
                {t("send_email_code")}
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Shield className="h-12 w-12 text-primary mx-auto" />
              <h3 className="font-semibold">{t("enter_verification_code")}</h3>
              <p className="text-sm text-muted-foreground">
                {t(`code_sent_${mfaType}_description`)}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mfa-code">{t("verification_code")}</Label>
              <Input
                id="mfa-code"
                type="text"
                placeholder="123456"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                {t("back")}
              </Button>
              <Button
                onClick={handleMFAVerification}
                className="flex-1"
                disabled={mfaCode.length !== 6}
              >
                {t("verify")}
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={sendMFACode}
              className="w-full text-sm"
            >
              {t("resend_code")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};