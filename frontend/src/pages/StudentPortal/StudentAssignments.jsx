import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent, Button,
  CircularProgress, Chip, Grid, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert
} from '@mui/material';
import { ArrowBack, Refresh, Upload, CheckCircle, Cancel } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function StudentAssignments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('student_token');
      const res = await api.get('/student-portal/assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(res.data.assignments);
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('student_token');
      const formData = new FormData();
      formData.append('assignment_id', selectedAssignment.id);
      formData.append('submission_text', submissionText);
      if (file) formData.append('file', file);

      await api.post('/student-portal/assignments/submit', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Assignment submitted successfully');
      setSubmitDialog(false);
      setSubmissionText('');
      setFile(null);
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 3 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/student-portal/dashboard')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" fontWeight="bold">My Assignments</Typography>
          </Box>
          <IconButton onClick={fetchAssignments}>
            <Refresh />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <Grid item xs={12} md={6} key={assignment.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">{assignment.title}</Typography>
                        {assignment.submitted ? (
                          <Chip icon={<CheckCircle />} label="Submitted" color="success" size="small" />
                        ) : (
                          <Chip icon={<Cancel />} label="Pending" color="error" size="small" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {assignment.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Due Date: {new Date(assignment.due_date).toLocaleDateString('en-IN')}
                      </Typography>
                      {assignment.submitted ? (
                        <Box sx={{ mt: 2 }}>
                          <Alert severity="success">
                            Submitted on {new Date(assignment.submission_date).toLocaleDateString('en-IN')}
                            {assignment.marks && ` • Marks: ${assignment.marks}`}
                          </Alert>
                          {assignment.feedback && (
                            <Alert severity="info" sx={{ mt: 1 }}>
                              Feedback: {assignment.feedback}
                            </Alert>
                          )}
                        </Box>
                      ) : (
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<Upload />}
                          sx={{ mt: 2 }}
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setSubmitDialog(true);
                          }}
                        >
                          Submit Assignment
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="info">No assignments available</Alert>
              </Grid>
            )}
          </Grid>
        )}

        {/* Submit Dialog */}
        <Dialog open={submitDialog} onClose={() => setSubmitDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Submit Assignment</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Submission Text"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              margin="normal"
              helperText="Upload your assignment file (optional)"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSubmitDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>Submit</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
