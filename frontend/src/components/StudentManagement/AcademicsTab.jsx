import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Button, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TextField
} from '@mui/material';
import {
  MenuBook, Assignment, Quiz, EmojiEvents, Description, VideoLibrary, TrendingUp, Assessment, Add
} from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AcademicsTab = ({ onRefresh }) => {
  const [courses, setCourses] = useState([]);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/course-packages');
      setCourses(res.data.packages || []);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" variant="body2">{title}</Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>{value}</Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Academics Module</Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Manage courses, assignments, exams, certificates, study materials, and track student progress
      </Typography>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Courses" value="24" icon={<MenuBook />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Assignments" value="18" icon={<Assignment />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Upcoming Exams" value="5" icon={<Quiz />} color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Certificates Issued" value="342" icon={<EmojiEvents />} color="#9c27b0" />
        </Grid>
      </Grid>

      {/* Courses Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Courses Management</Typography>
          <Button variant="contained" startIcon={<Add />} size="small">Add Course</Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Course Name</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Fee</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.slice(0, 5).map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.duration || 'N/A'}</TableCell>
                  <TableCell>₹{course.fee || 0}</TableCell>
                  <TableCell><Chip label="Active" color="success" size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Assignments & Exams */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Assignments</Typography>
              <Button size="small" startIcon={<Add />}>Create</Button>
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Card variant="outlined">
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="body2" fontWeight={600}>Math Assignment 1</Typography>
                  <Typography variant="caption" color="textSecondary">Due: 2024-02-15</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="body2" fontWeight={600}>Physics Lab Report</Typography>
                  <Typography variant="caption" color="textSecondary">Due: 2024-02-20</Typography>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Upcoming Exams</Typography>
              <Button size="small" startIcon={<Add />}>Schedule</Button>
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Card variant="outlined">
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="body2" fontWeight={600}>Mid Term Exam</Typography>
                  <Typography variant="caption" color="textSecondary">Date: 2024-02-25</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="body2" fontWeight={600}>Final Exam</Typography>
                  <Typography variant="caption" color="textSecondary">Date: 2024-03-15</Typography>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Study Materials & Progress */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Study Materials</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <VideoLibrary color="primary" />
                <Box>
                  <Typography variant="body2">Video Lectures</Typography>
                  <Typography variant="caption" color="textSecondary">24 videos</Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Description color="error" />
                <Box>
                  <Typography variant="body2">PDF Documents</Typography>
                  <Typography variant="caption" color="textSecondary">156 files</Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <MenuBook color="success" />
                <Box>
                  <Typography variant="body2">e-Books</Typography>
                  <Typography variant="caption" color="textSecondary">42 books</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Certificates & Verification</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" fullWidth startIcon={<EmojiEvents />}>
                  Generate Certificate
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" fullWidth startIcon={<Description />}>
                  Generate Marksheet
                </Button>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Verify Certificate"
                  placeholder="Enter certificate number"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AcademicsTab;
