import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const CoursesSubmodule = () => {
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', duration: '', fee: '' });

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/course-packages');
      setCourses(res.data.packages || []);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post('/course-packages', formData);
      toast.success('Course created');
      setOpen(false);
      fetchCourses();
    } catch (error) {
      toast.error('Failed to create course');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Courses Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
          Add Course
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course Name</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Fee</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.duration || 'N/A'}</TableCell>
                <TableCell>₹{course.fee || 0}</TableCell>
                <TableCell><Chip label="Active" color="success" size="small" /></TableCell>
                <TableCell>
                  <IconButton size="small"><Visibility fontSize="small" /></IconButton>
                  <IconButton size="small"><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Course</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Course Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} margin="normal" />
          <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} margin="normal" multiline rows={3} />
          <TextField fullWidth label="Duration (months)" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} margin="normal" />
          <TextField fullWidth label="Fee" value={formData.fee} onChange={(e) => setFormData({ ...formData, fee: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoursesSubmodule;
