import React, { useState, useEffect } from "react";
import { USSDModal } from "./USSDOfflineModeButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Navigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";
import { BiometricLogin } from "./BiometricLogin";
import { MFASetup } from "./MFASetup";
import { useToast } from "@/hooks/use-toast";

// Simulate biometric capture
function simulateBiometricCapture(type: 'face' | 'fingerprint', userId: string) {
  return `${type}-biometric-for-${userId}`;
}

// Auth context hook
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Login failed');
      }

      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setIsAuthenticated(true);
      setUser(data.user);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    preferredLanguage: string;
  }) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Registration failed');
      }

      const data = await response.json();
      
      // Store token if registration includes auto-login
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuthenticated(true);
        setUser(data.user);
      }
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    register,
    logout
  };
};

export const AuthPage = () => {
  const [showUSSDModal, setShowUSSDModal] = useState(false);
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
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [pendingBiometricUser, setPendingBiometricUser] = useState<{ email: string; id: string } | null>(null);
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [fingerRegistered, setFingerRegistered] = useState(false);
  const [redirectToDashboard, setRedirectToDashboard] = useState(false);
  const [error, setError] = useState<string>("");

  const { isAuthenticated, login, register, isLoading: authLoading } = useAuth();
  const { t, setLanguage, currentLanguage } = useLanguage();
  const { speak, isVoiceEnabled } = useVoice();
  const { toast } = useToast();

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Biometric registration
  const handleRegisterBiometric = (type: 'face' | 'fingerprint') => {
    if (!pendingBiometricUser) return;
    const key = `${pendingBiometricUser.email}_${type}`;
    const value = simulateBiometricCapture(type, pendingBiometricUser.id);
    localStorage.setItem(key, value);
    if (type === 'face') setFaceRegistered(true);
    if (type === 'fingerprint') setFingerRegistered(true);
  };

  const handleFinishBiometric = () => {
    setShowBiometricSetup(false);
    setPendingBiometricUser(null);
    setFaceRegistered(false);
    setFingerRegistered(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (!loginData.email || !loginData.password) {
        throw new Error("Please enter both email and password");
      }
      
      const success = await login({
        email: loginData.email.trim(),
        password: loginData.password
      });
      
      if (success) {
        setRedirectToDashboard(true);
        toast({
          title: "Login Successful",
          description: "Welcome back!",
          variant: "default"
        });
        if (isVoiceEnabled) {
          speak("Login successful");
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      
      if (isVoiceEnabled) {
        speak(errorMessage);
      }
      
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      setLoginData(prev => ({ ...prev, password: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (registerData.password !== registerData.confirmPassword) {
      const errorMsg = "Passwords do not match";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone,
        preferredLanguage: registerData.preferredLanguage
      });
      
      if (success) {
        toast({
          title: "Registration successful!",
          description: "You can now log in with your credentials.",
          variant: "default",
        });
        
        // Switch to login tab and pre-fill email
        setActiveTab("login");
        setLoginData({ ...loginData, email: registerData.email });
        setRegisterData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          preferredLanguage: "en"
        });
        
        if (isVoiceEnabled) {
          speak("Registration successful");
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      
      if (isVoiceEnabled) {
        speak(errorMessage);
      }
      
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (redirectToDashboard) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      {showBiometricSetup ? (
        <Dialog open={showBiometricSetup}>
          <DialogContent className="w-[96%] max-w-md">
            <DialogHeader>
              <DialogTitle>Register Biometrics</DialogTitle>
              <DialogDescription>
                Please register both Face ID and Fingerprint to complete your account setup.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <Button
                variant={faceRegistered ? "secondary" : "outline"}
                className="w-full"
                onClick={() => handleRegisterBiometric('face')}
                disabled={faceRegistered}
              >
                {faceRegistered ? "Face ID Registered" : "Register Face ID"}
              </Button>
              <Button
                variant={fingerRegistered ? "secondary" : "outline"}
                className="w-full"
                onClick={() => handleRegisterBiometric('fingerprint')}
                disabled={fingerRegistered}
              >
                {fingerRegistered ? "Fingerprint Registered" : "Register Fingerprint"}
              </Button>
              <Button
                className="w-full"
                disabled={!(faceRegistered && fingerRegistered)}
                onClick={handleFinishBiometric}
              >
                Finish Setup
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
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
                <Label htmlFor="language">Select Language</Label>
                <Select
                  value={currentLanguage}
                  onValueChange={(value) => setLanguage(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Language" />
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
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>
                      Sign in to continue
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginData.email}
                          onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
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
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register">
                  <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                      Join SafeVoice community
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={registerData.name}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="Enter your email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
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
                        <Label htmlFor="reg-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="reg-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
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
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferred-language">Preferred Language</Label>
                        <Select
                          value={registerData.preferredLanguage}
                          onValueChange={(value) => setRegisterData(prev => ({ ...prev, preferredLanguage: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Language" />
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
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create Account"
                        )}
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
                onClick={() => setShowUSSDModal(true)}
              >
                Offline Mode (USSD)
              </Button>
              <USSDModal open={showUSSDModal} onClose={() => setShowUSSDModal(false)} />
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};