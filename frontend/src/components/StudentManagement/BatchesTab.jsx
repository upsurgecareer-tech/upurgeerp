import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Grid, Card, CardContent, Avatar, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { Class, Add, People, Schedule, Assessment } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';

const BatchesTab = ({ onRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [batches, setBatches] = useState([]);

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    try {
      const res = await api.get('/batches');
      setBatches(res.data.batches || []);
    } catch (error) {
      toast.error('Failed to fetch batches');
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

  const BatchList = () => (
    <Box>
      <Button variant="contained" startIcon={<Add />} sx={{ mb: 2 }}>Create Batch</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Batch Name</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Students</TableCell>
              <TableCell>Faculty</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>{batch.name}</TableCell>
                <TableCell>{batch.course?.name || 'N/A'}</TableCell>
                <TableCell>{batch.student_count || 0}</TableCell>
                <TableCell>{batch.faculty?.name || 'N/A'}</TableCell>
                <TableCell><Chip label={batch.status || 'Active'} color="success" size="small" /></TableCell>
                <TableCell><Button size="small">View</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 0: return <BatchList />;
      case 1: return <Box><Typography>Assign Students to Batches</Typography></Box>;
      case 2: return <Box><Typography>Assign Faculty to Batches</Typography></Box>;
      case 3: return <Box><Typography>Timetable Scheduling</Typography></Box>;
      case 4: return <Box><Typography>Batch Reports & Analytics</Typography></Box>;
      default: return <BatchList />;
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Batch Management</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Batches" value={batches.length} icon={<Class />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Batches" value={batches.filter(b => b.status === 'active').length} icon={<Class />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Students" value="480" icon={<People />} color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Faculty Assigned" value="24" icon={<People />} color="#9c27b0" />
        </Grid>
      </Grid>

      <Paper>
        <Tabs value={activeSubTab} onChange={(e, v) => setActiveSubTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<Class fontSize="small" />} label="Batch List" iconPosition="start" />
          <Tab icon={<People fontSize="small" />} label="Assign Students" iconPosition="start" />
          <Tab icon={<People fontSize="small" />} label="Assign Faculty" iconPosition="start" />
          <Tab icon={<Schedule fontSize="small" />} label="Timetable" iconPosition="start" />
          <Tab icon={<Assessment fontSize="small" />} label="Reports" iconPosition="start" />
        </Tabs>
        <Box sx={{ p: { xs: 1, sm: 2 } }}>{renderSubTabContent()}</Box>
      </Paper>
    </Box>
  );
};

export default BatchesTab;
