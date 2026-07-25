import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Chip, IconButton, Tabs, Tab, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Card, CardContent, Grid, Avatar, Tooltip, InputAdornment, Divider,
  Alert, Badge, FormHelperText
} from '@mui/material';
import {
  Add, Check, Close, Phone, People, Event, Email, Videocam,
  Search, CalendarToday, AccessTime, Person, Notes, Refresh,
  FilterList, WhatsApp, Edit, Delete
} from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';

const TYPES = ['Call', 'Meeting', 'Demo', 'Email'];

const TYPE_CONFIG = {
  Call:    { color: 'primary',   icon: <Phone fontSize="small" /> },
  Meeting: { color: 'secondary', icon: <People fontSize="small" /> },
  Demo:    { color: 'warning',   icon: <Videocam fontSize="small" /> },
  Email:   { color: 'info',      icon: <Email fontSize="small" /> },
};

const STATUS_COLOR = { Pending: 'warning', Done: 'success', Cancelled: 'error' };

const emptyForm = { lead_id: '', follow_up_date: '', follow_up_type: 'Call', notes: '' };

export default function FollowUps() {
  const [tab, setTab] = useState(0);
  const [todayFollowUps, setTodayFollowUps] = useState([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchAll(); fetchLeads(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [todayRes, upcomingRes] = await Promise.all([
        api.get('/followups/today'),
        api.get('/followups/upcoming'),
      ]);
      setTodayFollowUps(todayRes.data.followUps || []);
      setUpcomingFollowUps(upcomingRes.data.followUps || []);
    } catch { 
      toast.error('Failed to fetch follow-ups'); 
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await api.get('/leads');
      setLeads(res.data.leads || res.data || []);
    } catch { setLeads([]); }
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'lead_id':
        if (!value) error = 'Please select a lead';
        break;
      case 'follow_up_date':
        if (!value) {
          error = 'Date and time are required';
        } else {
          const selectedDate = new Date(value);
          const now = new Date();
          now.setMinutes(now.getMinutes() - 5); // Allow 5 min buffer
          if (selectedDate < now) {
            error = 'Follow-up time cannot be in the past';
          }
          const maxDate = new Date();
          maxDate.setFullYear(maxDate.getFullYear() + 1);
          if (selectedDate > maxDate) {
            error = 'Follow-up cannot be more than 1 year ahead';
          }
        }
        break;
      case 'notes':
        if (value && value.length > 500) error = 'Notes must not exceed 500 characters';
        break;
    }
    return error;
  };

  const handleFieldChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleFieldBlur = (name) => {
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, formData[name]);
    setErrors({ ...errors, [name]: error });
  };

  const validateForm = () => {
    const newErrors = {};
    ['lead_id', 'follow_up_date', 'notes'].forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    setTouched({ lead_id: true, follow_up_date: true, notes: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSchedule = async () => {
    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
      return;
    }
    try {
      if (editId) {
        await api.put(`/followups/${editId}`, formData);
        toast.success('Follow-up updated');
      } else {
        await api.post(`/followups/leads/${formData.lead_id}`, formData);
        toast.success('Follow-up scheduled');
      }
      setOpen(false);
      setFormData(emptyForm);
      setErrors({});
      setTouched({});
      setEditId(null);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    }
  };

  const handleEdit = (f) => {
    setEditId(f.id);
    setFormData({
      lead_id: f.lead_id,
      follow_up_date: new Date(f.follow_up_date).toISOString().slice(0, 16),
      follow_up_type: f.follow_up_type,
      notes: f.notes || ''
    });
    setErrors({});
    setTouched({});
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this follow-up?')) return;
    try {
      await api.delete(`/followups/${id}`);
      toast.success('Follow-up deleted');
      fetchAll();
    } catch { 
      toast.error('Failed to delete'); 
    }
  };

  const markAsDone = async (id) => {
    try {
      await api.put(`/followups/${id}`, { status: 'Done' });
      toast.success('Marked as done');
      fetchAll();
    } catch { toast.error('Failed to update'); }
  };

  const handleCancel = async (id) => {
    try {
      await api.put(`/followups/${id}`, { status: 'Cancelled' });
      toast.success('Cancelled');
      fetchAll();
    } catch { toast.error('Failed to cancel'); }
  };

  const formatDate = (date) => new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const formatTime = (date) => new Date(date).toLocaleString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });

  const allFollowUps = tab === 0 ? todayFollowUps : upcomingFollowUps;
  let filtered = allFollowUps.filter(f =>
    (f.lead_name || f.lead_id?.toString() || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.notes || '').toLowerCase().includes(search.toLowerCase())
  );
  
  if (typeFilter !== 'All') {
    filtered = filtered.filter(f => f.follow_up_type === typeFilter);
  }
  if (statusFilter !== 'All') {
    filtered = filtered.filter(f => f.status === statusFilter);
  }

  const pendingToday = todayFollowUps.filter(f => f.status === 'Pending').length;
  const doneToday = todayFollowUps.filter(f => f.status === 'Done').length;

  const StatBox = ({ label, value, color }) => (
    <Paper sx={{ p: 2, textAlign: 'center', borderTop: 3, borderColor: `${color}.main` }}>
      <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>{value}</Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Paper>
  );

  const FollowUpCard = ({ f }) => {
    const typeConf = TYPE_CONFIG[f.follow_up_type] || TYPE_CONFIG.Call;
    const isPast = new Date(f.follow_up_date) < new Date() && f.status === 'Pending';
    
    return (
      <Card variant="outlined" sx={{
        mb: 2,
        borderLeft: 4,
        borderColor: f.status === 'Done' ? 'success.main' : f.status === 'Cancelled' ? 'error.main' : isPast ? 'error.main' : 'warning.main',
        opacity: f.status === 'Cancelled' ? 0.6 : 1,
        bgcolor: isPast ? 'error.50' : 'background.paper'
      }}>
        <CardContent sx={{ pb: '12px !important' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Avatar sx={{ bgcolor: `${typeConf.color}.main`, width: 40, height: 40 }}>
                {typeConf.icon}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Person fontSize="small" sx={{ color: 'text.secondary' }} />
                  {f.lead_name || `Lead #${f.lead_id}`}
                  {isPast && <Chip label="OVERDUE" size="small" color="error" sx={{ ml: 1, height: 20 }} />}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip icon={typeConf.icon} label={f.follow_up_type} size="small" color={typeConf.color} variant="outlined" />
                  <Chip icon={<CalendarToday fontSize="small" />} label={formatDate(f.follow_up_date)} size="small" variant="outlined" />
                  <Chip icon={<AccessTime fontSize="small" />} label={formatTime(f.follow_up_date)} size="small" variant="outlined" />
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={f.status} color={STATUS_COLOR[f.status] || 'default'} size="small" />
              {f.status === 'Pending' && (
                <>
                  <Tooltip title="Edit">
                    <IconButton size="small" color="info" onClick={() => handleEdit(f)}
                      sx={{ bgcolor: 'info.50', '&:hover': { bgcolor: 'info.100' } }}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Mark as Done">
                    <IconButton size="small" color="success" onClick={() => markAsDone(f.id)}
                      sx={{ bgcolor: 'success.50', '&:hover': { bgcolor: 'success.100' } }}>
                      <Check fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <IconButton size="small" color="error" onClick={() => handleCancel(f.id)}
                      sx={{ bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {f.status !== 'Pending' && (
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => handleDelete(f.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
          {f.notes && (
            <>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
                <Notes fontSize="small" sx={{ color: 'text.secondary', mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary">{f.notes}</Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout title="Follow-Ups">
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">Follow-Ups Management</Typography>
            <Typography variant="body2" color="text.secondary">Track and manage all your scheduled follow-ups</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchAll} disabled={loading}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => { setEditId(null); setFormData(emptyForm); setErrors({}); setTouched({}); setOpen(true); }}>
              Schedule Follow-Up
            </Button>
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}><StatBox label="Today's Total" value={todayFollowUps.length} color="primary" /></Grid>
          <Grid item xs={6} sm={3}><StatBox label="Pending Today" value={pendingToday} color="warning" /></Grid>
          <Grid item xs={6} sm={3}><StatBox label="Done Today" value={doneToday} color="success" /></Grid>
          <Grid item xs={6} sm={3}><StatBox label="Upcoming" value={upcomingFollowUps.length} color="info" /></Grid>
        </Grid>

        {/* Tabs + Search + Filters */}
        <Paper sx={{ mb: 2 }}>
          <Box sx={{ px: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Tabs value={tab} onChange={(_, v) => { setTab(v); setSearch(''); setTypeFilter('All'); setStatusFilter('All'); }}>
                <Tab label={`Today (${todayFollowUps.length})`} icon={<Event fontSize="small" />} iconPosition="start" />
                <Tab label={`Upcoming (${upcomingFollowUps.length})`} icon={<CalendarToday fontSize="small" />} iconPosition="start" />
              </Tabs>
            </Box>
            <Grid container spacing={2} sx={{ pb: 2 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by lead or notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="All">All Types</MenuItem>
                  {TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  onClick={() => { setSearch(''); setTypeFilter('All'); setStatusFilter('All'); }}
                  disabled={!search && typeFilter === 'All' && statusFilter === 'All'}
                >
                  Clear Filters
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                  Showing: {filtered.length} of {allFollowUps.length}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Cards */}
        {filtered.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <CalendarToday sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No follow-ups found.</Typography>
          </Paper>
        ) : (
          filtered.map(f => <FollowUpCard key={f.id} f={f} />)
        )}

        {/* Schedule Dialog */}
        <Dialog open={open} onClose={() => { setOpen(false); setFormData(emptyForm); setErrors({}); setTouched({}); setEditId(null); }} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>{editId ? 'Edit Follow-Up' : 'Schedule Follow-Up'}</DialogTitle>
          <Divider />
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField 
                select 
                label="Lead" 
                value={formData.lead_id}
                onChange={(e) => handleFieldChange('lead_id', e.target.value)}
                onBlur={() => handleFieldBlur('lead_id')}
                error={touched.lead_id && !!errors.lead_id}
                helperText={touched.lead_id && errors.lead_id}
                required 
                fullWidth
                disabled={editId}
              >
                <MenuItem value="">Select a lead</MenuItem>
                {leads.map(l => <MenuItem key={l.id} value={l.id}>{l.name} — {l.mobile}</MenuItem>)}
              </TextField>
              
              <TextField 
                select 
                label="Follow-Up Type" 
                value={formData.follow_up_type}
                onChange={(e) => handleFieldChange('follow_up_type', e.target.value)}
                fullWidth
              >
                {TYPES.map(t => (
                  <MenuItem key={t} value={t}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {TYPE_CONFIG[t].icon} {t}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField 
                label="Date & Time" 
                type="datetime-local" 
                value={formData.follow_up_date}
                onChange={(e) => handleFieldChange('follow_up_date', e.target.value)}
                onBlur={() => handleFieldBlur('follow_up_date')}
                error={touched.follow_up_date && !!errors.follow_up_date}
                helperText={touched.follow_up_date && errors.follow_up_date}
                InputLabelProps={{ shrink: true }} 
                required 
                fullWidth 
              />
              
              <TextField 
                label="Notes" 
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                onBlur={() => handleFieldBlur('notes')}
                error={touched.notes && !!errors.notes}
                helperText={touched.notes ? errors.notes || `${formData.notes.length}/500 characters` : '500 characters max'}
                multiline 
                rows={3} 
                fullWidth 
                placeholder="Add any notes or agenda..." 
              />
            </Box>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => { setOpen(false); setFormData(emptyForm); setErrors({}); setTouched({}); setEditId(null); }}>Cancel</Button>
            <Button 
              onClick={handleSchedule} 
              variant="contained"
              disabled={Object.keys(errors).some(key => errors[key])}
            >
              {editId ? 'Update' : 'Schedule'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
