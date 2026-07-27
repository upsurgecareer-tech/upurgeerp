import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Chip, CircularProgress, Tabs, Tab, Switch, FormControlLabel,
} from '@mui/material';
import { Add, Edit, Visibility, LockReset, AttachMoney } from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const emptyForm = { name: '', email: '', phone: '' };
const emptySalary = { basic_salary: '', hra: '', other_allowances: '', pf_deduction: '', tds_deduction: '', other_deductions: '', effective_from: new Date().toISOString().split('T')[0] };

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [viewStaff, setViewStaff] = useState(null);
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [salaryStaffId, setSalaryStaffId] = useState(null);
  const [salaryForm, setSalaryForm] = useState(emptySalary);
  const [salaryData, setSalaryData] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff');
      setStaff(res.data.staff || res.data || []);
    } catch { toast.error('Failed to fetch staff'); setStaff([]); }
    finally { setLoading(false); }
  };

  const handleOpen = (member = null) => {
    if (member) {
      setEditId(member.id);
      setFormData({
        name: `${member.first_name || ''} ${member.last_name || ''}`.trim(),
        email: member.email || '',
        phone: member.phone || '',
      });
    } else {
      setEditId(null);
      setFormData(emptyForm);
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditId(null); setFormData(emptyForm); };
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Name and Email are required');
      return;
    }
    try {
      if (editId) {
        await api.put(`/staff/${editId}`, formData);
        toast.success('Staff updated');
      } else {
        const res = await api.post('/staff', formData);
        const creds = res.data.credentials;
        toast.success(`Staff created! Username: ${creds?.username || 'upsurge'} | Password: ${creds?.password || 'Check email'}`);
      }
      handleClose();
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save staff');
    }
  };

  const handleToggleStatus = async (member) => {
    try {
      const newStatus = member.status === 'active' ? 'inactive' : 'active';
      await api.put(`/staff/${member.id}/status`, { status: newStatus });
      toast.success(`Staff ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchStaff();
    } catch { toast.error('Failed to update status'); }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm('Reset password for this staff member?')) return;
    try {
      const res = await api.put(`/staff/${id}/reset-password`);
      toast.success(`New password: ${res.data.newPassword}`);
    } catch { toast.error('Failed to reset password'); }
  };

  const handleOpenSalary = async (id) => {
    setSalaryStaffId(id);
    setSalaryForm(emptySalary);
    setSalaryData(null);
    try {
      const res = await api.get(`/staff/${id}/salary`);
      const s = res.data.salary;
      setSalaryData(s);
      setSalaryForm({
        basic_salary: s.basic_salary || '',
        hra: s.hra || '',
        other_allowances: s.other_allowances || '',
        pf_deduction: s.pf_deduction || '',
        tds_deduction: s.tds_deduction || '',
        other_deductions: s.other_deductions || '',
        effective_from: s.effective_from ? s.effective_from.split('T')[0] : new Date().toISOString().split('T')[0],
      });
    } catch { /* no salary yet */ }
    setSalaryOpen(true);
  };

  const handleSaveSalary = async () => {
    if (!salaryForm.basic_salary) { toast.error('Basic salary is required'); return; }
    try {
      await api.post(`/staff/${salaryStaffId}/salary`, salaryForm);
      toast.success('Salary structure saved');
      setSalaryOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save salary');
    }
  };

  const grossSalary = parseFloat(salaryForm.basic_salary || 0) + parseFloat(salaryForm.hra || 0) + parseFloat(salaryForm.other_allowances || 0);
  const totalDeductions = parseFloat(salaryForm.pf_deduction || 0) + parseFloat(salaryForm.tds_deduction || 0) + parseFloat(salaryForm.other_deductions || 0);
  const netSalary = grossSalary - totalDeductions;

  return (
    <Layout title="Staff Management">
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Staff Management</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Staff</Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Joining Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staff.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center">No staff found.</TableCell></TableRow>
                ) : staff.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{`${m.first_name || ''} ${m.last_name || ''}`.trim()}</TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>{m.phone}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <Chip label={member.status === 'active' ? 'Active' : 'Inactive'} color={member.status === 'active' ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => setViewStaff(m)}><Visibility /></IconButton>
                      <IconButton size="small" color="info" onClick={() => handleOpen(m)}><Edit /></IconButton>
                      <IconButton size="small" color="success" onClick={() => handleOpenSalary(m.id)} title="Salary"><AttachMoney /></IconButton>
                      <IconButton size="small" color="warning" onClick={() => handleResetPassword(m.id)} title="Reset Password"><LockReset /></IconButton>
                      <Switch size="small" checked={m.status === 'active'} onChange={() => handleToggleStatus(m)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editId ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <TextField label="Full Name" name="name" value={formData.name} onChange={handleChange} required sx={{ gridColumn: '1 / -1' }} />
              <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              <TextField label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">{editId ? 'Update' : 'Create'} Staff</Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={!!viewStaff} onClose={() => setViewStaff(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Staff Details</DialogTitle>
          <DialogContent>
            {viewStaff && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                <Typography><b>Name:</b> {`${viewStaff.first_name || ''} ${viewStaff.last_name || ''}`.trim()}</Typography>
                <Typography><b>Email:</b> {viewStaff.email}</Typography>
                <Typography><b>Phone:</b> {viewStaff.phone}</Typography>
                <Typography><b>Status:</b> {viewStaff.status === 'active' ? 'Active' : 'Inactive'}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewStaff(null)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Salary Dialog */}
        <Dialog open={salaryOpen} onClose={() => setSalaryOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Salary Structure</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <TextField label="Basic Salary (₹)" type="number" value={salaryForm.basic_salary} onChange={(e) => setSalaryForm({ ...salaryForm, basic_salary: e.target.value })} required />
              <TextField label="HRA (₹)" type="number" value={salaryForm.hra} onChange={(e) => setSalaryForm({ ...salaryForm, hra: e.target.value })} />
              <TextField label="Other Allowances (₹)" type="number" value={salaryForm.other_allowances} onChange={(e) => setSalaryForm({ ...salaryForm, other_allowances: e.target.value })} />
              <TextField label="PF Deduction (₹)" type="number" value={salaryForm.pf_deduction} onChange={(e) => setSalaryForm({ ...salaryForm, pf_deduction: e.target.value })} />
              <TextField label="TDS Deduction (₹)" type="number" value={salaryForm.tds_deduction} onChange={(e) => setSalaryForm({ ...salaryForm, tds_deduction: e.target.value })} />
              <TextField label="Other Deductions (₹)" type="number" value={salaryForm.other_deductions} onChange={(e) => setSalaryForm({ ...salaryForm, other_deductions: e.target.value })} />
              <TextField label="Effective From" type="date" value={salaryForm.effective_from} onChange={(e) => setSalaryForm({ ...salaryForm, effective_from: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ gridColumn: '1 / -1' }} />
            </Box>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2">Gross Salary: <b>₹{grossSalary.toLocaleString()}</b></Typography>
              <Typography variant="body2">Total Deductions: <b>₹{totalDeductions.toLocaleString()}</b></Typography>
              <Typography variant="body1" color="primary">Net Salary: <b>₹{netSalary.toLocaleString()}</b></Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSalaryOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSalary} variant="contained">Save Salary</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Staff;
