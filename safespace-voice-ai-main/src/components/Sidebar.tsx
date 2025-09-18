import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  AlertTriangle,
  MessageCircle,
  Map,
  Lock,
  Scale,
  BookOpen,
  Users,
  Settings,
  X,
  ChevronLeft,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { speak, isVoiceEnabled } = useVoice();

  const menuItems = [
    { id: "dashboard", icon: Home, label: t("dashboard"), path: "/dashboard" },
    { id: "report", icon: AlertTriangle, label: t("report_incident"), path: "/report" },
    { id: "chat", icon: MessageCircle, label: t("ai_chat"), path: "/chat" },
    { id: "map", icon: Map, label: t("safety_map"), path: "/map" },
    { id: "evidence", icon: Lock, label: t("evidence_vault"), path: "/evidence" },
    { id: "legal", icon: Scale, label: t("legal_assistance"), path: "/legal" },
    { id: "resources", icon: BookOpen, label: t("resources"), path: "/resources" },
    { id: "community", icon: Users, label: t("community"), path: "/community" },
    { id: "settings", icon: Settings, label: t("settings"), path: "/settings" },
  ];

  const handleNavigation = (item: typeof menuItems[0]) => {
    navigate(item.path);
    if (isVoiceEnabled) {
      speak(t("navigating_to", { page: item.label }));
    }
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-card border-r border-border transition-all duration-300",
          "md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            {!isCollapsed && (
              <div className="flex items-center gap-2 font-bold">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm">SafeVoice AI</span>
              </div>
            )}
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-8 w-8"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronLeft className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "rotate-180"
                )} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.id}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-11",
                        isCollapsed && "justify-center px-2",
                        isActive && "bg-primary/10 text-primary border-primary/20"
                      )}
                      onClick={() => handleNavigation(item)}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Emergency Quick Access */}
          {!isCollapsed && (
            <div className="p-4 border-t">
              <Button
                variant="destructive"
                className="w-full bg-gradient-emergency shadow-emergency"
                onClick={() => {
                  if (confirm("Call emergency services?")) {
                    window.location.href = "tel:911";
                  }
                }}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency: 911
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};