import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Chip, CircularProgress, Tabs, Tab, Card, CardContent, Grid,
  InputAdornment
} from '@mui/material';
import { Add, Receipt, Warning, Payment, AccountBalanceWallet, DateRange } from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const PAYMENT_MODES = ['Cash', 'Online', 'Cheque', 'Bank Transfer', 'UPI'];
const emptyPaymentForm = { admission_id: '', amount_paid: '', payment_mode: 'Cash', payment_date: new Date().toISOString().split('T')[0], remarks: '', fee_schedule_id: null };
const emptyEmiForm = { admission_id: '', count: 3, total_amount: 0, start_date: new Date().toISOString().split('T')[0] };

const Fees = () => {
  const [tab, setTab] = useState(0);
  const [duePayments, setDuePayments] = useState([]);
  const [collectionReport, setCollectionReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [emiOpen, setEmiOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [emiForm, setEmiForm] = useState(emptyEmiForm);
  const [admissions, setAdmissions] = useState([]);

  useEffect(() => { fetchData(); fetchAdmissions(); }, []);

  const fetchData = async () => {
    try {
      const [dueRes, reportRes] = await Promise.all([
        api.get('/fee-payments/due'),
        api.get('/fee-payments/collection-report'),
      ]);
      setDuePayments(dueRes.data.dueSchedules || dueRes.data || []);
      setCollectionReport(reportRes.data.data || reportRes.data || []);
    } catch { toast.error('Failed to fetch fee data'); }
    finally { setLoading(false); }
  };

  const fetchAdmissions = async () => {
    try {
      const res = await api.get('/admissions');
      setAdmissions(res.data.admissions || res.data || []);
    } catch { setAdmissions([]); }
  };

  const handlePaymentSubmit = async () => {
    if (!paymentForm.admission_id || !paymentForm.amount_paid) {
      toast.error('Student and Amount are required');
      return;
    }
    if (parseFloat(paymentForm.amount_paid) <= 0) {
      toast.error('Amount paid must be greater than 0');
      return;
    }
    try {
      await api.post('/fee-payments', paymentForm);
      toast.success('Payment recorded successfully');
      setPaymentOpen(false);
      setPaymentForm(emptyPaymentForm);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleEmiSubmit = async () => {
    if (!emiForm.admission_id || emiForm.total_amount <= 0 || emiForm.count <= 0) {
      toast.error('Valid Admission, Amount and Count are required');
      return;
    }
    try {
      const amountPerInstallment = (emiForm.total_amount / emiForm.count).toFixed(2);
      const installments = [];
      let currentDate = new Date(emiForm.start_date);

      for (let i = 1; i <= emiForm.count; i++) {
        installments.push({
          installment_no: i,
          due_date: currentDate.toISOString().split('T')[0],
          amount: amountPerInstallment
        });
        currentDate.setMonth(currentDate.getMonth() + 1); // Add 1 month for next installment
      }

      await api.post(`/admissions/${emiForm.admission_id}/fee-schedule`, { installments });
      toast.success('EMI Schedule generated successfully');
      setEmiOpen(false);
      setEmiForm(emptyEmiForm);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate EMI schedule');
    }
  };

  const totalCollected = collectionReport.reduce((sum, r) => sum + parseFloat(r.total_collected || 0), 0);

  return (
    <Layout title="Fee Installments & Collections">
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>Fee Management</Typography>
            <Typography variant="body1" color="text.secondary">Track EMIs, due payments, and collections</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" color="primary" startIcon={<DateRange />} onClick={() => setEmiOpen(true)} sx={{ borderRadius: 2 }}>
              Generate EMI Schedule
            </Button>
            <Button variant="contained" color="primary" startIcon={<AccountBalanceWallet />} onClick={() => setPaymentOpen(true)} sx={{ borderRadius: 2 }}>
              Record Payment
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 3, boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: '#059669', fontWeight: 600 }}>Total Collected (6 Months)</Typography>
                <Typography variant="h4" sx={{ color: '#047857', fontWeight: 800, mt: 1 }}>₹{totalCollected.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 3, boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: '#dc2626', fontWeight: 600 }}>Overdue / Pending EMIs</Typography>
                <Typography variant="h4" sx={{ color: '#b91c1c', fontWeight: 800, mt: 1 }}>{duePayments.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 3, boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: '#4f46e5', fontWeight: 600 }}>Active Enrollments</Typography>
                <Typography variant="h4" sx={{ color: '#4338ca', fontWeight: 800, mt: 1 }}>{admissions.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ bgcolor: '#f8fafc', borderBottom: 1, borderColor: 'divider' }}>
            <Tab label={`Pending Installments (${duePayments.length})`} icon={<Warning />} iconPosition="start" sx={{ fontWeight: 600 }} />
            <Tab label="Collection Report" icon={<Receipt />} iconPosition="start" sx={{ fontWeight: 600 }} />
          </Tabs>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
          ) : (
            <Box>
              {tab === 0 && (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Admission ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Installment Details</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Amount Due</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {duePayments.length === 0 ? (
                        <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}>No pending installments! 🎉</TableCell></TableRow>
                      ) : duePayments.map((d) => {
                        const isOverdue = new Date(d.due_date) < new Date();
                        return (
                          <TableRow key={d.id} hover>
                            <TableCell>
                              <Typography variant="subtitle2">{d.Admission?.Student?.name || `Adm #${d.admission_id}`}</Typography>
                              <Typography variant="caption" color="text.secondary">ID: {d.admission_id}</Typography>
                            </TableCell>
                            <TableCell>Installment #{d.installment_no}</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>₹{parseFloat(d.amount || 0).toLocaleString()}</TableCell>
                            <TableCell sx={{ color: isOverdue ? 'error.main' : 'text.primary', fontWeight: isOverdue ? 700 : 400 }}>
                              {new Date(d.due_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Chip label={isOverdue ? 'Overdue' : 'Pending'} color={isOverdue ? 'error' : 'warning'} size="small" sx={{ fontWeight: 600 }} />
                            </TableCell>
                            <TableCell align="right">
                              <Button size="small" variant="contained" color="success" onClick={() => {
                                setPaymentForm({ ...emptyPaymentForm, admission_id: d.admission_id, fee_schedule_id: d.id, amount_paid: d.amount });
                                setPaymentOpen(true);
                              }} sx={{ borderRadius: 2 }}>
                                Collect
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {tab === 1 && (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Month</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Total Collected</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Transactions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {collectionReport.length === 0 ? (
                        <TableRow><TableCell colSpan={3} align="center" sx={{ py: 5 }}>No collection data found.</TableCell></TableRow>
                      ) : collectionReport.map((r, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{r.month}</TableCell>
                          <TableCell sx={{ color: 'success.main', fontWeight: 700 }}>₹{parseFloat(r.total_collected || 0).toLocaleString()}</TableCell>
                          <TableCell><Chip label={`${r.payment_count} TXNs`} size="small" color="primary" variant="outlined" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Paper>

        {/* Record Payment Dialog */}
        <Dialog open={paymentOpen} onClose={() => setPaymentOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Record Payment</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField select label="Select Admission" name="admission_id" value={paymentForm.admission_id} onChange={(e) => setPaymentForm({...paymentForm, admission_id: e.target.value})} required>
                {admissions.map(a => <MenuItem key={a.id} value={a.id}>Adm #{a.id} (Total: ₹{a.total_fee})</MenuItem>)}
              </TextField>
              <TextField label="Amount Paid" name="amount_paid" type="number" value={paymentForm.amount_paid} onChange={(e) => setPaymentForm({...paymentForm, amount_paid: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} required />
              <TextField select label="Payment Mode" name="payment_mode" value={paymentForm.payment_mode} onChange={(e) => setPaymentForm({...paymentForm, payment_mode: e.target.value})}>
                {PAYMENT_MODES.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
              <TextField label="Payment Date" name="payment_date" type="date" value={paymentForm.payment_date} onChange={(e) => setPaymentForm({...paymentForm, payment_date: e.target.value})} InputLabelProps={{ shrink: true }} />
              <TextField label="Remarks (Txn ID, Check No)" name="remarks" value={paymentForm.remarks} onChange={(e) => setPaymentForm({...paymentForm, remarks: e.target.value})} multiline rows={2} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setPaymentOpen(false)}>Cancel</Button>
            <Button onClick={handlePaymentSubmit} variant="contained" sx={{ borderRadius: 2 }}>Confirm Payment</Button>
          </DialogActions>
        </Dialog>

        {/* EMI Generator Dialog */}
        <Dialog open={emiOpen} onClose={() => setEmiOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Generate EMI Schedule</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This will automatically divide the total amount into equal monthly installments starting from the selected date.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField select label="Select Admission" name="admission_id" value={emiForm.admission_id} onChange={(e) => {
                const adm = admissions.find(x => x.id === e.target.value);
                setEmiForm({...emiForm, admission_id: e.target.value, total_amount: adm ? adm.net_payable : 0});
              }} required>
                {admissions.map(a => <MenuItem key={a.id} value={a.id}>Adm #{a.id} (Net Payable: ₹{a.net_payable})</MenuItem>)}
              </TextField>
              <TextField label="Total Amount to Divide" type="number" value={emiForm.total_amount} onChange={(e) => setEmiForm({...emiForm, total_amount: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} required />
              <TextField label="Number of Installments (Months)" type="number" value={emiForm.count} onChange={(e) => setEmiForm({...emiForm, count: e.target.value})} required />
              <TextField label="First Installment Date" type="date" value={emiForm.start_date} onChange={(e) => setEmiForm({...emiForm, start_date: e.target.value})} InputLabelProps={{ shrink: true }} required />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setEmiOpen(false)}>Cancel</Button>
            <Button onClick={handleEmiSubmit} variant="contained" color="primary" sx={{ borderRadius: 2 }}>Generate Schedule</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Fees;
