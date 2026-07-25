import { useState, useEffect, useCallback } from 'react';
import {
  Box, Tabs, Tab, Typography, Grid, Card, CardContent, Button,
  Paper, CircularProgress, Alert, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent,
  TextField, MenuItem, Fade, Avatar, Tooltip, Divider
} from '@mui/material';
import {
  AssignmentTurnedIn, EventNote, HolidayVillage, Assessment, FactCheck,
  Add, CheckCircle, Cancel, AccessTime, BeachAccess, LocalHospital,
  FamilyRestroom, BusinessCenter
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function LeaveManagement() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Leave Applications', icon: <AssignmentTurnedIn /> },
    { label: 'Leave Balances', icon: <Assessment /> },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(245,158,11,0.12)', color: '#f59e0b', display: 'flex' }}>
          <EventNote fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Leave Management</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage leave requests, track balances, and approve applications.</Typography>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 3, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.07)' }}>
        <Tabs
          value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{
            px: 2,
            '& .MuiTab-root': { minHeight: 64, fontWeight: 600, color: '#64748b', textTransform: 'none', '&.Mui-selected': { color: '#f59e0b' } },
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: '#f59e0b' }
          }}
        >
          {tabs.map((tab, idx) => <Tab key={idx} icon={tab.icon} iconPosition="start" label={tab.label} />)}
        </Tabs>
      </Paper>

      <Fade in key={activeTab}>
        <Box>
          {activeTab === 0 && <LeaveApplications />}
          {activeTab === 1 && <LeaveBalances />}
        </Box>
      </Fade>
    </Box>
  );
}

// ── Leave Applications Tab ───────────────────────────────────────────────────
function LeaveApplications() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [form, setForm] = useState({ employee_id: '', leave_type: 'Casual', start_date: '', end_date: '', reason: '' });

  const leaveTypeIcons = { Sick: <LocalHospital />, Casual: <BeachAccess />, Earned: <BusinessCenter />, Maternity: <FamilyRestroom />, Paternity: <FamilyRestroom /> };

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [leavesRes, empsRes] = await Promise.all([
        api.get('/hrms/leaves'),
        api.get('/hrms/employees')
      ]);
      setLeaves(leavesRes.data.leaves || []);
      setEmployees(empsRes.data.employees || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchBalance = async (empId) => {
    if (!empId) return;
    try {
      const res = await api.get(`/hrms/leaves/balance/${empId}`);
      setLeaveBalance(res.data.balance);
    } catch { setLeaveBalance(null); }
  };

  const handleSubmit = async () => {
    if (!form.employee_id || !form.start_date || !form.end_date || !form.reason) {
      toast.error('Please fill all required fields'); return;
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      toast.error('End date cannot be earlier than start date'); return;
    }
    try {
      await api.post('/hrms/leaves', form);
      toast.success('Leave applied successfully');
      setOpen(false);
      setForm({ employee_id: '', leave_type: 'Casual', start_date: '', end_date: '', reason: '' });
      setLeaveBalance(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply leave');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/hrms/leaves/${id}/status`, { status });
      toast.success(`Leave ${status.toLowerCase()} successfully`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${status.toLowerCase()} leave`);
    }
  };

  const statusColor = (s) => {
    if (s === 'Approved') return { bgcolor: '#dcfce7', color: '#166534' };
    if (s === 'Rejected') return { bgcolor: '#fee2e2', color: '#991b1b' };
    return { bgcolor: '#fef9c3', color: '#854d0e' };
  };

  // Stats
  const pending = leaves.filter(l => l.status === 'Pending').length;
  const approved = leaves.filter(l => l.status === 'Approved').length;
  const rejected = leaves.filter(l => l.status === 'Rejected').length;

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Applications', value: leaves.length, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Pending Approval', value: pending, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Approved', value: approved, color: '#10b981', bg: '#f0fdf4' },
          { label: 'Rejected', value: rejected, color: '#ef4444', bg: '#fef2f2' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card sx={{ bgcolor: s.bg, border: `1px solid ${s.color}22`, borderRadius: 3, textAlign: 'center' }}>
              <CardContent sx={{ py: '12px !important' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>All Leave Applications</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #f59e0b, #d97706)', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(245,158,11,0.4)' }, transition: 'all 0.2s' }}>
          Apply Leave
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
      ) : leaves.length === 0 ? (
        <Alert severity="info">No leave applications found. Click "Apply Leave" to submit one.</Alert>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                  {['Employee', 'Type', 'Duration', 'Days', 'Reason', 'Status', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.map(leave => (
                  <TableRow key={leave.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#f59e0b', fontSize: '0.8rem' }}>
                          {leave.employee?.user?.first_name?.[0] || '?'}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {leave.employee?.user?.first_name} {leave.employee?.user?.last_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={leaveTypeIcons[leave.leave_type] || <EventNote />}
                        label={leave.leave_type}
                        size="small"
                        sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(leave.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} –{' '}
                      {new Date(leave.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </TableCell>
                    <TableCell><Chip label={`${leave.total_days}d`} size="small" sx={{ bgcolor: '#e0f2fe', color: '#0284c7', fontWeight: 700 }} /></TableCell>
                    <TableCell sx={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{leave.reason}</TableCell>
                    <TableCell><Chip label={leave.status} size="small" sx={{ fontWeight: 700, ...statusColor(leave.status) }} /></TableCell>
                    <TableCell>
                      {leave.status === 'Pending' && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Approve">
                            <Button size="small" variant="contained" color="success" onClick={() => handleStatus(leave.id, 'Approved')} sx={{ minWidth: 0, px: 1, borderRadius: 2 }}>✓</Button>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <Button size="small" variant="contained" color="error" onClick={() => handleStatus(leave.id, 'Rejected')} sx={{ minWidth: 0, px: 1, borderRadius: 2 }}>✗</Button>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Apply Leave Dialog */}
      <Dialog open={open} onClose={() => { setOpen(false); setLeaveBalance(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Apply Leave</DialogTitle>
        <DialogContent>
          <TextField
            select fullWidth margin="normal" label="Employee *"
            value={form.employee_id}
            onChange={e => { setForm({ ...form, employee_id: e.target.value }); fetchBalance(e.target.value); }}
          >
            <MenuItem value="">Select Employee</MenuItem>
            {employees.map(emp => <MenuItem key={emp.id} value={emp.id}>{emp.user?.first_name} {emp.user?.last_name}</MenuItem>)}
          </TextField>

          {leaveBalance && (
            <Card sx={{ mt: 1, mb: 1, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 3 }}>
              <CardContent sx={{ py: '12px !important' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Leave Balance</Typography>
                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                  {[
                    { label: 'Sick', used: leaveBalance.sick_leave_used, total: leaveBalance.sick_leave_total || leaveBalance.sick_leave || 12 },
                    { label: 'Casual', used: leaveBalance.casual_leave_used, total: leaveBalance.casual_leave_total || leaveBalance.casual_leave || 12 },
                    { label: 'Earned', used: leaveBalance.earned_leave_used, total: leaveBalance.earned_leave_total || leaveBalance.earned_leave || 15 },
                  ].map(lb => (
                    <Grid item xs={4} key={lb.label}>
                      <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 2, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" color="text.secondary">{lb.label}</Typography>
                        <Typography variant="body1" fontWeight={800} color={(lb.total - lb.used) > 0 ? '#10b981' : '#ef4444'}>
                          {lb.total - (lb.used || 0)}<span style={{ fontSize: 10, color: '#94a3b8' }}>/{lb.total}</span>
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          <TextField select fullWidth margin="normal" label="Leave Type *" value={form.leave_type} onChange={e => setForm({ ...form, leave_type: e.target.value })}>
            {['Sick', 'Casual', 'Earned', 'Maternity', 'Paternity', 'Unpaid'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField fullWidth margin="normal" type="date" label="Start Date *" InputLabelProps={{ shrink: true }} value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth margin="normal" type="date" label="End Date *" InputLabelProps={{ shrink: true }} value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
            </Grid>
          </Grid>
          <TextField fullWidth margin="normal" multiline rows={3} label="Reason *" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button fullWidth variant="outlined" onClick={() => { setOpen(false); setLeaveBalance(null); }} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button fullWidth variant="contained" onClick={handleSubmit} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>Submit Application</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// ── Leave Balances Tab ───────────────────────────────────────────────────────
function LeaveBalances() {
  const [employees, setEmployees] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/hrms/employees');
      const emps = res.data.employees || [];
      setEmployees(emps);
      // Fetch balance for each employee
      const bals = {};
      await Promise.allSettled(emps.map(async emp => {
        try {
          const r = await api.get(`/hrms/leaves/balance/${emp.id}`);
          bals[emp.id] = r.data.balance;
        } catch { bals[emp.id] = null; }
      }));
      setBalances(bals);
    } catch {
      toast.error('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>Employee Leave Balances — {new Date().getFullYear()}</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
      ) : employees.length === 0 ? (
        <Alert severity="info">No employees found.</Alert>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                  {['Employee', 'Sick Leave', 'Casual Leave', 'Earned Leave', 'Total Used'].map(h => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map(emp => {
                  const b = balances[emp.id];
                  const sick = { used: b?.sick_leave_used || 0, total: b?.sick_leave_total || b?.sick_leave || 12 };
                  const casual = { used: b?.casual_leave_used || 0, total: b?.casual_leave_total || b?.casual_leave || 12 };
                  const earned = { used: b?.earned_leave_used || 0, total: b?.earned_leave_total || b?.earned_leave || 15 };
                  const totalUsed = sick.used + casual.used + earned.used;

                  const BalChip = ({ used, total }) => (
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Chip label={`${total - used} left`} size="small" sx={{ bgcolor: (total - used) > 0 ? '#dcfce7' : '#fee2e2', color: (total - used) > 0 ? '#166534' : '#991b1b', fontWeight: 700 }} />
                      <Typography variant="caption" color="text.secondary">of {total}</Typography>
                    </Box>
                  );

                  return (
                    <TableRow key={emp.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#3b82f6', fontSize: '0.8rem' }}>
                            {emp.user?.first_name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{emp.user?.first_name} {emp.user?.last_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{emp.designation}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{b ? <BalChip used={sick.used} total={sick.total} /> : <Typography variant="caption" color="text.secondary">N/A</Typography>}</TableCell>
                      <TableCell>{b ? <BalChip used={casual.used} total={casual.total} /> : <Typography variant="caption" color="text.secondary">N/A</Typography>}</TableCell>
                      <TableCell>{b ? <BalChip used={earned.used} total={earned.total} /> : <Typography variant="caption" color="text.secondary">N/A</Typography>}</TableCell>
                      <TableCell><Chip label={`${totalUsed} days`} size="small" sx={{ bgcolor: totalUsed > 0 ? '#fef9c3' : '#f1f5f9', color: totalUsed > 0 ? '#854d0e' : '#64748b', fontWeight: 700 }} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
