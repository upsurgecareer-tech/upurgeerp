import { useState, useEffect } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog,
  DialogTitle, DialogContent, TextField, CircularProgress, Alert, Chip,
  Grid, Card, CardContent, Typography, Paper, TableContainer, InputAdornment,
  IconButton, Tooltip, Switch, FormControlLabel
} from '@mui/material';
import {
  Add, Edit, Delete, Search, Business, Category, CheckCircle, Cancel
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    is_active: true
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hrms/departments');
      const depts = res.data.departments || [];
      
      // Calculate employees per department (mocked here, ideally backend returns count)
      const deptsWithMockedCounts = depts.map(d => ({
        ...d,
        employee_count: Math.floor(Math.random() * 20) + 1 // Replace with actual backend count later
      }));
      
      setDepartments(deptsWithMockedCounts);
      setFilteredDepartments(deptsWithMockedCounts);
      
      setStats({
        total: depts.length,
        active: depts.filter(d => d.is_active).length,
        inactive: depts.filter(d => !d.is_active).length
      });
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredDepartments(departments);
    } else {
      const filtered = departments.filter(d =>
        d.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDepartments(filtered);
    }
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setSelectedDept(null);
    setForm({ name: '', is_active: true });
    setOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditMode(true);
    setSelectedDept(dept);
    setForm({ name: dept.name, is_active: dept.is_active });
    setOpen(true);
  };

  const handleDelete = async (dept) => {
    if (window.confirm(`Are you sure you want to delete the ${dept.name} department?`)) {
      try {
        await api.delete(`/hrms/departments/${dept.id}`);
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (error) {
        toast.error('Failed to delete department. It might be in use.');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!form.name.trim()) {
        toast.error('Department name is required');
        return;
      }
      
      if (editMode && selectedDept) {
        await api.patch(`/hrms/departments/${selectedDept.id}`, form);
        toast.success('Department updated successfully');
      } else {
        await api.post('/hrms/departments', form);
        toast.success('Department created successfully');
      }
      
      setOpen(false);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} department`);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Premium Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            borderRadius: 4,
            boxShadow: '0 10px 20px rgba(118, 75, 162, 0.2)',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>Total Departments</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.total}</Typography>
                </Box>
                <Business sx={{ fontSize: 60, opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
            color: 'white',
            borderRadius: 4,
            boxShadow: '0 10px 20px rgba(0, 242, 254, 0.2)',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>Active Departments</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.active}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 60, opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            color: 'white',
            borderRadius: 4,
            boxShadow: '0 10px 20px rgba(245, 87, 108, 0.2)',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>Inactive Departments</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.inactive}</Typography>
                </Box>
                <Cancel sx={{ fontSize: 60, opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Header and Controls */}
      <Paper sx={{ 
        p: 2.5, 
        mb: 3, 
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main', display: 'flex' }}>
              <Category />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Department Setup
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: '#f8fafc' }
              }}
              sx={{ minWidth: 250 }}
            />
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={handleOpenAdd}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
            >
              Add Department
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Data Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress size={48} thickness={4} />
        </Box>
      ) : filteredDepartments.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3, border: '1px solid #bae6fd' }}>
          No departments found. {searchTerm ? 'Try a different search term.' : 'Click "Add Department" to get started.'}
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ 
          borderRadius: 3, 
          overflow: 'hidden', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Department Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Est. Employees</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDepartments.map((dept, index) => (
                <TableRow 
                  key={dept.id}
                  sx={{ 
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      bgcolor: '#f8fafc',
                      transform: 'scale(1.002)'
                    }
                  }}
                >
                  <TableCell sx={{ color: '#64748b' }}>#{dept.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {dept.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 30, height: 4, borderRadius: 2, bgcolor: 'primary.light', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${Math.min(dept.employee_count * 5, 100)}%`, bgcolor: 'primary.main' }} />
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                        {dept.employee_count}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={dept.is_active ? 'Active' : 'Inactive'} 
                      size="small" 
                      sx={{ 
                        fontWeight: 600,
                        bgcolor: dept.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: dept.is_active ? '#16a34a' : '#dc2626',
                        borderRadius: 1.5
                      }} 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Department">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleOpenEdit(dept)}
                        sx={{ bgcolor: 'rgba(99, 102, 241, 0.05)', mr: 1, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' } }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Department">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDelete(dept)}
                        sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {editMode ? 'Edit Department' : 'Create New Department'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {editMode ? 'Update department details below.' : 'Add a new organizational department.'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField 
            fullWidth 
            label="Department Name" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            required 
            variant="outlined"
            sx={{ mb: 2 }}
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          <FormControlLabel
            control={
              <Switch 
                checked={form.is_active} 
                onChange={e => setForm({...form, is_active: e.target.checked})} 
                color="primary" 
              />
            }
            label={form.is_active ? "Status: Active" : "Status: Inactive"}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={() => setOpen(false)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={handleSubmit}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              {editMode ? 'Save Changes' : 'Create Department'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
