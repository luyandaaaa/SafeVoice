import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Hospital, Phone, MapPin, Users, Eye, UserPlus } from "lucide-react";

interface Service {
  id: string;
  name: string;
  type: 'shelter' | 'medical' | 'legal' | 'counseling';
  location: string;
  contact: string;
  capacity: string;
  available: boolean;
}

export const ServicesSection = () => {
  const [filters, setFilters] = useState({
    type: "all",
    location: "all"
  });

  const services: Service[] = [
    {
      id: "1",
      name: "Hope Shelter",
      type: "shelter",
      location: "Johannesburg, GP",
      contact: "011 123 4567",
      capacity: "12/20",
      available: true
    },
    {
      id: "2",
      name: "Legal Aid Clinic",
      type: "legal",
      location: "Cape Town, WC",
      contact: "021 987 6543",
      capacity: "Available",
      available: true
    },
    {
      id: "3",
      name: "Trauma Center",
      type: "medical",
      location: "Durban, KZN",
      contact: "031 456 7890",
      capacity: "Available",
      available: true
    },
    {
      id: "4",
      name: "Counseling Services",
      type: "counseling",
      location: "Pretoria, GP",
      contact: "012 345 6789",
      capacity: "Available",
      available: true
    },
    {
      id: "5",
      name: "Safe Haven Shelter",
      type: "shelter",
      location: "Port Elizabeth, EC",
      contact: "041 123 4567",
      capacity: "5/15",
      available: true
    },
    {
      id: "6",
      name: "Family Court Support",
      type: "legal",
      location: "Bloemfontein, FS",
      contact: "051 987 6543",
      capacity: "Available",
      available: false
    }
  ];

  const filteredServices = services.filter(service => {
    if (filters.type && filters.type !== "all" && service.type !== filters.type) return false;
    if (filters.location && filters.location !== "all" && !service.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    return true;
  });

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'shelter':
        return <Hospital className="h-4 w-4" />;
      case 'medical':
        return <Hospital className="h-4 w-4" />;
      case 'legal':
        return <Users className="h-4 w-4" />;
      case 'counseling':
        return <Users className="h-4 w-4" />;
      default:
        return <Hospital className="h-4 w-4" />;
    }
  };

  const getServiceTypeBadge = (type: string) => {
    const colors = {
      shelter: "bg-blue-100 text-blue-800",
      medical: "bg-red-100 text-red-800",
      legal: "bg-green-100 text-green-800",
      counseling: "bg-purple-100 text-purple-800"
    };
    
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="bg-card rounded-lg shadow-custom p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Support Services Directory</h2>
        <Button variant="default">
          <Hospital className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Service Type</Label>
              <Select onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="shelter">Shelter</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="counseling">Counseling</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Location</Label>
              <Select onValueChange={(value) => setFilters({...filters, location: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="gp">Gauteng</SelectItem>
                  <SelectItem value="wc">Western Cape</SelectItem>
                  <SelectItem value="kzn">KwaZulu-Natal</SelectItem>
                  <SelectItem value="ec">Eastern Cape</SelectItem>
                  <SelectItem value="fs">Free State</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.map((service) => (
              <TableRow key={service.id} className="hover:bg-muted/50 transition-smooth">
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getServiceIcon(service.type)}
                    <span className="font-medium">{service.name}</span>
                  </div>
                </TableCell>
                <TableCell>{getServiceTypeBadge(service.type)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>{service.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{service.contact}</span>
                  </div>
                </TableCell>
                <TableCell>{service.capacity}</TableCell>
                <TableCell>
                  <Badge variant={service.available ? "default" : "secondary"}>
                    {service.available ? "Available" : "Full"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {service.available && (
                      <Button variant="default" size="sm">
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