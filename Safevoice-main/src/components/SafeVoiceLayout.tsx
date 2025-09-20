import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Menu, LogOut, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";

interface SafeVoiceLayoutProps {
  children: React.ReactNode;
}

export const SafeVoiceLayout = ({ children }: SafeVoiceLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const { isVoiceEnabled, toggleVoice, speak } = useVoice();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  useEffect(() => {
    if (isVoiceEnabled) {
      speak(t('welcome_message', { name: user?.name || 'User' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, isVoiceEnabled]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b shadow-soft">
        <div className="flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2 font-bold text-xl">
            <img src="/logo.png" alt="SafeVoice Logo" className="h-8 w-8" />
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              SafeVoice AI
            </span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {/* Voice Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoice}
              className={cn(
                "transition-colors",
                isVoiceEnabled ? "text-primary" : "text-muted-foreground"
              )}
              title={t(isVoiceEnabled ? 'voice_enabled' : 'voice_disabled')}
            >
              {isVoiceEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>

            {/* User Info */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t('welcome')}</span>
              <span className="font-medium">{user?.name}</span>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title={t('logout')}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};