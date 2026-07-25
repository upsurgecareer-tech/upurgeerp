import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, CircularProgress, Divider, Paper } from '@mui/material';
import { People, EventNote, MonetizationOn, TrendingUp, Work, GetApp, Inventory, Assignment } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const accent = '#0ea5e9';

export default function ReportsAnalytics() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    employees: 0,
    leaves: 0,
    jobs: 0,
    assets: 0,
    tasks: 0,
    candidates: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [empRes, leavesRes, jobsRes, assetsRes, tasksRes, candRes] = await Promise.allSettled([
        api.get('/hrms/employees'),
        api.get('/hrms/leaves'),
        api.get('/hrms/recruitment/jobs'),
        api.get('/hrms/assets'),
        api.get('/hrms/tasks'),
        api.get('/hrms/recruitment/candidates')
      ]);

      setStats({
        employees: empRes.status === 'fulfilled' ? (empRes.value.data.employees?.length || empRes.value.data?.length || 0) : 0,
        leaves: leavesRes.status === 'fulfilled' ? (leavesRes.value.data.leaves?.filter(l => l.status === 'Pending').length || 0) : 0,
        jobs: jobsRes.status === 'fulfilled' ? (jobsRes.value.data.jobs?.filter(j => j.status === 'Open').length || 0) : 0,
        assets: assetsRes.status === 'fulfilled' ? (assetsRes.value.data.assets?.length || 0) : 0,
        tasks: tasksRes.status === 'fulfilled' ? (tasksRes.value.data.tasks?.filter(t => t.status !== 'Done').length || 0) : 0,
        candidates: candRes.status === 'fulfilled' ? (candRes.value.data.candidates?.length || 0) : 0
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const reportCards = [
    { title: 'Employee Reports', desc: 'Active vs Inactive, Department wise', icon: <People fontSize="large" />, color: '#3b82f6', stat: stats.employees, statLabel: 'Total Employees' },
    { title: 'Attendance & Leaves', desc: 'Monthly attendance, leave balances', icon: <EventNote fontSize="large" />, color: '#10b981', stat: stats.leaves, statLabel: 'Pending Leaves' },
    { title: 'Payroll Reports', desc: 'Salary processing, taxes, deductions', icon: <MonetizationOn fontSize="large" />, color: '#f59e0b', stat: '-', statLabel: 'Payroll Cycles' },
    { title: 'Recruitment Analytics', desc: 'Time to hire, candidate pipeline', icon: <Work fontSize="large" />, color: '#8b5cf6', stat: stats.jobs, statLabel: 'Open Jobs' },
    { title: 'Asset Management', desc: 'Asset allocation, maintenance tracking', icon: <Inventory fontSize="large" />, color: '#ec4899', stat: stats.assets, statLabel: 'Total Assets' },
    { title: 'Task & Productivity', desc: 'Timesheets, project task progress', icon: <Assignment fontSize="large" />, color: '#14b8a6', stat: stats.tasks, statLabel: 'Active Tasks' }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(14,165,233,0.12)', color: accent, display: 'flex' }}>
            <TrendingUp fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Reports & Analytics</Typography>
            <Typography variant="body2" color="text.secondary">Gain insights into HR metrics and generate comprehensive reports.</Typography>
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<GetApp />} sx={{ borderRadius: 2, fontWeight: 700, borderColor: accent, color: accent }}>
          Export All Data
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {reportCards.map((r, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{ 
                borderRadius: 3, 
                border: '1px solid rgba(226,232,240,0.8)', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
                transition: 'all 0.2s', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(0,0,0,0.1)' },
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ p: 3, flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${r.color}15`, color: r.color, display: 'inline-flex' }}>
                      {r.icon}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>{r.stat}</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>{r.statLabel}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#0f172a' }}>{r.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{r.desc}</Typography>
                </CardContent>
                <Divider />
                <Box sx={{ p: 2, bgcolor: '#f8fafc' }}>
                  <Button variant="text" fullWidth sx={{ color: r.color, fontWeight: 700, '&:hover': { bgcolor: `${r.color}11` } }}>
                    Generate Report &rarr;
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
