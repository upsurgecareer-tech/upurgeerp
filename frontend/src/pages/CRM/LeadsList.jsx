import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, TablePagination,
  TableSortLabel, Tooltip, Menu, InputAdornment, Grid
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, Phone, WhatsApp, Email, Refresh,
  FileDownload, FileUpload, DeleteSweep, CheckCircle, Search, FilterList
} from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const STAGES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const SOURCES = ['Website', 'Referral', 'Walk-in', 'Social Media', 'Other'];
const PRIORITIES = ['Hot', 'Warm', 'Cold'];
const emptyForm = { 
  name: '', email: '', mobile: '', course_interest: '', 
  source: 'Website', stage: 'New', inquiry_date: '', priority: 'Warm' 
};

const stageColor = (stage) => ({ 
  New: 'info', Contacted: 'primary', Qualified: 'warning', 
  Converted: 'success', Lost: 'error' 
}[stage] || 'default');

const priorityColor = (priority) => ({
  Hot: 'error', Warm: 'warning', Cold: 'info'
}[priority] || 'default');

export default function LeadsList() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ 
    stage: '', source: '', search: '', priority: '',
    dateFrom: '', dateTo: '' 
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => { fetchLeads(); }, []);
  useEffect(() => { applyFilters(); }, [leads, filters, order, orderBy]);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
        else if (value.trim().length > 100) error = 'Name must not exceed 100 characters';
        else if (!/^[a-zA-Z\s-]+$/.test(value)) error = 'Name can only contain letters, spaces, and hyphens';
        break;
      case 'mobile':
        if (!value.trim()) error = 'Mobile number is required';
        else if (!/^\d{10}$/.test(value.replace(/\s/g, ''))) error = 'Mobile must be exactly 10 digits';
        else if (!/^[6-9]/.test(value)) error = 'Mobile must start with 6, 7, 8, or 9';
        else {
          const duplicate = leads.find(l => l.mobile === value && l.id !== editId);
          if (duplicate) error = 'This mobile number already exists';
        }
        break;
      case 'email':
        if (value.trim()) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
          else if (value.length > 100) error = 'Email must not exceed 100 characters';
          else {
            const duplicate = leads.find(l => l.email === value && l.id !== editId);
            if (duplicate) error = 'This email already exists';
          }
        }
        break;
      case 'inquiry_date':
        if (value) {
          const selectedDate = new Date(value);
          selectedDate.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          oneYearAgo.setHours(0, 0, 0, 0);
          if (selectedDate > today) error = 'Date cannot be in the future';
          else if (selectedDate < oneYearAgo) error = 'Date cannot be more than 1 year old';
        }
        break;
      case 'course_interest':
        if (value.length > 200) error = 'Course interest must not exceed 200 characters';
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
    ['name', 'mobile', 'email', 'inquiry_date', 'course_interest'].forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    setTouched({ name: true, mobile: true, email: true, inquiry_date: true, course_interest: true });
    return Object.keys(newErrors).length === 0;
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads');
      setLeads(res.data.leads || res.data || []);
    } catch { 
      toast.error('Failed to fetch leads'); 
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leads];
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(l => 
        l.name?.toLowerCase().includes(search) ||
        l.email?.toLowerCase().includes(search) ||
        l.mobile?.includes(search) ||
        l.course_interest?.toLowerCase().includes(search)
      );
    }
    if (filters.stage) filtered = filtered.filter(l => l.stage === filters.stage);
    if (filters.source) filtered = filtered.filter(l => l.source === filters.source);
    if (filters.priority) filtered = filtered.filter(l => l.priority === filters.priority);
    if (filters.dateFrom) filtered = filtered.filter(l => new Date(l.createdAt || l.created_at) >= new Date(filters.dateFrom));
    if (filters.dateTo) filtered = filtered.filter(l => new Date(l.createdAt || l.created_at) <= new Date(filters.dateTo));

    filtered.sort((a, b) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];
      if (orderBy === 'created_at') {
        aVal = a.createdAt || a.created_at;
        bVal = b.createdAt || b.created_at;
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else {
        aVal = aVal?.toString().toLowerCase() || '';
        bVal = bVal?.toString().toLowerCase() || '';
      }
      return order === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    setFilteredLeads(filtered);
    setPage(0);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAll = (event) => {
    setSelected(event.target.checked ? paginatedLeads.map(l => l.id) : []);
  };

  const handleSelect = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
    else if (selectedIndex === 0) newSelected = newSelected.concat(selected.slice(1));
    else if (selectedIndex === selected.length - 1) newSelected = newSelected.concat(selected.slice(0, -1));
    else if (selectedIndex > 0) newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    setSelected(newSelected);
  };

  const handleOpen = (lead = null) => {
    if (lead) {
      setEditId(lead.id);
      setFormData({ 
        name: lead.name || '', email: lead.email || '', mobile: lead.mobile || '', 
        course_interest: lead.course_interest || '', source: lead.source || 'Website', 
        stage: lead.stage || 'New', inquiry_date: lead.inquiry_date ? lead.inquiry_date.split('T')[0] : '',
        priority: lead.priority || 'Warm'
      });
    } else {
      setEditId(null);
      setFormData(emptyForm);
    }
    setErrors({});
    setTouched({});
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
      return;
    }
    try {
      if (editId) {
        await api.put(`/leads/${editId}`, formData);
        toast.success('Lead updated');
      } else {
        await api.post('/leads', formData);
        toast.success('Lead created');
      }
      setOpen(false);
      setEditId(null);
      setFormData(emptyForm);
      setErrors({});
      setTouched({});
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save lead');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted');
      fetchLeads();
    } catch { toast.error('Failed to delete'); }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.length} selected leads?`)) return;
    try {
      await Promise.all(selected.map(id => api.delete(`/leads/${id}`)));
      toast.success(`${selected.length} leads deleted`);
      setSelected([]);
      fetchLeads();
    } catch { toast.error('Failed to delete leads'); }
  };

  const handleBulkStageUpdate = async (newStage) => {
    try {
      await Promise.all(selected.map(id => api.put(`/leads/${id}`, { stage: newStage })));
      toast.success(`${selected.length} leads updated to ${newStage}`);
      setSelected([]);
      setAnchorEl(null);
      fetchLeads();
    } catch { toast.error('Failed to update leads'); }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Mobile', 'Course Interest', 'Source', 'Stage', 'Priority', 'Created Date'];
    const rows = filteredLeads.map(l => [
      l.name, l.email, l.mobile, l.course_interest, l.source, l.stage, 
      l.priority || 'N/A', (l.createdAt || l.created_at) ? new Date(l.createdAt || l.created_at).toLocaleDateString() : 'N/A'
    ]);
    let csv = headers.join(',') + '\n';
    rows.forEach(row => { csv += row.map(cell => `"${cell || ''}"`).join(',') + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported successfully');
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a valid CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await api.post('/leads/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Imported ${res.data.imported} leads. Duplicates skipped: ${res.data.duplicates}`);
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to import CSV');
    } finally {
      setLoading(false);
      event.target.value = null; // reset input
    }
  };

  const handleQuickAction = (lead, action) => {
    if (action === 'call') window.location.href = `tel:${lead.mobile}`;
    else if (action === 'whatsapp') window.open(`https://wa.me/${lead.mobile.replace(/\D/g, '')}`, '_blank');
    else if (action === 'email') window.location.href = `mailto:${lead.email}`;
  };

  const clearFilters = () => {
    setFilters({ stage: '', source: '', search: '', priority: '', dateFrom: '', dateTo: '' });
  };

  const paginatedLeads = filteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const isSelected = (id) => selected.indexOf(id) !== -1;

  return (
    <Layout title="Leads List">
      <Box sx={{ width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">Leads Management</Typography>
            <Typography variant="body2" color="text.secondary">
              Total: {filteredLeads.length} leads {filters.search || filters.stage || filters.source ? `(filtered from ${leads.length})` : ''}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchLeads} disabled={loading}>Refresh</Button>
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              id="import-csv-input"
              onChange={handleImportCSV}
            />
            <label htmlFor="import-csv-input">
              <Button variant="outlined" component="span" startIcon={<FileUpload />}>
                Import CSV
              </Button>
            </label>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExportCSV}>Export CSV</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Lead</Button>
          </Box>
        </Box>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField label="Search" size="small" fullWidth value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField select label="Stage" size="small" fullWidth value={filters.stage}
                  onChange={(e) => setFilters({ ...filters, stage: e.target.value })}>
                  <MenuItem value="">All Stages</MenuItem>
                  {STAGES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField select label="Source" size="small" fullWidth value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value })}>
                  <MenuItem value="">All Sources</MenuItem>
                  {SOURCES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField select label="Priority" size="small" fullWidth value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
                  <MenuItem value="">All Priorities</MenuItem>
                  {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <Button variant="outlined" fullWidth startIcon={<FilterList />}
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                  {showAdvancedFilters ? 'Hide' : 'More'} Filters
                </Button>
              </Grid>
            </Grid>

            {showAdvancedFilters && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} md={3}>
                  <TextField label="Date From" type="date" size="small" fullWidth value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField label="Date To" type="date" size="small" fullWidth value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button variant="outlined" fullWidth onClick={clearFilters}>Clear All Filters</Button>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        {selected.length > 0 && (
          <Card sx={{ mb: 2, bgcolor: 'primary.50' }}>
            <CardContent sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" fontWeight="bold">{selected.length} selected</Typography>
                <Button size="small" startIcon={<DeleteSweep />} color="error" onClick={handleBulkDelete}>Delete Selected</Button>
                <Button size="small" startIcon={<CheckCircle />} onClick={(e) => setAnchorEl(e.currentTarget)}>Change Stage</Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                  {STAGES.map(stage => (
                    <MenuItem key={stage} onClick={() => handleBulkStageUpdate(stage)}>
                      <Chip label={stage} color={stageColor(stage)} size="small" sx={{ mr: 1 }} />
                      {stage}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </CardContent>
          </Card>
        )}

        <TableContainer component={Card} sx={{ width: '100%', overflowX: 'auto', maxWidth: '100%' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox indeterminate={selected.length > 0 && selected.length < paginatedLeads.length}
                    checked={paginatedLeads.length > 0 && selected.length === paginatedLeads.length}
                    onChange={handleSelectAll} />
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}><TableSortLabel active={orderBy === 'name'} direction={orderBy === 'name' ? order : 'asc'} onClick={() => handleSort('name')}>Name</TableSortLabel></TableCell>
                <TableCell sx={{ minWidth: 100 }}>Mobile</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Email</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Course Interest</TableCell>
                <TableCell sx={{ minWidth: 100 }}><TableSortLabel active={orderBy === 'source'} direction={orderBy === 'source' ? order : 'asc'} onClick={() => handleSort('source')}>Source</TableSortLabel></TableCell>
                <TableCell sx={{ minWidth: 100 }}><TableSortLabel active={orderBy === 'stage'} direction={orderBy === 'stage' ? order : 'asc'} onClick={() => handleSort('stage')}>Stage</TableSortLabel></TableCell>
                <TableCell sx={{ minWidth: 80 }}>Priority</TableCell>
                <TableCell sx={{ minWidth: 100 }}><TableSortLabel active={orderBy === 'created_at'} direction={orderBy === 'created_at' ? order : 'asc'} onClick={() => handleSort('created_at')}>Created</TableSortLabel></TableCell>
                <TableCell sx={{ minWidth: 140 }}>Quick Actions</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={11} align="center">Loading...</TableCell></TableRow>
              ) : paginatedLeads.length === 0 ? (
                <TableRow><TableCell colSpan={11} align="center">No leads found.</TableCell></TableRow>
              ) : paginatedLeads.map((lead) => {
                const isItemSelected = isSelected(lead.id);
                return (
                  <TableRow key={lead.id} selected={isItemSelected} hover>
                    <TableCell padding="checkbox"><Checkbox checked={isItemSelected} onChange={() => handleSelect(lead.id)} /></TableCell>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>{lead.mobile}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.course_interest}</TableCell>
                    <TableCell>{lead.source}</TableCell>
                    <TableCell><Chip label={lead.stage} color={stageColor(lead.stage)} size="small" /></TableCell>
                    <TableCell><Chip label={lead.priority || 'Warm'} color={priorityColor(lead.priority || 'Warm')} size="small" variant="outlined" /></TableCell>
                    <TableCell>
                      {(() => {
                        const dateValue = lead.createdAt || lead.created_at;
                        if (!dateValue) return 'N/A';
                        try {
                          return new Date(dateValue).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          });
                        } catch {
                          return 'Invalid Date';
                        }
                      })()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Call"><IconButton size="small" color="primary" onClick={() => handleQuickAction(lead, 'call')}><Phone fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="WhatsApp"><IconButton size="small" color="success" onClick={() => handleQuickAction(lead, 'whatsapp')}><WhatsApp fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Email"><IconButton size="small" color="info" onClick={() => handleQuickAction(lead, 'email')}><Email fontSize="small" /></IconButton></Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details"><IconButton size="small" color="primary" onClick={() => navigate(`/crm/lead/${lead.id}`)}><Visibility fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton size="small" color="info" onClick={() => handleOpen(lead)}><Edit fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(lead.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination rowsPerPageOptions={[5, 10, 25, 50, 100]} component="div" count={filteredLeads.length}
            rowsPerPage={rowsPerPage} page={page} onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
        </TableContainer>

        <Dialog open={open} onClose={() => { setOpen(false); setFormData(emptyForm); setErrors({}); setTouched({}); }} maxWidth="sm" fullWidth>
          <DialogTitle>{editId ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Full Name" value={formData.name} onChange={(e) => handleFieldChange('name', e.target.value)}
                onBlur={() => handleFieldBlur('name')} error={touched.name && !!errors.name}
                helperText={touched.name && errors.name} required />
              <TextField label="Mobile" value={formData.mobile} onChange={(e) => handleFieldChange('mobile', e.target.value)}
                onBlur={() => handleFieldBlur('mobile')} error={touched.mobile && !!errors.mobile}
                helperText={touched.mobile && errors.mobile} required />
              <TextField label="Email" type="email" value={formData.email} onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')} error={touched.email && !!errors.email}
                helperText={touched.email && errors.email} />
              <TextField label="Inquiry Date" type="date" value={formData.inquiry_date} onChange={(e) => handleFieldChange('inquiry_date', e.target.value)}
                onBlur={() => handleFieldBlur('inquiry_date')} error={touched.inquiry_date && !!errors.inquiry_date}
                helperText={touched.inquiry_date && errors.inquiry_date} InputLabelProps={{ shrink: true }} />
              <TextField label="Course Interest" value={formData.course_interest} onChange={(e) => handleFieldChange('course_interest', e.target.value)}
                onBlur={() => handleFieldBlur('course_interest')} error={touched.course_interest && !!errors.course_interest}
                helperText={touched.course_interest && errors.course_interest} />
              <TextField select label="Source" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })}>
                {SOURCES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField select label="Stage" value={formData.stage} onChange={(e) => setFormData({ ...formData, stage: e.target.value })}>
                {STAGES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField select label="Priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpen(false); setFormData(emptyForm); setErrors({}); setTouched({}); }}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={Object.keys(errors).some(key => errors[key])}>
              {editId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
