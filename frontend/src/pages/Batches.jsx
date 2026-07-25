import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Chip, CircularProgress, Tabs, Tab,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, PersonAdd } from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const STATUS = ['Upcoming', 'Active', 'Completed', 'Cancelled'];
const emptyForm = { name: '', start_date: '', end_date: '', timing: '', max_students: 30, status: 'Upcoming' };

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [viewBatch, setViewBatch] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [tab, setTab] = useState(0);

  useEffect(() => { fetchBatches(); fetchAllStudents(); }, []);

  const fetchBatches = async () => {
    try {
      const res = await api.get('/batches');
      setBatches(res.data.batches || res.data || []);
    } catch { toast.error('Failed to fetch batches'); setBatches([]); }
    finally { setLoading(false); }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await api.get('/students');
      setAllStudents(res.data.students || res.data || []);
    } catch { setAllStudents([]); }
  };

  const fetchBatchStudents = async (batchId) => {
    try {
      const res = await api.get(`/batches/${batchId}/students`);
      setBatchStudents(res.data.students || res.data || []);
    } catch { setBatchStudents([]); }
  };

  const handleOpen = (batch = null) => {
    if (batch) {
      setEditId(batch.id);
      setFormData({
        name: batch.name || '',
        start_date: batch.start_date ? batch.start_date.split('T')[0] : '',
        end_date: batch.end_date ? batch.end_date.split('T')[0] : '',
        timing: batch.timing || '',
        max_students: batch.max_students || 30,
        status: batch.status || 'Upcoming',
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
    if (!formData.name) { toast.error('Batch name is required'); return; }
    try {
      if (editId) {
        await api.put(`/batches/${editId}`, formData);
        toast.success('Batch updated');
      } else {
        await api.post('/batches', formData);
        toast.success('Batch created');
      }
      handleClose();
      fetchBatches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save batch');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this batch?')) return;
    try {
      await api.delete(`/batches/${id}`);
      toast.success('Batch deleted');
      fetchBatches();
    } catch { toast.error('Failed to delete batch'); }
  };

  const handleView = (batch) => {
    setViewBatch(batch);
    fetchBatchStudents(batch.id);
    setTab(0);
  };

  const handleEnroll = async () => {
    if (!selectedStudent) { toast.error('Select a student'); return; }
    try {
      await api.post(`/batches/${viewBatch.id}/students`, { student_id: selectedStudent });
      toast.success('Student enrolled');
      setEnrollOpen(false);
      setSelectedStudent('');
      fetchBatchStudents(viewBatch.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll student');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Remove student from batch?')) return;
    try {
      await api.delete(`/batches/${viewBatch.id}/students/${studentId}`);
      toast.success('Student removed');
      fetchBatchStudents(viewBatch.id);
    } catch { toast.error('Failed to remove student'); }
  };

  const getStatusColor = (status) => ({ Upcoming: 'info', Active: 'success', Completed: 'default', Cancelled: 'error' }[status] || 'default');

  return (
    <Layout title="Batches Management">
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Batches Management</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Batch</Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Batch Name</TableCell>
                  <TableCell>Timing</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Max Students</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batches.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center">No batches found.</TableCell></TableRow>
                ) : batches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.name}</TableCell>
                    <TableCell>{b.timing}</TableCell>
                    <TableCell>{b.start_date ? new Date(b.start_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{b.end_date ? new Date(b.end_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{b.max_students}</TableCell>
                    <TableCell><Chip label={b.status} color={getStatusColor(b.status)} size="small" /></TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => handleView(b)}><Visibility /></IconButton>
                      <IconButton size="small" color="info" onClick={() => handleOpen(b)}><Edit /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(b.id)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editId ? 'Edit Batch' : 'Add New Batch'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Batch Name" name="name" value={formData.name} onChange={handleChange} required />
              <TextField label="Timing (e.g. 9:00 AM - 11:00 AM)" name="timing" value={formData.timing} onChange={handleChange} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField label="Start Date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                <TextField label="End Date" name="end_date" type="date" value={formData.end_date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                <TextField label="Max Students" name="max_students" type="number" value={formData.max_students} onChange={handleChange} />
                <TextField select label="Status" name="status" value={formData.status} onChange={handleChange}>
                  {STATUS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">{editId ? 'Update' : 'Create'} Batch</Button>
          </DialogActions>
        </Dialog>

        {/* View Batch Dialog */}
        <Dialog open={!!viewBatch} onClose={() => setViewBatch(null)} maxWidth="md" fullWidth>
          <DialogTitle>Batch: {viewBatch?.name}</DialogTitle>
          <DialogContent>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
              <Tab label="Details" />
              <Tab label={`Students (${batchStudents.length})`} />
            </Tabs>
            {tab === 0 && viewBatch && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography><b>Timing:</b> {viewBatch.timing}</Typography>
                <Typography><b>Start Date:</b> {viewBatch.start_date ? new Date(viewBatch.start_date).toLocaleDateString() : '-'}</Typography>
                <Typography><b>End Date:</b> {viewBatch.end_date ? new Date(viewBatch.end_date).toLocaleDateString() : '-'}</Typography>
                <Typography><b>Max Students:</b> {viewBatch.max_students}</Typography>
                <Typography><b>Status:</b> {viewBatch.status}</Typography>
              </Box>
            )}
            {tab === 1 && (
              <Box>
                <Button startIcon={<PersonAdd />} variant="outlined" size="small" sx={{ mb: 2 }} onClick={() => setEnrollOpen(true)}>
                  Enroll Student
                </Button>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student ID</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {batchStudents.length === 0 ? (
                      <TableRow><TableCell colSpan={3} align="center">No students enrolled</TableCell></TableRow>
                    ) : batchStudents.map((bs) => (
                      <TableRow key={bs.id}>
                        <TableCell>{bs.student_id}</TableCell>
                        <TableCell><Chip label={bs.status} size="small" color="success" /></TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => handleRemoveStudent(bs.student_id)}><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewBatch(null)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Enroll Student Dialog */}
        <Dialog open={enrollOpen} onClose={() => setEnrollOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Enroll Student</DialogTitle>
          <DialogContent>
            <TextField select fullWidth label="Select Student" value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)} sx={{ mt: 1 }}>
              {allStudents.map(s => <MenuItem key={s.id} value={s.id}>{s.name} - {s.mobile}</MenuItem>)}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEnrollOpen(false)}>Cancel</Button>
            <Button onClick={handleEnroll} variant="contained">Enroll</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Batches;
