import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  MessageSquare, 
  Shield, 
  AlertTriangle, 
  FolderOpen, 
  Hospital, 
  History,
  LogOut,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Overview", icon: BarChart3 },
  { id: "incidents", label: "Incidents", icon: FolderOpen },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "chat", label: "Chat Support", icon: MessageSquare },
  { id: "evidence", label: "Evidence Vault", icon: Shield },
  { id: "history", label: "Case History", icon: History },
  { id: "services", label: "Services", icon: Hospital },
];

export const ReviewerSidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('safevoice_user_role');
    navigate('/auth');
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-bold">SafeVoice</h2>
        <p className="text-sm text-muted-foreground">Reviewer Portal</p>
      </div>
      
      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};