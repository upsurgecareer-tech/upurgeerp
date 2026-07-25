import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { People, EventNote, Assessment, Description, Folder, BarChart, Work, School, Laptop, Security, SmartToy, PhoneAndroid } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function HRMSDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    departments: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [employees, leaves, departments] = await Promise.all([
        api.get('/hrms/employees'),
        api.get('/hrms/leaves?status=Pending'),
        api.get('/hrms/departments')
      ]);

      setStats({
        totalEmployees: employees.data.employees?.length || employees.data?.length || 0,
        activeEmployees: (employees.data.employees || employees.data || []).filter(e => e.status === 'Active').length || 0,
        pendingLeaves: leaves.data.leaves?.length || leaves.data?.length || 0,
        departments: departments.data.departments?.length || departments.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const cards = [
    { title: 'Total Employees', value: stats.totalEmployees, icon: <People fontSize="large" />, gradient: 'linear-gradient(135deg, #3A1C71 0%, #D76D77 50%, #FFAF7B 100%)', module: 1 },
    { title: 'Active Employees', value: stats.activeEmployees, icon: <People fontSize="large" />, gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', module: 1 },
    { title: 'Pending Leaves', value: stats.pendingLeaves, icon: <EventNote fontSize="large" />, gradient: 'linear-gradient(135deg, #FF8008 0%, #FFC837 100%)', module: 3 },
    { title: 'Departments', value: stats.departments, icon: <Description fontSize="large" />, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', module: 1 }
  ];

  const modules = [
    { title: 'Employee Management', icon: <People />, color: '#3A1C71', bgcolor: '#F3E5F5', module: 1, desc: 'Manage employees, departments, designations' },
    { title: 'Attendance', icon: <EventNote />, color: '#00695C', bgcolor: '#E0F2F1', module: 2, desc: 'Track attendance, check-in/out, biometric' },
    { title: 'Leave Management', icon: <Folder />, color: '#E65100', bgcolor: '#FFF3E0', module: 3, desc: 'Leave applications, approvals, balance' },
    { title: 'Payroll', icon: <Assessment />, color: '#B71C1C', bgcolor: '#FFEBEE', module: 4, desc: 'Salary, payslip, PF/ESI, tax calculation' },
    { title: 'Recruitment', icon: <Work />, color: '#4A148C', bgcolor: '#F3E5F5', module: 5, desc: 'Job posting, candidates, interviews' },
    { title: 'Self Service', icon: <People />, color: '#01579B', bgcolor: '#E1F5FE', module: 6, desc: 'Employee portal, leave, payslip' },
    { title: 'Performance', icon: <BarChart />, color: '#1B5E20', bgcolor: '#E8F5E9', module: 7, desc: 'KPI, goals, appraisal, feedback' },
    { title: 'Tasks & Projects', icon: <Description />, color: '#E65100', bgcolor: '#FFF3E0', module: 8, desc: 'Task assignment, project management' },
    { title: 'Training', icon: <School />, color: '#311B92', bgcolor: '#EDE7F6', module: 9, desc: 'Training programs, certifications' },
    { title: 'Assets', icon: <Laptop />, color: '#004D40', bgcolor: '#E0F2F1', module: 10, desc: 'Laptop, ID cards, asset tracking' },
    { title: 'Communication', icon: <EventNote />, color: '#880E4F', bgcolor: '#FCE4EC', module: 11, desc: 'Email, SMS, WhatsApp, announcements' },
    { title: 'Shifts', icon: <EventNote />, color: '#0D47A1', bgcolor: '#E3F2FD', module: 12, desc: 'Shift management, scheduling' },
    { title: 'Reports', icon: <Assessment />, color: '#4A148C', bgcolor: '#F3E5F5', module: 13, desc: 'Analytics, reports, export' },
    { title: 'Access Control', icon: <Security />, color: '#BF360C', bgcolor: '#FBE9E7', module: 14, desc: 'Role-based access management' },
    { title: 'Security', icon: <Security />, color: '#b71c1c', bgcolor: '#FFEBEE', module: 15, desc: 'Login, OTP, audit logs' },
    { title: 'AI Features', icon: <SmartToy />, color: '#311B92', bgcolor: '#EDE7F6', module: 16, desc: 'AI chatbot support' },
    { title: 'Integration', icon: <PhoneAndroid />, color: '#006064', bgcolor: '#E0F7FA', module: 17, desc: 'Mobile, biometric, API' }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto" }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #1e293b, #334155)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          HRMS Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
          Complete Human Resource Management System with 17 Modules
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                borderRadius: 4,
                background: card.gradient,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 20px -10px rgba(0,0,0,0.15)',
                '&:hover': { 
                  transform: 'translateY(-5px) scale(1.02)',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' 
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%)',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                },
                '&:hover::before': { opacity: 1 }
              }} 
              onClick={() => navigate(`/hrms?module=${card.module}`)}
            >
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    backdropFilter: 'blur(10px)',
                    p: 1.5, 
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{card.value}</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>{card.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>
        Explore Modules
      </Typography>
      
      <Grid container spacing={3}>
        {modules.map((mod, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                borderRadius: 4,
                border: '1px solid rgba(226, 232, 240, 0.8)',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  transform: 'translateY(-5px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  borderColor: 'transparent'
                } 
              }} 
              onClick={() => navigate(`/hrms?module=${mod.module}`)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  bgcolor: mod.bgcolor, 
                  color: mod.color, 
                  p: 1.5, 
                  borderRadius: 3, 
                  display: 'inline-flex',
                  mb: 2,
                  boxShadow: `0 4px 12px ${mod.color}20`
                }}>
                  {mod.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
                  {mod.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6, fontWeight: 500 }}>
                  {mod.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
