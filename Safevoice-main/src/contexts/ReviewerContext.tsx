import React, { createContext, useContext, useState, useEffect } from 'react';
import { Incident } from '@/types/incident';

interface ReviewerContextType {
  incidents: Incident[];
  updateIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Omit<Incident, 'id'>) => void;
  updateIncidentStatus: (id: string, status: 'new' | 'in-progress' | 'resolved') => void;
  alertModalOpen: boolean;
  setAlertModalOpen: (open: boolean) => void;
}

const ReviewerContext = createContext<ReviewerContextType | undefined>(undefined);

export const useReviewer = () => {
  const context = useContext(ReviewerContext);
  if (context === undefined) {
    throw new Error('useReviewer must be used within a ReviewerProvider');
  }
  return context;
};

// Sample data for incidents
const sampleIncidents: Incident[] = [
  {
    id: "GBV-2023-001",
    type: "domestic_violence",
    date: "2023-09-26",
    location: "Johannesburg, Gauteng",
    description: "Domestic violence incident reported",
    status: "new",
    priority: "critical",
    userId: "user1",
  },
  {
    id: "GBV-2023-002",
    type: "harassment",
    date: "2023-09-25",
    location: "Cape Town, Western Cape",
    description: "Harassment case at workplace",
    status: "in-progress",
    priority: "urgent",
    userId: "user2",
  },
  {
    id: "GBV-2023-003",
    type: "assault",
    date: "2023-09-24",
    location: "Durban, KwaZulu-Natal",
    description: "Physical assault reported",
    status: "resolved",
    priority: "follow-up",
    userId: "user3",
  },
  {
    id: "GBV-2023-004",
    type: "domestic_violence",
    date: "2023-09-26",
    location: "Pretoria, Gauteng",
    description: "Domestic abuse case",
    status: "new",
    priority: "critical",
    userId: "user4",
  },
  {
    id: "GBV-2023-005",
    type: "harassment",
    date: "2023-09-25",
    location: "Bloemfontein, Free State",
    description: "Online harassment reported",
    status: "in-progress",
    priority: "urgent",
    userId: "user5",
  }
];

export const ReviewerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    // Try to get incidents from localStorage
    const savedIncidents = localStorage.getItem('reviewer_incidents');
    if (savedIncidents) {
      return JSON.parse(savedIncidents);
    }
    // If no saved incidents, use sample data and save it
    localStorage.setItem('reviewer_incidents', JSON.stringify(sampleIncidents));
    return sampleIncidents;
  });
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  // Save incidents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('reviewer_incidents', JSON.stringify(incidents));
  }, [incidents]);

  const updateIncidents = (newIncidents: Incident[]) => {
    setIncidents(newIncidents);
    localStorage.setItem('reviewer_incidents', JSON.stringify(newIncidents));
  };

  // Function to add a new incident
  const addIncident = (incident: Omit<Incident, 'id'>) => {
    const newIncident = {
      ...incident,
      id: `GBV-2023-${String(incidents.length + 1).padStart(3, '0')}`
    };
    const updatedIncidents = [...incidents, newIncident];
    updateIncidents(updatedIncidents);
  };

  // Function to update an incident's status
  const updateIncidentStatus = (id: string, status: 'new' | 'in-progress' | 'resolved') => {
    const updatedIncidents = incidents.map(incident =>
      incident.id === id ? { ...incident, status } : incident
    );
    updateIncidents(updatedIncidents);
  };

  return (
    <ReviewerContext.Provider value={{ 
      incidents, 
      updateIncidents,
      addIncident,
      updateIncidentStatus,
      alertModalOpen,
      setAlertModalOpen
    }}>
      {children}
    </ReviewerContext.Provider>
  );
};