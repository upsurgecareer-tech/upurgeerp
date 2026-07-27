import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Paper, CircularProgress,
  Alert, Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Dialog, DialogTitle, DialogContent, TextField, MenuItem,
  Avatar, Tooltip, IconButton, Divider, InputAdornment
} from '@mui/material';
import {
  AdminPanelSettings, PersonAdd, Edit, Block, CheckCircle,
  Search, Visibility, VisibilityOff, LockReset
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Layout from '../../components/Layout';

const roleColors = {
  'super admin':  { bg: '#fee2e2', color: '#991b1b' },
  'branch admin': { bg: '#fef9c3', color: '#854d0e' },
  'faculty':      { bg: '#f0fdf4', color: '#166534' },
  'counsellor':   { bg: '#eff6ff', color: '#1d4ed8' },
  'cashier':      { bg: '#fff7ed', color: '#9a3412' },
};

const statusStyle = {
  active:    { bg: '#f0fdf4', color: '#166534', label: 'Active' },
  inactive:  { bg: '#fee2e2', color: '#991b1b', label: 'Inactive' },
  suspended: { bg: '#fef9c3', color: '#854d0e', label: 'Suspended' },
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add/Edit User dialog
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '', password: '',
    phone: '', role_id: '', status: 'active'
  });

  // Reset Password dialog
  const [resetOpen, setResetOpen] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles'),
      ]);
      setUsers(usersRes.data.users || []);
      setRoles(rolesRes.data.roles || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Add/Edit handlers ───────────────────────────────────────────────────────
  const handleOpen = (user = null) => {
    setEditUser(user);
    setShowPass(false);
    if (user) {
      setForm({
        first_name: user.first_name || '', last_name: user.last_name || '',
        username: user.username || '', email: user.email || '', password: '',
        phone: user.phone || '', role_id: user.role_id || '', status: user.status || 'active',
      });
    } else {
      setForm({ first_name: '', last_name: '', username: '', email: '', password: '', phone: '', role_id: '', status: 'active' });
    }
    setOpen(true);
  };

  const handleNameChange = (field, value) => {
    const updated = { ...form, [field]: value };
    if (!editUser) {
      const first = field === 'first_name' ? value : updated.first_name;
      const last = field === 'last_name' ? value : updated.last_name;
      const clean = `${first || ''}${last || ''}`.toLowerCase().replace(/[^a-z0-9]/g, '');
      updated.username = clean ? `upsurge_${clean}` : '';
    }
    setForm(updated);
  };

  const handleSave = async () => {
    if (!form.first_name || !form.email || !form.role_id) {
      toast.error('First name, email and role are required'); return;
    }
    if (!editUser && !form.password) {
      toast.error('Password is required for new user'); return;
    }
    if (!editUser && form.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    try {
      if (editUser) {
        await api.put(`/users/${editUser.id}`, {
          first_name: form.first_name, last_name: form.last_name,
          phone: form.phone, role_id: form.role_id, status: form.status
        });
        toast.success('User updated successfully!');
      } else {
        await api.post('/users', form);
        toast.success('User created successfully!');
      }
      setOpen(false);
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    }
  };

  const handleToggle = async (user) => {
    try {
      const res = await api.patch(`/users/${user.id}/toggle-status`);
      toast.success(res.data.message);
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to toggle status');
    }
  };

  // ── Reset Password handlers ─────────────────────────────────────────────────
  const handleResetOpen = (user) => {
    setResetUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPass(false);
    setShowConfirmPass(false);
    setResetOpen(true);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!'); return;
    }
    try {
      setResetting(true);
      const res = await api.patch(`/users/${resetUser.id}/reset-password`, { new_password: newPassword });
      toast.success(res.data.message);
      setResetOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getRoleStyle = (roleName) => {
    const key = (roleName || '').toLowerCase().trim();
    return roleColors[key] || { bg: '#f1f5f9', color: '#475569' };
  };

  const filtered = users.filter(u =>
    `${u.first_name} ${u.last_name} ${u.email} ${u.username}`.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status !== 'active').length,
  };

  return (
    <Layout title="User Management">
      <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>

        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(239,68,68,0.12)', color: '#ef4444', display: 'flex' }}>
            <AdminPanelSettings fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>User Management</Typography>
            <Typography variant="body2" color="text.secondary">
              Admin panel — Create users, assign roles, reset passwords, activate/deactivate access.
            </Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Users', value: stats.total, color: '#6366f1', bg: '#eef2ff' },
            { label: 'Active', value: stats.active, color: '#10b981', bg: '#f0fdf4' },
            { label: 'Inactive', value: stats.inactive, color: '#ef4444', bg: '#fef2f2' },
            { label: 'Roles', value: roles.length, color: '#f59e0b', bg: '#fffbeb' },
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

        {/* Search + Add */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small" placeholder="Search users..." value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ minWidth: 260 }}
          />
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => handleOpen()}
            sx={{ borderRadius: 2, fontWeight: 700, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}>
            Add New User
          </Button>
        </Box>

        {/* Users Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Alert severity="info">No users found.</Alert>
        ) : (
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
                    {['User', 'Email', 'Role', 'Last Login', 'Status', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(u => {
                    const roleName = u.role?.name || '';
                    const rs = getRoleStyle(roleName);
                    const ss = statusStyle[u.status] || statusStyle.inactive;
                    return (
                      <TableRow key={u.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: rs.color, fontSize: '0.85rem', fontWeight: 700 }}>
                              {u.first_name?.[0]}{u.last_name?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={700}>{u.first_name} {u.last_name}</Typography>
                              <Typography variant="caption" color="text.secondary">@{u.username}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell><Typography variant="body2">{u.email}</Typography></TableCell>
                        <TableCell>
                          <Chip label={roleName || 'No Role'} size="small"
                            sx={{ bgcolor: rs.bg, color: rs.color, fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {u.last_login
                              ? new Date(u.last_login).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'Never'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={ss.label} size="small" sx={{ bgcolor: ss.bg, color: ss.color, fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Edit Role & Details">
                              <IconButton size="small" onClick={() => handleOpen(u)}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reset Password">
                              <IconButton size="small" color="warning" onClick={() => handleResetOpen(u)}>
                                <LockReset fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={u.status === 'active' ? 'Deactivate User' : 'Activate User'}>
                              <IconButton size="small" color={u.status === 'active' ? 'error' : 'success'}
                                onClick={() => handleToggle(u)}>
                                {u.status === 'active' ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* ── Add/Edit User Dialog ─────────────────────────────────────────── */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {editUser ? `Edit User: ${editUser.first_name} ${editUser.last_name}` : 'Create New User'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={6}>
                <TextField fullWidth label="First Name *" value={form.first_name}
                  onChange={e => handleNameChange('first_name', e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Last Name" value={form.last_name}
                  onChange={e => handleNameChange('last_name', e.target.value)} />
              </Grid>
              {!editUser && (
                <Grid item xs={12}>
                  <TextField fullWidth label="Username *" value={form.username}
                    helperText="Auto-generated from employee name (you can customize if needed)"
                    onChange={e => setForm({ ...form, username: e.target.value })} />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField fullWidth label="Email *" type="email" value={form.email}
                  disabled={!!editUser}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </Grid>
              {!editUser && (
                <Grid item xs={12}>
                  <TextField fullWidth label="Password *" type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    helperText="Minimum 6 characters"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPass(!showPass)} size="small">
                            {showPass ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }} />
                </Grid>
              )}
              <Grid item xs={6}>
                <TextField fullWidth label="Phone" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField select fullWidth label="Role *" value={form.role_id}
                  onChange={e => setForm({ ...form, role_id: e.target.value })}>
                  <MenuItem value="">Select Role</MenuItem>
                  {roles.map(r => (
                    <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              {editUser && (
                <Grid item xs={12}>
                  <TextField select fullWidth label="Status" value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}>
                    <MenuItem value="active">✅ Active</MenuItem>
                    <MenuItem value="inactive">❌ Inactive</MenuItem>
                    <MenuItem value="suspended">⚠️ Suspended</MenuItem>
                  </TextField>
                </Grid>
              )}
            </Grid>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button fullWidth variant="outlined" onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>
                Cancel
              </Button>
              <Button fullWidth variant="contained" onClick={handleSave}
                sx={{ borderRadius: 2, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}>
                {editUser ? 'Update User' : 'Create User'}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* ── Reset Password Dialog ───────────────────────────────────────────── */}
        <Dialog open={resetOpen} onClose={() => setResetOpen(false)} maxWidth="xs" fullWidth
          PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockReset color="warning" />
            Reset Password
          </DialogTitle>
          <DialogContent>
            {resetUser && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#fff7ed', borderRadius: 2, border: '1px solid #fed7aa' }}>
                <Typography variant="body2" fontWeight={700}>
                  👤 {resetUser.first_name} {resetUser.last_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">{resetUser.email}</Typography>
              </Box>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth label="New Password *"
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  helperText="Minimum 6 characters"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNewPass(!showNewPass)} size="small">
                          {showNewPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Confirm Password *"
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  error={confirmPassword.length > 0 && newPassword !== confirmPassword}
                  helperText={confirmPassword.length > 0 && newPassword !== confirmPassword ? '❌ Passwords do not match' : confirmPassword.length > 0 ? '✅ Passwords match' : ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPass(!showConfirmPass)} size="small">
                          {showConfirmPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button fullWidth variant="outlined" onClick={() => setResetOpen(false)} sx={{ borderRadius: 2 }}>
                Cancel
              </Button>
              <Button fullWidth variant="contained" onClick={handleResetPassword}
                disabled={resetting || !newPassword || newPassword !== confirmPassword}
                startIcon={<LockReset />}
                sx={{ borderRadius: 2, bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' }, color: 'white' }}>
                {resetting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

      </Box>
    </Layout>
  );
}
