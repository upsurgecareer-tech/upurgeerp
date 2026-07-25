import { useState, useEffect, useCallback } from 'react';
import {
  Box, Tabs, Tab, Typography, Grid, Card, CardContent, Button, Paper,
  CircularProgress, Alert, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, TextField,
  MenuItem, Avatar, Divider, Fade, IconButton, Tooltip, LinearProgress
} from '@mui/material';
import {
  Work, Add, Edit, Delete, Person, Event, CheckCircle, GroupAdd,
  Search, Business, AttachMoney, CalendarToday, FilterList
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const accentColor = '#16a34a';

const chipColor = (status) => {
  const m = { Open: '#dcfce7:#166534', Draft: '#f1f5f9:#475569', Closed: '#fee2e2:#991b1b', 'On Hold': '#fef9c3:#854d0e', Applied: '#eff6ff:#1d4ed8', Screening: '#fef9c3:#854d0e', 'Interview Scheduled': '#f0fdf4:#166534', Interviewed: '#e0f2fe:#0369a1', Selected: '#dcfce7:#166534', Rejected: '#fee2e2:#991b1b' };
  const [bg, color] = (m[status] || '#f1f5f9:#475569').split(':');
  return { bgcolor: bg, color };
};

export default function RecruitmentManagement() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: 'Job Postings', icon: <Work /> },
    { label: 'Candidates', icon: <Person /> },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(22,163,74,0.12)', color: accentColor, display: 'flex' }}>
          <Work fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Recruitment & ATS</Typography>
          <Typography variant="body2" color="text.secondary">Manage job postings, candidates, and hiring pipeline.</Typography>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 8px 32px rgba(31,38,135,0.07)' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ px: 2, '& .MuiTab-root': { minHeight: 64, fontWeight: 600, color: '#64748b', textTransform: 'none', '&.Mui-selected': { color: accentColor } }, '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: accentColor } }}>
          {tabs.map((t, i) => <Tab key={i} icon={t.icon} iconPosition="start" label={t.label} />)}
        </Tabs>
      </Paper>

      <Fade in key={activeTab}><Box>
        {activeTab === 0 && <JobPostings />}
        {activeTab === 1 && <Candidates />}
      </Box></Fade>
    </Box>
  );
}

// ── Job Postings ──────────────────────────────────────────────────────────────
function JobPostings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ title: '', department_id: '', description: '', requirements: '', location: '', employment_type: 'Full-time', min_salary: '', max_salary: '', openings: 1, deadline: '' });

  const fetch = useCallback(async () => {
    try { setLoading(true); const r = await api.get('/hrms/recruitment/jobs'); setJobs(r.data.jobs || []); }
    catch { toast.error('Failed to load jobs'); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetch();
    api.get('/hrms/departments').then(r => setDepartments(r.data.departments || [])).catch(() => {});
  }, [fetch]);

  const handleOpen = (job = null) => {
    setEditJob(job);
    setForm(job ? { title: job.title, department_id: job.department_id || '', description: job.description || '', requirements: job.requirements || '', location: job.location || '', employment_type: job.employment_type || 'Full-time', min_salary: job.min_salary || '', max_salary: job.max_salary || '', openings: job.openings || 1, deadline: job.deadline || '' }
      : { title: '', department_id: '', description: '', requirements: '', location: '', employment_type: 'Full-time', min_salary: '', max_salary: '', openings: 1, deadline: '' });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Job title is required'); return; }
    try {
      const payload = { ...form };
      
      // Sanitize empty strings to null for Joi validation
      if (!payload.department_id) payload.department_id = null;
      if (!payload.min_salary) payload.min_salary = null;
      if (!payload.max_salary) payload.max_salary = null;
      if (!payload.deadline) payload.deadline = null;
      
      // Map frontend enum to backend enum
      const typeMap = {
        'Full-time': 'Full-Time',
        'Part-time': 'Part-Time',
        'Contract': 'Contract',
        'Internship': 'Intern'
      };
      if (payload.employment_type && typeMap[payload.employment_type]) {
        payload.employment_type = typeMap[payload.employment_type];
      }

      editJob ? await api.put(`/hrms/recruitment/jobs/${editJob.id}`, payload) : await api.post('/hrms/recruitment/jobs', payload);
      toast.success(editJob ? 'Job updated!' : 'Job posted!'); setOpen(false); fetch();
    } catch (e) {
      if (e.response?.data?.errors) {
        toast.error(e.response.data.errors.map(err => err.message).join(', '));
      } else {
        toast.error(e.response?.data?.message || 'Failed to save');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try { await api.delete(`/hrms/recruitment/jobs/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleStatus = async (id, status) => {
    try { await api.put(`/hrms/recruitment/jobs/${id}`, { status }); fetch(); }
    catch { toast.error('Failed to update status'); }
  };

  const statuses = ['Open', 'Closed', 'On Hold', 'Draft'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>Job Postings ({jobs.length})</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}
          sx={{ borderRadius: 2, fontWeight: 700, bgcolor: accentColor, '&:hover': { bgcolor: '#15803d', transform: 'translateY(-1px)' }, transition: 'all 0.2s' }}>
          Post New Job
        </Button>
      </Box>

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        : jobs.length === 0 ? <Alert severity="info">No job postings yet. Create your first job posting!</Alert>
        : (
          <Grid container spacing={2}>
            {jobs.map(job => (
              <Grid item xs={12} md={6} lg={4} key={job.id}>
                <Card sx={{ borderRadius: 3, border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 35px rgba(0,0,0,0.1)' } }}>
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Chip label={job.status} size="small" sx={{ ...chipColor(job.status), fontWeight: 700 }} />
                      <Chip label={job.employment_type} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>{job.title}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <Business fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">{job.department?.name || 'No Department'}</Typography>
                    </Box>
                    {job.location && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">📍 {job.location}</Typography>
                    </Box>}
                    {(job.min_salary || job.max_salary) && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">💰 </Typography>
                        <Typography variant="caption" fontWeight={600} color={accentColor}>₹{job.min_salary ? parseInt(job.min_salary).toLocaleString('en-IN') : '?'} – ₹{job.max_salary ? parseInt(job.max_salary).toLocaleString('en-IN') : '?'}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Box sx={{ textAlign: 'center', flex: 1, bgcolor: '#f0fdf4', borderRadius: 1.5, py: 1 }}>
                        <Typography variant="h6" fontWeight={800} color={accentColor}>{job.applicants || 0}</Typography>
                        <Typography variant="caption" color="text.secondary">Applicants</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', flex: 1, bgcolor: '#eff6ff', borderRadius: 1.5, py: 1 }}>
                        <Typography variant="h6" fontWeight={800} color="#3b82f6">{job.openings}</Typography>
                        <Typography variant="caption" color="text.secondary">Openings</Typography>
                      </Box>
                    </Box>
                    {job.deadline && <Typography variant="caption" color="text.secondary">⏰ Deadline: {new Date(job.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Typography>}
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => handleOpen(job)} sx={{ borderRadius: 2, textTransform: 'none', flex: 1 }}>Edit</Button>
                    <TextField select size="small" value={job.status} onChange={e => handleStatus(job.id, e.target.value)} sx={{ flex: 1, '& .MuiSelect-select': { py: '6px', fontSize: '0.8rem' } }}>
                      {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                    <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(job.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editJob ? 'Edit Job Posting' : 'Post New Job'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={8}><TextField fullWidth label="Job Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField select fullWidth label="Employment Type" value={form.employment_type} onChange={e => setForm({ ...form, employment_type: e.target.value })}>
              {['Full-time', 'Part-time', 'Contract', 'Internship'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField></Grid>
            <Grid item xs={12} md={6}><TextField select fullWidth label="Department" value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })}>
              <MenuItem value="">No Department</MenuItem>
              {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Openings" value={form.openings} onChange={e => setForm({ ...form, openings: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Min Salary (₹)" value={form.min_salary} onChange={e => setForm({ ...form, min_salary: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Max Salary (₹)" value={form.max_salary} onChange={e => setForm({ ...form, max_salary: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth type="date" label="Application Deadline" InputLabelProps={{ shrink: true }} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Job Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Requirements" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} /></Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button fullWidth variant="outlined" onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button fullWidth variant="contained" onClick={handleSave} sx={{ borderRadius: 2, bgcolor: accentColor, '&:hover': { bgcolor: '#15803d' } }}>{editJob ? 'Update' : 'Post Job'}</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// ── Candidates ────────────────────────────────────────────────────────────────
function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [filterJob, setFilterJob] = useState('');
  
  const initialForm = {
    name: '', email: '', phone: '', job_posting_id: '', experience_years: '',
    current_salary: '', current_in_hand_salary: '', expected_salary: '', expected_in_hand_salary: '',
    notice_period_days: '', application_date: '', notes: ''
  };
  const [form, setForm] = useState(initialForm);

  const [editCandidateId, setEditCandidateId] = useState(null);

  const fetch = useCallback(async () => {
    try { setLoading(true); const r = await api.get('/hrms/recruitment/candidates', { params: filterJob ? { job_posting_id: filterJob } : {} }); setCandidates(r.data.candidates || []); }
    catch { toast.error('Failed to load candidates'); } finally { setLoading(false); }
  }, [filterJob]);

  useEffect(() => {
    fetch();
    api.get('/hrms/recruitment/jobs').then(r => setJobs(r.data.jobs || [])).catch(() => {});
  }, [fetch]);

  const handleEdit = (c) => {
    setEditCandidateId(c.id);
    setForm({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      job_posting_id: c.job_posting_id || '',
      experience_years: c.experience_years || '',
      current_salary: c.current_salary || '',
      current_in_hand_salary: c.current_in_hand_salary || '',
      expected_salary: c.expected_salary || '',
      expected_in_hand_salary: c.expected_in_hand_salary || '',
      notice_period_days: c.notice_period_days || '',
      application_date: c.application_date || '',
      notes: c.notes || ''
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.job_posting_id) { toast.error('Name, email, and job are required'); return; }
    try {
      const payload = { ...form };
      ['experience_years', 'current_salary', 'current_in_hand_salary', 'expected_salary', 'expected_in_hand_salary', 'notice_period_days'].forEach(k => {
        if (!payload[k]) payload[k] = null;
      });
      if (!payload.phone) payload.phone = null;
      if (!payload.application_date) payload.application_date = null;

      if (editCandidateId) {
        await api.put(`/hrms/recruitment/candidates/${editCandidateId}`, payload);
        toast.success('Candidate updated!');
      } else {
        await api.post('/hrms/recruitment/candidates', payload); 
        toast.success('Candidate added!');
      }
      setOpen(false); setEditCandidateId(null); setForm(initialForm); fetch(); 
    }
    catch (e) {
      if (e.response?.data?.errors) {
        toast.error(e.response.data.errors.map(err => err.message).join(', '));
      } else {
        toast.error(e.response?.data?.message || 'Failed to save candidate');
      }
    }
  };

  const handleStatusChange = async (id, status) => {
    try { await api.put(`/hrms/recruitment/candidates/${id}`, { status }); fetch(); }
    catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this candidate?')) return;
    try { await api.delete(`/hrms/recruitment/candidates/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const statuses = ['Applied', 'Screening', 'Interview Scheduled', 'Interviewed', 'Selected', 'Rejected', 'On Hold'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" fontWeight={700}>Candidates ({candidates.length})</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField select size="small" label="Filter by Job" value={filterJob} onChange={e => setFilterJob(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">All Jobs</MenuItem>
            {jobs.map(j => <MenuItem key={j.id} value={j.id}>{j.title}</MenuItem>)}
          </TextField>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}
            sx={{ borderRadius: 2, fontWeight: 700, bgcolor: accentColor, '&:hover': { bgcolor: '#15803d' } }}>Add Candidate</Button>
        </Box>
      </Box>

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        : candidates.length === 0 ? <Alert severity="info">No candidates found. Add candidates or post jobs first.</Alert>
        : (
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
                    {['Date', 'Candidate', 'Position', 'Exp', 'Current CTC', 'In Hand', 'Exp CTC', 'Exp In Hand', 'Notice (Days)', 'Status', 'Actions'].map(h =>
                      <TableCell key={h} sx={{ color: 'white', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidates.map(c => (
                    <TableRow key={c.id} hover>
                      <TableCell>{c.application_date ? new Date(c.application_date).toLocaleDateString('en-IN') : new Date(c.created_at || c.createdAt || Date.now()).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: accentColor, width: 36, height: 36 }}>{c.name?.[0]}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>{c.name}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">{c.email}</Typography>
                            {c.phone && <Typography variant="caption" color="text.secondary" display="block">{c.phone}</Typography>}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600}>{c.jobPosting?.title || '—'}</Typography></TableCell>
                      <TableCell>{c.experience_years ? `${c.experience_years}y` : '—'}</TableCell>
                      <TableCell>{c.current_salary ? `₹${parseInt(c.current_salary).toLocaleString('en-IN')}` : '—'}</TableCell>
                      <TableCell>{c.current_in_hand_salary ? `₹${parseInt(c.current_in_hand_salary).toLocaleString('en-IN')}` : '—'}</TableCell>
                      <TableCell>{c.expected_salary ? `₹${parseInt(c.expected_salary).toLocaleString('en-IN')}` : '—'}</TableCell>
                      <TableCell>{c.expected_in_hand_salary ? `₹${parseInt(c.expected_in_hand_salary).toLocaleString('en-IN')}` : '—'}</TableCell>
                      <TableCell>{c.notice_period_days !== null ? c.notice_period_days : '—'}</TableCell>
                      <TableCell>
                        <TextField select size="small" value={c.status} onChange={e => handleStatusChange(c.id, e.target.value)}
                          sx={{ minWidth: 160, '& .MuiSelect-select': { py: '6px', fontSize: '0.8rem', ...chipColor(c.status) }, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}>
                          {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleEdit(c)}><Edit fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

      <Dialog open={open} onClose={() => { setOpen(false); setEditCandidateId(null); setForm(initialForm); }} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editCandidateId ? 'Edit Candidate' : 'Add Candidate'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={4}><TextField fullWidth label="Application Date" type="date" InputLabelProps={{ shrink: true }} value={form.application_date} onChange={e => setForm({ ...form, application_date: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField select fullWidth label="Position (Job) *" value={form.job_posting_id} onChange={e => setForm({ ...form, job_posting_id: e.target.value })}>
              <MenuItem value="">Select Job</MenuItem>
              {jobs.map(j => <MenuItem key={j.id} value={j.id}>{j.title}</MenuItem>)}
            </TextField></Grid>
            
            <Grid item xs={12} md={4}><TextField fullWidth label="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Mobile Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth type="number" label="Total Exp (Years)" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: e.target.value })} /></Grid>
            
            <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Current CTC (₹)" value={form.current_salary} onChange={e => setForm({ ...form, current_salary: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="number" label="In Hand Salary (₹)" value={form.current_in_hand_salary} onChange={e => setForm({ ...form, current_in_hand_salary: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Expected CTC (₹)" value={form.expected_salary} onChange={e => setForm({ ...form, expected_salary: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Expected In Hand (₹)" value={form.expected_in_hand_salary} onChange={e => setForm({ ...form, expected_in_hand_salary: e.target.value })} /></Grid>
            
            <Grid item xs={12} md={4}><TextField fullWidth type="number" label="Notice Period (Days)" value={form.notice_period_days} onChange={e => setForm({ ...form, notice_period_days: e.target.value })} /></Grid>
            <Grid item xs={12} md={8}><TextField fullWidth label="Remarks / Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button fullWidth variant="outlined" onClick={() => { setOpen(false); setEditCandidateId(null); setForm(initialForm); }} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button fullWidth variant="contained" onClick={handleSave} sx={{ borderRadius: 2, bgcolor: accentColor }}>{editCandidateId ? 'Update Candidate' : 'Add Candidate'}</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
