import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Shield, 
  AlertTriangle, 
  FileText, 
  LogOut,
  Menu,
  X,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "incidents", label: "Incidents", icon: FileText },
  { id: "alerts", label: "Live Alerts", icon: AlertTriangle },
  { id: "evidence", label: "Evidence", icon: Shield },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export const ReviewerSidebar = ({ activeSection, setActiveSection, isOpen, onClose }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/auth', { replace: true });
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
          "fixed left-0 top-0 z-50 h-screen bg-card border-r border-border transition-all duration-300",
          "md:sticky md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-3 border-b">
            {!isCollapsed && (
              <div className="flex items-center gap-2 font-bold">
                <img src="/logo.png" alt="SafeVoice Logo" className="h-7 w-7" />
                <span className="text-sm">SafeVoice AI</span>
              </div>
            )}
            
            <div className="flex">
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
          <nav className="flex-1 overflow-y-auto py-2">
            <ul className="space-y-0.5 px-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Button
                      variant={activeSection === item.id ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-2 h-10",
                        isCollapsed && "justify-center px-0",
                        activeSection === item.id && "bg-primary/10 text-primary border-primary/20"
                      )}
                      onClick={() => setActiveSection(item.id)}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="truncate text-sm">{item.label}</span>
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="px-2 py-2 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="truncate">Logout</span>
              )}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};