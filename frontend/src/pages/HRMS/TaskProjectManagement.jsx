import { useState, useEffect, useCallback } from 'react';
import {
  Box, Tabs, Tab, Typography, Grid, Card, CardContent, Button, Paper,
  CircularProgress, Alert, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, TextField,
  MenuItem, Avatar, Divider, Fade, IconButton, Tooltip, LinearProgress
} from '@mui/material';
import {
  Assignment, Folder, Schedule, Add, Edit, Delete, CheckCircle,
  RadioButtonUnchecked, PlayArrow, RateReview, Cancel
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const accent = '#8b5cf6';

const priorityStyle = { Low: { bg: '#f0fdf4', color: '#166534' }, Medium: { bg: '#eff6ff', color: '#1d4ed8' }, High: { bg: '#fef9c3', color: '#854d0e' }, Critical: { bg: '#fee2e2', color: '#991b1b' } };
const statusIcon = { 'Todo': <RadioButtonUnchecked fontSize="small" />, 'In Progress': <PlayArrow fontSize="small" />, 'Review': <RateReview fontSize="small" />, 'Done': <CheckCircle fontSize="small" />, 'Cancelled': <Cancel fontSize="small" /> };
const statusColor = { 'Todo': '#64748b', 'In Progress': '#3b82f6', 'Review': '#f59e0b', 'Done': '#10b981', 'Cancelled': '#ef4444' };

export default function TaskProjectManagement() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: 'Task Board', icon: <Assignment /> },
    { label: 'Timesheets', icon: <Schedule /> },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(139,92,246,0.12)', color: accent, display: 'flex' }}>
          <Folder fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Tasks & Projects</Typography>
          <Typography variant="body2" color="text.secondary">Manage team tasks, track work hours via timesheets.</Typography>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 8px 32px rgba(31,38,135,0.07)' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ px: 2, '& .MuiTab-root': { minHeight: 64, fontWeight: 600, color: '#64748b', textTransform: 'none', '&.Mui-selected': { color: accent } }, '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: accent } }}>
          {tabs.map((t, i) => <Tab key={i} icon={t.icon} iconPosition="start" label={t.label} />)}
        </Tabs>
      </Paper>

      <Fade in key={activeTab}><Box>
        {activeTab === 0 && <TaskBoard />}
        {activeTab === 1 && <Timesheets />}
      </Box></Fade>
    </Box>
  );
}

// ── Task Board ────────────────────────────────────────────────────────────────
function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ title: '', description: '', project: '', assigned_to: '', priority: 'Medium', due_date: '', estimated_hours: '' });

  const fetch = useCallback(async () => {
    try { setLoading(true); const r = await api.get('/hrms/tasks', { params: filterStatus ? { status: filterStatus } : {} }); setTasks(r.data.tasks || []); }
    catch { toast.error('Failed to load tasks'); } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => {
    fetch();
    api.get('/hrms/employees').then(r => setEmployees(r.data.employees || [])).catch(() => {});
  }, [fetch]);

  const handleOpen = (task = null) => {
    setEditTask(task);
    setForm(task ? { title: task.title, description: task.description || '', project: task.project || '', assigned_to: task.assigned_to || '', priority: task.priority || 'Medium', due_date: task.due_date || '', estimated_hours: task.estimated_hours || '' }
      : { title: '', description: '', project: '', assigned_to: '', priority: 'Medium', due_date: '', estimated_hours: '' });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Task title required'); return; }
    try {
      editTask ? await api.put(`/hrms/tasks/${editTask.id}`, form) : await api.post('/hrms/tasks', form);
      toast.success(editTask ? 'Task updated!' : 'Task created!'); setOpen(false); fetch();
    } catch (e) {
      if (e.response?.data?.errors) {
        toast.error(e.response.data.errors.map(err => err.message).join(', '));
      } else {
        toast.error(e.response?.data?.message || 'Failed to save');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete task?')) return;
    try { await api.delete(`/hrms/tasks/${id}`); toast.success('Deleted'); fetch(); } catch { toast.error('Failed'); }
  };

  const handleStatusChange = async (id, status) => {
    try { await api.put(`/hrms/tasks/${id}`, { status }); fetch(); } catch { toast.error('Failed'); }
  };

  const allStatuses = ['Todo', 'In Progress', 'Review', 'Done', 'Cancelled'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  // Group tasks by status for kanban-like view
  const grouped = allStatuses.slice(0, 4).map(s => ({ status: s, tasks: tasks.filter(t => t.status === s) }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField select size="small" label="Filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="">All Tasks</MenuItem>
            {allStatuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}
          sx={{ borderRadius: 2, fontWeight: 700, bgcolor: accent, '&:hover': { bgcolor: '#7c3aed', transform: 'translateY(-1px)' }, transition: 'all 0.2s' }}>
          New Task
        </Button>
      </Box>

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        : tasks.length === 0 ? <Alert severity="info">No tasks found. Create your first task!</Alert>
        : filterStatus ? (
          // Filtered flat list
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
                    {['Task', 'Project', 'Assigned To', 'Priority', 'Due Date', 'Status', 'Actions'].map(h =>
                      <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map(t => (
                    <TableRow key={t.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={600}>{t.title}</Typography><Typography variant="caption" color="text.secondary">{t.description?.slice(0, 60)}</Typography></TableCell>
                      <TableCell>{t.project || '—'}</TableCell>
                      <TableCell>{t.assignee ? `${t.assignee.user?.first_name} ${t.assignee.user?.last_name}` : '—'}</TableCell>
                      <TableCell><Chip label={t.priority} size="small" sx={{ fontWeight: 700, ...(priorityStyle[t.priority] || {}) }} /></TableCell>
                      <TableCell>{t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN') : '—'}</TableCell>
                      <TableCell>
                        <TextField select size="small" value={t.status} onChange={e => handleStatusChange(t.id, e.target.value)} sx={{ minWidth: 120, '& .MuiSelect-select': { py: '5px', fontSize: '0.8rem', color: statusColor[t.status] } }}>
                          {allStatuses.map(s => <MenuItem key={s} value={s} sx={{ color: statusColor[s] }}>{s}</MenuItem>)}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(t)}><Edit fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(t.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : (
          // Kanban-style columns
          <Grid container spacing={2}>
            {grouped.map(group => (
              <Grid item xs={12} sm={6} md={3} key={group.status}>
                <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: `2px solid ${statusColor[group.status]}33`, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <Box sx={{ bgcolor: `${statusColor[group.status]}11`, p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: `2px solid ${statusColor[group.status]}33` }}>
                    <Box sx={{ color: statusColor[group.status] }}>{statusIcon[group.status]}</Box>
                    <Typography fontWeight={700} sx={{ color: statusColor[group.status] }}>{group.status}</Typography>
                    <Chip label={group.tasks.length} size="small" sx={{ ml: 'auto', bgcolor: `${statusColor[group.status]}22`, color: statusColor[group.status], fontWeight: 700 }} />
                  </Box>
                  <Box sx={{ p: 1.5, maxHeight: 450, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {group.tasks.length === 0 ? (
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 3, display: 'block' }}>No tasks</Typography>
                    ) : group.tasks.map(t => (
                      <Card key={t.id} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid rgba(226,232,240,0.8)', transition: 'transform 0.15s', '&:hover': { transform: 'translateY(-1px)' } }}>
                        <CardContent sx={{ p: '12px !important' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Chip label={t.priority} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', ...(priorityStyle[t.priority] || {}) }} />
                            <Box sx={{ display: 'flex' }}>
                              <Tooltip title="Edit"><IconButton size="small" sx={{ p: 0.3 }} onClick={() => handleOpen(t)}><Edit sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                              <Tooltip title="Delete"><IconButton size="small" sx={{ p: 0.3 }} color="error" onClick={() => handleDelete(t.id)}><Delete sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                            </Box>
                          </Box>
                          <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5, lineHeight: 1.3 }}>{t.title}</Typography>
                          {t.project && <Typography variant="caption" sx={{ color: accent, fontWeight: 600 }}>📁 {t.project}</Typography>}
                          {t.assignee && <Typography variant="caption" color="text.secondary" display="block">👤 {t.assignee.user?.first_name} {t.assignee.user?.last_name}</Typography>}
                          {t.due_date && <Typography variant="caption" color={new Date(t.due_date) < new Date() && t.status !== 'Done' ? 'error' : 'text.secondary'} display="block">⏰ {new Date(t.due_date).toLocaleDateString('en-IN')}</Typography>}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}><TextField fullWidth label="Task Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Project" value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField select fullWidth label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              {priorities.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField></Grid>
            <Grid item xs={12} md={6}><TextField select fullWidth label="Assign To" value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
              <MenuItem value="">Unassigned</MenuItem>
              {employees.map(e => <MenuItem key={e.id} value={e.id}>{e.user?.first_name} {e.user?.last_name}</MenuItem>)}
            </TextField></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="date" label="Due Date" InputLabelProps={{ shrink: true }} value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Est. Hours" value={form.estimated_hours} onChange={e => setForm({ ...form, estimated_hours: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button fullWidth variant="outlined" onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button fullWidth variant="contained" onClick={handleSave} sx={{ borderRadius: 2, bgcolor: accent, '&:hover': { bgcolor: '#7c3aed' } }}>{editTask ? 'Update' : 'Create'} Task</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// ── Timesheets ────────────────────────────────────────────────────────────────
function Timesheets() {
  const [entries, setEntries] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], hours_worked: '', task_description: '', project: '' });

  const fetch = useCallback(async () => {
    try { setLoading(true); const r = await api.get('/hrms/timesheets', { params: { month, year } }); setEntries(r.data.timesheets || []); setTotalHours(r.data.totalHours || 0); }
    catch { toast.error('Failed to load timesheets'); } finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async () => {
    if (!form.date || !form.hours_worked) { toast.error('Date and hours are required'); return; }
    try { await api.post('/hrms/timesheets', form); toast.success('Timesheet entry added!'); setOpen(false); setForm({ date: new Date().toISOString().split('T')[0], hours_worked: '', task_description: '', project: '' }); fetch(); }
    catch (e) {
      if (e.response?.data?.errors) {
        toast.error(e.response.data.errors.map(err => err.message).join(', '));
      } else {
        toast.error(e.response?.data?.message || 'Failed');
      }
    }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/hrms/timesheets/${id}`); toast.success('Entry deleted'); fetch(); } catch { toast.error('Failed'); }
  };

  const handleSubmit = async (id) => {
    try { await api.patch(`/hrms/timesheets/${id}/submit`); toast.success('Submitted for approval'); fetch(); } catch { toast.error('Failed'); }
  };

  const months = [['01','Jan'],['02','Feb'],['03','Mar'],['04','Apr'],['05','May'],['06','Jun'],['07','Jul'],['08','Aug'],['09','Sep'],['10','Oct'],['11','Nov'],['12','Dec']];
  const statusStyle2 = { Draft: { bg: '#f1f5f9', color: '#475569' }, Submitted: { bg: '#eff6ff', color: '#1d4ed8' }, Approved: { bg: '#f0fdf4', color: '#166534' }, Rejected: { bg: '#fee2e2', color: '#991b1b' } };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField select size="small" label="Month" value={month} onChange={e => setMonth(e.target.value)} sx={{ minWidth: 90 }}>
            {months.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Year" value={year} onChange={e => setYear(e.target.value)} sx={{ minWidth: 90 }}>
            {['2024', '2025', '2026'].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </TextField>
          <Chip label={`${parseFloat(totalHours).toFixed(1)} hrs total`} sx={{ bgcolor: '#eef2ff', color: accent, fontWeight: 700 }} />
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}
          sx={{ borderRadius: 2, fontWeight: 700, bgcolor: accent, '&:hover': { bgcolor: '#7c3aed' } }}>
          Log Hours
        </Button>
      </Box>

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        : entries.length === 0 ? <Alert severity="info">No timesheet entries for this period. Start logging your work hours!</Alert>
        : (
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
                    {['Date', 'Project', 'Description', 'Hours', 'Status', 'Actions'].map(h =>
                      <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map(e => (
                    <TableRow key={e.id} hover>
                      <TableCell fontWeight={600}>{new Date(e.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}</TableCell>
                      <TableCell>{e.project || '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 250 }}><Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.task_description || '—'}</Typography></TableCell>
                      <TableCell><Chip label={`${parseFloat(e.hours_worked).toFixed(1)}h`} size="small" sx={{ bgcolor: '#eef2ff', color: accent, fontWeight: 800 }} /></TableCell>
                      <TableCell><Chip label={e.status} size="small" sx={{ fontWeight: 700, ...(statusStyle2[e.status] || {}) }} /></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {e.status === 'Draft' && <Tooltip title="Submit for Approval"><IconButton size="small" color="primary" onClick={() => handleSubmit(e.id)}><CheckCircle fontSize="small" /></IconButton></Tooltip>}
                          {e.status === 'Draft' && <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(e.id)}><Delete fontSize="small" /></IconButton></Tooltip>}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Log Work Hours</DialogTitle>
        <DialogContent>
          <TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} sx={{ mt: 1, mb: 2 }} />
          <TextField fullWidth type="number" label="Hours Worked *" value={form.hours_worked} onChange={e => setForm({ ...form, hours_worked: e.target.value })} sx={{ mb: 2 }} inputProps={{ step: 0.5, min: 0.5, max: 24 }} />
          <TextField fullWidth label="Project" value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth multiline rows={3} label="Task Description" value={form.task_description} onChange={e => setForm({ ...form, task_description: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button fullWidth variant="outlined" onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button fullWidth variant="contained" onClick={handleSave} sx={{ borderRadius: 2, bgcolor: accent }}>Log Hours</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
