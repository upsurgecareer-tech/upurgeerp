import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Chip, CircularProgress, Tabs, Tab, Grid, Card, CardContent,
  Avatar
} from '@mui/material';
import { Add, Warning, CheckCircle, Cancel, Schedule, CheckCircleOutline, Group, AssignmentInd } from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const Attendance = () => {
  const [tab, setTab] = useState(0);
  const [batches, setBatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [sessionOpen, setSessionOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [batchStudents, setBatchStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [sessionForm, setSessionForm] = useState({
    batch_id: '', subject: '', date: new Date().toISOString().split('T')[0],
    start_time: '', end_time: '',
  });
  const [createdSession, setCreatedSession] = useState(null);

  useEffect(() => { fetchBatches(); fetchAtRisk(); }, []);

  const fetchBatches = async () => {
    try {
      const res = await api.get('/batches');
      setBatches(res.data.batches || res.data || []);
    } catch { setBatches([]); }
    finally { setLoading(false); }
  };

  const fetchSessions = async (batchId) => {
    try {
      const res = await api.get(`/attendance/batch/${batchId}`);
      setSessions(res.data.sessions || res.data || []);
    } catch { setSessions([]); }
  };

  const fetchAtRisk = async () => {
    try {
      const res = await api.get('/attendance/at-risk');
      setAtRisk(res.data.atRiskStudents || res.data || []);
    } catch { setAtRisk([]); }
  };

  const fetchBatchStudentsForManual = async (batchId) => {
    try {
      const res = await api.get(`/batches/${batchId}/students`);
      const students = res.data.students || res.data || [];
      setBatchStudents(students);
      const init = {};
      students.forEach(s => { init[s.student_id] = 'Present'; });
      setAttendance(init);
    } catch { setBatchStudents([]); }
  };

  const handleBatchChange = (batchId) => {
    setSelectedBatch(batchId);
    fetchSessions(batchId);
  };

  const handleCreateSession = async () => {
    if (!sessionForm.batch_id || !sessionForm.subject || !sessionForm.date) {
      toast.error('Batch, Subject and Date are required');
      return;
    }
    try {
      const res = await api.post('/attendance/sessions', sessionForm);
      const session = res.data.session;
      toast.success('Session created');
      setCreatedSession(session);
      setSessionOpen(false);
      setSessionForm({ batch_id: '', subject: '', date: new Date().toISOString().split('T')[0], start_time: '', end_time: '' });
      if (selectedBatch) fetchSessions(selectedBatch);
      
      await fetchBatchStudentsForManual(session.batch_id);
      setManualOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create session');
    }
  };

  const handleMarkManual = async () => {
    if (!createdSession) { toast.error('No session selected'); return; }
    try {
      const records = Object.entries(attendance).map(([student_id, status]) => ({ student_id: parseInt(student_id), status }));
      await api.post('/attendance/manual', { session_id: createdSession.id, attendance: records });
      toast.success(`Attendance marked for ${records.length} students`);
      
      // Auto-trigger SMS for Absentees
      const absentees = records.filter(r => r.status === 'Absent').length;
      if (absentees > 0) {
        toast.info(`Triggering absence SMS alerts to ${absentees} parents...`);
      }

      setManualOpen(false);
      setCreatedSession(null);
      if (selectedBatch) fetchSessions(selectedBatch);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const toggleStudentStatus = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  return (
    <Layout title="Batch Attendance">
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>Batch Attendance</Typography>
            <Typography variant="body1" color="text.secondary">Fast toggle attendance & auto-SMS alerts</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => setSessionOpen(true)} sx={{ borderRadius: 2 }}>
              New Session
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 3, boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: '#2563eb', fontWeight: 600 }}>Active Batches</Typography>
                <Typography variant="h4" sx={{ color: '#1d4ed8', fontWeight: 800, mt: 1 }}>{batches.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 3, boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: '#059669', fontWeight: 600 }}>Total Sessions Hosted</Typography>
                <Typography variant="h4" sx={{ color: '#047857', fontWeight: 800, mt: 1 }}>{sessions.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 3, boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: '#dc2626', fontWeight: 600 }}>At-Risk Students</Typography>
                <Typography variant="h4" sx={{ color: '#b91c1c', fontWeight: 800, mt: 1 }}>{atRisk.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ bgcolor: '#f8fafc', borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Live Sessions" icon={<AssignmentInd />} iconPosition="start" sx={{ fontWeight: 600 }} />
            <Tab label="Defaulters (At-Risk)" icon={<Warning />} iconPosition="start" sx={{ fontWeight: 600 }} />
          </Tabs>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
          ) : (
            <Box sx={{ p: 0 }}>
              {tab === 0 && (
                <Box sx={{ p: 3 }}>
                  <TextField select label="Select Batch to View Sessions" value={selectedBatch}
                    onChange={(e) => handleBatchChange(e.target.value)} sx={{ mb: 3, minWidth: 300 }}>
                    {batches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                  </TextField>

                  <TableContainer>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Timing</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sessions.length === 0 ? (
                          <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                            {selectedBatch ? 'No sessions found for this batch.' : 'Please select a batch.'}
                          </TableCell></TableRow>
                        ) : sessions.map((s) => (
                          <TableRow key={s.id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{new Date(s.date).toLocaleDateString()}</TableCell>
                            <TableCell>{s.subject}</TableCell>
                            <TableCell><Chip label={`${s.start_time} - ${s.end_time}`} size="small" icon={<Schedule />} /></TableCell>
                            <TableCell align="right">
                              <Button size="small" variant="outlined" onClick={async () => {
                                setCreatedSession(s);
                                await fetchBatchStudentsForManual(s.batch_id);
                                setManualOpen(true);
                              }}>
                                Edit Attendance
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {tab === 1 && (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Admission No</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Total Classes</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Present</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Attendance %</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {atRisk.length === 0 ? (
                        <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}>All students have good attendance! 🎉</TableCell></TableRow>
                      ) : atRisk.map((s) => (
                        <TableRow key={s.id} hover>
                          <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32 }}>{s.name[0]}</Avatar>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{s.name}</Typography>
                          </TableCell>
                          <TableCell>{s.admission_no}</TableCell>
                          <TableCell>{s.total_classes}</TableCell>
                          <TableCell>{s.present_count}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${s.attendance_percentage}%`}
                              color={s.attendance_percentage < 50 ? 'error' : 'warning'}
                              size="small"
                              sx={{ fontWeight: 800 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Paper>

        {/* Create Session Dialog */}
        <Dialog open={sessionOpen} onClose={() => setSessionOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Start New Session</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField select label="Batch" name="batch_id" value={sessionForm.batch_id} onChange={(e) => setSessionForm({ ...sessionForm, batch_id: e.target.value })} required>
                {batches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
              </TextField>
              <TextField label="Subject (e.g. Physics CH-1)" value={sessionForm.subject} onChange={(e) => setSessionForm({ ...sessionForm, subject: e.target.value })} required />
              <TextField label="Date" type="date" value={sessionForm.date} onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })} InputLabelProps={{ shrink: true }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField label="Start Time" type="time" value={sessionForm.start_time} onChange={(e) => setSessionForm({ ...sessionForm, start_time: e.target.value })} InputLabelProps={{ shrink: true }} />
                <TextField label="End Time" type="time" value={sessionForm.end_time} onChange={(e) => setSessionForm({ ...sessionForm, end_time: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setSessionOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSession} variant="contained" sx={{ borderRadius: 2 }}>Create & Take Attendance</Button>
          </DialogActions>
        </Dialog>

        {/* Premium Fast-Toggle Attendance Dialog (Mobile Friendly) */}
        <Dialog open={manualOpen} onClose={() => setManualOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, minHeight: '60vh' } }}>
          <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Live Attendance</Typography>
            <Typography variant="caption" color="text.secondary">Absentees will automatically trigger an SMS to parents.</Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {batchStudents.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><Typography>No students enrolled in this batch.</Typography></Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {batchStudents.map((bs, index) => (
                  <Box key={bs.student_id} sx={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    p: 2, borderBottom: '1px solid #f1f5f9',
                    bgcolor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>{bs.student?.name?.[0] || 'S'}</Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{bs.student?.name || `Student ID: ${bs.student_id}`}</Typography>
                        <Typography variant="caption" color="text.secondary">Adm: {bs.student?.admission_no || 'N/A'}</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant={attendance[bs.student_id] === 'Present' ? 'contained' : 'outlined'} 
                        color="success" 
                        size="small"
                        onClick={() => toggleStudentStatus(bs.student_id, 'Present')}
                        sx={{ borderRadius: 20, minWidth: '80px', textTransform: 'none', fontWeight: 700 }}
                      >
                        Present
                      </Button>
                      <Button 
                        variant={attendance[bs.student_id] === 'Absent' ? 'contained' : 'outlined'} 
                        color="error" 
                        size="small"
                        onClick={() => toggleStudentStatus(bs.student_id, 'Absent')}
                        sx={{ borderRadius: 20, minWidth: '80px', textTransform: 'none', fontWeight: 700 }}
                      >
                        Absent
                      </Button>
                      <Button 
                        variant={attendance[bs.student_id] === 'Late' ? 'contained' : 'outlined'} 
                        color="warning" 
                        size="small"
                        onClick={() => toggleStudentStatus(bs.student_id, 'Late')}
                        sx={{ borderRadius: 20, minWidth: '80px', textTransform: 'none', fontWeight: 700 }}
                      >
                        Late
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={() => setManualOpen(false)}>Cancel</Button>
            <Button onClick={handleMarkManual} variant="contained" color="primary" disabled={batchStudents.length === 0} sx={{ borderRadius: 2, px: 4 }}>
              Submit Attendance
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Attendance;
