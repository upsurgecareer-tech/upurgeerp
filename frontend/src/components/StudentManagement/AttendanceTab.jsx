import { useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Grid, Card, CardContent, Button, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import {
  CheckCircle, QrCode, Fingerprint, Assessment, EventNote, Warning, Notifications
} from '@mui/icons-material';

const AttendanceTab = ({ onRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState(0);

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" variant="body2">{title}</Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>{value}</Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const DailyAttendance = () => (
    <Box>
      <Button variant="contained" sx={{ mb: 2 }}>Mark Attendance</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>Batch A</TableCell>
              <TableCell><Chip label="Present" color="success" size="small" /></TableCell>
              <TableCell>09:15 AM</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const QRAttendance = () => (
    <Box textAlign="center">
      <Typography variant="h6" gutterBottom>QR Code Attendance</Typography>
      <Box sx={{ width: 200, height: 200, bgcolor: 'grey.200', mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <QrCode sx={{ fontSize: 100 }} />
      </Box>
      <Typography variant="body2" color="textSecondary">Students scan this QR code to mark attendance</Typography>
      <Button variant="contained" sx={{ mt: 2 }}>Generate New QR</Button>
    </Box>
  );

  const AttendanceReports = () => (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Daily Report</Typography>
              <Button variant="outlined" size="small" sx={{ mt: 1 }}>Download</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Monthly Report</Typography>
              <Button variant="outlined" size="small" sx={{ mt: 1 }}>Download</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 0: return <DailyAttendance />;
      case 1: return <QRAttendance />;
      case 2: return <Box><Typography>Biometric Integration Coming Soon</Typography></Box>;
      case 3: return <AttendanceReports />;
      case 4: return <Box><Typography>Leave Management</Typography></Box>;
      case 5: return <Box><Typography>At-Risk Students (Below 75% attendance)</Typography></Box>;
      default: return <DailyAttendance />;
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Attendance Module
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Present Today" value="425" icon={<CheckCircle />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Absent Today" value="75" icon={<Warning />} color="#d32f2f" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Late Arrivals" value="12" icon={<EventNote />} color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="On Leave" value="8" icon={<Notifications />} color="#0288d1" />
        </Grid>
      </Grid>

      <Paper>
        <Tabs
          value={activeSubTab}
          onChange={(e, v) => setActiveSubTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<CheckCircle fontSize="small" />} label="Daily Attendance" iconPosition="start" />
          <Tab icon={<QrCode fontSize="small" />} label="QR Code" iconPosition="start" />
          <Tab icon={<Fingerprint fontSize="small" />} label="Biometric" iconPosition="start" />
          <Tab icon={<Assessment fontSize="small" />} label="Reports" iconPosition="start" />
          <Tab icon={<EventNote fontSize="small" />} label="Leave Management" iconPosition="start" />
          <Tab icon={<Warning fontSize="small" />} label="At-Risk Students" iconPosition="start" />
        </Tabs>

        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          {renderSubTabContent()}
        </Box>
      </Paper>
    </Box>
  );
};

export default AttendanceTab;
