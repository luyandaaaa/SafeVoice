export interface Incident {
  id: string;
  type: string;
  date: string;
  location: string;
  description: string;
  status: 'new' | 'in-progress' | 'resolved';
  priority: 'critical' | 'urgent' | 'follow-up';
  evidence?: string[];
  userId: string;
  reportId?: string;
}