import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Paper, Tabs, Tab, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Chip, IconButton, Grid, Card, CardContent, Avatar, CircularProgress, Tooltip, Alert
} from '@mui/material';
import {
  AccountBalance, Receipt, TrendingUp, Paid, Add, CheckCircle, Description, History
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Layout from '../../components/Layout';

// Shared styling for tables
const tableHeaderStyle = { background: 'linear-gradient(135deg, #0f172a, #334155)', color: 'white', fontWeight: 700 };

export default function FinanceDashboard() {
  const [tab, setTab] = useState(0);

  return (
    <Layout title="Finance & Accounting">
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a' }}>
              Finance & Accounting
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your ledger, transactions, and expenses.
            </Typography>
          </Box>
        </Box>

        <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 4, overflow: 'hidden' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}
          >
            <Tab icon={<TrendingUp />} iconPosition="start" label="Dashboard" sx={{ fontWeight: 600 }} />
            <Tab icon={<AccountBalance />} iconPosition="start" label="Chart of Accounts" sx={{ fontWeight: 600 }} />
            <Tab icon={<Receipt />} iconPosition="start" label="Transactions" sx={{ fontWeight: 600 }} />
            <Tab icon={<Paid />} iconPosition="start" label="Expenses" sx={{ fontWeight: 600 }} />
            <Tab icon={<Description />} iconPosition="start" label="Financial Reports" sx={{ fontWeight: 600 }} />
          </Tabs>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {tab === 0 && <OverviewTab />}
          {tab === 1 && <AccountHeadsTab />}
          {tab === 2 && <TransactionsTab />}
          {tab === 3 && <ExpensesTab />}
          {tab === 4 && <ReportsTab />}
        </Box>
      </Container>
    </Layout>
  );
}

// ── Overview Tab ────────────────────────────────────────────────────────
function OverviewTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [plRes, expRes] = await Promise.all([
          api.get('/accounting/reports/profit-loss'),
          api.get('/accounting/expenses')
        ]);
        setData({ pl: plRes.data.data, expenses: expRes.data.data });
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <CircularProgress />;
  if (!data) return null;

  const totalRevenue = data.pl?.totalIncome || 0;
  const totalExpensePL = data.pl?.totalExpenses || 0;
  const netProfit = data.pl?.netProfitLoss || 0;
  const pendingExp = data.expenses?.filter(e => e.status === 'Pending')?.length || 0;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card sx={{ bgcolor: '#eff6ff', borderRadius: 4, boxShadow: 'none', border: '1px solid #bfdbfe' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#3b82f6' }}><AccountBalance /></Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Revenue</Typography>
                <Typography variant="h4" fontWeight={800} color="#1e3a8a">₹{parseFloat(totalRevenue).toLocaleString('en-IN')}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ bgcolor: '#fef2f2', borderRadius: 4, boxShadow: 'none', border: '1px solid #fecaca' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#ef4444' }}><Paid /></Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Expenses</Typography>
                <Typography variant="h4" fontWeight={800} color="#7f1d1d">₹{parseFloat(totalExpensePL).toLocaleString('en-IN')}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ bgcolor: '#f0fdf4', borderRadius: 4, boxShadow: 'none', border: '1px solid #bbf7d0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#22c55e' }}><TrendingUp /></Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>Net Profit</Typography>
                <Typography variant="h4" fontWeight={800} color="#14532d">₹{parseFloat(netProfit).toLocaleString('en-IN')}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      {pendingExp > 0 && (
        <Grid item xs={12}>
          <Alert severity="warning" icon={<History />} sx={{ borderRadius: 2 }}>
            You have <b>{pendingExp}</b> pending expenses requiring approval.
          </Alert>
        </Grid>
      )}
    </Grid>
  );
}

// ── Account Heads Tab ────────────────────────────────────────────────────────
function AccountHeadsTab() {
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', type: 'Expense', parentId: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounting/account-heads');
      setHeads(res.data.data || []);
    } catch { toast.error('Failed to fetch account heads'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async () => {
    try {
      await api.post('/accounting/account-heads', { ...form, parentId: form.parentId || null });
      toast.success('Account Head created');
      setOpen(false);
      fetch();
    } catch (err) {
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach(e => toast.error(e.message));
      } else {
        toast.error(err.response?.data?.message || 'Failed to create');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setForm({ name: '', code: '', type: 'Expense', parentId: '' }); setOpen(true); }}>
          New Account Head
        </Button>
      </Box>
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={tableHeaderStyle}>
                <TableCell sx={{ color: 'white' }}>Code</TableCell>
                <TableCell sx={{ color: 'white' }}>Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Type</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell></TableRow> : null}
              {!loading && heads.length === 0 ? <TableRow><TableCell colSpan={4} align="center">No records found</TableCell></TableRow> : null}
              {heads.map(h => (
                <TableRow key={h.id} hover>
                  <TableCell fontWeight={600}>{h.code}</TableCell>
                  <TableCell>{h.name}</TableCell>
                  <TableCell>
                    <Chip label={h.type} size="small" color={h.type === 'Asset' ? 'primary' : h.type === 'Liability' ? 'warning' : h.type === 'Income' ? 'success' : 'error'} />
                  </TableCell>
                  <TableCell><Chip label={h.isActive ? 'Active' : 'Inactive'} size="small" color={h.isActive ? 'success' : 'default'} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Account Head</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {['Asset', 'Liability', 'Equity', 'Income', 'Expense'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Parent Head (Optional)" value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })}>
                <MenuItem value="">None</MenuItem>
                {heads.map(h => <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ── Transactions Tab ────────────────────────────────────────────────────────
function TransactionsTab() {
  const [txns, setTxns] = useState([]);
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ transactionDate: new Date().toISOString().split('T')[0], type: 'Journal', description: '', entries: [{ accountHeadId: '', debit: 0, credit: 0 }, { accountHeadId: '', debit: 0, credit: 0 }] });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, hdRes] = await Promise.all([
        api.get('/accounting/transactions'),
        api.get('/accounting/account-heads')
      ]);
      setTxns(txRes.data.data || []);
      setHeads(hdRes.data.data || []);
    } catch { toast.error('Failed to fetch transactions'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...form.entries];
    newEntries[index][field] = value;
    setForm({ ...form, entries: newEntries });
  };

  const addEntry = () => setForm({ ...form, entries: [...form.entries, { accountHeadId: '', debit: 0, credit: 0 }] });
  const removeEntry = (index) => setForm({ ...form, entries: form.entries.filter((_, i) => i !== index) });

  const handleSave = async () => {
    const totalDr = form.entries.reduce((sum, e) => sum + parseFloat(e.debit || 0), 0);
    const totalCr = form.entries.reduce((sum, e) => sum + parseFloat(e.credit || 0), 0);
    if (totalDr !== totalCr) {
      toast.error(`Debit (₹${totalDr}) and Credit (₹${totalCr}) must match!`);
      return;
    }
    try {
      await api.post('/accounting/transactions', form);
      toast.success('Transaction saved');
      setOpen(false);
      fetch();
    } catch (err) {
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach(e => toast.error(e.message));
      } else {
        toast.error(err.response?.data?.message || 'Failed to create');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setForm({ transactionDate: new Date().toISOString().split('T')[0], type: 'Journal', description: '', entries: [{ accountHeadId: '', debit: 0, credit: 0 }, { accountHeadId: '', debit: 0, credit: 0 }] }); setOpen(true); }}>
          New Transaction
        </Button>
      </Box>
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={tableHeaderStyle}>
                <TableCell sx={{ color: 'white' }}>Txn No.</TableCell>
                <TableCell sx={{ color: 'white' }}>Date</TableCell>
                <TableCell sx={{ color: 'white' }}>Type</TableCell>
                <TableCell sx={{ color: 'white' }}>Description</TableCell>
                <TableCell sx={{ color: 'white' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow> : null}
              {!loading && txns.length === 0 ? <TableRow><TableCell colSpan={5} align="center">No records found</TableCell></TableRow> : null}
              {txns.map(t => (
                <TableRow key={t.id} hover>
                  <TableCell fontWeight={600}>{t.transactionNumber}</TableCell>
                  <TableCell>{new Date(t.transactionDate).toLocaleDateString()}</TableCell>
                  <TableCell><Chip label={t.type} size="small" color="primary" variant="outlined" /></TableCell>
                  <TableCell>{t.description || '—'}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#10b981' }}>₹{parseFloat(t.totalAmount).toLocaleString('en-IN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Journal Transaction</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth type="date" label="Date" value={form.transactionDate} onChange={e => setForm({ ...form, transactionDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {['Receipt', 'Payment', 'Journal', 'Contra'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </Grid>
          </Grid>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Entries</Typography>
          {form.entries.map((entry, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField select label="Account Head" size="small" sx={{ flex: 2 }} value={entry.accountHeadId} onChange={e => handleEntryChange(index, 'accountHeadId', e.target.value)}>
                {heads.map(h => <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>)}
              </TextField>
              <TextField type="number" label="Debit (₹)" size="small" sx={{ flex: 1 }} value={entry.debit} onChange={e => handleEntryChange(index, 'debit', e.target.value)} />
              <TextField type="number" label="Credit (₹)" size="small" sx={{ flex: 1 }} value={entry.credit} onChange={e => handleEntryChange(index, 'credit', e.target.value)} />
              <TextField label="Remarks" size="small" sx={{ flex: 1.5 }} value={entry.description || ''} onChange={e => handleEntryChange(index, 'description', e.target.value)} />
              {form.entries.length > 2 && (
                <Button color="error" onClick={() => removeEntry(index)}>Remove</Button>
              )}
            </Box>
          ))}
          <Button variant="outlined" size="small" onClick={addEntry} sx={{ mt: 1 }}>+ Add Row</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Transaction</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ── Expenses Tab ────────────────────────────────────────────────────────
function ExpensesTab() {
  const [expenses, setExpenses] = useState([]);
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ accountHeadId: '', expenseDate: new Date().toISOString().split('T')[0], amount: '', paymentMethod: 'Cash', description: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [exRes, hdRes] = await Promise.all([
        api.get('/accounting/expenses'),
        api.get('/accounting/account-heads')
      ]);
      setExpenses(exRes.data.data || []);
      setHeads((hdRes.data.data || []).filter(h => h.type === 'Expense'));
    } catch { toast.error('Failed to fetch expenses'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async () => {
    try {
      await api.post('/accounting/expenses', { ...form, amount: parseFloat(form.amount) });
      toast.success('Expense recorded');
      setOpen(false);
      fetch();
    } catch (err) {
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach(e => toast.error(e.message));
      } else {
        toast.error(err.response?.data?.message || 'Failed to record expense');
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/accounting/expenses/${id}/approve`, { status: 'Approved' });
      toast.success('Expense Approved');
      fetch();
    } catch (err) {
      toast.error('Failed to approve expense');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setForm({ accountHeadId: '', expenseDate: new Date().toISOString().split('T')[0], amount: '', paymentMethod: 'Cash', description: '' }); setOpen(true); }}>
          Log Expense
        </Button>
      </Box>
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={tableHeaderStyle}>
                <TableCell sx={{ color: 'white' }}>Exp No.</TableCell>
                <TableCell sx={{ color: 'white' }}>Date</TableCell>
                <TableCell sx={{ color: 'white' }}>Account</TableCell>
                <TableCell sx={{ color: 'white' }}>Amount</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell></TableRow> : null}
              {!loading && expenses.length === 0 ? <TableRow><TableCell colSpan={6} align="center">No expenses found</TableCell></TableRow> : null}
              {expenses.map(e => (
                <TableRow key={e.id} hover>
                  <TableCell fontWeight={600}>{e.expenseNumber}</TableCell>
                  <TableCell>{new Date(e.expenseDate).toLocaleDateString()}</TableCell>
                  <TableCell>{e.accountHead?.name || '—'}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#ef4444' }}>₹{parseFloat(e.amount).toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Chip label={e.status} size="small" color={e.status === 'Approved' ? 'success' : e.status === 'Rejected' ? 'error' : 'warning'} />
                  </TableCell>
                  <TableCell>
                    {e.status === 'Pending' && (
                      <Tooltip title="Approve">
                        <IconButton size="small" color="success" onClick={() => handleApprove(e.id)}><CheckCircle /></IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Expense</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Expense Account" value={form.accountHeadId} onChange={e => setForm({ ...form, accountHeadId: e.target.value })}>
                {heads.map(h => <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="Date" value={form.expenseDate} onChange={e => setForm({ ...form, expenseDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="number" label="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Payment Method" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                {['Cash', 'Bank', 'Cheque', 'Online'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ── Reports Tab ────────────────────────────────────────────────────────
function ReportsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get('/accounting/reports/balance-sheet');
        setData(res.data.data);
      } catch (err) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <CircularProgress />;
  if (!data) return <Typography>No data</Typography>;

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#0f172a' }}>Assets</Typography>
          <Table size="small">
            <TableBody>
              {data.assets.map((a, i) => (
                <TableRow key={i}>
                  <TableCell>{a.name}</TableCell>
                  <TableCell align="right" fontWeight={600}>₹{parseFloat(a.balance).toLocaleString('en-IN')}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell><Typography fontWeight={800}>Total Assets</Typography></TableCell>
                <TableCell align="right"><Typography fontWeight={800} color="primary">₹{parseFloat(data.totalAssets).toLocaleString('en-IN')}</Typography></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#0f172a' }}>Liabilities & Equity</Typography>
          <Table size="small">
            <TableBody>
              {data.liabilities.map((l, i) => (
                <TableRow key={i}>
                  <TableCell>{l.name}</TableCell>
                  <TableCell align="right" fontWeight={600}>₹{parseFloat(l.balance).toLocaleString('en-IN')}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell><Typography fontWeight={800}>Total Liabilities</Typography></TableCell>
                <TableCell align="right"><Typography fontWeight={800} color="error">₹{parseFloat(data.totalLiabilities).toLocaleString('en-IN')}</Typography></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </Grid>
    </Grid>
  );
}
