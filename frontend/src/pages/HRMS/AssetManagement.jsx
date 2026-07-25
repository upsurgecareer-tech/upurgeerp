import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Paper, CircularProgress,
  Alert, Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Dialog, DialogTitle, DialogContent, TextField, MenuItem,
  Avatar, Divider, Tooltip, IconButton
} from '@mui/material';
import { Inventory, Add, Edit, Delete, Assignment, AssignmentReturn, Category } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const accent = '#f59e0b';

const statusStyle = { Available: { bg: '#f0fdf4', color: '#166534' }, Assigned: { bg: '#eff6ff', color: '#1d4ed8' }, 'Under Repair': { bg: '#fef9c3', color: '#854d0e' }, Retired: { bg: '#fee2e2', color: '#991b1b' } };
const catIcon = { Laptop: '💻', Desktop: '🖥️', Mobile: '📱', Vehicle: '🚗', Furniture: '🪑', Software: '💿', Other: '📦' };

export default function AssetManagement() {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [assignAsset, setAssignAssetData] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [assignEmpId, setAssignEmpId] = useState('');
  const [form, setForm] = useState({ name: '', asset_code: '', category: 'Other', brand: '', model: '', serial_number: '', purchase_date: '', purchase_cost: '', warranty_expiry: '', location: '', notes: '' });

  const fetch = useCallback(async () => {
    try { setLoading(true); const r = await api.get('/hrms/assets', { params: filterStatus ? { status: filterStatus } : {} }); setAssets(r.data.assets || []); }
    catch { toast.error('Failed to load assets'); } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => {
    fetch();
    api.get('/hrms/employees').then(r => setEmployees(r.data.employees || [])).catch(() => {});
  }, [fetch]);

  const handleOpen = (asset = null) => {
    setEditAsset(asset);
    setForm(asset ? { name: asset.name, asset_code: asset.asset_code || '', category: asset.category || 'Other', brand: asset.brand || '', model: asset.model || '', serial_number: asset.serial_number || '', purchase_date: asset.purchase_date || '', purchase_cost: asset.purchase_cost || '', warranty_expiry: asset.warranty_expiry || '', location: asset.location || '', notes: asset.notes || '' }
      : { name: '', asset_code: '', category: 'Other', brand: '', model: '', serial_number: '', purchase_date: '', purchase_cost: '', warranty_expiry: '', location: '', notes: '' });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Asset name required'); return; }
    try {
      editAsset ? await api.put(`/hrms/assets/${editAsset.id}`, form) : await api.post('/hrms/assets', form);
      toast.success(editAsset ? 'Asset updated!' : 'Asset created!'); setOpen(false); fetch();
    } catch (e) {
      if (e.response?.data?.errors) {
        toast.error(e.response.data.errors.map(err => err.message).join(', '));
      } else {
        toast.error(e.response?.data?.message || 'Failed to save');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset?')) return;
    try { await api.delete(`/hrms/assets/${id}`); toast.success('Deleted'); fetch(); } catch { toast.error('Failed to delete'); }
  };

  const handleAssign = async () => {
    if (!assignEmpId) { toast.error('Select an employee'); return; }
    try { await api.post(`/hrms/assets/${assignAsset.id}/assign`, { employee_id: assignEmpId }); toast.success('Asset assigned!'); setAssignOpen(false); setAssignEmpId(''); fetch(); }
    catch (e) {
      if (e.response?.data?.errors) {
        toast.error(e.response.data.errors.map(err => err.message).join(', '));
      } else {
        toast.error(e.response?.data?.message || 'Failed to assign');
      }
    }
  };

  const handleReturn = async (id) => {
    try { await api.post(`/hrms/assets/${id}/return`); toast.success('Asset returned'); fetch(); }
    catch { toast.error('Failed to return asset'); }
  };

  const cats = ['Laptop', 'Desktop', 'Mobile', 'Vehicle', 'Furniture', 'Software', 'Other'];
  const statuses = ['Available', 'Assigned', 'Under Repair', 'Retired'];

  const stats = { total: assets.length, available: assets.filter(a => a.status === 'Available').length, assigned: assets.filter(a => a.status === 'Assigned').length, repair: assets.filter(a => a.status === 'Under Repair').length };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(245,158,11,0.12)', color: accent, display: 'flex' }}>
          <Inventory fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Asset Management</Typography>
          <Typography variant="body2" color="text.secondary">Track company assets, assignments, and maintenance.</Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[{ l: 'Total Assets', v: stats.total, c: accent, bg: '#fffbeb' }, { l: 'Available', v: stats.available, c: '#10b981', bg: '#f0fdf4' }, { l: 'Assigned', v: stats.assigned, c: '#3b82f6', bg: '#eff6ff' }, { l: 'Under Repair', v: stats.repair, c: '#ef4444', bg: '#fef2f2' }].map(s => (
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
        <TextField select size="small" label="Filter by Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All Status</MenuItem>
          {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}
          sx={{ borderRadius: 2, fontWeight: 700, bgcolor: accent, '&:hover': { bgcolor: '#d97706', transform: 'translateY(-1px)' }, transition: 'all 0.2s' }}>
          Add Asset
        </Button>
      </Box>

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        : assets.length === 0 ? <Alert severity="info">No assets found. Add your first asset!</Alert>
        : (
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
                    {['Asset', 'Category', 'Brand/Model', 'Serial No.', 'Purchase', 'Status', 'Assigned To', 'Actions'].map(h =>
                      <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assets.map(a => (
                    <TableRow key={a.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ fontSize: '1.5rem' }}>{catIcon[a.category] || '📦'}</Box>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>{a.name}</Typography>
                            {a.asset_code && <Typography variant="caption" color="text.secondary">#{a.asset_code}</Typography>}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Chip label={a.category} size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569' }} /></TableCell>
                      <TableCell>
                        <Typography variant="body2">{a.brand || '—'}</Typography>
                        <Typography variant="caption" color="text.secondary">{a.model || ''}</Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{a.serial_number || '—'}</Typography></TableCell>
                      <TableCell>
                        {a.purchase_cost && <Typography variant="body2" fontWeight={600}>₹{parseInt(a.purchase_cost).toLocaleString('en-IN')}</Typography>}
                        {a.purchase_date && <Typography variant="caption" color="text.secondary">{new Date(a.purchase_date).toLocaleDateString('en-IN')}</Typography>}
                      </TableCell>
                      <TableCell><Chip label={a.status} size="small" sx={{ fontWeight: 700, ...(statusStyle[a.status] || {}) }} /></TableCell>
                      <TableCell>
                        {a.assignedEmployee ? (
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{a.assignedEmployee.user?.first_name} {a.assignedEmployee.user?.last_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{a.assigned_date ? new Date(a.assigned_date).toLocaleDateString('en-IN') : ''}</Typography>
                          </Box>
                        ) : <Typography variant="caption" color="text.secondary">—</Typography>}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {a.status === 'Available' && (
                            <Tooltip title="Assign"><IconButton size="small" color="primary" onClick={() => { setAssignAssetData(a); setAssignOpen(true); }}><Assignment fontSize="small" /></IconButton></Tooltip>
                          )}
                          {a.status === 'Assigned' && (
                            <Tooltip title="Return"><IconButton size="small" color="warning" onClick={() => handleReturn(a.id)}><AssignmentReturn fontSize="small" /></IconButton></Tooltip>
                          )}
                          <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(a)}><Edit fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(a.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}><TextField fullWidth label="Asset Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Asset Code" value={form.asset_code} onChange={e => setForm({ ...form, asset_code: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {cats.map(c => <MenuItem key={c} value={c}>{catIcon[c]} {c}</MenuItem>)}
            </TextField></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Model" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Serial Number" value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth type="date" label="Purchase Date" InputLabelProps={{ shrink: true }} value={form.purchase_date} onChange={e => setForm({ ...form, purchase_date: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth type="number" label="Purchase Cost (₹)" value={form.purchase_cost} onChange={e => setForm({ ...form, purchase_cost: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth type="date" label="Warranty Expiry" InputLabelProps={{ shrink: true }} value={form.warranty_expiry} onChange={e => setForm({ ...form, warranty_expiry: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button fullWidth variant="outlined" onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button fullWidth variant="contained" onClick={handleSave} sx={{ borderRadius: 2, bgcolor: accent, '&:hover': { bgcolor: '#d97706' } }}>{editAsset ? 'Update' : 'Add'} Asset</Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Assign: {assignAsset?.name}</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Select Employee" value={assignEmpId} onChange={e => setAssignEmpId(e.target.value)} sx={{ mt: 1 }}>
            <MenuItem value="">Choose Employee</MenuItem>
            {employees.map(e => <MenuItem key={e.id} value={e.id}>{e.user?.first_name} {e.user?.last_name} — {e.designation || e.department?.name}</MenuItem>)}
          </TextField>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button fullWidth variant="outlined" onClick={() => setAssignOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button fullWidth variant="contained" onClick={handleAssign} sx={{ borderRadius: 2, bgcolor: accent }}>Assign</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
