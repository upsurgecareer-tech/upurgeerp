import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import {
  People, School, EventAvailable, Payment, Description, Assessment, Class, TrendingUp
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../../services/api';
import { authService } from '../../services/authService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardTab = ({ onRefresh }) => {
  const user = authService.getCurrentUser();
  const isFaculty = (user?.role_name || '').toLowerCase().trim() === 'faculty';

  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    presentToday: 0,
    feePending: 0,
    totalBatches: 0,
    documentsVerified: 0,
    pendingAdmissions: 0,
    upcomingExams: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsRes, batchesRes] = await Promise.all([
        api.get('/students'),
        api.get('/batches'),
      ]);

      const students = studentsRes.data.students || studentsRes.data || [];
      const batches = batchesRes.data.batches || [];

      setStats({
        totalStudents: students.length,
        activeStudents: students.filter(s => s.status === 'active' || s.status === 'Active').length,
        presentToday: Math.floor(students.length * 0.85),
        feePending: Math.floor(students.length * 0.30),
        totalBatches: batches.length,
        documentsVerified: Math.floor(students.length * 0.90),
        pendingAdmissions: Math.floor(students.length * 0.05),
        upcomingExams: 3,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography color="textSecondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                <TrendingUp fontSize="small" color="success" />
                <Typography variant="caption" color="success.main">
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const attendanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Attendance %',
        data: [85, 88, 82, 90, 87, 84],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const admissionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Admissions',
        data: [45, 52, 38, 65, 58, 72],
        backgroundColor: '#2e7d32',
      },
    ],
  };

  const feeData = {
    labels: ['Paid', 'Pending', 'Overdue'],
    datasets: [
      {
        data: [70, 20, 10],
        backgroundColor: ['#2e7d32', '#ed6c02', '#d32f2f'],
      },
    ],
  };

  const recentActivities = [
    { id: 1, activity: 'New admission: John Doe', time: '5 mins ago', type: 'admission' },
    { id: 2, activity: 'Fee payment received: ₹25,000', time: '15 mins ago', type: 'payment' },
    { id: 3, activity: 'Attendance marked for Batch A', time: '1 hour ago', type: 'attendance' },
    { id: 4, activity: 'Document verified: Jane Smith', time: '2 hours ago', type: 'document' },
  ];

  const filteredActivities = isFaculty 
    ? recentActivities.filter(a => a.type !== 'admission' && a.type !== 'payment')
    : recentActivities;

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Student Management Dashboard
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Overview of all student management activities and statistics
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<People />}
            color="#1976d2"
            subtitle={`${stats.activeStudents} active`}
            trend="+12% this month"
          />
        </Grid>
        {!isFaculty && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Admissions"
              value={stats.pendingAdmissions}
              icon={<School />}
              color="#2e7d32"
              subtitle="New applications"
              trend="+5 today"
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={isFaculty ? 4 : 3}>
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            icon={<EventAvailable />}
            color="#ed6c02"
            subtitle={`${((stats.presentToday / stats.totalStudents) * 100).toFixed(1)}% attendance`}
          />
        </Grid>
        {!isFaculty && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Fee Pending"
              value={stats.feePending}
              icon={<Payment />}
              color="#d32f2f"
              subtitle="Students with dues"
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={isFaculty ? 4 : 3}>
          <StatCard
            title="Documents Verified"
            value={stats.documentsVerified}
            icon={<Description />}
            color="#0288d1"
            subtitle={`${((stats.documentsVerified / stats.totalStudents) * 100).toFixed(0)}% complete`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={isFaculty ? 4 : 3}>
          <StatCard
            title="Upcoming Exams"
            value={stats.upcomingExams}
            icon={<Assessment />}
            color="#9c27b0"
            subtitle="This month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={isFaculty ? 6 : 3}>
          <StatCard
            title="Total Batches"
            value={stats.totalBatches}
            icon={<Class />}
            color="#f57c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={isFaculty ? 6 : 3}>
          <StatCard
            title="Communications"
            value="245"
            icon={<Assessment />}
            color="#00897b"
            subtitle="This month"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={isFaculty ? 12 : 6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Weekly Attendance Trend</Typography>
            <Line data={attendanceData} options={{ responsive: true, maintainAspectRatio: true }} />
          </Paper>
        </Grid>
        {!isFaculty && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Monthly Admissions</Typography>
              <Bar data={admissionData} options={{ responsive: true, maintainAspectRatio: true }} />
            </Paper>
          </Grid>
        )}
      </Grid>

      <Grid container spacing={2}>
        {!isFaculty && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Fee Collection Status</Typography>
              <Doughnut data={feeData} options={{ responsive: true, maintainAspectRatio: true }} />
            </Paper>
          </Grid>
        )}
        <Grid item xs={12} md={isFaculty ? 12 : 8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Activities</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Activity</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.activity}</TableCell>
                      <TableCell>{activity.time}</TableCell>
                      <TableCell>
                        <Chip
                          label={activity.type}
                          size="small"
                          color={
                            activity.type === 'admission' ? 'success' :
                            activity.type === 'payment' ? 'primary' :
                            activity.type === 'attendance' ? 'warning' : 'info'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardTab;
