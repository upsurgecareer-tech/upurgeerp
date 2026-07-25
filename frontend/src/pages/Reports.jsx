import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Tabs, Tab, CircularProgress, Chip,
} from '@mui/material';
import { GetApp, People, Payment, TrendingUp, Assessment } from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const Reports = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [feeCollection, setFeeCollection] = useState([]);
  const [leadConversion, setLeadConversion] = useState({ byStage: [], totalLeads: 0, convertedLeads: 0, conversionRate: 0 });
  const [revenue, setRevenue] = useState([]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [studRes, feeRes, leadRes, revRes] = await Promise.all([
        api.get('/reports/students'),
        api.get('/reports/fee-collection'),
        api.get('/reports/lead-conversion'),
        api.get('/reports/revenue'),
      ]);
      setStudents(studRes.data.students || studRes.data || []);
      setFeeCollection(feeRes.data.data || feeRes.data || []);
      setLeadConversion(leadRes.data || {});
      setRevenue(revRes.data.data || revRes.data || []);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const res = await api.get(`/reports/export?reportType=${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch { toast.error('Export failed'); }
  };

  const totalFeeCollected = feeCollection.reduce((sum, r) => sum + parseFloat(r.total_collected || 0), 0);
  const totalRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);

  return (
    <Layout title="Reports & Analytics">
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>Reports & Analytics</Typography>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <People sx={{ color: '#1976d2' }} />
                <Typography variant="h5">{students.length}</Typography>
                <Typography variant="caption">Total Students</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Payment sx={{ color: '#4caf50' }} />
                <Typography variant="h5">₹{totalFeeCollected.toLocaleString()}</Typography>
                <Typography variant="caption">Fee Collected</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ color: '#ff9800' }} />
                <Typography variant="h5">{leadConversion.conversionRate || 0}%</Typography>
                <Typography variant="caption">Lead Conversion</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: '#f3e5f5' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Assessment sx={{ color: '#9c27b0' }} />
                <Typography variant="h5">{leadConversion.totalLeads || 0}</Typography>
                <Typography variant="caption">Total Leads</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Students" />
          <Tab label="Fee Collection" />
          <Tab label="Lead Conversion" />
          <Tab label="Revenue" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : (
          <>
            {tab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <Button startIcon={<GetApp />} variant="outlined" size="small" onClick={() => handleExport('students')}>
                    Export CSV
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Admission No</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Mobile</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.length === 0 ? (
                        <TableRow><TableCell colSpan={5} align="center">No students found.</TableCell></TableRow>
                      ) : students.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.admission_no}</TableCell>
                          <TableCell>{s.name}</TableCell>
                          <TableCell>{s.mobile}</TableCell>
                          <TableCell>{s.email}</TableCell>
                          <TableCell><Chip label={s.status || 'Active'} color="success" size="small" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {tab === 1 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell>Total Collected</TableCell>
                      <TableCell>Payments Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeCollection.length === 0 ? (
                      <TableRow><TableCell colSpan={3} align="center">No fee collection data.</TableCell></TableRow>
                    ) : feeCollection.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>{r.month}</TableCell>
                        <TableCell>₹{parseFloat(r.total_collected || 0).toLocaleString()}</TableCell>
                        <TableCell>{r.payment_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {tab === 2 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <Button startIcon={<GetApp />} variant="outlined" size="small" onClick={() => handleExport('leads')}>
                    Export CSV
                  </Button>
                </Box>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4">{leadConversion.totalLeads || 0}</Typography>
                      <Typography variant="caption">Total Leads</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">{leadConversion.convertedLeads || 0}</Typography>
                      <Typography variant="caption">Converted</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">{leadConversion.conversionRate || 0}%</Typography>
                      <Typography variant="caption">Conversion Rate</Typography>
                    </Paper>
                  </Grid>
                </Grid>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Stage</TableCell>
                        <TableCell>Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(leadConversion.byStage || []).map((s, i) => (
                        <TableRow key={i}>
                          <TableCell>{s.stage}</TableCell>
                          <TableCell>{s.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {tab === 3 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      <TableCell>Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenue.length === 0 ? (
                      <TableRow><TableCell colSpan={2} align="center">No revenue data.</TableCell></TableRow>
                    ) : revenue.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>{r.period}</TableCell>
                        <TableCell>₹{parseFloat(r.total || 0).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Container>
    </Layout>
  );
};

export default Reports;
