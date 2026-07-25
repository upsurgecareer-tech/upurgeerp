import { useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Grid, Card, CardContent, Avatar, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { Description, Verified, CreditCard, EmojiEvents, Upload, Assessment } from '@mui/icons-material';

const DocumentsTab = ({ onRefresh }) => {
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

  const DocumentUpload = () => (
    <Box>
      <Button variant="contained" startIcon={<Upload />} sx={{ mb: 2 }}>Upload Document</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Document Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Uploaded Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>ID Proof</TableCell>
              <TableCell><Chip label="Verified" color="success" size="small" /></TableCell>
              <TableCell>2024-01-15</TableCell>
              <TableCell><Button size="small">View</Button></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 0: return <DocumentUpload />;
      case 1: return <Box><Typography>Document Verification Queue</Typography></Box>;
      case 2: return <Box><Typography>ID Card Generation</Typography></Box>;
      case 3: return <Box><Typography>Certificate Management</Typography></Box>;
      case 4: return <Box><Typography>Document Reports</Typography></Box>;
      default: return <DocumentUpload />;
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Documents Management</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Documents" value="1,245" icon={<Description />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Verified" value="1,120" icon={<Verified />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending" value="125" icon={<Description />} color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="ID Cards Issued" value="480" icon={<CreditCard />} color="#9c27b0" />
        </Grid>
      </Grid>

      <Paper>
        <Tabs value={activeSubTab} onChange={(e, v) => setActiveSubTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<Upload fontSize="small" />} label="Upload" iconPosition="start" />
          <Tab icon={<Verified fontSize="small" />} label="Verification" iconPosition="start" />
          <Tab icon={<CreditCard fontSize="small" />} label="ID Cards" iconPosition="start" />
          <Tab icon={<EmojiEvents fontSize="small" />} label="Certificates" iconPosition="start" />
          <Tab icon={<Assessment fontSize="small" />} label="Reports" iconPosition="start" />
        </Tabs>
        <Box sx={{ p: { xs: 1, sm: 2 } }}>{renderSubTabContent()}</Box>
      </Paper>
    </Box>
  );
};

export default DocumentsTab;
