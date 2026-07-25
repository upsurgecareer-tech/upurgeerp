import { useState, useEffect, useCallback } from 'react';
import {
  Box, Tabs, Tab, Typography, Grid, Card, CardContent, Button, Paper,
  CircularProgress, Alert, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, TextField,
  MenuItem, Avatar, Tooltip, Divider, IconButton, InputAdornment
} from '@mui/material';
import {
  AttachMoney, Add, Edit, CheckCircle, Receipt, AccountBalance,
  TrendingUp, People, Download, Search
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function PayrollManagement() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Payroll List', icon: <Receipt /> },
    { label: 'Salary Structures', icon: <AccountBalance /> },
    { label: 'Generate Payroll', icon: <Add /> },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex' }}>
          <AttachMoney fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Payroll Management</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage salary structures, generate payroll, and track payments.</Typography>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 3, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 8px 32px rgba(31,38,135,0.07)' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ px: 2, '& .MuiTab-root': { minHeight: 64, fontWeight: 600, color: '#64748b', textTransform: 'none', '&.Mui-selected': { color: '#10b981' } }, '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: '#10b981' } }}>
          {tabs.map((t, i) => <Tab key={i} icon={t.icon} iconPosition="start" label={t.label} />)}
        </Tabs>
      </Paper>

      {activeTab === 0 && <PayrollList />}
      {activeTab === 1 && <SalaryStructures />}
      {activeTab === 2 && <GeneratePayroll />}
    </Box>
  );
}

// ── Stats card helper ────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, bg, icon }) => (
  <Card sx={{ bgcolor: bg, border: `1px solid ${color}22`, borderRadius: 3 }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '16px !important' }}>
      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}22`, color }}>{icon}</Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
      </Box>
    </CardContent>
  </Card>
);

// ── Payroll List ─────────────────────────────────────────────────────────────
function PayrollList() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      const res = await api.get('/payroll', { params });
      setPayrolls(res.data.payroll || []);
    } catch {
      toast.error('Failed to load payroll records');
    } finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/payroll/${id}/approve`);
      toast.success('Payroll approved & marked as Paid');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to approve'); }
  };

  const months = [['01','Jan'],['02','Feb'],['03','Mar'],['04','Apr'],['05','May'],['06','Jun'],['07','Jul'],['08','Aug'],['09','Sep'],['10','Oct'],['11','Nov'],['12','Dec']];
  const total = payrolls.reduce((s, p) => s + parseFloat(p.net_salary || 0), 0);
  const paid = payrolls.filter(p => p.status === 'Paid').length;
  const pending = payrolls.filter(p => p.status === 'Pending').length;

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}><StatCard label="Total Records" value={payrolls.length} color="#3b82f6" bg="#eff6ff" icon={<People />} /></Grid>
        <Grid item xs={6} sm={3}><StatCard label="Total Payout" value={`₹${(total/1000).toFixed(1)}K`} color="#10b981" bg="#f0fdf4" icon={<AttachMoney />} /></Grid>
        <Grid item xs={6} sm={3}><StatCard label="Paid" value={paid} color="#10b981" bg="#f0fdf4" icon={<CheckCircle />} /></Grid>
        <Grid item xs={6} sm={3}><StatCard label="Pending" value={pending} color="#f59e0b" bg="#fffbeb" icon={<Receipt />} /></Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>Payroll Records</Typography>
        <TextField select size="small" label="Month" value={month} onChange={e => setMonth(e.target.value)} sx={{ minWidth: 110 }}>
          <MenuItem value="">All Months</MenuItem>
          {months.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Year" value={year} onChange={e => setYear(e.target.value)} sx={{ minWidth: 100 }}>
          {['2024','2025','2026'].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </TextField>
      </Box>

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        : payrolls.length === 0 ? <Alert severity="info">No payroll records found. Generate payroll from the "Generate Payroll" tab.</Alert>
        : (
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
                    {['Employee','Month','Basic Salary','Allowances','Deductions','Net Salary','Status','Action'].map(h => (
                      <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payrolls.map(p => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981', fontSize: '0.8rem' }}>
                            {p.employee?.user?.first_name?.[0] || p.user?.first_name?.[0] || '?'}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {p.employee?.user?.first_name || p.user?.first_name} {p.employee?.user?.last_name || p.user?.last_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{p.month}</TableCell>
                      <TableCell sx={{ color: '#1e293b', fontWeight: 600 }}>₹{parseFloat(p.basic_salary || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>+₹{parseFloat(p.allowances || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell sx={{ color: '#ef4444', fontWeight: 600 }}>-₹{parseFloat(p.deductions || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 800 }}>₹{parseFloat(p.net_salary || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Chip label={p.status} size="small" sx={{ fontWeight: 700, bgcolor: p.status === 'Paid' ? '#dcfce7' : p.status === 'Cancelled' ? '#fee2e2' : '#fef9c3', color: p.status === 'Paid' ? '#166534' : p.status === 'Cancelled' ? '#991b1b' : '#854d0e' }} />
                      </TableCell>
                      <TableCell>
                        {p.status === 'Pending' && (
                          <Tooltip title="Mark as Paid">
                            <Button size="small" variant="contained" color="success" onClick={() => handleApprove(p.id)} sx={{ borderRadius: 2, textTransform: 'none' }}>
                              Approve
                            </Button>
                          </Tooltip>
                        )}
                        {p.payment_date && <Typography variant="caption" color="text.secondary" display="block">{new Date(p.payment_date).toLocaleDateString()}</Typography>}
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

// ── Salary Structures ────────────────────────────────────────────────────────
function SalaryStructures() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ employee_user_id: '', basic_salary: '', hra: '', other_allowances: '', pf_deduction: '', tds_deduction: '', effective_from: new Date().toISOString().split('T')[0] });

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/payroll/employees');
      // Map salary_structure to salary for easier access
      const emps = (res.data.employees || []).map(e => ({ ...e, salary: e.salary_structure }));
      setEmployees(emps);
    } catch { toast.error('Failed to load salary data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleOpen = (emp) => {
    setSelected(emp);
    setForm({
      employee_user_id: emp.user_id || emp.user?.id,
      basic_salary: emp.salary?.basic_salary || '',
      hra: emp.salary?.hra || '',
      other_allowances: emp.salary?.other_allowances || '',
      pf_deduction: emp.salary?.pf_deduction || '',
      tds_deduction: emp.salary?.tds_deduction || '',
      effective_from: emp.salary?.effective_from || new Date().toISOString().split('T')[0]
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        employee_user_id: form.employee_user_id,
        basic_salary: parseFloat(form.basic_salary) || 0,
        allowances: JSON.stringify({ hra: parseFloat(form.hra) || 0, other: parseFloat(form.other_allowances) || 0 }),
        deductions: JSON.stringify({ pf: parseFloat(form.pf_deduction) || 0, tds: parseFloat(form.tds_deduction) || 0 }),
        total_salary: parseFloat(calcNet()),
        effective_from: form.effective_from
      };
      await api.post('/payroll/salary-structure', payload);
      toast.success('Salary structure saved!');
      setOpen(false);
      fetch();
    } catch (err) {
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach(e => toast.error(e.message));
      } else {
        toast.error(err.response?.data?.message || 'Failed to save');
      }
    }
  };

  const calcNet = () => {
    const basic = parseFloat(form.basic_salary) || 0;
    const hra = parseFloat(form.hra) || 0;
    const other = parseFloat(form.other_allowances) || 0;
    const pf = parseFloat(form.pf_deduction) || 0;
    const tds = parseFloat(form.tds_deduction) || 0;
    return basic + hra + other - pf - tds;
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Employee Salary Structures</Typography>
      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        : employees.length === 0 ? <Alert severity="info">No employees found.</Alert>
        : (
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
                    {['Employee','Designation','Department','Basic Salary','Net Salary','Effective From','Action'].map(h => (
                      <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map(emp => (
                    <TableRow key={emp.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#3b82f6', fontSize: '0.8rem' }}>{emp.user?.first_name?.[0]}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{emp.user?.first_name} {emp.user?.last_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{emp.user?.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{emp.designation || '—'}</TableCell>
                      <TableCell>{emp.department?.name || '—'}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{emp.salary?.basic_salary ? `₹${parseFloat(emp.salary.basic_salary).toLocaleString('en-IN')}` : <Chip label="Not Set" size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b' }} />}</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 700 }}>{emp.salary?.total_salary ? `₹${parseFloat(emp.salary.total_salary).toLocaleString('en-IN')}` : '—'}</TableCell>
                      <TableCell>{emp.salary?.effective_from || '—'}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" startIcon={<Edit />} onClick={() => handleOpen(emp)} sx={{ borderRadius: 2, textTransform: 'none' }}>
                          {emp.salary ? 'Edit' : 'Set Salary'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selected?.salary ? 'Edit' : 'Set'} Salary — {selected?.user?.first_name} {selected?.user?.last_name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}><TextField fullWidth label="Basic Salary (₹)" type="number" value={form.basic_salary} onChange={e => setForm({ ...form, basic_salary: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="HRA (₹)" type="number" value={form.hra} onChange={e => setForm({ ...form, hra: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Other Allowances (₹)" type="number" value={form.other_allowances} onChange={e => setForm({ ...form, other_allowances: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="PF Deduction (₹)" type="number" value={form.pf_deduction} onChange={e => setForm({ ...form, pf_deduction: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="TDS Deduction (₹)" type="number" value={form.tds_deduction} onChange={e => setForm({ ...form, tds_deduction: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth type="date" label="Effective From" InputLabelProps={{ shrink: true }} value={form.effective_from} onChange={e => setForm({ ...form, effective_from: e.target.value })} /></Grid>
          </Grid>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
            <Typography variant="body2" color="text.secondary">Calculated Net Salary</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981' }}>₹{calcNet().toLocaleString('en-IN')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button fullWidth variant="outlined" onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button fullWidth variant="contained" onClick={handleSave} sx={{ borderRadius: 2, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>Save Structure</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// ── Generate Payroll ─────────────────────────────────────────────────────────
function GeneratePayroll() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({});

  const months = [['01','January'],['02','February'],['03','March'],['04','April'],['05','May'],['06','June'],['07','July'],['08','August'],['09','September'],['10','October'],['11','November'],['12','December']];

  useEffect(() => {
    api.get('/payroll/employees').then(res => {
      const emps = (res.data.employees || []).map(e => ({ ...e, salary: e.salary_structure }));
      setEmployees(emps);
      // Pre-fill forms from salary structures
      const f = {};
      emps.forEach(e => {
        const sal = e.salary;
        const allowances = sal?.allowances;
        const deductions = sal?.deductions;
        const hra = allowances?.hra || 0;
        const other = allowances?.other || 0;
        const pf = deductions?.pf || 0;
        const tds = deductions?.tds || 0;
        f[e.id] = {
          basic_salary: sal?.basic_salary || 0,
          allowances: parseFloat(hra) + parseFloat(other),
          deductions: parseFloat(pf) + parseFloat(tds),
        };
        f[e.id].net_salary = parseFloat(f[e.id].basic_salary) + f[e.id].allowances - f[e.id].deductions;
      });
      setForm(f);
    }).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    const toGenerate = selected.length > 0 ? employees.filter(e => selected.includes(e.id)) : employees;
    if (toGenerate.length === 0) { toast.error('No employees selected'); return; }
    try {
      setGenerating(true);
      await Promise.all(toGenerate.map(e =>
        api.post('/payroll/generate', {
          employee_id: e.id,
          month: month,
          year: parseInt(year),
          basic_salary: form[e.id]?.basic_salary || 0,
          allowances: form[e.id]?.allowances || 0,
          deductions: form[e.id]?.deductions || 0,
          net_salary: form[e.id]?.net_salary || 0,
        })
      ));
      toast.success(`Payroll generated for ${toGenerate.length} employees!`);
      setSelected([]);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to generate payroll'); }
    finally { setGenerating(false); }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Select Payroll Period</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField select size="small" label="Month" value={month} onChange={e => setMonth(e.target.value)} sx={{ minWidth: 140 }}>
            {months.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Year" value={year} onChange={e => setYear(e.target.value)} sx={{ minWidth: 100 }}>
            {['2024','2025','2026'].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </TextField>
          <Button variant="contained" size="large" startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AttachMoney />}
            onClick={handleGenerate} disabled={generating}
            sx={{ borderRadius: 2, fontWeight: 700, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
            {generating ? 'Generating...' : `Generate for ${selected.length > 0 ? selected.length : 'All'} Employees`}
          </Button>
        </Box>
      </Paper>

      {employees.length > 0 && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
                  <TableCell padding="checkbox" sx={{ color: 'white' }}></TableCell>
                  {['Employee','Basic','Allowances','Deductions','Net Salary'].map(h => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map(emp => (
                  <TableRow key={emp.id} hover selected={selected.includes(emp.id)}>
                    <TableCell padding="checkbox">
                      <input type="checkbox" checked={selected.includes(emp.id)} onChange={() => setSelected(prev => prev.includes(emp.id) ? prev.filter(x => x !== emp.id) : [...prev, emp.id])} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#3b82f6', fontSize: '0.75rem' }}>{emp.user?.first_name?.[0]}</Avatar>
                        <Typography variant="body2" fontWeight={600}>{emp.user?.first_name} {emp.user?.last_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>₹{parseFloat(form[emp.id]?.basic_salary || 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell sx={{ color: '#10b981' }}>+₹{parseFloat(form[emp.id]?.allowances || 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell sx={{ color: '#ef4444' }}>-₹{parseFloat(form[emp.id]?.deductions || 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0284c7' }}>₹{parseFloat(form[emp.id]?.net_salary || 0).toLocaleString('en-IN')}</TableCell>
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
