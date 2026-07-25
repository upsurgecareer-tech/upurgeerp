import { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Grid, Typography, Dialog, DialogTitle,
  DialogContent, TextField, CircularProgress, Alert, Chip, IconButton,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  InputAdornment, Tooltip, Avatar, MenuItem, Select, FormControl, InputLabel,
  Checkbox, Stack, Divider, Fade, Zoom
} from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector, 
  TimelineContent, TimelineDot, TimelineOppositeContent, timelineOppositeContentClasses 
} from '@mui/lab';
import {
  CheckCircle, Cancel, HourglassEmpty, Block, PersonOff, PersonAdd,
  Edit, History, FilterList, Search, People, TrendingUp, Warning, Update
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function StatusManagement() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  
  const [form, setForm] = useState({
    status: '',
    reason: '',
    effective_date: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const statuses = [
    { value: 'Active', label: 'Active', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: <CheckCircle /> },
    { value: 'Inactive', label: 'Inactive', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)', icon: <HourglassEmpty /> },
    { value: 'On Leave', label: 'On Leave', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: <Warning /> },
    { value: 'Suspended', label: 'Suspended', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <Block /> },
    { value: 'Terminated', label: 'Terminated', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)', icon: <PersonOff /> },
    { value: 'Resigned', label: 'Resigned', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', icon: <Cancel /> }
  ];

  const [stats, setStats] = useState({
    active: 0,
    inactive: 0,
    onLeave: 0,
    terminated: 0
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hrms/employees');
      const emps = res.data.employees || [];
      setEmployees(emps);
      setFilteredEmployees(emps);
      
      setStats({
        active: emps.filter(e => e.status === 'Active').length,
        inactive: emps.filter(e => e.status === 'Inactive').length,
        onLeave: emps.filter(e => e.status === 'On Leave').length,
        terminated: emps.filter(e => e.status === 'Terminated' || e.status === 'Resigned').length
      });
    } catch (error) {
      console.error('Fetch Employees Error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    applyFilters(value, filterStatus);
  };

  const handleStatusFilter = (value) => {
    setFilterStatus(value);
    applyFilters(searchTerm, value);
  };

  const applyFilters = (search, status) => {
    let filtered = [...employees];

    if (search) {
      filtered = filtered.filter(emp =>
        emp.user?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.user?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.employee_code?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filtered = filtered.filter(emp => emp.status === status);
    }

    setFilteredEmployees(filtered);
  };

  const handleSelectEmployee = (empId) => {
    if (selectedEmployees.includes(empId)) {
      setSelectedEmployees(selectedEmployees.filter(id => id !== empId));
    } else {
      setSelectedEmployees([...selectedEmployees, empId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(e => e.id));
    }
  };

  const handleChangeStatus = (employee) => {
    setSelectedEmployee(employee);
    setForm({
      status: employee.status,
      reason: '',
      effective_date: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setOpenDialog(true);
  };

  const handleBulkStatusChange = () => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }
    setSelectedEmployee(null);
    setForm({
      status: '',
      reason: '',
      effective_date: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!form.status) {
      toast.error('Please select a status');
      return;
    }
    if (!form.reason) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      if (selectedEmployee) {
        await api.patch(`/hrms/employees/${selectedEmployee.id}/status`, {
          status: form.status,
          reason: form.reason,
          remarks: form.remarks
        });
        toast.success('Status updated successfully');
      } else {
        await api.post('/hrms/employees/bulk-status', {
          employeeIds: selectedEmployees,
          status: form.status,
          reason: form.reason,
          remarks: form.remarks
        });
        toast.success(`Status updated for ${selectedEmployees.length} employees`);
        setSelectedEmployees([]);
      }
      setOpenDialog(false);
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleViewHistory = async (employee) => {
    setSelectedEmployee(employee);
    try {
      const res = await api.get(`/hrms/employees/${employee.id}/status-history`);
      setStatusHistory(res.data.history || []);
      setOpenHistory(true);
    } catch (error) {
      toast.error('Failed to fetch status history');
    }
  };

  const getStatusConfig = (status) => {
    return statuses.find(s => s.value === status) || statuses[1];
  };

  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
            color: 'white', borderRadius: 4, transition: 'transform 0.3s',
            boxShadow: '0 10px 20px rgba(56, 249, 215, 0.2)',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>Active</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.active}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 60, opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', borderRadius: 4, transition: 'transform 0.3s',
            boxShadow: '0 10px 20px rgba(118, 75, 162, 0.2)',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>Inactive</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.inactive}</Typography>
                </Box>
                <HourglassEmpty sx={{ fontSize: 60, opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', 
            color: 'white', borderRadius: 4, transition: 'transform 0.3s',
            boxShadow: '0 10px 20px rgba(253, 160, 133, 0.2)',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>On Leave</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.onLeave}</Typography>
                </Box>
                <Warning sx={{ fontSize: 60, opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', 
            color: 'white', borderRadius: 4, transition: 'transform 0.3s',
            boxShadow: '0 10px 20px rgba(255, 8, 68, 0.2)',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>Terminated</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.terminated}</Typography>
                </Box>
                <PersonOff sx={{ fontSize: 60, opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Header with Filters */}
      <Paper sx={{ 
        p: 2.5, 
        mb: 3, 
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main', display: 'flex' }}>
              <Update />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Employee Status Management
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Edit />}
            onClick={handleBulkStatusChange}
            disabled={selectedEmployees.length === 0}
            sx={{ 
              borderRadius: 2, textTransform: 'none', fontWeight: 600,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            Bulk Status Change {selectedEmployees.length > 0 && `(${selectedEmployees.length})`}
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>,
                sx: { borderRadius: 2, bgcolor: '#f8fafc' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => handleStatusFilter(e.target.value)}
                label="Filter by Status"
                sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}
              >
                <MenuItem value="">All Status</MenuItem>
                {statuses.map(status => (
                  <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('');
                setFilteredEmployees(employees);
              }}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, height: '100%' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Employees Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress size={48} thickness={4} />
        </Box>
      ) : filteredEmployees.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3, border: '1px solid #bae6fd' }}>No employees found matching the criteria.</Alert>
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
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={handleSelectAll}
                    color="primary"
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Employee Details</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Current Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Last Updated</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map(emp => {
                const statusConfig = getStatusConfig(emp.status);
                return (
                  <TableRow 
                    key={emp.id} 
                    hover
                    selected={selectedEmployees.includes(emp.id)}
                    sx={{ 
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: '#f8fafc', transform: 'scale(1.002)' },
                      '&.Mui-selected, &.Mui-selected:hover': { bgcolor: 'primary.50' }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedEmployees.includes(emp.id)}
                        onChange={() => handleSelectEmployee(emp.id)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 600, width: 40, height: 40, boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)' }}>
                          {emp.user?.first_name?.charAt(0)}{emp.user?.last_name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {emp.user?.first_name} {emp.user?.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {emp.user?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={emp.employee_code} size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', borderRadius: 1.5, fontWeight: 600 }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{emp.department?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        size="small"
                        sx={{ 
                          bgcolor: statusConfig.bg, 
                          color: statusConfig.color,
                          borderRadius: 1.5, 
                          fontWeight: 600,
                          border: `1px solid ${statusConfig.color}33`,
                          '& .MuiChip-icon': { color: statusConfig.color, fontSize: '1rem' }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 500 }}>{new Date(emp.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Change Status" placement="top" arrow>
                        <IconButton size="small" onClick={() => handleChangeStatus(emp)} sx={{ color: 'primary.main', bgcolor: 'primary.50', mr: 1, '&:hover': { bgcolor: 'primary.100' } }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View History" placement="top" arrow>
                        <IconButton size="small" onClick={() => handleViewHistory(emp)} sx={{ color: 'info.main', bgcolor: 'info.50', '&:hover': { bgcolor: 'info.100' } }}>
                          <History fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Change Status Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {selectedEmployee ? `Update Status` : `Bulk Status Update`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {selectedEmployee ? `${selectedEmployee.user?.first_name} ${selectedEmployee.user?.last_name} (${selectedEmployee.employee_code})` : `${selectedEmployees.length} employees selected`}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth>
              <InputLabel>New Status *</InputLabel>
              <Select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                label="New Status *"
                sx={{ borderRadius: 2 }}
              >
                {statuses.map(status => (
                  <MenuItem key={status.value} value={status.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: status.color, fontWeight: 600 }}>
                      {status.icon}
                      {status.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="date"
              label="Effective Date *"
              value={form.effective_date}
              onChange={e => setForm({ ...form, effective_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              label="Reason *"
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              multiline
              rows={2}
              placeholder="e.g., Annual Leave, Resignation, Promotion..."
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              label="Remarks (Optional)"
              value={form.remarks}
              onChange={e => setForm({ ...form, remarks: e.target.value })}
              multiline
              rows={2}
              placeholder="Additional internal remarks"
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button fullWidth variant="outlined" onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
              <Button fullWidth variant="contained" color="primary" onClick={handleSubmit} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Update Status</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Status History Dialog */}
      <Dialog 
        open={openHistory} 
        onClose={() => setOpenHistory(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 2, borderBottom: '1px solid #f1f5f9' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Status Timeline</Typography>
          <Typography variant="caption" color="text.secondary">
            History for {selectedEmployee?.user?.first_name} {selectedEmployee?.user?.last_name}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
          <Box sx={{ p: 3 }}>
            <Timeline sx={{ p: 0, m: 0, [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.2, pl: 0 } }}>
              {statusHistory.map((history, index) => {
                const config = getStatusConfig(history.status);
                return (
                  <TimelineItem key={history.id}>
                    <TimelineOppositeContent sx={{ pt: 1.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                        {new Date(history.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {new Date(history.created_at).getFullYear()}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot sx={{ bgcolor: config.bg, color: config.color, boxShadow: `0 0 0 4px ${config.bg}` }}>
                        {config.icon}
                      </TimelineDot>
                      {index < statusHistory.length - 1 && <TimelineConnector sx={{ bgcolor: '#e2e8f0' }} />}
                    </TimelineSeparator>
                    <TimelineContent sx={{ pb: 4 }}>
                      <Card sx={{ 
                        borderRadius: 3, 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        border: '1px solid white',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: config.color, boxShadow: `0 10px 20px ${config.bg}` }
                      }}>
                        <CardContent sx={{ p: 2.5, pb: '20px !important' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: config.color }}>
                              {history.status}
                            </Typography>
                            <Chip label={history.changer ? `${history.changer.first_name} ${history.changer.last_name}` : 'System'} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#f1f5f9' }} />
                          </Box>
                          
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                            {history.reason}
                          </Typography>
                          
                          {history.remarks && (
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1, p: 1, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                              {history.remarks}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
          </Box>
        </DialogContent>
        <Box sx={{ p: 2, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => setOpenHistory(false)} sx={{ borderRadius: 2, fontWeight: 600 }}>
            Close
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
