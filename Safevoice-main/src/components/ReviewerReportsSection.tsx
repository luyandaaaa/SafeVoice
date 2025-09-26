import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Share2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  name: string;
  dateGenerated: string;
  type: 'internal' | 'legal' | 'funding' | 'compliance';
  status: 'completed' | 'generating' | 'failed';
  size: string;
}

export const ReportsSection = () => {
  const { toast } = useToast();

  const reports: Report[] = [
    {
      id: "1",
      name: "Monthly Summary - October 2023",
      dateGenerated: "2023-10-31",
      type: "internal",
      status: "completed",
      size: "2.4 MB"
    },
    {
      id: "2",
      name: "Court Submission - GBV-2023-0011",
      dateGenerated: "2023-10-20",
      type: "legal",
      status: "completed",
      size: "1.8 MB"
    },
    {
      id: "3",
      name: "Donor Report - Q3 2023",
      dateGenerated: "2023-09-30",
      type: "funding",
      status: "completed",
      size: "3.2 MB"
    },
    {
      id: "4",
      name: "Compliance Audit - September 2023",
      dateGenerated: "2023-09-15",
      type: "compliance",
      status: "completed",
      size: "4.1 MB"
    },
    {
      id: "5",
      name: "Weekly Statistics Report",
      dateGenerated: "2023-10-16",
      type: "internal",
      status: "generating",
      size: "Generating..."
    }
  ];

  const handleDownload = (reportId: string, reportName: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${reportName}...`,
    });
  };

  const handleShare = (reportId: string, reportName: string) => {
    toast({
      title: "Report Shared",
      description: `${reportName} has been shared via secure link.`,
    });
  };

  const getReportTypeBadge = (type: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      internal: { variant: "default", className: "" },
      legal: { variant: "destructive", className: "" },
      funding: { variant: "secondary", className: "bg-green-100 text-green-800" },
      compliance: { variant: "outline", className: "" }
    };
    
    return (
      <Badge variant={variants[type]?.variant || "secondary"} className={variants[type]?.className}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Completed</Badge>;
      case 'generating':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Generating</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-custom p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Download Reports</h2>
        <Button variant="default">
          <Plus className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{reports.filter(r => r.status === 'completed').length}</p>
              <p className="text-sm text-muted-foreground">Completed Reports</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{reports.filter(r => r.type === 'legal').length}</p>
              <p className="text-sm text-muted-foreground">Legal Reports</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{reports.filter(r => r.type === 'internal').length}</p>
              <p className="text-sm text-muted-foreground">Internal Reports</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {reports.reduce((acc, r) => acc + (r.status === 'completed' ? parseFloat(r.size) || 0 : 0), 0).toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Total Size (MB)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Date Generated</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id} className="hover:bg-muted/50 transition-smooth">
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{report.name}</span>
                  </div>
                </TableCell>
                <TableCell>{report.dateGenerated}</TableCell>
                <TableCell>{getReportTypeBadge(report.type)}</TableCell>
                <TableCell>{getStatusBadge(report.status)}</TableCell>
                <TableCell>{report.size}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {report.status === 'completed' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(report.id, report.name)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleShare(report.id, report.name)}
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </>
                    )}
                    {report.status === 'generating' && (
                      <Button variant="outline" size="sm" disabled>
                        Generating...
                      </Button>
                    )}
                    {report.status === 'failed' && (
                      <Button variant="destructive" size="sm">
                        Retry
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