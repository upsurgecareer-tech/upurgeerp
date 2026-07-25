import { useState } from 'react';
import { Box, Tabs, Tab, Typography, Button } from '@mui/material';
import Employees from './Employees';
import Departments from './Departments';
import Designations from './Designations';
import EmployeeDocuments from './EmployeeDocuments';
import ExperienceEducation from './ExperienceEducation';
import StatusManagement from './StatusManagement';
import EmployeeReports from './EmployeeReports';

import EmployeeOnboarding from './EmployeeOnboarding';

export default function EmployeeManagement() {
  const [activeTab, setActiveTab] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  if (showOnboarding) {
    return (
      <Box>
        <Button 
          onClick={() => setShowOnboarding(false)} 
          sx={{ mb: 2 }} 
          variant="outlined"
        >
          &larr; Back to Employees
        </Button>
        <EmployeeOnboarding />
      </Box>
    );
  }

  const tabs = [
    { label: 'Employee List', component: <Employees onAdd={() => setShowOnboarding(true)} /> },
    { label: 'Departments', component: <Departments /> },
    { label: 'Designations', component: <Designations /> },
    { label: 'Documents', component: <EmployeeDocuments /> },
    { label: 'Experience & Education', component: <ExperienceEducation /> },
    { label: 'Status Management', component: <StatusManagement /> },
    { label: 'Reports', component: <EmployeeReports /> }
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Employee Management</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
          {tabs.map((tab, idx) => <Tab key={idx} label={tab.label} />)}
        </Tabs>
      </Box>
      {tabs[activeTab]?.component}
    </Box>
  );
}
