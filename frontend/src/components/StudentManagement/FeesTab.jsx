import { useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Grid, Card, CardContent, Avatar, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { Payment, Receipt, Schedule, Discount, Notifications, Assessment } from '@mui/icons-material';

const FeesTab = ({ onRefresh }) => {
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

  const FeeCollection = () => (
    <Box>
      <Button variant="contained" sx={{ mb: 2 }}>Collect Fee</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Total Fee</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Pending</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>₹50,000</TableCell>
              <TableCell>₹35,000</TableCell>
              <TableCell>₹15,000</TableCell>
              <TableCell><Chip label="Partial" color="warning" size="small" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 0: return <FeeCollection />;
      case 1: return <Box><Typography>Fee Structure Management</Typography></Box>;
      case 2: return <Box><Typography>Payment History & Receipts</Typography></Box>;
      case 3: return <Box><Typography>Installment Plans</Typography></Box>;
      case 4: return <Box><Typography>Discount Management</Typography></Box>;
      case 5: return <Box><Typography>Fee Reports</Typography></Box>;
      default: return <FeeCollection />;
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Fees Management</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Collected" value="₹45L" icon={<Payment />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending" value="₹15L" icon={<Schedule />} color="#d32f2f" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="This Month" value="₹8L" icon={<Receipt />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Discounts Given" value="₹2L" icon={<Discount />} color="#ed6c02" />
        </Grid>
      </Grid>

      <Paper>
        <Tabs value={activeSubTab} onChange={(e, v) => setActiveSubTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<Payment fontSize="small" />} label="Fee Collection" iconPosition="start" />
          <Tab icon={<Schedule fontSize="small" />} label="Fee Structure" iconPosition="start" />
          <Tab icon={<Receipt fontSize="small" />} label="Payment History" iconPosition="start" />
          <Tab icon={<Schedule fontSize="small" />} label="Installments" iconPosition="start" />
          <Tab icon={<Discount fontSize="small" />} label="Discounts" iconPosition="start" />
          <Tab icon={<Assessment fontSize="small" />} label="Reports" iconPosition="start" />
        </Tabs>
        <Box sx={{ p: { xs: 1, sm: 2 } }}>{renderSubTabContent()}</Box>
      </Paper>
    </Box>
  );
};

export default FeesTab;
