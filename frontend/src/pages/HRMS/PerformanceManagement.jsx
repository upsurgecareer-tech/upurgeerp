import { useState, useEffect, useCallback } from 'react';
import {
  Box, Tabs, Tab, Typography, Grid, Card, CardContent, Button, Paper,
  CircularProgress, Alert, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, TextField,
  MenuItem, Avatar, Rating, LinearProgress, Divider, Slider, Fade
} from '@mui/material';
import {
  TrendingUp, Add, Star, Edit, Delete, CheckCircle, Person, Assessment
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function PerformanceManagement() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: 'Reviews', icon: <Assessment /> },
    { label: 'Add Review', icon: <Add /> },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(139,92,246,0.12)', color: '#8b5cf6', display: 'flex' }}>
          <TrendingUp fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Performance Management</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Track employee performance reviews, ratings and goal progress.</Typography>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 8px 32px rgba(31,38,135,0.07)' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ px: 2, '& .MuiTab-root': { minHeight: 64, fontWeight: 600, color: '#64748b', textTransform: 'none', '&.Mui-selected': { color: '#8b5cf6' } }, '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: '#8b5cf6' } }}>
          {tabs.map((t, i) => <Tab key={i} icon={t.icon} iconPosition="start" label={t.label} />)}
        </Tabs>
      </Paper>

      <Fade in key={activeTab}>
        <Box>
          {activeTab === 0 && <ReviewsList />}
          {activeTab === 1 && <AddReview onSuccess={() => setActiveTab(0)} />}
        </Box>
      </Fade>
    </Box>
  );
}

// ── Reviews List ─────────────────────────────────────────────────────────────
function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/hrms/performance');
      setReviews(res.data.reviews || []);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAcknowledge = async (id) => {
    try {
      await api.patch(`/hrms/performance/${id}/acknowledge`);
      toast.success('Review acknowledged!');
      fetch();
    } catch { toast.error('Failed to acknowledge'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/hrms/performance/${id}`);
      toast.success('Review deleted');
      fetch();
    } catch { toast.error('Failed to delete'); }
  };

  const ratingColor = (r) => r >= 4 ? '#10b981' : r >= 3 ? '#f59e0b' : '#ef4444';

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + parseFloat(r.overall_rating || 0), 0) / reviews.length).toFixed(1) : 0;

  return (
    <Box>
      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Reviews', value: reviews.length, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'Avg Rating', value: `${avgRating}/5`, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Acknowledged', value: reviews.filter(r => r.status === 'Acknowledged').length, color: '#10b981', bg: '#f0fdf4' },
          { label: 'Pending', value: reviews.filter(r => r.status !== 'Acknowledged').length, color: '#ef4444', bg: '#fef2f2' },
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

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        : reviews.length === 0 ? <Alert severity="info">No performance reviews yet. Add the first review using the "Add Review" tab.</Alert>
        : (
          <Grid container spacing={2}>
            {reviews.map(r => (
              <Grid item xs={12} md={6} key={r.id}>
                <Card sx={{ borderRadius: 3, border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#8b5cf6', width: 40, height: 40 }}>
                          {r.employee?.user?.first_name?.[0] || '?'}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={700}>{r.employee?.user?.first_name} {r.employee?.user?.last_name}</Typography>
                          <Typography variant="caption" color="text.secondary">Period: {r.review_period}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={r.status} size="small" sx={{ fontWeight: 700, bgcolor: r.status === 'Acknowledged' ? '#dcfce7' : '#fef9c3', color: r.status === 'Acknowledged' ? '#166534' : '#854d0e' }} />
                      </Box>
                    </Box>

                    {/* Overall Rating */}
                    <Box sx={{ textAlign: 'center', mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: ratingColor(parseFloat(r.overall_rating)) }}>
                        {parseFloat(r.overall_rating || 0).toFixed(1)}
                      </Typography>
                      <Rating value={parseFloat(r.overall_rating || 0)} readOnly precision={0.5} sx={{ color: '#f59e0b' }} />
                      <Typography variant="caption" color="text.secondary">Overall Rating</Typography>
                    </Box>

                    {/* Skills Breakdown */}
                    {[
                      { label: 'Technical Skills', value: r.technical_skills },
                      { label: 'Communication', value: r.communication },
                      { label: 'Teamwork', value: r.teamwork },
                      { label: 'Punctuality', value: r.punctuality },
                      { label: 'Quality of Work', value: r.quality_of_work },
                    ].map(skill => (
                      <Box key={skill.label} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                          <Typography variant="caption" color="text.secondary">{skill.label}</Typography>
                          <Typography variant="caption" fontWeight={700} color={ratingColor(skill.value / 2)}>{skill.value}/10</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={(skill.value || 0) * 10} sx={{ height: 6, borderRadius: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: ratingColor(skill.value / 2), borderRadius: 3 } }} />
                      </Box>
                    ))}

                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      {r.status !== 'Acknowledged' && (
                        <Button size="small" variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => handleAcknowledge(r.id)} sx={{ borderRadius: 2, textTransform: 'none' }}>
                          Acknowledge
                        </Button>
                      )}
                      <Button size="small" variant="outlined" color="error" startIcon={<Delete />} onClick={() => handleDelete(r.id)} sx={{ borderRadius: 2, textTransform: 'none' }}>
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
    </Box>
  );
}

// ── Add Review ───────────────────────────────────────────────────────────────
function AddReview({ onSuccess }) {
  const [employees, setEmployees] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    employee_id: '', review_period: '', reviewer_id: '',
    technical_skills: 5, communication: 5, teamwork: 5, punctuality: 5, quality_of_work: 5,
    strengths: '', areas_of_improvement: '', goals: '', comments: ''
  });

  useEffect(() => {
    api.get('/hrms/employees').then(res => setEmployees(res.data.employees || [])).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!form.employee_id || !form.review_period) { toast.error('Employee and review period are required'); return; }
    try {
      setSaving(true);
      await api.post('/hrms/performance', form);
      toast.success('Performance review submitted!');
      onSuccess();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
    finally { setSaving(false); }
  };

  const SkillSlider = ({ label, field }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
        <Chip label={`${form[field]}/10`} size="small" sx={{ bgcolor: form[field] >= 7 ? '#dcfce7' : form[field] >= 5 ? '#fef9c3' : '#fee2e2', color: form[field] >= 7 ? '#166534' : form[field] >= 5 ? '#854d0e' : '#991b1b', fontWeight: 700 }} />
      </Box>
      <Slider value={form[field]} onChange={(e, v) => setForm({ ...form, [field]: v })} min={1} max={10} step={1} marks sx={{ color: form[field] >= 7 ? '#10b981' : form[field] >= 5 ? '#f59e0b' : '#ef4444' }} />
    </Box>
  );

  return (
    <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>New Performance Review</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField select fullWidth label="Employee *" value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}>
            <MenuItem value="">Select Employee</MenuItem>
            {employees.map(e => <MenuItem key={e.id} value={e.id}>{e.user?.first_name} {e.user?.last_name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Review Period *" placeholder="e.g. Q1 2026, Annual 2025" value={form.review_period} onChange={e => setForm({ ...form, review_period: e.target.value })} />
        </Grid>
        <Grid item xs={12}>
          <Divider><Typography variant="caption" color="text.secondary" fontWeight={600}>SKILL RATINGS (1-10)</Typography></Divider>
        </Grid>
        <Grid item xs={12} md={6}>
          <SkillSlider label="Technical Skills" field="technical_skills" />
          <SkillSlider label="Communication" field="communication" />
          <SkillSlider label="Teamwork" field="teamwork" />
        </Grid>
        <Grid item xs={12} md={6}>
          <SkillSlider label="Punctuality" field="punctuality" />
          <SkillSlider label="Quality of Work" field="quality_of_work" />
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <Typography variant="caption" color="text.secondary">Calculated Average</Typography>
            <Typography variant="h4" fontWeight={800} color="#8b5cf6">
              {((form.technical_skills + form.communication + form.teamwork + form.punctuality + form.quality_of_work) / 10).toFixed(1)}/5
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}><TextField fullWidth multiline rows={3} label="Strengths" value={form.strengths} onChange={e => setForm({ ...form, strengths: e.target.value })} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth multiline rows={3} label="Areas of Improvement" value={form.areas_of_improvement} onChange={e => setForm({ ...form, areas_of_improvement: e.target.value })} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth multiline rows={3} label="Goals for Next Period" value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} /></Grid>
        <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Additional Comments" value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} /></Grid>
        <Grid item xs={12}>
          <Button fullWidth variant="contained" size="large" onClick={handleSubmit} disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Star />}
            sx={{ borderRadius: 2, fontWeight: 700, py: 1.5, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 25px rgba(139,92,246,0.4)' }, transition: 'all 0.2s' }}>
            {saving ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
