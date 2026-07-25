import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, CircularProgress,
  Alert, Chip, Avatar, Dialog, DialogTitle, DialogContent, TextField,
  MenuItem, Divider, Paper, LinearProgress
} from '@mui/material';
import {
  Person, Event, Receipt, Description, Download, AccessTime, History,
  BeachAccess, CheckCircle, AttachMoney, LocalHospital
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function EmployeeSelfService() {
  const navigate = useNavigate();
  const [myData, setMyData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [attendanceToday, setAttendanceToday] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyLeaveOpen, setApplyLeaveOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ leave_type: 'Casual', start_date: '', end_date: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch today's attendance (also returns employee_id)
      const attRes = await api.get('/hrms/attendance/my-today').catch(() => null);
      if (attRes?.data?.employee_id) {
        const empId = attRes.data.employee_id;
        setAttendanceToday(attRes.data.attendance);

        // Fetch employee details
        const empRes = await api.get(`/hrms/employees/${empId}`).catch(() => null);
        setMyData(empRes?.data?.employee || null);

        // Fetch leave balance
        const balRes = await api.get(`/hrms/leaves/balance/${empId}`).catch(() => null);
        setLeaveBalance(balRes?.data?.balance || null);

        // Fetch my recent leaves
        const leavesRes = await api.get('/hrms/leaves', { params: { employee_id: empId } }).catch(() => null);
        setRecentLeaves((leavesRes?.data?.leaves || []).slice(0, 5));
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleCheckIn = async () => {
    try {
      const res = await api.post('/hrms/attendance/check-in', {});
      toast.success(res.data.message);
      setAttendanceToday(res.data.attendance);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to check in'); }
  };

  const handleCheckOut = async () => {
    try {
      const res = await api.post('/hrms/attendance/check-out');
      toast.success(res.data.message);
      setAttendanceToday(res.data.attendance);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to check out'); }
  };

  const handleApplyLeave = async () => {
    if (!myData) { toast.error('Employee record not found'); return; }
    if (!leaveForm.start_date || !leaveForm.end_date || !leaveForm.reason) { toast.error('Please fill all fields'); return; }
    try {
      setSubmitting(true);
      await api.post('/hrms/leaves', { ...leaveForm, employee_id: myData.id });
      toast.success('Leave applied successfully!');
      setApplyLeaveOpen(false);
      setLeaveForm({ leave_type: 'Casual', start_date: '', end_date: '', reason: '' });
      loadAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to apply leave'); }
    finally { setSubmitting(false); }
  };

  const fmt = d => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;

  if (!myData) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="warning" sx={{ borderRadius: 3 }}>
        You are not registered as an employee. Please contact HR to set up your employee profile.
      </Alert>
    </Box>
  );

  const sick = { used: leaveBalance?.sick_leave_used || 0, total: leaveBalance?.sick_leave_total || leaveBalance?.sick_leave || 12 };
  const casual = { used: leaveBalance?.casual_leave_used || 0, total: leaveBalance?.casual_leave_total || leaveBalance?.casual_leave || 12 };
  const earned = { used: leaveBalance?.earned_leave_used || 0, total: leaveBalance?.earned_leave_total || leaveBalance?.earned_leave || 15 };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Profile Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 4, background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 72, height: 72, fontSize: '1.8rem', bgcolor: '#3b82f6', border: '3px solid rgba(255,255,255,0.3)' }}>
            {myData.user?.first_name?.[0]}{myData.user?.last_name?.[0]}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={800}>{myData.user?.first_name} {myData.user?.last_name}</Typography>
            <Typography sx={{ opacity: 0.8 }}>{myData.designation} · {myData.department?.name || 'No Department'}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>EMP ID: {myData.employee_code}</Typography>
          </Box>
          <Chip label={myData.status} sx={{ bgcolor: myData.status === 'Active' ? '#10b981' : '#ef4444', color: 'white', fontWeight: 700, fontSize: '0.9rem', px: 1 }} />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Today's Attendance */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime color="primary" /> Today's Attendance
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Check In</Typography>
                    <Typography variant="h6" fontWeight={800} color="#10b981">{fmt(attendanceToday?.check_in)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: '#fff7ed', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Check Out</Typography>
                    <Typography variant="h6" fontWeight={800} color="#f59e0b">{fmt(attendanceToday?.check_out)}</Typography>
                  </Box>
                </Grid>
              </Grid>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button fullWidth variant="contained" onClick={handleCheckIn} disabled={!!attendanceToday?.check_in}
                    sx={{ borderRadius: 2, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, textTransform: 'none', fontWeight: 700 }}>
                    {attendanceToday?.check_in ? '✓ Checked In' : 'Check In'}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button fullWidth variant="contained" onClick={handleCheckOut} disabled={!attendanceToday?.check_in || !!attendanceToday?.check_out}
                    sx={{ borderRadius: 2, bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' }, textTransform: 'none', fontWeight: 700 }}>
                    {attendanceToday?.check_out ? '✓ Checked Out' : 'Check Out'}
                  </Button>
                </Grid>
              </Grid>
              {attendanceToday?.total_hours && (
                <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                  <Chip label={`${attendanceToday.total_hours}h worked today`} color="primary" variant="outlined" size="small" sx={{ fontWeight: 700 }} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Balance */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BeachAccess color="warning" /> Leave Balance
                </Typography>
                <Button size="small" variant="contained" onClick={() => setApplyLeaveOpen(true)}
                  sx={{ borderRadius: 2, bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' }, textTransform: 'none', fontWeight: 600 }}>
                  Apply Leave
                </Button>
              </Box>
              {[
                { label: 'Sick Leave', icon: <LocalHospital sx={{ fontSize: 16 }} />, ...sick, color: '#ef4444', bg: '#fef2f2' },
                { label: 'Casual Leave', icon: <BeachAccess sx={{ fontSize: 16 }} />, ...casual, color: '#3b82f6', bg: '#eff6ff' },
                { label: 'Earned Leave', icon: <CheckCircle sx={{ fontSize: 16 }} />, ...earned, color: '#10b981', bg: '#f0fdf4' },
              ].map(lb => (
                <Box key={lb.label} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ color: lb.color }}>{lb.icon}</Box>
                      <Typography variant="body2" fontWeight={600}>{lb.label}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700} color={lb.color}>{lb.total - lb.used} / {lb.total} left</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={((lb.total - lb.used) / lb.total) * 100}
                    sx={{ height: 8, borderRadius: 4, bgcolor: `${lb.color}22`, '& .MuiLinearProgress-bar': { bgcolor: lb.color, borderRadius: 4 } }} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Leave Applications */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 4, border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <History color="action" /> My Recent Leave Applications
              </Typography>
              {recentLeaves.length === 0 ? (
                <Alert severity="info">No leave applications yet.</Alert>
              ) : (
                recentLeaves.map(l => (
                  <Box key={l.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{l.leave_type} Leave</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(l.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – {new Date(l.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} ({l.total_days} days)
                      </Typography>
                    </Box>
                    <Chip label={l.status} size="small" sx={{ fontWeight: 700, bgcolor: l.status === 'Approved' ? '#dcfce7' : l.status === 'Rejected' ? '#fee2e2' : '#fef9c3', color: l.status === 'Approved' ? '#166534' : l.status === 'Rejected' ? '#991b1b' : '#854d0e' }} />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Apply Leave Dialog */}
      <Dialog open={applyLeaveOpen} onClose={() => setApplyLeaveOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Apply for Leave</DialogTitle>
        <DialogContent>
          <TextField select fullWidth margin="normal" label="Leave Type" value={leaveForm.leave_type} onChange={e => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}>
            {['Sick', 'Casual', 'Earned', 'Maternity', 'Paternity', 'Unpaid'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField fullWidth margin="normal" type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={leaveForm.start_date} onChange={e => setLeaveForm({ ...leaveForm, start_date: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth margin="normal" type="date" label="End Date" InputLabelProps={{ shrink: true }} value={leaveForm.end_date} onChange={e => setLeaveForm({ ...leaveForm, end_date: e.target.value })} /></Grid>
          </Grid>
          <TextField fullWidth margin="normal" multiline rows={3} label="Reason" value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => setApplyLeaveOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button fullWidth variant="contained" onClick={handleApplyLeave} disabled={submitting}
              sx={{ borderRadius: 2, bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
