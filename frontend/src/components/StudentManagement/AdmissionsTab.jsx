import { useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Grid, Card, CardContent, Avatar, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { School, HourglassEmpty, CheckCircle, Cancel, Assessment, Add } from '@mui/icons-material';

const AdmissionsTab = ({ onRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState(0);

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

  const NewApplications = () => (
    <Box>
      <Button variant="contained" startIcon={<Add />} sx={{ mb: 2 }}>New Application</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Application ID</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>APP-2024-001</TableCell>
              <TableCell>John Doe</TableCell>
              <TableCell>Web Development</TableCell>
              <TableCell>2024-01-15</TableCell>
              <TableCell><Chip label="Pending" color="warning" size="small" /></TableCell>
              <TableCell><Button size="small">Review</Button></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>APP-2024-002</TableCell>
              <TableCell>Jane Smith</TableCell>
              <TableCell>Data Science</TableCell>
              <TableCell>2024-01-16</TableCell>
              <TableCell><Chip label="Approved" color="success" size="small" /></TableCell>
              <TableCell><Button size="small">View</Button></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const ApplicationForm = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Application Form</Typography>
      <Typography variant="body2" color="textSecondary">Create and manage application forms for new admissions</Typography>
      <Button variant="contained" sx={{ mt: 2 }}>Create Form</Button>
    </Box>
  );

  const DocumentUpload = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Document Upload</Typography>
      <Typography variant="body2" color="textSecondary">Upload and verify student documents</Typography>
    </Box>
  );

  const ApprovalWorkflow = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Approval Workflow</Typography>
      <Typography variant="body2" color="textSecondary">Manage admission approval process</Typography>
    </Box>
  );

  const AdmissionReports = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Admission Reports</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Monthly Admissions</Typography>
              <Button variant="outlined" size="small" sx={{ mt: 1 }}>Download</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Course-wise Admissions</Typography>
              <Button variant="outlined" size="small" sx={{ mt: 1 }}>Download</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 0: return <NewApplications />;
      case 1: return <ApplicationForm />;
      case 2: return <DocumentUpload />;
      case 3: return <ApprovalWorkflow />;
      case 4: return <AdmissionReports />;
      default: return <NewApplications />;
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Admissions Module
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Manage student admissions from application to enrollment
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="New Applications" value="45" icon={<School />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending Review" value="18" icon={<HourglassEmpty />} color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Approved" value="22" icon={<CheckCircle />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Rejected" value="5" icon={<Cancel />} color="#d32f2f" />
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
          <Tab icon={<School fontSize="small" />} label="New Applications" iconPosition="start" />
          <Tab icon={<School fontSize="small" />} label="Application Form" iconPosition="start" />
          <Tab icon={<School fontSize="small" />} label="Document Upload" iconPosition="start" />
          <Tab icon={<CheckCircle fontSize="small" />} label="Approval Workflow" iconPosition="start" />
          <Tab icon={<Assessment fontSize="small" />} label="Reports" iconPosition="start" />
        </Tabs>

        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          {renderSubTabContent()}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdmissionsTab;
