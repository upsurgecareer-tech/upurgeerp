import { useState, useEffect, useCallback } from 'react';
import {
  Box, Tabs, Tab, Typography, Grid, Card, CardContent, Button,
  Paper, CircularProgress, Alert, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tooltip, Fade, Divider,
  TextField, InputAdornment, Avatar, MenuItem
} from '@mui/material';
import {
  CheckCircle, Schedule, LocationOn, AccessTime, CalendarToday,
  Fingerprint, EventNote, Login, Logout, Search
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function AttendanceManagement() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Check-In / Out', icon: <Fingerprint /> },
    { label: 'Daily Attendance', icon: <EventNote /> },
    { label: 'My History', icon: <CalendarToday /> }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'flex' }}>
          <Schedule fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Attendance & Time Tracking</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage daily check-ins, track work hours, and view team attendance.</Typography>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 3, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.07)' }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            '& .MuiTab-root': { minHeight: 64, fontWeight: 600, color: '#64748b', textTransform: 'none', fontSize: '0.95rem', '&.Mui-selected': { color: '#3b82f6' } },
            '& .MuiTabs-indicator': { height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3, bgcolor: '#3b82f6' }
          }}
        >
          {tabs.map((tab, idx) => (
            <Tab key={idx} icon={tab.icon} iconPosition="start" label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      <Fade in={true} key={activeTab}>
        <Box>
          {activeTab === 0 && <CheckInOut />}
          {activeTab === 1 && <DailyAttendance />}
          {activeTab === 2 && <MyAttendanceHistory />}
        </Box>
      </Fade>
    </Box>
  );
}

// ── Check-In / Out Panel ─────────────────────────────────────────────────────
function CheckInOut() {
  const [loading, setLoading] = useState(false);
  const [locationStr, setLocationStr] = useState('');
  const [todayAtt, setTodayAtt] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchMyToday();
    return () => clearInterval(timer);
  }, []);

  const fetchMyToday = async () => {
    try {
      setFetching(true);
      const res = await api.get('/hrms/attendance/my-today');
      setTodayAtt(res.data.attendance);
    } catch (err) {
      // Not an employee – silent
    } finally {
      setFetching(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const res = await api.post('/hrms/attendance/check-in', { location: locationStr });
      toast.success(res.data.message);
      setTodayAtt(res.data.attendance);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      const res = await api.post('/hrms/attendance/check-out');
      toast.success(res.data.message);
      setTodayAtt(res.data.attendance);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocationStr(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`); toast.success('Location captured'); },
        () => toast.error('Could not get location')
      );
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

  const checkedIn = todayAtt?.check_in;
  const checkedOut = todayAtt?.check_out;

  return (
    <Grid container spacing={3}>
      {/* Live Clock */}
      <Grid item xs={12} md={4}>
        <Card sx={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', borderRadius: 4, boxShadow: '0 20px 60px rgba(30,41,59,0.4)', p: 1 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <AccessTime sx={{ fontSize: 48, mb: 1, opacity: 0.8 }} />
            <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: -2, fontFamily: 'monospace' }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.7, mt: 1 }}>
              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.15)' }} />
            <Chip
              label={checkedIn && !checkedOut ? '🟢 Checked In' : checkedOut ? '🔴 Checked Out' : '⚪ Not Checked In'}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, fontSize: '0.9rem', px: 1 }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Action Panel */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#1e293b' }}>Today's Attendance</Typography>

          {fetching ? <CircularProgress /> : (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                    <Login sx={{ color: '#16a34a', mb: 0.5 }} />
                    <Typography variant="caption" color="text.secondary" display="block">Check In</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#16a34a' }}>{fmt(todayAtt?.check_in)}</Typography>
                    {todayAtt?.is_late && <Chip label="Late" size="small" color="warning" sx={{ mt: 0.5 }} />}
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#fff7ed', border: '1px solid #fed7aa', textAlign: 'center' }}>
                    <Logout sx={{ color: '#ea580c', mb: 0.5 }} />
                    <Typography variant="caption" color="text.secondary" display="block">Check Out</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#ea580c' }}>{fmt(todayAtt?.check_out)}</Typography>
                    {todayAtt?.total_hours && <Typography variant="caption" color="text.secondary">{todayAtt.total_hours}h worked</Typography>}
                  </Box>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                size="small"
                label="Location (optional)"
                value={locationStr}
                onChange={(e) => setLocationStr(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Use my current location">
                        <Button size="small" startIcon={<LocationOn />} onClick={getLocation} sx={{ textTransform: 'none' }}>GPS</Button>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth variant="contained" size="large"
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Login />}
                    onClick={handleCheckIn}
                    disabled={loading || !!checkedIn}
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, background: checkedIn ? '#e2e8f0' : 'linear-gradient(135deg, #10b981, #059669)', '&:not(:disabled):hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(16,185,129,0.4)' }, transition: 'all 0.3s' }}
                  >
                    {checkedIn ? 'Already Checked In' : 'Check In'}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth variant="contained" size="large"
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Logout />}
                    onClick={handleCheckOut}
                    disabled={loading || !checkedIn || !!checkedOut}
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, background: (!checkedIn || checkedOut) ? '#e2e8f0' : 'linear-gradient(135deg, #f59e0b, #d97706)', '&:not(:disabled):hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(245,158,11,0.4)' }, transition: 'all 0.3s' }}
                  >
                    {checkedOut ? 'Already Checked Out' : 'Check Out'}
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}

// ── Daily Attendance ─────────────────────────────────────────────────────────
function DailyAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/hrms/attendance/daily');
      setRecords(res.data.attendance || []);
    } catch (err) {
      toast.error('Failed to fetch daily attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = records.filter(r => {
    const name = `${r.employee?.user?.first_name} ${r.employee?.user?.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const statusColor = (s) => {
    if (s === 'Present') return { bgcolor: '#dcfce7', color: '#166534' };
    if (s === 'Half Day') return { bgcolor: '#fef9c3', color: '#854d0e' };
    if (s === 'Absent') return { bgcolor: '#fee2e2', color: '#991b1b' };
    return { bgcolor: '#f1f5f9', color: '#475569' };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>Today's Team Attendance</Typography>
        <TextField
          size="small" placeholder="Search employee..."
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>, sx: { borderRadius: 2 } }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Alert severity="info">No attendance records for today yet.</Alert>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Employee</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Department</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Check In</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Check Out</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Hours</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#3b82f6', fontSize: '0.8rem' }}>
                          {(r.employee?.user?.first_name?.[0] || '?')}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {r.employee?.user?.first_name} {r.employee?.user?.last_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{r.employee?.department?.name || '—'}</TableCell>
                    <TableCell sx={{ color: '#16a34a', fontWeight: 600 }}>
                      {r.check_in ? new Date(r.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      {r.is_late && <Chip label="Late" size="small" color="warning" sx={{ ml: 1 }} />}
                    </TableCell>
                    <TableCell sx={{ color: '#ea580c', fontWeight: 600 }}>
                      {r.check_out ? new Date(r.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#0284c7' }}>
                      {r.total_hours ? `${r.total_hours}h` : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip label={r.status} size="small" sx={{ fontWeight: 700, ...statusColor(r.status) }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

// ── My Attendance History ─────────────────────────────────────────────────────
function MyAttendanceHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [employeeId, setEmployeeId] = useState(null);

  const fetchMyId = useCallback(async () => {
    try {
      const res = await api.get('/hrms/attendance/my-today');
      setEmployeeId(res.data.employee_id);
    } catch (err) { /* not an employee */ }
  }, []);

  const fetchHistory = useCallback(async (empId) => {
    if (!empId) return;
    try {
      setLoading(true);
      const res = await api.get(`/hrms/attendance/employee/${empId}`, { params: { month, year } });
      setRecords(res.data.attendance || []);
    } catch (err) {
      toast.error('Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchMyId(); }, [fetchMyId]);
  useEffect(() => { if (employeeId) fetchHistory(employeeId); }, [employeeId, fetchHistory]);

  const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const years = ['2024','2025','2026'];

  const statusColor = (s) => {
    if (s === 'Present') return { bgcolor: '#dcfce7', color: '#166534' };
    if (s === 'Half Day') return { bgcolor: '#fef9c3', color: '#854d0e' };
    if (s === 'Absent') return { bgcolor: '#fee2e2', color: '#991b1b' };
    return { bgcolor: '#f1f5f9', color: '#475569' };
  };

  const present = records.filter(r => r.status === 'Present').length;
  const absent = records.filter(r => r.status === 'Absent').length;
  const halfDay = records.filter(r => r.status === 'Half Day').length;
  const totalHours = records.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0).toFixed(1);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', flex: 1 }}>My Attendance History</Typography>
        <TextField select size="small" label="Month" value={month} onChange={e => setMonth(e.target.value)} sx={{ minWidth: 120 }}>
          {months.map((m, i) => <MenuItem key={m} value={m}>{monthNames[i]}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Year" value={year} onChange={e => setYear(e.target.value)} sx={{ minWidth: 100 }}>
          {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </TextField>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Present', value: present, color: '#10b981', bg: '#f0fdf4' },
          { label: 'Absent', value: absent, color: '#ef4444', bg: '#fef2f2' },
          { label: 'Half Day', value: halfDay, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Total Hours', value: `${totalHours}h`, color: '#3b82f6', bg: '#eff6ff' },
        ].map(stat => (
          <Grid item xs={6} sm={3} key={stat.label}>
            <Card sx={{ bgcolor: stat.bg, border: `1px solid ${stat.color}22`, borderRadius: 3, textAlign: 'center', p: 1 }}>
              <CardContent sx={{ py: '12px !important' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: stat.color }}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!employeeId ? (
        <Alert severity="warning">You are not registered as an employee. Please contact HR.</Alert>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
      ) : records.length === 0 ? (
        <Alert severity="info">No attendance records for {monthNames[parseInt(month) - 1]} {year}.</Alert>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Check In</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Check Out</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Hours</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map(r => (
                  <TableRow key={r.id} hover>
                    <TableCell fontWeight={600}>
                      {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' })}
                    </TableCell>
                    <TableCell sx={{ color: '#16a34a', fontWeight: 600 }}>
                      {r.check_in ? new Date(r.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </TableCell>
                    <TableCell sx={{ color: '#ea580c', fontWeight: 600 }}>
                      {r.check_out ? new Date(r.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 700 }}>
                      {r.total_hours ? `${r.total_hours}h` : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip label={r.status} size="small" sx={{ fontWeight: 700, ...statusColor(r.status) }} />
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', fontSize: '0.8rem' }}>{r.location || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
