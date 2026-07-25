import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Tabs, Tab, Paper, Grid, Card, CardContent,
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Chip, CircularProgress, Alert, Tooltip, Avatar
} from '@mui/material';
import {
  School, Assignment, Quiz, MenuBook, VideoLibrary, CalendarToday,
  Add, Edit, Delete, Visibility, CheckCircle, Schedule, TrendingUp
} from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const Academics = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Courses State
  const [courses, setCourses] = useState([]);
  const [courseDialog, setCourseDialog] = useState(false);
  const [courseForm, setCourseForm] = useState({
    name: '', total_fee: '', duration_months: '', description: ''
  });
  const [editCourseId, setEditCourseId] = useState(null);

  // Assignments State
  const [assignments, setAssignments] = useState([]);
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    batch_id: '', title: '', description: '', due_date: '', total_marks: 100
  });

  // Exams State
  const [exams, setExams] = useState([]);
  const [examDialog, setExamDialog] = useState(false);
  const [examForm, setExamForm] = useState({
    batch_id: '', name: '', exam_date: '', start_time: '', end_time: '',
    duration_minutes: 60, total_marks: 100, passing_marks: 40, exam_type: 'Theory'
  });

  // Batches for dropdowns
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    fetchBatches();
    if (activeTab === 0) fetchCourses();
    if (activeTab === 1) fetchAssignments();
    if (activeTab === 2) fetchExams();
  }, [activeTab]);

  const fetchBatches = async () => {
    try {
      const res = await api.get('/batches');
      setBatches(res.data.batches || []);
    } catch (error) {
      console.error('Failed to fetch batches');
    }
  };

  // ========== COURSES ==========
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/course-packages');
      setCourses(res.data.packages || []);
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSubmit = async () => {
    try {
      if (editCourseId) {
        await api.put(`/course-packages/${editCourseId}`, courseForm);
        toast.success('Course updated successfully');
      } else {
        await api.post('/course-packages', courseForm);
        toast.success('Course created successfully');
      }
      setCourseDialog(false);
      setCourseForm({ name: '', total_fee: '', duration_months: '', description: '' });
      setEditCourseId(null);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save course');
    }
  };

  const handleEditCourse = (course) => {
    setCourseForm({
      name: course.name,
      total_fee: course.total_fee,
      duration_months: course.duration_months,
      description: course.description || ''
    });
    setEditCourseId(course.id);
    setCourseDialog(true);
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await api.delete(`/course-packages/${id}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  // ========== ASSIGNMENTS ==========
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data.assignments || []);
    } catch (error) {
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async () => {
    try {
      await api.post('/assignments', assignmentForm);
      toast.success('Assignment created successfully');
      setAssignmentDialog(false);
      setAssignmentForm({ batch_id: '', title: '', description: '', due_date: '', total_marks: 100 });
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    }
  };

  // ========== EXAMS ==========
  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exams');
      setExams(res.data.exams || []);
    } catch (error) {
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const handleExamSubmit = async () => {
    try {
      await api.post('/exams', examForm);
      toast.success('Exam created successfully');
      setExamDialog(false);
      setExamForm({
        batch_id: '', name: '', exam_date: '', start_time: '', end_time: '',
        duration_minutes: 60, total_marks: 100, passing_marks: 40, exam_type: 'Theory'
      });
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create exam');
    }
  };

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
    <Layout title="Academics Management">
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">Academics Management</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage courses, assignments, exams, and academic content
            </Typography>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<School />} label="Total Courses" value={courses.length} color="primary" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<Assignment />} label="Assignments" value={assignments.length} color="info" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<Quiz />} label="Exams" value={exams.length} color="warning" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<MenuBook />} label="Active Batches" value={batches.length} color="success" />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab icon={<School />} label="Courses" />
            <Tab icon={<Assignment />} label="Assignments" />
            <Tab icon={<Quiz />} label="Exams" />
            <Tab icon={<MenuBook />} label="Syllabus" />
            <Tab icon={<VideoLibrary />} label="Study Materials" />
            <Tab icon={<TrendingUp />} label="Progress Tracking" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* COURSES TAB */}
            {activeTab === 0 && (
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Course Packages</Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setCourseDialog(true)}
                  >
                    Add Course
                  </Button>
                </Box>
                <TableContainer>
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
                      {courses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Alert severity="info">No courses found</Alert>
                          </TableCell>
                        </TableRow>
                      ) : (
                        courses.map((course) => (
                          <TableRow key={course.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>{course.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {course.description?.substring(0, 50)}...
                              </Typography>
                            </TableCell>
                            <TableCell>{course.duration_months} months</TableCell>
                            <TableCell>₹{course.total_fee}</TableCell>
                            <TableCell>
                              <Chip
                                label={course.is_active ? 'Active' : 'Inactive'}
                                color={course.is_active ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Edit">
                                <IconButton size="small" color="info" onClick={() => handleEditCourse(course)}>
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => handleDeleteCourse(course.id)}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {/* ASSIGNMENTS TAB */}
            {activeTab === 1 && (
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Assignments</Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setAssignmentDialog(true)}
                  >
                    Create Assignment
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Batch</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Marks</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assignments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Alert severity="info">No assignments found</Alert>
                          </TableCell>
                        </TableRow>
                      ) : (
                        assignments.map((assignment) => (
                          <TableRow key={assignment.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>{assignment.title}</Typography>
                            </TableCell>
                            <TableCell>Batch {assignment.batch_id}</TableCell>
                            <TableCell>
                              {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>{assignment.total_marks}</TableCell>
                            <TableCell>
                              <Chip
                                label={assignment.status || 'Active'}
                                color="success"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title="View Submissions">
                                <IconButton size="small" color="primary">
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {/* EXAMS TAB */}
            {activeTab === 2 && (
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Examinations</Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setExamDialog(true)}
                  >
                    Schedule Exam
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Exam Name</TableCell>
                        <TableCell>Batch</TableCell>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Marks</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {exams.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Alert severity="info">No exams scheduled</Alert>
                          </TableCell>
                        </TableRow>
                      ) : (
                        exams.map((exam) => (
                          <TableRow key={exam.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>{exam.name}</Typography>
                            </TableCell>
                            <TableCell>Batch {exam.batch_id}</TableCell>
                            <TableCell>
                              {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'N/A'}
                              <br />
                              <Typography variant="caption">
                                {exam.start_time} - {exam.end_time}
                              </Typography>
                            </TableCell>
                            <TableCell>{exam.duration_minutes} min</TableCell>
                            <TableCell>{exam.total_marks}</TableCell>
                            <TableCell>
                              <Chip label={exam.exam_type} size="small" />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={exam.status || 'Scheduled'}
                                color={exam.status === 'Completed' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {/* SYLLABUS TAB */}
            {activeTab === 3 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Syllabus Management</Typography>
                <Alert severity="info">
                  Syllabus management feature coming soon. You can upload course syllabus and track completion.
                </Alert>
              </Paper>
            )}

            {/* STUDY MATERIALS TAB */}
            {activeTab === 4 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Study Materials</Typography>
                <Alert severity="info">
                  Study materials are managed through LMS module. Go to LMS → Videos/Materials section.
                </Alert>
              </Paper>
            )}

            {/* PROGRESS TRACKING TAB */}
            {activeTab === 5 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Student Progress Tracking</Typography>
                <Alert severity="info">
                  Progress tracking shows student performance across assignments, exams, and attendance.
                </Alert>
              </Paper>
            )}
          </>
        )}

        {/* Course Dialog */}
        <Dialog open={courseDialog} onClose={() => setCourseDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editCourseId ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
              <TextField
                label="Course Name"
                value={courseForm.name}
                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                required
                fullWidth
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Total Fee"
                    type="number"
                    value={courseForm.total_fee}
                    onChange={(e) => setCourseForm({ ...courseForm, total_fee: e.target.value })}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Duration (Months)"
                    type="number"
                    value={courseForm.duration_months}
                    onChange={(e) => setCourseForm({ ...courseForm, duration_months: e.target.value })}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <TextField
                label="Description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCourseDialog(false)}>Cancel</Button>
            <Button onClick={handleCourseSubmit} variant="contained">
              {editCourseId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assignment Dialog */}
        <Dialog open={assignmentDialog} onClose={() => setAssignmentDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create Assignment</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
              <TextField
                select
                label="Batch"
                value={assignmentForm.batch_id}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, batch_id: e.target.value })}
                required
                fullWidth
              >
                {batches.map((batch) => (
                  <MenuItem key={batch.id} value={batch.id}>{batch.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Assignment Title"
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Due Date"
                    type="date"
                    value={assignmentForm.due_date}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Total Marks"
                    type="number"
                    value={assignmentForm.total_marks}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, total_marks: e.target.value })}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignmentDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignmentSubmit} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        {/* Exam Dialog */}
        <Dialog open={examDialog} onClose={() => setExamDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Schedule Exam</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
              <TextField
                select
                label="Batch"
                value={examForm.batch_id}
                onChange={(e) => setExamForm({ ...examForm, batch_id: e.target.value })}
                required
                fullWidth
              >
                {batches.map((batch) => (
                  <MenuItem key={batch.id} value={batch.id}>{batch.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Exam Name"
                value={examForm.name}
                onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                required
                fullWidth
              />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    label="Exam Date"
                    type="date"
                    value={examForm.exam_date}
                    onChange={(e) => setExamForm({ ...examForm, exam_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Start Time"
                    type="time"
                    value={examForm.start_time}
                    onChange={(e) => setExamForm({ ...examForm, start_time: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="End Time"
                    type="time"
                    value={examForm.end_time}
                    onChange={(e) => setExamForm({ ...examForm, end_time: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    label="Duration (min)"
                    type="number"
                    value={examForm.duration_minutes}
                    onChange={(e) => setExamForm({ ...examForm, duration_minutes: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Total Marks"
                    type="number"
                    value={examForm.total_marks}
                    onChange={(e) => setExamForm({ ...examForm, total_marks: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Passing Marks"
                    type="number"
                    value={examForm.passing_marks}
                    onChange={(e) => setExamForm({ ...examForm, passing_marks: e.target.value })}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <TextField
                select
                label="Exam Type"
                value={examForm.exam_type}
                onChange={(e) => setExamForm({ ...examForm, exam_type: e.target.value })}
                fullWidth
              >
                <MenuItem value="Theory">Theory</MenuItem>
                <MenuItem value="Practical">Practical</MenuItem>
                <MenuItem value="Online">Online</MenuItem>
                <MenuItem value="Assignment">Assignment</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExamDialog(false)}>Cancel</Button>
            <Button onClick={handleExamSubmit} variant="contained">Schedule</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Academics;
