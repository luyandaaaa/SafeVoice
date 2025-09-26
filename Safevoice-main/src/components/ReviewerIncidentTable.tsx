import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, UserPlus } from "lucide-react";
import { Incident } from "@/types/incident";
import { useToast } from "@/hooks/use-toast";

interface IncidentTableProps {
  incidents: Incident[];
  updateIncidents: (incidents: Incident[]) => void;
  showFilters?: boolean;
}

export const IncidentTable = ({ incidents, updateIncidents, showFilters = false }: IncidentTableProps) => {
  const [filteredIncidents, setFilteredIncidents] = useState(incidents);
  const [filters, setFilters] = useState({
    province: "all",
    type: "all",
    status: "all",
    dateFrom: "",
    dateTo: ""
  });
  const { toast } = useToast();

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    let filtered = incidents;
    
    if (newFilters.province && newFilters.province !== "all") {
      filtered = filtered.filter(incident => 
        incident.location.toLowerCase().includes(newFilters.province.toLowerCase())
      );
    }
    
    if (newFilters.type && newFilters.type !== "all") {
      filtered = filtered.filter(incident => 
        incident.type.toLowerCase() === newFilters.type.toLowerCase()
      );
    }
    
    if (newFilters.status && newFilters.status !== "all") {
      filtered = filtered.filter(incident => 
        incident.status === newFilters.status
      );
    }
    
    if (newFilters.dateFrom) {
      filtered = filtered.filter(incident => 
        incident.date >= newFilters.dateFrom
      );
    }
    
    if (newFilters.dateTo) {
      filtered = filtered.filter(incident => 
        incident.date <= newFilters.dateTo
      );
    }
    
    setFilteredIncidents(filtered);
  };

  const handleAssign = (incidentId: string) => {
    const updatedIncidents = incidents.map(incident =>
      incident.id === incidentId
        ? { ...incident, status: 'in-progress' as const }
        : incident
    );
    updateIncidents(updatedIncidents);
    toast({
      title: "Incident Assigned",
      description: `Case ${incidentId} has been assigned and is now in progress.`,
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'urgent':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Urgent</Badge>;
      case 'follow-up':
        return <Badge variant="outline">Follow-up</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'in-progress':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const displayIncidents = showFilters ? filteredIncidents : incidents;

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="province-filter">Province</Label>
            <Select onValueChange={(value) => handleFilterChange('province', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Provinces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                <SelectItem value="gp">Gauteng</SelectItem>
                <SelectItem value="wc">Western Cape</SelectItem>
                <SelectItem value="kzn">KwaZulu-Natal</SelectItem>
                <SelectItem value="ec">Eastern Cape</SelectItem>
                <SelectItem value="fs">Free State</SelectItem>
                <SelectItem value="mp">Mpumalanga</SelectItem>
                <SelectItem value="nw">North West</SelectItem>
                <SelectItem value="lp">Limpopo</SelectItem>
                <SelectItem value="nc">Northern Cape</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type-filter">Type of Abuse</Label>
            <Select onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
                <SelectItem value="sexual">Sexual</SelectItem>
                <SelectItem value="emotional">Emotional</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date-from">Date From</Label>
            <Input
              type="date"
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date-to">Date To</Label>
            <Input
              type="date"
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>
      )}
      
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayIncidents.map((incident) => (
              <TableRow key={incident.id} className="hover:bg-muted/50 transition-smooth">
                <TableCell className="font-medium">{incident.id}</TableCell>
                <TableCell>{incident.date}</TableCell>
                <TableCell>{incident.type}</TableCell>
                <TableCell>{incident.location}</TableCell>
                <TableCell>{getPriorityBadge(incident.priority)}</TableCell>
                <TableCell>{getStatusBadge(incident.status)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {incident.status === 'new' && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleAssign(incident.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};