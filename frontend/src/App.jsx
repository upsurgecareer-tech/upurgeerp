import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Admissions from './pages/Admissions';
import StudentDocuments from './pages/Documents';
import Batches from './pages/Batches';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import Staff from './pages/Staff';
import Reports from './pages/Reports';
import Academics from './pages/Academics';
import CRMAnalytics from './pages/CRM/CRMAnalytics';
import FollowUps from './pages/CRM/FollowUps';
import LeadsList from './pages/CRM/LeadsList';
import LeadKanban from './pages/CRM/LeadKanban';
import LeadDetail from './pages/CRM/LeadDetail';
import CRMDashboard from './pages/CRM/CRMDashboard';
import HRMS from './pages/HRMS';
import HRMSDashboard from './pages/HRMS/HRMSDashboard';
import Employees from './pages/HRMS/Employees';
import EmployeeOnboarding from './pages/HRMS/EmployeeOnboarding';

import Departments from './pages/HRMS/Departments';
import Designations from './pages/HRMS/Designations';
import HRMSDocuments from "./pages/HRMS/EmployeeDocuments";

import EmployeeReports from './pages/HRMS/EmployeeReports';
import AttendanceManagement from './pages/HRMS/AttendanceManagement';
import LeaveManagement from './pages/HRMS/LeaveManagement';
import PayrollManagement from './pages/HRMS/PayrollManagement';
import RecruitmentManagement from './pages/HRMS/RecruitmentManagement';
import PerformanceManagement from './pages/HRMS/PerformanceManagement';
import TaskProjectManagement from './pages/HRMS/TaskProjectManagement';
import TrainingManagement from './pages/HRMS/TrainingManagement';
import AssetManagement from './pages/HRMS/AssetManagement';
import CommunicationManagement from './pages/HRMS/CommunicationManagement';
import ShiftScheduling from './pages/HRMS/ShiftScheduling';
import RoleAccessControl from './pages/HRMS/RoleAccessControl';
import SecurityFeatures from './pages/HRMS/SecurityFeatures';
import AIFeatures from './pages/HRMS/AIFeatures';
import MobileIntegration from './pages/HRMS/MobileIntegration';
import StudentLogin from './pages/StudentPortal/StudentLogin';
import StudentDashboard from './pages/StudentPortal/StudentDashboard';
import StudentAttendance from './pages/StudentPortal/StudentAttendance';
import StudentAssignments from './pages/StudentPortal/StudentAssignments';
import StudentStudyMaterials from './pages/StudentPortal/StudentStudyMaterials';
import StudentCertificates from './pages/StudentPortal/StudentCertificates';
import StudentProfile from './pages/StudentPortal/StudentProfile';
import UserManagement from './pages/Admin/UserManagement';
import FinanceDashboard from './pages/Finance/FinanceDashboard';
import PrivateRoute from './components/PrivateRoute';

// Import newly created Library and Inventory components
import LibraryDashboard from './pages/Library/LibraryDashboard';
import InventoryDashboard from './pages/Inventory/InventoryDashboard';

// Import LMS Dashboard
import LMSDashboard from './pages/LMS/LMSDashboard';

// Import Communication Dashboard
import CommunicationDashboard from './pages/Communication/CommunicationDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4f46e5', // Deep Indigo
      light: '#818cf8',
      dark: '#3730a3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899', // Pink
      light: '#f472b6',
      dark: '#be185d',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Sleek slate gray
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <PrivateRoute>
                <Leads />
              </PrivateRoute>
            }
          />
          <Route
            path="/students"
            element={
              <PrivateRoute>
                <Students />
              </PrivateRoute>
            }
          />
          <Route
            path="/students/:id"
            element={
              <PrivateRoute>
                <StudentDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/admissions"
            element={
              <PrivateRoute>
                <Admissions />
              </PrivateRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <PrivateRoute>
                <StudentDocuments />
              </PrivateRoute>
            }
          />
          <Route
            path="/batches"
            element={
              <PrivateRoute>
                <Batches />
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <PrivateRoute>
                <Attendance />
              </PrivateRoute>
            }
          />
          <Route
            path="/fees"
            element={
              <PrivateRoute>
                <Fees />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <PrivateRoute>
                <Staff />
              </PrivateRoute>
            }
          />
          <Route
            path="/academics"
            element={
              <PrivateRoute>
                <Academics />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route path="/crm/dashboard" element={<PrivateRoute><CRMDashboard /></PrivateRoute>} />
          <Route path="/crm/analytics" element={<PrivateRoute><CRMAnalytics /></PrivateRoute>} />
          <Route path="/crm/followups" element={<PrivateRoute><FollowUps /></PrivateRoute>} />
          <Route path="/crm/leads" element={<PrivateRoute><LeadsList /></PrivateRoute>} />
          <Route path="/crm/kanban" element={<PrivateRoute><LeadKanban /></PrivateRoute>} />
          <Route path="/crm/lead/:id" element={<PrivateRoute><LeadDetail /></PrivateRoute>} />
          <Route path="/hrms" element={<PrivateRoute><HRMS /></PrivateRoute>} />
          <Route path="/hrms/dashboard" element={<PrivateRoute><HRMSDashboard /></PrivateRoute>} />
          <Route path="/hrms/employees" element={<PrivateRoute><Employees /></PrivateRoute>} />
          <Route path="/hrms/leaves" element={<PrivateRoute><LeaveManagement /></PrivateRoute>} />
          <Route path="/hrms/departments" element={<PrivateRoute><Departments /></PrivateRoute>} />
          <Route path="/hrms/designations" element={<PrivateRoute><Designations /></PrivateRoute>} />
          <Route path="/hrms/documents" element={<PrivateRoute><HRMSDocuments /></PrivateRoute>} />
          <Route path="/hrms/reports" element={<PrivateRoute><EmployeeReports /></PrivateRoute>} />
          
          {/* New 17 Modules Routes */}
          <Route path="/hrms/attendance" element={<PrivateRoute><AttendanceManagement /></PrivateRoute>} />
          <Route path="/hrms/payroll" element={<PrivateRoute><PayrollManagement /></PrivateRoute>} />
          <Route path="/hrms/recruitment" element={<PrivateRoute><RecruitmentManagement /></PrivateRoute>} />
          <Route path="/hrms/performance" element={<PrivateRoute><PerformanceManagement /></PrivateRoute>} />
          <Route path="/hrms/tasks" element={<PrivateRoute><TaskProjectManagement /></PrivateRoute>} />
          <Route path="/hrms/training" element={<PrivateRoute><TrainingManagement /></PrivateRoute>} />
          <Route path="/hrms/assets" element={<PrivateRoute><AssetManagement /></PrivateRoute>} />
          <Route path="/hrms/communication" element={<PrivateRoute><CommunicationManagement /></PrivateRoute>} />
          <Route path="/hrms/shifts" element={<PrivateRoute><ShiftScheduling /></PrivateRoute>} />
          <Route path="/hrms/access-control" element={<PrivateRoute><RoleAccessControl /></PrivateRoute>} />
          <Route path="/hrms/security" element={<PrivateRoute><SecurityFeatures /></PrivateRoute>} />
          <Route path="/hrms/ai-features" element={<PrivateRoute><AIFeatures /></PrivateRoute>} />
          <Route path="/hrms/mobile-integration" element={<PrivateRoute><MobileIntegration /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute adminOnly><UserManagement /></PrivateRoute>} />
          <Route path="/finance" element={<PrivateRoute><FinanceDashboard /></PrivateRoute>} />
          
          {/* New Library & Inventory Routes */}
          <Route path="/library" element={<PrivateRoute><LibraryDashboard /></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><InventoryDashboard /></PrivateRoute>} />
          
          {/* Coaching Classes LMS Route */}
          <Route path="/lms" element={<PrivateRoute><LMSDashboard /></PrivateRoute>} />
          
          {/* Communication Engine Route */}
          <Route path="/communication" element={<PrivateRoute><CommunicationDashboard /></PrivateRoute>} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}

export default App;
