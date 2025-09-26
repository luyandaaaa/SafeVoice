import React from 'react';
import { useReviewer } from '@/contexts/ReviewerContext';
import { DashboardStats } from './ReviewerDashboardStats';
import { AlertModal } from './ReviewerAlertModal';
import { AnalyticsSection } from './ReviewerAnalyticsSection';
import { IncidentTable } from './ReviewerIncidentTable';

export const ReviewerDashboardWrapper = () => {
  const { incidents } = useReviewer();
  return <DashboardStats incidents={incidents} />;
};

export const ReviewerAlertWrapper = () => {
  const { alertModalOpen, setAlertModalOpen } = useReviewer();
  return (
    <AlertModal 
      open={alertModalOpen} 
      onOpenChange={setAlertModalOpen} 
    />
  );
};

export const ReviewerAnalyticsWrapper = () => {
  const { incidents } = useReviewer();
  return <AnalyticsSection incidents={incidents} />;
};

export const ReviewerIncidentTableWrapper = () => {
  const { incidents, updateIncidents } = useReviewer();
  return (
    <IncidentTable 
      incidents={incidents} 
      updateIncidents={updateIncidents}
    />
  );
};