import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Paper, CircularProgress,
  Alert, Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Dialog, DialogTitle, DialogContent, TextField, MenuItem,
  Avatar, Tooltip, Switch, FormControlLabel, Divider
} from '@mui/material';
import { Schedule, Add, Edit, Delete, AccessTime, CheckCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function ShiftScheduling() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editShift, setEditShift] = useState(null);
  const [form, setForm] = useState({ name: '', start_time: '09:00', end_time: '18:00', grace_period_minutes: 15 });

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/hrms/shifts');
      setShifts(res.data.shifts || []);
    } catch { toast.error('Failed to load shifts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleOpen = (shift = null) => {
    setEditShift(shift);
    if (shift) {
      setForm({ name: shift.name, start_time: shift.start_time?.slice(0, 5) || '09:00', end_time: shift.end_time?.slice(0, 5) || '18:00', grace_period_minutes: shift.grace_period_minutes || 15 });
    } else {
      setForm({ name: '', start_time: '09:00', end_time: '18:00', grace_period_minutes: 15 });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Shift name is required'); return; }
    try {
      if (editShift) {
        await api.put(`/hrms/shifts/${editShift.id}`, form);
        toast.success('Shift updated!');
      } else {
        await api.post('/hrms/shifts', form);
        toast.success('Shift created!');
      }
      setOpen(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save shift'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shift?')) return;
    try {
      await api.delete(`/hrms/shifts/${id}`);
      toast.success('Shift deleted');
      fetch();
    } catch { toast.error('Failed to delete shift'); }
  };

  const calcHours = (start, end) => {
    if (!start || !end) return '?';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : '?';
  };

  const shiftColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(6,182,212,0.12)', color: '#06b6d4', display: 'flex' }}>
          <Schedule fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Shift Scheduling</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Define and manage work shifts for your organization.</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>Work Shifts ({shifts.length})</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg, #06b6d4, #0891b2)', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(6,182,212,0.4)' }, transition: 'all 0.2s' }}>
          Add Shift
        </Button>
      </Box>

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        : shifts.length === 0 ? (
          <Alert severity="info">No shifts defined yet. Add your first shift!</Alert>
        ) : (
          <Grid container spacing={3}>
            {shifts.map((shift, i) => (
              <Grid item xs={12} sm={6} md={4} key={shift.id}>
                <Card sx={{ borderRadius: 4, border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' } }}>
                  <Box sx={{ background: `linear-gradient(135deg, ${shiftColors[i % shiftColors.length]}, ${shiftColors[i % shiftColors.length]}cc)`, p: 3, color: 'white', textAlign: 'center' }}>
                    <AccessTime sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h5" fontWeight={800}>{shift.name}</Typography>
                    <Chip label={shift.is_active ? 'Active' : 'Inactive'} size="small" sx={{ bgcolor: shift.is_active ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)', color: 'white', mt: 1, fontWeight: 700 }} />
                  </Box>
                  <CardContent>
                    <Grid container spacing={1} sx={{ mb: 1 }}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">Start Time</Typography>
                          <Typography variant="h6" fontWeight={800} color="#10b981">{shift.start_time?.slice(0, 5) || '—'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#fff7ed', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">End Time</Typography>
                          <Typography variant="h6" fontWeight={800} color="#f59e0b">{shift.end_time?.slice(0, 5) || '—'}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">Duration</Typography>
                        <Typography variant="body1" fontWeight={700}>{calcHours(shift.start_time, shift.end_time)}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">Grace Period</Typography>
                        <Typography variant="body1" fontWeight={700}>{shift.grace_period_minutes} min</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button fullWidth size="small" variant="outlined" startIcon={<Edit />} onClick={() => handleOpen(shift)} sx={{ borderRadius: 2, textTransform: 'none' }}>Edit</Button>
                      <Button fullWidth size="small" variant="outlined" color="error" startIcon={<Delete />} onClick={() => handleDelete(shift.id)} sx={{ borderRadius: 2, textTransform: 'none' }}>Delete</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editShift ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Shift Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} sx={{ mt: 1, mb: 2 }} placeholder="e.g. Morning Shift, Night Shift" />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField fullWidth type="time" label="Start Time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="time" label="End Time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
          <TextField fullWidth type="number" label="Grace Period (minutes)" value={form.grace_period_minutes} onChange={e => setForm({ ...form, grace_period_minutes: parseInt(e.target.value) || 0 })} sx={{ mt: 2 }} />
          {form.start_time && form.end_time && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Total Duration</Typography>
              <Typography variant="h6" fontWeight={800} color="#10b981">{calcHours(form.start_time, form.end_time)}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button fullWidth variant="outlined" onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button fullWidth variant="contained" onClick={handleSave} sx={{ borderRadius: 2, bgcolor: '#06b6d4', '&:hover': { bgcolor: '#0891b2' } }}>
              {editShift ? 'Update' : 'Create'} Shift
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
