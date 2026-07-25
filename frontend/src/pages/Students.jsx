import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Layout from '../components/Layout';
import { authService } from '../services/authService';

// Import all tab components
import DashboardTab from '../components/StudentManagement/DashboardTab';
import StudentsListTab from '../components/StudentManagement/StudentsListTab';
import AdmissionsTab from '../components/StudentManagement/AdmissionsTab';
import AttendanceTab from '../components/StudentManagement/AttendanceTab';
import FeesTab from '../components/StudentManagement/FeesTab';
import DocumentsTab from '../components/StudentManagement/DocumentsTab';
import AcademicsTab from '../components/StudentManagement/AcademicsTab';
import BatchesTab from '../components/StudentManagement/BatchesTab';
import CommunicationTab from '../components/StudentManagement/CommunicationTab';

const Students = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = parseInt(searchParams.get('tab')) || 0;
  const user = authService.getCurrentUser();
  const isFaculty = (user?.role_name || '').toLowerCase().trim() === 'faculty';

  useEffect(() => {
    // If no tab parameter, redirect to dashboard
    if (!searchParams.get('tab')) {
      navigate('/students?tab=0', { replace: true });
    } else if (isFaculty && (activeTab === 2 || activeTab === 4)) {
      // Prevent faculty from accessing Admissions or Fees
      navigate('/students?tab=0', { replace: true });
    }
  }, [searchParams, navigate, isFaculty, activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 0: return <DashboardTab />;
      case 1: return <StudentsListTab />;
      case 2: return <AdmissionsTab />;
      case 3: return <AttendanceTab />;
      case 4: return <FeesTab />;
      case 5: return <DocumentsTab />;
      case 6: return <AcademicsTab />;
      case 7: return <BatchesTab />;
      case 8: return <CommunicationTab />;
      default: return <DashboardTab />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 0: return 'Student Management Dashboard';
      case 1: return 'Students List';
      case 2: return 'Admissions';
      case 3: return 'Attendance';
      case 4: return 'Fees Management';
      case 5: return 'Documents';
      case 6: return 'Academics';
      case 7: return 'Batches';
      case 8: return 'Communication';
      default: return 'Student Management';
    }
  };

  return (
    <Layout title={getTitle()}>
      <Container maxWidth={false} sx={{ px: { xs: 0, sm: 1, md: 2 } }}>
        {renderContent()}
      </Container>
    </Layout>
  );
};

export default Students;
