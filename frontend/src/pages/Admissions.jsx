import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Chip, CircularProgress, Grid, Card, CardContent,
  Alert, Autocomplete, InputAdornment, TablePagination, Tooltip
} from '@mui/material';
import {
  Add, Visibility, School, Person, AttachMoney, TrendingUp,
  Search, Refresh, FileDownload, Edit, Delete
} from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const Admissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [filteredAdmissions, setFilteredAdmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewAdmission, setViewAdmission] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    student_id: null,
    course_package_id: null,
    batch_id: null,
    admission_date: new Date().toISOString().split('T')[0],
    total_fee: 0,
    discount_amount: 0
  });

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { applyFilters(); }, [admissions, search, statusFilter, courseFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [admRes, stuRes, courseRes, batchRes] = await Promise.all([
        api.get('/admissions'),
        api.get('/students'),
        api.get('/course-packages'),
        api.get('/batches')
      ]);
      setAdmissions(admRes.data.admissions || []);
      setStudents(stuRes.data.students || []);
      setCourses(courseRes.data.packages || courseRes.data || []);
      setBatches(batchRes.data.batches || []);
    } catch (error) {
      toast.error('Failed to fetch data');
      setAdmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...admissions];
    
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(a => {
        const student = students.find(s => s.id === a.student_id);
        const course = courses.find(c => c.id === a.course_package_id);
        return (
          student?.name?.toLowerCase().includes(query) ||
          student?.mobile?.includes(query) ||
          course?.name?.toLowerCase().includes(query) ||
          a.id?.toString().includes(query)
        );
      });
    }
    
    if (statusFilter !== 'All') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
    
    if (courseFilter !== 'All') {
      filtered = filtered.filter(a => a.course_package_id === parseInt(courseFilter));
    }
    
    setFilteredAdmissions(filtered);
    setPage(0);
  };

  const handleOpen = (admission = null) => {
    if (admission) {
      setEditId(admission.id);
      setFormData({
        student_id: admission.student_id,
        course_package_id: admission.course_package_id,
        batch_id: admission.batch_id,
        admission_date: admission.admission_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        total_fee: admission.total_fee || 0,
        discount_amount: admission.discount_amount || 0
      });
    } else {
      setEditId(null);
      setFormData({
        student_id: null,
        course_package_id: null,
        batch_id: null,
        admission_date: new Date().toISOString().split('T')[0],
        total_fee: 0,
        discount_amount: 0
      });
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.student_id || !formData.course_package_id) {
      toast.error('Student and Course are required');
      return;
    }
    try {
      if (editId) {
        await api.put(`/admissions/${editId}`, formData);
        toast.success('Admission updated successfully');
      } else {
        await api.post('/admissions', formData);
        toast.success('Admission created successfully');
      }
      setOpen(false);
      setEditId(null);
      fetchData();
      setFormData({
        student_id: null,
        course_package_id: null,
        batch_id: null,
        admission_date: new Date().toISOString().split('T')[0],
        total_fee: 0,
        discount_amount: 0
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save admission');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admission?')) return;
    try {
      await api.delete(`/admissions/${id}`);
      toast.success('Admission deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete admission');
    }
  };

  const handleCourseChange = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    setFormData({ ...formData, course_package_id: courseId, total_fee: course?.total_fee || 0 });
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Student', 'Course', 'Batch', 'Admission Date', 'Total Fee', 'Discount', 'Net Payable', 'Status'];
    const rows = filteredAdmissions.map(a => [
      a.id,
      students.find(s => s.id === a.student_id)?.name || 'N/A',
      courses.find(c => c.id === a.course_package_id)?.name || 'N/A',
      batches.find(b => b.id === a.batch_id)?.name || 'N/A',
      new Date(a.admission_date).toLocaleDateString('en-IN'),
      a.total_fee || 0,
      a.discount_amount || 0,
      a.net_payable || 0,
      a.status || 'Active'
    ]);
    let csv = headers.join(',') + '\n';
    rows.forEach(row => { csv += row.map(cell => `"${cell}"`).join(',') + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admissions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported successfully');
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setCourseFilter('All');
  };

  const paginatedAdmissions = filteredAdmissions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const avgFee = admissions.length > 0 ? admissions.reduce((sum, a) => sum + (a.net_payable || 0), 0) / admissions.length : 0;

  const StatCard = ({ icon, label, value, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ bgcolor: `${color}.main`, color: 'white', p: 1.5, borderRadius: 2 }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="h5" fontWeight="bold">{value}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Layout title="Admissions">
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">Admissions Management</Typography>
            <Typography variant="body2" color="text.secondary">
              Total: {filteredAdmissions.length} admissions {search || statusFilter !== 'All' || courseFilter !== 'All' ? `(filtered from ${admissions.length})` : ''}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData}>
              Refresh
            </Button>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
              New Admission
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <StatCard icon={<School />} label="Total Admissions" value={admissions.length} color="primary" />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard icon={<Person />} label="Active" value={admissions.filter(a => a.status === 'Active').length} color="success" />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard icon={<AttachMoney />} label="Total Revenue" value={`₹${admissions.reduce((sum, a) => sum + (a.net_payable || 0), 0).toLocaleString()}`} color="warning" />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard icon={<TrendingUp />} label="Avg Fee" value={`₹${Math.round(avgFee).toLocaleString()}`} color="info" />
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  placeholder="Search by student, course, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="small"
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  select
                  label="Course"
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="All">All Courses</MenuItem>
                  {courses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={clearFilters}
                  disabled={!search && statusFilter === 'All' && courseFilter === 'All'}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Admission ID</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Batch</TableCell>
                  <TableCell>Admission Date</TableCell>
                  <TableCell>Total Fee</TableCell>
                  <TableCell>Net Payable</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAdmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Alert severity="info">No admissions found</Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAdmissions.map((adm) => (
                    <TableRow key={adm.id} hover>
                      <TableCell>#{adm.id}</TableCell>
                      <TableCell>{students.find(s => s.id === adm.student_id)?.name || 'N/A'}</TableCell>
                      <TableCell>{courses.find(c => c.id === adm.course_package_id)?.name || 'N/A'}</TableCell>
                      <TableCell>{batches.find(b => b.id === adm.batch_id)?.name || 'N/A'}</TableCell>
                      <TableCell>{new Date(adm.admission_date).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>₹{(adm.total_fee || 0).toLocaleString()}</TableCell>
                      <TableCell>₹{(adm.net_payable || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={adm.status || 'Active'} color={adm.status === 'Active' ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View">
                          <IconButton size="small" color="primary" onClick={() => setViewAdmission(adm)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="info" onClick={() => handleOpen(adm)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDelete(adm.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {!loading && filteredAdmissions.length > 0 && (
              <TablePagination
                component="div"
                count={filteredAdmissions.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            )}
          </TableContainer>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editId ? 'Edit Admission' : 'New Admission'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
              <Autocomplete
                options={students}
                getOptionLabel={(s) => `${s.name} (${s.mobile})`}
                value={students.find(s => s.id === formData.student_id) || null}
                onChange={(e, val) => setFormData({ ...formData, student_id: val?.id })}
                renderInput={(params) => <TextField {...params} label="Select Student" required />}
              />
              <Autocomplete
                options={courses}
                getOptionLabel={(c) => `${c.name} - ₹${c.total_fee}`}
                value={courses.find(c => c.id === formData.course_package_id) || null}
                onChange={(e, val) => handleCourseChange(val?.id)}
                renderInput={(params) => <TextField {...params} label="Select Course" required />}
              />
              <Autocomplete
                options={batches}
                getOptionLabel={(b) => b.name}
                value={batches.find(b => b.id === formData.batch_id) || null}
                onChange={(e, val) => setFormData({ ...formData, batch_id: val?.id })}
                renderInput={(params) => <TextField {...params} label="Select Batch (Optional)" />}
              />
              <TextField
                label="Admission Date"
                type="date"
                value={formData.admission_date}
                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Total Fee"
                type="number"
                value={formData.total_fee}
                onChange={(e) => setFormData({ ...formData, total_fee: parseFloat(e.target.value) })}
              />
              <TextField
                label="Discount Amount"
                type="number"
                value={formData.discount_amount}
                onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) })}
              />
              <TextField
                label="Net Payable"
                value={`₹${(formData.total_fee - formData.discount_amount).toLocaleString()}`}
                disabled
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">{editId ? 'Update' : 'Create'} Admission</Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={!!viewAdmission} onClose={() => setViewAdmission(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Admission Details</DialogTitle>
          <DialogContent dividers>
            {viewAdmission && (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Admission ID</Typography>
                  <Typography variant="body1" fontWeight={500}>#{viewAdmission.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Student</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {students.find(s => s.id === viewAdmission.student_id)?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Course</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {courses.find(c => c.id === viewAdmission.course_package_id)?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Batch</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {batches.find(b => b.id === viewAdmission.batch_id)?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Admission Date</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {new Date(viewAdmission.admission_date).toLocaleDateString('en-IN')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip label={viewAdmission.status} color="success" size="small" sx={{ mt: 0.5 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Total Fee</Typography>
                  <Typography variant="body1" fontWeight={500}>₹{(viewAdmission.total_fee || 0).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Discount</Typography>
                  <Typography variant="body1" fontWeight={500}>₹{(viewAdmission.discount_amount || 0).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Net Payable</Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    ₹{(viewAdmission.net_payable || 0).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewAdmission(null)}>Close</Button>
            <Button variant="contained" startIcon={<Edit />} onClick={() => { setViewAdmission(null); handleOpen(viewAdmission); }}>
              Edit
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Admissions;
