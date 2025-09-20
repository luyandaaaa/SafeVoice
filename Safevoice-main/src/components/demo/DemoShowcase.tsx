import { useState } from "react";
import { Shield, Globe, Mic, Brain, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";
import heroImage from "@/assets/safevoice-hero.jpg";

export const DemoShowcase = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const { t, currentLanguage } = useLanguage();
  const { speak, isVoiceEnabled } = useVoice();

  const features = [
    {
      id: "mfa",
      icon: Lock,
      title: "Multi-Factor Authentication",
      description: "Face ID, Fingerprint, and traditional login options",
      gradient: "bg-gradient-hero"
    },
    {
      id: "multilingual",
      icon: Globe,
      title: "11 South African Languages",
      description: "Full support for all official SA languages",
      gradient: "bg-gradient-safe"
    },
    {
      id: "voice",
      icon: Mic,
      title: "Voice Accessibility",
      description: "Screen reader support and voice navigation",
      gradient: "bg-gradient-emergency"
    },
    {
      id: "ai",
      icon: Brain,
      title: "AI Support Chatbot",
      description: "24/7 multilingual AI assistant for support",
      gradient: "bg-primary"
    },
    {
      id: "safety",
      icon: Shield,
      title: "Emergency Features",
      description: "SOS alerts, location sharing, quick reports",
      gradient: "bg-warning"
    },
    {
      id: "community",
      icon: Users,
      title: "Community Support",
      description: "Connect with support groups and resources",
      gradient: "bg-success"
    }
  ];

  const handleFeatureDemo = (featureId: string) => {
    setActiveFeature(featureId);
    if (isVoiceEnabled) {
      const feature = features.find(f => f.id === featureId);
      if (feature) {
        speak(`Demonstrating ${feature.title}: ${feature.description}`);
      }
    }
    
    // Auto-clear after 3 seconds
    setTimeout(() => setActiveFeature(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl">
        <img 
          src={heroImage} 
          alt="SafeVoice AI Platform" 
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-glow/70 flex items-center">
          <div className="text-center w-full text-white p-8">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16" />
            </div>
            <h1 className="text-4xl font-bold mb-4">SafeVoice AI</h1>
            <p className="text-xl mb-6">Breaking the Silence, Saving Lives</p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                11 Languages
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                MFA Security
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Voice Accessibility
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                AI Chatbot
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;
          
          return (
            <Card 
              key={feature.id}
              className={`shadow-soft hover:shadow-md transition-all cursor-pointer ${
                isActive ? 'ring-2 ring-primary scale-105' : ''
              }`}
              onClick={() => handleFeatureDemo(feature.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${feature.gradient} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
                {isActive && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
                      Demonstrating feature...
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Language Support */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Multi-Language Support
          </CardTitle>
          <CardDescription>
            Complete support for all 11 official South African languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
              <div
                key={code}
                className={`p-3 rounded-lg border text-center transition-all hover:shadow-sm ${
                  currentLanguage === code 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <div className="font-medium text-sm">{name}</div>
                <div className="text-xs opacity-70 mt-1">{code.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Accessibility Demo */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Voice Accessibility Features
          </CardTitle>
          <CardDescription>
            Comprehensive voice support for users with visual impairments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Voice Navigation</h4>
              <p className="text-sm text-muted-foreground">
                Navigate the entire app using voice commands and get audio feedback
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Screen Reader Support</h4>
              <p className="text-sm text-muted-foreground">
                Full compatibility with screen readers and assistive technologies
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Audio Descriptions</h4>
              <p className="text-sm text-muted-foreground">
                Detailed audio descriptions of all interface elements and actions
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Voice Input</h4>
              <p className="text-sm text-muted-foreground">
                Speak to the AI chatbot and dictate reports using voice input
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant={isVoiceEnabled ? "success" : "outline"}
              onClick={() => {
                if (isVoiceEnabled) {
                  speak("Voice accessibility is currently enabled. You can navigate the app using voice commands and receive audio feedback.");
                }
              }}
              className="flex-1"
            >
              <Mic className="h-4 w-4 mr-2" />
              {isVoiceEnabled ? "Voice Enabled" : "Enable Voice"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="shadow-soft bg-gradient-hero text-white">
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">Ready to Experience SafeVoice AI?</h3>
          <p className="text-white/90 mb-6">
            Join thousands of users who trust SafeVoice AI for their safety and support needs.
            Experience the power of multilingual AI assistance, advanced security, and comprehensive accessibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="text-primary">
              Try Biometric Login
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/20">
              Explore Features
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};