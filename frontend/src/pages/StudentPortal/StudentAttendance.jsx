import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent, Button,
  CircularProgress, Table, TableBody, TableCell, TableHead,
  TableRow, Chip, Grid, MenuItem, TextField, LinearProgress, Paper, IconButton
} from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function StudentAttendance() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('student_token');
      const res = await api.get(`/student-portal/attendance?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(res.data.attendance);
      setSummary(res.data.summary);
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 3 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/student-portal/dashboard')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" fontWeight="bold">My Attendance</Typography>
          </Box>
          <IconButton onClick={fetchAttendance}>
            <Refresh />
          </IconButton>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Total Classes</Typography>
                <Typography variant="h4" fontWeight="bold">{summary?.total || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Present</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">{summary?.present || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Absent</Typography>
                <Typography variant="h4" fontWeight="bold" color="error.main">{summary?.absent || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Percentage</Typography>
                <Typography variant="h4" fontWeight="bold">{summary?.percentage || 0}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Progress Bar */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Attendance Progress</Typography>
              <Typography variant="body2" fontWeight="bold">{summary?.percentage || 0}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={parseFloat(summary?.percentage || 0)}
              sx={{ height: 10, borderRadius: 5 }}
              color={parseFloat(summary?.percentage || 0) >= 75 ? 'success' : 'error'}
            />
          </CardContent>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  {[...Array(12)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  {[2024, 2025, 2026].map(y => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Attendance Records</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
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
                  {attendance.length > 0 ? (
                    attendance.map((att, idx) => (
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
                      <TableCell colSpan={4} align="center">No attendance records for selected period</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
