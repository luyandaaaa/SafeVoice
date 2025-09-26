import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, FileText, CheckCircle } from "lucide-react";
import { Incident } from "@/types/incident";

interface DashboardStatsProps {
  incidents: Incident[];
}

export const DashboardStats = ({ incidents }: DashboardStatsProps) => {
  const criticalCount = incidents.filter(i => i.priority === 'critical').length;
  const urgentCount = incidents.filter(i => i.priority === 'urgent').length;
  const newCount = incidents.filter(i => i.status === 'new').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

  const stats = [
    {
      title: "Critical Incidents",
      value: criticalCount,
      icon: AlertTriangle,
      variant: "destructive" as const,
      className: "border-l-4 border-l-critical"
    },
    {
      title: "Urgent Cases",
      value: urgentCount,
      icon: Clock,
      variant: "secondary" as const,
      className: "border-l-4 border-l-warning"
    },
    {
      title: "New Reports",
      value: newCount,
      icon: FileText,
      variant: "default" as const,
      className: "border-l-4 border-l-primary"
    },
    {
      title: "Resolved Cases",
      value: resolvedCount,
      icon: CheckCircle,
      variant: "secondary" as const,
      className: "border-l-4 border-l-success"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className={`shadow-custom hover:shadow-custom-lg transition-smooth ${stat.className}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <Badge variant={stat.variant} className="mt-2">
                {stat.variant === "destructive" && "High Priority"}
                {stat.variant === "secondary" && stat.title === "Urgent Cases" && "Needs Attention"}
                {stat.variant === "default" && "Active"}
                {stat.variant === "secondary" && "Completed"}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};