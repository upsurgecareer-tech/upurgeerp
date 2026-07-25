import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Box, Tabs, Tab } from '@mui/material';
import Layout from '../components/Layout';
import HRMSDashboard from './HRMS/HRMSDashboard';
import EmployeeManagement from './HRMS/EmployeeManagement';
import AttendanceManagement from './HRMS/AttendanceManagement';
import LeaveManagement from './HRMS/LeaveManagement';
import PayrollManagement from './HRMS/PayrollManagement';
import RecruitmentManagement from './HRMS/RecruitmentManagement';
import EmployeeSelfService from './HRMS/EmployeeSelfService';
import PerformanceManagement from './HRMS/PerformanceManagement';
import TaskProjectManagement from './HRMS/TaskProjectManagement';
import TrainingManagement from './HRMS/TrainingManagement';
import AssetManagement from './HRMS/AssetManagement';
import CommunicationManagement from './HRMS/CommunicationManagement';
import ShiftScheduling from './HRMS/ShiftScheduling';
import ReportsAnalytics from './HRMS/ReportsAnalytics';
import RoleAccessControl from './HRMS/RoleAccessControl';
import SecurityFeatures from './HRMS/SecurityFeatures';
import AIFeatures from './HRMS/AIFeatures';
import MobileIntegration from './HRMS/MobileIntegration';

const HRMS = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeModule = parseInt(searchParams.get('module')) || 0;

  useEffect(() => {
    if (!searchParams.get('module')) {
      navigate('/hrms?module=0', { replace: true });
    }
  }, [searchParams, navigate]);

  const modules = [
    { label: '📊 Dashboard', component: <HRMSDashboard /> },
    { label: '📋 Employees', component: <EmployeeManagement /> },
    { label: '✅ Attendance', component: <AttendanceManagement /> },
    { label: '🏖️ Leave', component: <LeaveManagement /> },
    { label: '💰 Payroll', component: <PayrollManagement /> },
    { label: '🎯 Recruitment', component: <RecruitmentManagement /> },
    { label: '👤 Self Service', component: <EmployeeSelfService /> },
    { label: '📊 Performance', component: <PerformanceManagement /> },
    { label: '📝 Tasks', component: <TaskProjectManagement /> },
    { label: '🎓 Training', component: <TrainingManagement /> },
    { label: '💻 Assets', component: <AssetManagement /> },
    { label: '💬 Communication', component: <CommunicationManagement /> },
    { label: '🕐 Shifts', component: <ShiftScheduling /> },
    { label: '📈 Reports', component: <ReportsAnalytics /> },
    { label: '🔐 Access Control', component: <RoleAccessControl /> },
    { label: '🔒 Security', component: <SecurityFeatures /> },
    { label: '🤖 AI Features', component: <AIFeatures /> },
    { label: '📱 Integration', component: <MobileIntegration /> }
  ];

  const handleTabChange = (event, newValue) => {
    navigate(`/hrms?module=${newValue}`);
  };

  return (
    <Layout title="HRMS - Human Resource Management System">
      <Box sx={{ 
        mb: 4, 
        p: 1, 
        bgcolor: '#f8fafc', 
        borderRadius: 3,
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
        border: '1px solid #e2e8f0'
      }}>
        <Tabs 
          value={activeModule} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto"
          TabIndicatorProps={{ style: { display: 'none' } }}
          sx={{ 
            minHeight: 48,
            '& .MuiTabs-flexContainer': { gap: 1 },
            '& .MuiTab-root': { 
              minWidth: 'auto', 
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#64748b',
              borderRadius: 2,
              px: 3,
              py: 1,
              minHeight: 40,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                color: '#0f172a',
                bgcolor: '#f1f5f9',
                transform: 'translateY(-1px)'
              },
              '&.Mui-selected': {
                color: '#fff',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                fontWeight: 600
              }
            },
            '& .MuiTabs-scrollButtons': { 
              color: '#3b82f6',
              '&.Mui-disabled': { opacity: 0.3 } 
            }
          }}
        >
          {modules.map((module, index) => (
            <Tab key={index} label={module.label} disableRipple />
          ))}
        </Tabs>
      </Box>
      <Container maxWidth={false} sx={{ px: { xs: 0, sm: 1, md: 2 } }}>
        {modules[activeModule]?.component || <HRMSDashboard />}
      </Container>
    </Layout>
  );
};

export default HRMS;
