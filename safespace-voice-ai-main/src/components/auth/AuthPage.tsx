import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";
import { BiometricLogin } from "./BiometricLogin";
import { MFASetup } from "./MFASetup";
import { useToast } from "@/hooks/use-toast";

export const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    preferredLanguage: "en"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showMFA, setShowMFA] = useState(false);

  const { login, register, isAuthenticated } = useAuth();
  const { t, setLanguage, currentLanguage } = useLanguage();
  const { speak, isVoiceEnabled } = useVoice();
  const { toast } = useToast();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(loginData);
      if (success) {
        toast({
          title: t("login_success"),
          description: t("welcome_back"),
          variant: "default"
        });
        if (isVoiceEnabled) {
          speak(t("login_successful"));
        }
      } else {
        toast({
          title: t("login_failed"),
          description: t("invalid_credentials"),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("login_error"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: t("error"),
        description: t("passwords_dont_match"),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(registerData);
      if (success) {
        toast({
          title: t("registration_success"),
          description: t("account_created"),
          variant: "default"
        });
        if (isVoiceEnabled) {
          speak(t("registration_successful"));
        }
      } else {
        toast({
          title: t("registration_failed"),
          description: t("registration_error"),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("registration_error"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-hero rounded-full shadow-glow">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              SafeVoice AI
            </h1>
            <p className="text-muted-foreground mt-2">
              Breaking the Silence, Saving Lives
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="language">{t("select_language")}</Label>
              <Select
                value={currentLanguage}
                onValueChange={(value) => setLanguage(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("select_language")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Forms */}
        {!showMFA ? (
          <Card className="shadow-soft">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("login")}</TabsTrigger>
                <TabsTrigger value="register">{t("register")}</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <CardHeader>
                  <CardTitle>{t("welcome_back")}</CardTitle>
                  <CardDescription>
                    {t("sign_in_to_continue")}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("email_placeholder")}
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">{t("password")}</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t("password_placeholder")}
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="space-y-4">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-hero shadow-soft"
                      disabled={isLoading}
                    >
                      {isLoading ? t("signing_in") : t("sign_in")}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <CardHeader>
                  <CardTitle>{t("create_account")}</CardTitle>
                  <CardDescription>
                    {t("join_safevoice_community")}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("full_name")}</Label>
                      <Input
                        id="name"
                        placeholder={t("full_name_placeholder")}
                        value={registerData.name}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">{t("email")}</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder={t("email_placeholder")}
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("phone_number")}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+27 123 456 789"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">{t("password")}</Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t("password_placeholder")}
                          value={registerData.password}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">{t("confirm_password")}</Label>
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("confirm_password_placeholder")}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferred-language">{t("preferred_language")}</Label>
                      <Select
                        value={registerData.preferredLanguage}
                        onValueChange={(value) => setRegisterData(prev => ({ ...prev, preferredLanguage: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("select_language")} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                            <SelectItem key={code} value={code}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-hero shadow-soft"
                      disabled={isLoading}
                    >
                      {isLoading ? t("creating_account") : t("create_account")}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        ) : (
          <MFASetup onComplete={() => setShowMFA(false)} />
        )}

        {/* Biometric Login */}
        <BiometricLogin />

        {/* Offline Mode */}
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                toast({
                  title: t("offline_mode"),
                  description: t("dial_ussd_code") + " *384*SOS#",
                });
              }}
            >
              {t("offline_mode_ussd")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};