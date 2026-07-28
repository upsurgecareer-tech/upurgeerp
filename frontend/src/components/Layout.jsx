import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem,
  ListItemIcon, ListItemText, ListItemButton, useMediaQuery, useTheme,
  Collapse, Chip, Avatar, Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon, People as PeopleIcon,
  School as SchoolIcon, Assignment as AssignmentIcon, Payment as PaymentIcon,
  Logout as LogoutIcon, CheckCircle as CheckCircleIcon, BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon, EventNote as EventNoteIcon, ListAlt as ListAltIcon,
  Work as WorkIcon, Assessment as AssessmentIcon, LibraryBooks as LibraryBooksIcon,
  Inventory as InventoryIcon, Email as EmailIcon, Quiz as QuizIcon,
  VideoLibrary as VideoLibraryIcon, EmojiEvents as EmojiEventsIcon,
  BusinessCenter as BusinessCenterIcon, ExpandLess, ExpandMore,
  AccountBalance as AccountBalanceIcon, Class as ClassIcon, AdminPanelSettings,
} from '@mui/icons-material';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import logo from '../assets/upsurgelogo.png';
import { hasAccess, getCurrentRole, isAdmin } from '../config/permissions';

const drawerWidth = 240;

// Role badge colors — match actual DB role names
const roleBadge = {
  'super admin':          { bg: '#fee2e2', color: '#991b1b', label: 'Super Admin' },
  'branch admin':         { bg: '#fef9c3', color: '#854d0e', label: 'Branch Admin' },
  'faculty':              { bg: '#f0fdf4', color: '#166534', label: 'Faculty' },
  'counsellor':           { bg: '#eff6ff', color: '#1d4ed8', label: 'Counsellor' },
  'counselling':          { bg: '#eff6ff', color: '#1d4ed8', label: 'Counselling' },
  'cashier':              { bg: '#fff7ed', color: '#9a3412', label: 'Cashier' },
  'hr':                   { bg: '#f3e8ff', color: '#7e22ce', label: 'HR' },
  'hr manager':           { bg: '#f3e8ff', color: '#7e22ce', label: 'HR Manager' },
  'accountant':           { bg: '#ecfdf5', color: '#047857', label: 'Accountant' },
  'receptionist':         { bg: '#fdf2f8', color: '#be185d', label: 'Receptionist' },
  'academic coordinator': { bg: '#e0f2fe', color: '#0369a1', label: 'Coordinator' },
  'placement officer':    { bg: '#f0fdf4', color: '#15803d', label: 'Placement Officer' },
  'marketing lead':       { bg: '#fef2f2', color: '#b91c1c', label: 'Marketing Lead' },
  'it admin':             { bg: '#f1f5f9', color: '#334155', label: 'IT Admin' },
  'librarian':            { bg: '#fffbeb', color: '#b45309', label: 'Librarian' },
  'transport manager':    { bg: '#eff6ff', color: '#2563eb', label: 'Transport Mgr' },
  'hostel warden':        { bg: '#faf5ff', color: '#7e22ce', label: 'Hostel Warden' },
};


const Layout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState(() => {
    const initial = {};
    const items = [
      { key: 'crm', paths: ['/crm', '/leads'] },
      { key: 'students', paths: ['/students', '/admissions'] },
      { key: 'academics', paths: ['/batches', '/attendance'] },
      { key: 'hrms', paths: ['/hrms'] },
      { key: 'finance', paths: ['/fees', '/accounting'] },
    ];
    items.forEach(({ key, paths }) => {
      if (paths.some(p => window.location.pathname.startsWith(p))) {
        initial[key] = true;
      }
    });
    return initial;
  });

  const user = authService.getCurrentUser();
  const roleName = getCurrentRole();
  const roleStyle = roleBadge[roleName] || { bg: '#f1f5f9', color: '#475569', label: roleName || 'User' };
  const adminUser = isAdmin();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuToggle = (menuKey) => setOpenMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }));
  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };
  const handleMenuClick = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  // All menu items — filtered by role
  const allMenuItems = [
    {
      text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard',
      section: 'dashboard',
    },
    {
      text: 'CRM', icon: <TrendingUpIcon />, key: 'crm', section: 'crm',
      childPaths: ['/crm', '/leads'],
      children: [
        { text: 'Overview', icon: <DashboardIcon />, path: '/crm/dashboard' },
        { text: 'Leads List', icon: <ListAltIcon />, path: '/crm/leads' },
        { text: 'Sales Pipeline', icon: <DashboardIcon />, path: '/crm/kanban' },
        { text: 'Follow Ups', icon: <EventNoteIcon />, path: '/crm/followups' },
        { text: 'Analytics', icon: <BarChartIcon />, path: '/crm/analytics' },
      ],
    },
    {
      text: 'Student Management', icon: <SchoolIcon />, key: 'students', section: 'students',
      childPaths: ['/students'],
      children: [
        { text: 'Overview', icon: <DashboardIcon />, path: '/students?tab=0' },
        { text: 'Students List', icon: <PeopleIcon />, path: '/students?tab=1' },
        { text: 'Admissions', icon: <SchoolIcon />, path: '/students?tab=2' },
        { text: 'Attendance', icon: <CheckCircleIcon />, path: '/students?tab=3' },
        { text: 'Fees Management', icon: <PaymentIcon />, path: '/students?tab=4' },
        { text: 'Documents', icon: <AssignmentIcon />, path: '/students?tab=5' },
        { text: 'Academics', icon: <ClassIcon />, path: '/students?tab=6' },
        { text: 'Batches', icon: <ClassIcon />, path: '/students?tab=7' },
        { text: 'Communication', icon: <EmailIcon />, path: '/students?tab=8' },
      ],
    },
    {
      text: 'LMS', icon: <VideoLibraryIcon />, path: '/lms', section: 'lms',
    },
    {
      text: 'HRMS', icon: <BusinessCenterIcon />, key: 'hrms', section: 'hrms',
      childPaths: ['/hrms'],
      children: [
        { text: 'Overview', icon: <DashboardIcon />, path: '/hrms?module=0' },
        {
          text: 'Core HR & Financials', icon: <PeopleIcon />, key: 'hrms_core',
          children: [
            { text: 'Employees', icon: <PeopleIcon />, path: '/hrms?module=1' },
            { text: 'Attendance', icon: <CheckCircleIcon />, path: '/hrms?module=2' },
            { text: 'Leave', icon: <EventNoteIcon />, path: '/hrms?module=3' },
            { text: 'Payroll', icon: <PaymentIcon />, path: '/hrms?module=4' },
          ]
        },
        {
          text: 'Operations & Talent', icon: <TrendingUpIcon />, key: 'hrms_ops',
          children: [
            { text: 'Recruitment', icon: <WorkIcon />, path: '/hrms?module=5' },
            { text: 'Performance', icon: <TrendingUpIcon />, path: '/hrms?module=7' },
            { text: 'Tasks', icon: <AssignmentIcon />, path: '/hrms?module=8' },
            { text: 'Shifts', icon: <EventNoteIcon />, path: '/hrms?module=12' },
          ]
        },
        {
          text: 'Assets & Training', icon: <InventoryIcon />, key: 'hrms_assets',
          children: [
            { text: 'Assets', icon: <InventoryIcon />, path: '/hrms?module=10' },
            { text: 'Training', icon: <SchoolIcon />, path: '/hrms?module=9' },
          ]
        },
        {
          text: 'System & Comms', icon: <AdminPanelSettings />, key: 'hrms_sys',
          children: [
            { text: 'Communication', icon: <EmailIcon />, path: '/hrms?module=11' },
            { text: 'Self Service', icon: <PeopleIcon />, path: '/hrms?module=6' },
            { text: 'Reports', icon: <BarChartIcon />, path: '/hrms?module=13' },
            { text: 'Access Control', icon: <BusinessCenterIcon />, path: '/hrms?module=14' },
            { text: 'Security', icon: <CheckCircleIcon />, path: '/hrms?module=15' },
            { text: 'AI Features', icon: <SchoolIcon />, path: '/hrms?module=16' },
            { text: 'Integration', icon: <DashboardIcon />, path: '/hrms?module=17' },
          ]
        }
      ],
    },
    {
      text: 'Finance & Accounting', icon: <AccountBalanceIcon />, path: '/finance', section: 'finance',
    },
    {
      text: 'Library', icon: <LibraryBooksIcon />, path: '/library', section: 'library',
    },
    {
      text: 'Inventory', icon: <InventoryIcon />, path: '/inventory', section: 'inventory',
    },
    {
      text: 'Reports', icon: <BarChartIcon />, path: '/reports', section: 'reports',
    },
    // Admin-only: User Management
    ...(adminUser ? [{
      text: 'User Management', icon: <AdminPanelSettings />, path: '/admin/users',
      section: 'admin',
      adminOnly: true,
    }] : []),
  ];

  // If role is faculty, hide Admissions and Fees Management from Students menu
  if (roleName === 'faculty') {
    const studentsMenu = allMenuItems.find(item => item.key === 'students');
    if (studentsMenu && studentsMenu.children) {
      studentsMenu.children = studentsMenu.children.filter(
        child => child.text !== 'Admissions' && child.text !== 'Fees Management'
      );
    }
  }

  // Filter menu by role permissions
  let menuItems = allMenuItems.filter(item => hasAccess(roleName, item.section));

  // For faculty and HR roles, remove top-level general Dashboard to prevent double dashboard in sidebar
  if (roleName === 'faculty' || roleName === 'hr manager' || roleName === 'hr') {
    menuItems = menuItems.filter(item => item.section !== 'dashboard');
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)' }}>
      <Toolbar sx={{ bgcolor: 'transparent', color: 'black', minHeight: '64px !important', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <img src={logo} alt="Upsurge ERP" style={{ height: '50px', objectFit: 'contain' }} />
      </Toolbar>

      {/* User info + Role badge */}
      <Box sx={{ px: 2, py: 2, borderBottom: '1px solid rgba(0,0,0,0.05)', bgcolor: 'rgba(250, 250, 250, 0.5)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: roleStyle.color, fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography component="div" variant="body2" fontWeight={700} noWrap>{user?.first_name} {user?.last_name}</Typography>
            <Box component="div" sx={{ mt: 0.3 }}>
              <Chip
                label={roleStyle.label}
                size="small"
                sx={{ bgcolor: roleStyle.bg, color: roleStyle.color, fontWeight: 700, fontSize: '0.68rem', height: 18 }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        <List sx={{ py: 1 }}>
          {menuItems.map((item) => (
            <Box key={item.text}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={item.children
                    ? item.childPaths?.some(path => location.pathname.startsWith(path))
                    : location.pathname === item.path}
                  onClick={() => {
                    if (item.children) {
                      handleMenuToggle(item.key);
                    } else {
                      handleMenuClick(item.path);
                    }
                  }}
                  sx={{
                    mx: 1, my: 0.5, borderRadius: 2,
                    transition: 'all 0.2s ease',
                    ...(item.adminOnly ? { bgcolor: 'rgba(239,68,68,0.06)', '&:hover': { bgcolor: 'rgba(239,68,68,0.12)', transform: 'translateY(-1px)' } } : {}),
                    '&.Mui-selected': {
                      bgcolor: item.adminOnly ? '#ef4444' : 'primary.main',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                      '&:hover': { bgcolor: item.adminOnly ? '#dc2626' : 'primary.dark' },
                      '& .MuiListItemIcon-root': { color: 'white' },
                    },
                    '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-1px)' },
                  }}
                >
                  <ListItemIcon sx={{
                    color: item.adminOnly ? '#ef4444' : 'primary.main',
                    minWidth: 40,
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: item.adminOnly ? '#ef4444' : 'inherit',
                    }}
                  />
                  {item.children && (openMenus[item.key] ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>

              {item.children && (
                <Collapse in={openMenus[item.key]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <Box key={child.text}>
                        <ListItem disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            selected={child.path && (location.search ? location.pathname + location.search === child.path : location.pathname === child.path)}
                            onClick={() => {
                              if (child.children) {
                                handleMenuToggle(child.key);
                              } else {
                                handleMenuClick(child.path);
                              }
                            }}
                            sx={{
                              mx: 1, pl: child.children ? 3 : 4, borderRadius: 1,
                              '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } },
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                          >
                            <ListItemIcon sx={{ color: 'text.secondary', minWidth: 35 }}>{child.icon}</ListItemIcon>
                            <ListItemText primary={child.text} primaryTypographyProps={{ fontSize: '0.813rem', fontWeight: child.children ? 600 : 400 }} />
                            {child.children && (openMenus[child.key] ? <ExpandLess sx={{ fontSize: '1rem' }} /> : <ExpandMore sx={{ fontSize: '1rem' }} />)}
                          </ListItemButton>
                        </ListItem>
                        {child.children && (
                          <Collapse in={openMenus[child.key]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              {child.children.map((subchild) => (
                                <ListItem key={subchild.text} disablePadding sx={{ mb: 0.5 }}>
                                  <ListItemButton
                                    selected={location.search ? location.pathname + location.search === subchild.path : location.pathname === subchild.path}
                                    onClick={() => handleMenuClick(subchild.path)}
                                    sx={{
                                      mx: 1, pl: 6, borderRadius: 1,
                                      '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } },
                                      '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                  >
                                    <ListItemIcon sx={{ color: 'text.secondary', minWidth: 35 }}>{subchild.icon}</ListItemIcon>
                                    <ListItemText primary={subchild.text} primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 400 }} />
                                  </ListItemButton>
                                </ListItem>
                              ))}
                            </List>
                          </Collapse>
                        )}
                      </Box>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <AppBar position="fixed" sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
        ml: { xs: 0, md: `${drawerWidth}px` },
        bgcolor: 'rgba(255, 255, 255, 0.8)', 
        color: 'text.primary',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
            {title || 'Dashboard'}
          </Typography>
          {adminUser && (
            <Tooltip title="User Management">
              <IconButton color="inherit" onClick={() => navigate('/admin/users')} sx={{ mr: 1, color: '#ef4444' }}>
                <AdminPanelSettings />
              </IconButton>
            </Tooltip>
          )}
          <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' }, color: 'text.secondary' }}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} sx={{ color: 'text.primary' }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
        {drawer}
      </Drawer>

      <Drawer variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, height: '100vh', overflowY: 'auto', borderRight: '1px solid rgba(0,0,0,0.05)', bgcolor: 'transparent' } }}
        open>
        {drawer}
      </Drawer>

      <Box component="main" sx={{
        flexGrow: 1, p: { xs: 2, sm: 3 }, mt: '64px',
        width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
        minHeight: 'calc(100vh - 64px)', 
        bgcolor: 'background.default',
        boxSizing: 'border-box', overflowX: 'hidden',
      }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
