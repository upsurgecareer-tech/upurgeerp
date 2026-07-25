import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, CircularProgress, InputAdornment, Grid, TablePagination,
  Tooltip, Avatar, Alert
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, Info, Search, Refresh, FileDownload, Upload
} from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const StudentsListTab = ({ onRefresh }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', dob: '', gender: 'Male', status: 'Active',
    address: '', parent_name: '', parent_mobile: '',
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => { applyFilters(); }, [students, search, statusFilter, genderFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students');
      const studentData = res.data.students || res.data || [];
      setStudents(studentData);
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error('Failed to fetch students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(query) ||
        s.mobile?.includes(query) ||
        s.email?.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'All') filtered = filtered.filter(s => s.status === statusFilter);
    if (genderFilter !== 'All') filtered = filtered.filter(s => s.gender === genderFilter);
    setFilteredStudents(filtered);
    setPage(0);
  };

  const handleOpen = (student = null) => {
    if (student) {
      setEditId(student.id);
      setFormData({
        name: student.name || '',
        email: student.email || '',
        mobile: student.mobile || '',
        dob: student.dob ? student.dob.split('T')[0] : '',
        gender: student.gender || 'Male',
        address: student.address || '',
        parent_name: student.parent_name || '',
        parent_mobile: student.parent_mobile || '',
        status: student.status || 'Active',
      });
    } else {
      setEditId(null);
      setFormData({
        name: '', email: '', mobile: '', dob: '', gender: 'Male', status: 'Active',
        address: '', parent_name: '', parent_mobile: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await api.put(`/students/${editId}`, formData);
        toast.success('Student updated');
      } else {
        await api.post('/students', formData);
        toast.success('Student created');
      }
      handleClose();
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save student');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch {
      toast.error('Failed to delete student');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Mobile', 'Email', 'Gender', 'Status'];
    const rows = filteredStudents.map(s => [s.name, s.mobile, s.email || '', s.gender || '', s.status || '']);
    let csv = headers.join(',') + '\\n';
    rows.forEach(row => { csv += row.map(cell => `\"${cell}\"`).join(',') + '\\n'; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported');
  };

  const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {/* Actions */}
      <Box display="flex" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
        <TextField
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
        />
        <Box display="flex" gap={1} flexWrap="wrap">
          <TextField select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="small" sx={{ width: 120 }}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
          <TextField select label="Gender" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} size="small" sx={{ width: 120 }}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </TextField>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchStudents}>Refresh</Button>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExportCSV}>Export</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Student</Button>
        </Box>
      </Box>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center"><Alert severity="info">No students found</Alert></TableCell>
                </TableRow>
              ) : (
                paginatedStudents.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>{s.name?.charAt(0)}</Avatar>
                        <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{s.mobile}</Typography>
                      {s.email && <Typography variant="caption" color="textSecondary">{s.email}</Typography>}
                    </TableCell>
                    <TableCell>{s.gender || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip label={s.status || 'Active'} color={s.status === 'Active' ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View"><IconButton size="small" onClick={() => setViewStudent(s)}><Info fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Detail"><IconButton size="small" onClick={() => navigate(`/students/${s.id}`)}><Visibility fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(s)}><Edit fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(s.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredStudents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Edit Student' : 'Add Student'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <TextField fullWidth label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Mobile" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="DOB" type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Gender" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Parent Name" value={formData.parent_name} onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Parent Mobile" value={formData.parent_mobile} onChange={(e) => setFormData({ ...formData, parent_mobile: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} multiline rows={2} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editId ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewStudent} onClose={() => setViewStudent(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent dividers>
          {viewStudent && (
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="caption" color="textSecondary">Name</Typography><Typography variant="body1">{viewStudent.name}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="textSecondary">Mobile</Typography><Typography variant="body1">{viewStudent.mobile}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="textSecondary">Email</Typography><Typography variant="body1">{viewStudent.email || 'N/A'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="textSecondary">Gender</Typography><Typography variant="body1">{viewStudent.gender || 'N/A'}</Typography></Grid>
              <Grid item xs={12}><Typography variant="caption" color="textSecondary">Address</Typography><Typography variant="body1">{viewStudent.address || 'N/A'}</Typography></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewStudent(null)}>Close</Button>
          <Button variant="contained" onClick={() => { setViewStudent(null); handleOpen(viewStudent); }}>Edit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentsListTab;
