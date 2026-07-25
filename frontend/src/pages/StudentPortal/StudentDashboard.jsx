import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button,
  CircularProgress, Avatar, LinearProgress, Paper, Table, TableBody,
  TableCell, TableHead, TableRow, Chip, IconButton
} from '@mui/material';
import {
  EventNote, Payment, Description, EmojiEvents, Logout,
  Assignment, VideoLibrary, Download, Refresh
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const studentInfo = JSON.parse(localStorage.getItem('student_info') || '{}');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('student_token');
      const res = await api.get('/student-portal/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboard(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_info');
    toast.success('Logged out successfully');
    navigate('/student-login');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const { student, stats, recentAttendance } = dashboard || {};

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 24 }}>
                {student?.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">{student?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {student?.admission_no} • {student?.course}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={fetchDashboard}>
                <Refresh />
              </IconButton>
              <Button variant="outlined" startIcon={<Logout />} onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: 'success.light', p: 1.5, borderRadius: 2 }}>
                    <EventNote sx={{ color: 'success.dark' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Attendance</Typography>
                    <Typography variant="h5" fontWeight="bold">{stats?.attendance?.percentage || 0}%</Typography>
                    <Typography variant="caption">{stats?.attendance?.present}/{stats?.attendance?.total} classes</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: stats?.fees?.status === 'Paid' ? 'success.light' : 'warning.light', p: 1.5, borderRadius: 2 }}>
                    <Payment sx={{ color: stats?.fees?.status === 'Paid' ? 'success.dark' : 'warning.dark' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Fee Status</Typography>
                    <Typography variant="h5" fontWeight="bold">₹{stats?.fees?.pending || 0}</Typography>
                    <Typography variant="caption">Pending</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: 'info.light', p: 1.5, borderRadius: 2 }}>
                    <Description sx={{ color: 'info.dark' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Documents</Typography>
                    <Typography variant="h5" fontWeight="bold">{stats?.documents || 0}</Typography>
                    <Typography variant="caption">Uploaded</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: 'primary.light', p: 1.5, borderRadius: 2 }}>
                    <EmojiEvents sx={{ color: 'primary.dark' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Certificates</Typography>
                    <Typography variant="h5" fontWeight="bold">{stats?.certificates || 0}</Typography>
                    <Typography variant="caption">Issued</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Links */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Quick Access</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EventNote />}
                      onClick={() => navigate('/student-portal/attendance')}
                      sx={{ py: 2 }}
                    >
                      Attendance
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Assignment />}
                      onClick={() => navigate('/student-portal/assignments')}
                      sx={{ py: 2 }}
                    >
                      Assignments
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<VideoLibrary />}
                      onClick={() => navigate('/student-portal/study-materials')}
                      sx={{ py: 2 }}
                    >
                      Study Materials
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EmojiEvents />}
                      onClick={() => navigate('/student-portal/certificates')}
                      sx={{ py: 2 }}
                    >
                      Certificates
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Attendance Progress</Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Overall</Typography>
                    <Typography variant="body2" fontWeight="bold">{stats?.attendance?.percentage || 0}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(stats?.attendance?.percentage || 0)}
                    sx={{ height: 10, borderRadius: 5 }}
                    color={parseFloat(stats?.attendance?.percentage || 0) >= 75 ? 'success' : 'error'}
                  />
                </Box>
                {parseFloat(stats?.attendance?.percentage || 0) < 75 && (
                  <Typography variant="caption" color="error">
                    ⚠️ Attendance below 75%. Not eligible for certification.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Attendance */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Recent Attendance</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Batch</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentAttendance?.length > 0 ? (
                  recentAttendance.map((att, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(att.attendance_date).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>{att.batch?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={att.status}
                          size="small"
                          color={att.status === 'Present' ? 'success' : att.status === 'Late' ? 'warning' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{att.marked_at ? new Date(att.marked_at).toLocaleTimeString('en-IN') : 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No attendance records</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
