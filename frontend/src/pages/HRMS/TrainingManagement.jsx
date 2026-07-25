import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Paper, CircularProgress,
  Alert, Chip, Dialog, DialogTitle, DialogContent, TextField, MenuItem,
  Avatar, Divider, Fade, IconButton, Tooltip, LinearProgress
} from '@mui/material';
import { School, Add, Edit, Delete, People, CalendarToday, AccessTime } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const accent = '#6366f1';

const statusColor = { Upcoming: { bg: '#eff6ff', color: '#1d4ed8' }, Ongoing: { bg: '#f0fdf4', color: '#166534' }, Completed: { bg: '#f1f5f9', color: '#475569' }, Cancelled: { bg: '#fee2e2', color: '#991b1b' } };
const modeColor = { Online: '#0ea5e9', Offline: '#f59e0b', Hybrid: '#8b5cf6' };

export default function TrainingManagement() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editProg, setEditProg] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '', trainer_name: '', mode: 'Online', start_date: '', end_date: '', duration_hours: '', max_participants: '', department_id: '' });

  const fetch = useCallback(async () => {
    try { setLoading(true); const r = await api.get('/hrms/training', { params: filter ? { status: filter } : {} }); setPrograms(r.data.programs || []); }
    catch { toast.error('Failed to load training programs'); } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => {
    fetch();
    api.get('/hrms/departments').then(r => setDepartments(r.data.departments || [])).catch(() => {});
  }, [fetch]);

  const handleOpen = (prog = null) => {
    setEditProg(prog);
    setForm(prog ? { title: prog.title, description: prog.description || '', category: prog.category || '', trainer_name: prog.trainer_name || '', mode: prog.mode || 'Online', start_date: prog.start_date || '', end_date: prog.end_date || '', duration_hours: prog.duration_hours || '', max_participants: prog.max_participants || '', department_id: prog.department_id || '' }
      : { title: '', description: '', category: '', trainer_name: '', mode: 'Online', start_date: '', end_date: '', duration_hours: '', max_participants: '', department_id: '' });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Program title is required'); return; }
    try {
      editProg ? await api.put(`/hrms/training/${editProg.id}`, form) : await api.post('/hrms/training', form);
      toast.success(editProg ? 'Program updated!' : 'Training program created!'); setOpen(false); fetch();
    } catch (e) {
      if (e.response?.data?.errors) {
        toast.error(e.response.data.errors.map(err => err.message).join(', '));
      } else {
        toast.error(e.response?.data?.message || 'Failed to save');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this training program?')) return;
    try { await api.delete(`/hrms/training/${id}`); toast.success('Deleted'); fetch(); } catch { toast.error('Failed to delete'); }
  };

  const handleStatusChange = async (id, status) => {
    try { await api.put(`/hrms/training/${id}`, { status }); fetch(); } catch { toast.error('Failed to update'); }
  };

  const cats = ['Technical', 'Soft Skills', 'Leadership', 'Compliance', 'Safety', 'Product', 'Sales', 'HR', 'Other'];
  const modes = ['Online', 'Offline', 'Hybrid'];
  const statuses = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

  const stats = { total: programs.length, upcoming: programs.filter(p => p.status === 'Upcoming').length, ongoing: programs.filter(p => p.status === 'Ongoing').length, completed: programs.filter(p => p.status === 'Completed').length };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(99,102,241,0.12)', color: accent, display: 'flex' }}>
          <School fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Training Management</Typography>
          <Typography variant="body2" color="text.secondary">Plan, schedule and track employee training programs.</Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[{ l: 'Total Programs', v: stats.total, c: accent, bg: '#eef2ff' }, { l: 'Upcoming', v: stats.upcoming, c: '#3b82f6', bg: '#eff6ff' }, { l: 'Ongoing', v: stats.ongoing, c: '#10b981', bg: '#f0fdf4' }, { l: 'Completed', v: stats.completed, c: '#64748b', bg: '#f1f5f9' }].map(s => (
          <Grid item xs={6} sm={3} key={s.l}>
            <Card sx={{ bgcolor: s.bg, border: `1px solid ${s.c}22`, borderRadius: 3, textAlign: 'center' }}>
              <CardContent sx={{ py: '12px !important' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: s.c }}>{s.v}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.l}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <TextField select size="small" label="Filter by Status" value={filter} onChange={e => setFilter(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All Status</MenuItem>
          {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}
          sx={{ borderRadius: 2, fontWeight: 700, bgcolor: accent, '&:hover': { bgcolor: '#4f46e5', transform: 'translateY(-1px)' }, transition: 'all 0.2s' }}>
          New Program
        </Button>
      </Box>

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        : programs.length === 0 ? <Alert severity="info">No training programs yet. Create the first one!</Alert>
        : (
          <Grid container spacing={2}>
            {programs.map(prog => (
              <Grid item xs={12} md={6} lg={4} key={prog.id}>
                <Card sx={{ borderRadius: 3, border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 35px rgba(0,0,0,0.1)' } }}>
                  <Box sx={{ p: 2.5, pb: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Chip label={prog.status} size="small" sx={{ fontWeight: 700, ...(statusColor[prog.status] || {}) }} />
                      <Chip label={prog.mode} size="small" sx={{ bgcolor: `${modeColor[prog.mode]}22`, color: modeColor[prog.mode], fontWeight: 700 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, lineHeight: 1.3 }}>{prog.title}</Typography>
                    {prog.category && <Chip label={prog.category} size="small" sx={{ mb: 1, bgcolor: '#f1f5f9', color: '#475569' }} />}
                    {prog.trainer_name && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>👨‍🏫 {prog.trainer_name}</Typography>}
                    {prog.department && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>🏢 {prog.department.name}</Typography>}
                    <Grid container spacing={1} sx={{ mb: 1.5 }}>
                      {prog.start_date && <Grid item xs={6}><Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 1, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Start</Typography>
                        <Typography variant="body2" fontWeight={700}>{new Date(prog.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Typography>
                      </Box></Grid>}
                      {prog.end_date && <Grid item xs={6}><Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 1, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">End</Typography>
                        <Typography variant="body2" fontWeight={700}>{new Date(prog.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Typography>
                      </Box></Grid>}
                    </Grid>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {prog.duration_hours && <Typography variant="caption" color="text.secondary">⏱ {prog.duration_hours}h</Typography>}
                      {prog.max_participants && <Typography variant="caption" color="text.secondary">👥 Max {prog.max_participants}</Typography>}
                    </Box>
                  </Box>
                  <Box sx={{ p: 2, pt: 1.5, mt: 'auto' }}>
                    <Divider sx={{ mb: 1.5 }} />
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField select size="small" value={prog.status} onChange={e => handleStatusChange(prog.id, e.target.value)} sx={{ flex: 1, '& .MuiSelect-select': { py: '5px', fontSize: '0.78rem' } }}>
                        {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </TextField>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(prog)}><Edit fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(prog.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editProg ? 'Edit Program' : 'Create Training Program'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={8}><TextField fullWidth label="Program Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField select fullWidth label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <MenuItem value="">Select</MenuItem>
              {cats.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Trainer Name" value={form.trainer_name} onChange={e => setForm({ ...form, trainer_name: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField select fullWidth label="Mode" value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
              {modes.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField></Grid>
            <Grid item xs={12} md={4}><TextField select fullWidth label="Department" value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })}>
              <MenuItem value="">All Departments</MenuItem>
              {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="date" label="End Date" InputLabelProps={{ shrink: true }} value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Duration (hours)" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Max Participants" value={form.max_participants} onChange={e => setForm({ ...form, max_participants: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button fullWidth variant="outlined" onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button fullWidth variant="contained" onClick={handleSave} sx={{ borderRadius: 2, bgcolor: accent, '&:hover': { bgcolor: '#4f46e5' } }}>{editProg ? 'Update' : 'Create'} Program</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
