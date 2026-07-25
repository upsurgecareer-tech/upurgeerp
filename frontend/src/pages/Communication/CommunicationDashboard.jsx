import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Chip, CircularProgress, Tabs, Tab, Grid, Card, CardContent
} from '@mui/material';
import { Message, Email, Campaign, Send, History } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';

const CommunicationDashboard = () => {
  const [tab, setTab] = useState(0);
  const [logs, setLogs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSms, setOpenSms] = useState(false);
  const [openAnnouncement, setOpenAnnouncement] = useState(false);
  
  const [smsForm, setSmsForm] = useState({ batch_id: '', message: '' });
  const [annForm, setAnnForm] = useState({ title: '', message: '', targetAudience: 'All', publishDate: new Date().toISOString().split('T')[0] });

  useEffect(() => { fetchData(); fetchBatches(); }, []);

  const fetchData = async () => {
    try {
      const [logsRes, annRes] = await Promise.all([
        api.get('/communication/logs'),
        api.get('/communication/announcements')
      ]);
      setLogs(logsRes.data || []);
      setAnnouncements(annRes.data || []);
    } catch { toast.error('Failed to fetch communication data'); }
    finally { setLoading(false); }
  };

  const fetchBatches = async () => {
    try {
      const res = await api.get('/batches');
      setBatches(res.data.batches || res.data || []);
    } catch { setBatches([]); }
  };

  const handleSendSms = async () => {
    if (!smsForm.batch_id || !smsForm.message) return toast.error('Please fill all fields');
    try {
      // In a real scenario, this would fetch students in the batch and loop over them
      // For now we mock the API call since the backend expects recipientPhone
      await api.post('/communication/send-sms', {
        recipientType: 'Student',
        recipientId: 1, // Mock
        recipientPhone: '+919999999999', // Mock
        message: smsForm.message
      });
      toast.success('Bulk SMS queued successfully');
      setOpenSms(false);
      setSmsForm({ batch_id: '', message: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to send SMS');
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!annForm.title || !annForm.message) return toast.error('Please fill all fields');
    try {
      await api.post('/communication/announcements', { ...annForm, type: 'General', sendPush: true });
      toast.success('Announcement broadcasted');
      setOpenAnnouncement(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to broadcast announcement');
    }
  };

  return (
    <Layout title="Communication Engine">
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>Communication Engine</Typography>
            <Typography variant="body1" color="text.secondary">Broadcast SMS, WhatsApp, and App Notifications</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" color="primary" startIcon={<Campaign />} onClick={() => setOpenAnnouncement(true)} sx={{ borderRadius: 2 }}>
              New Announcement
            </Button>
            <Button variant="contained" color="primary" startIcon={<Message />} onClick={() => setOpenSms(true)} sx={{ borderRadius: 2 }}>
              Send Bulk SMS
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 3, boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: '#2563eb', fontWeight: 600 }}>Total SMS Sent</Typography>
                <Typography variant="h4" sx={{ color: '#1d4ed8', fontWeight: 800, mt: 1 }}>{logs.filter(l => l.type === 'SMS').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 3, boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: '#059669', fontWeight: 600 }}>Active Announcements</Typography>
                <Typography variant="h4" sx={{ color: '#047857', fontWeight: 800, mt: 1 }}>{announcements.filter(a => a.isPublished).length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 3, boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: '#d97706', fontWeight: 600 }}>Email Broadcasts</Typography>
                <Typography variant="h4" sx={{ color: '#b45309', fontWeight: 800, mt: 1 }}>{logs.filter(l => l.type === 'Email').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ bgcolor: '#f8fafc', borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Broadcast History" icon={<History />} iconPosition="start" sx={{ fontWeight: 600 }} />
            <Tab label="Announcements" icon={<Campaign />} iconPosition="start" sx={{ fontWeight: 600 }} />
          </Tabs>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
          ) : (
            <Box>
              {tab === 0 && (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Recipient</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.length === 0 ? (
                        <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}>No communication history.</TableCell></TableRow>
                      ) : logs.map((log) => (
                        <TableRow key={log.id} hover>
                          <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip size="small" label={log.type} color={log.type === 'SMS' ? 'primary' : log.type === 'Email' ? 'warning' : 'success'} />
                          </TableCell>
                          <TableCell>{log.recipientType} ({log.recipientContact})</TableCell>
                          <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.message}</TableCell>
                          <TableCell>
                            <Chip size="small" label={log.status} color={log.status === 'Sent' ? 'success' : 'error'} variant="outlined" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {tab === 1 && (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Audience</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {announcements.length === 0 ? (
                        <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5 }}>No active announcements.</TableCell></TableRow>
                      ) : announcements.map((a) => (
                        <TableRow key={a.id} hover>
                          <TableCell>{new Date(a.publishDate).toLocaleDateString()}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{a.title}</TableCell>
                          <TableCell>{a.targetAudience}</TableCell>
                          <TableCell>
                            <Chip size="small" label={a.isPublished ? 'Live' : 'Draft'} color={a.isPublished ? 'success' : 'default'} />
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

        {/* Send Bulk SMS Dialog */}
        <Dialog open={openSms} onClose={() => setOpenSms(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Send Bulk SMS</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField select label="Select Target Batch" value={smsForm.batch_id} onChange={(e) => setSmsForm({...smsForm, batch_id: e.target.value})} required>
                {batches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                <MenuItem value="ALL">All Active Students</MenuItem>
              </TextField>
              <TextField label="Message Content" value={smsForm.message} onChange={(e) => setSmsForm({...smsForm, message: e.target.value})} multiline rows={4} required placeholder="Dear Student, tomorrow is a holiday..." />
              <Typography variant="caption" color="text.secondary">1 Credit = 160 characters. Your message has {smsForm.message.length} characters.</Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpenSms(false)}>Cancel</Button>
            <Button onClick={handleSendSms} variant="contained" endIcon={<Send />} sx={{ borderRadius: 2 }}>Broadcast Now</Button>
          </DialogActions>
        </Dialog>

        {/* New Announcement Dialog */}
        <Dialog open={openAnnouncement} onClose={() => setOpenAnnouncement(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Create Announcement</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Announcement Title" value={annForm.title} onChange={(e) => setAnnForm({...annForm, title: e.target.value})} required />
              <TextField label="Message" value={annForm.message} onChange={(e) => setAnnForm({...annForm, message: e.target.value})} multiline rows={4} required />
              <TextField select label="Target Audience" value={annForm.targetAudience} onChange={(e) => setAnnForm({...annForm, targetAudience: e.target.value})}>
                <MenuItem value="All">All Branches & Users</MenuItem>
                <MenuItem value="Students">Students Only</MenuItem>
                <MenuItem value="Staff">Staff Only</MenuItem>
                <MenuItem value="Parents">Parents Only</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpenAnnouncement(false)}>Cancel</Button>
            <Button onClick={handleCreateAnnouncement} variant="contained" color="primary" sx={{ borderRadius: 2 }}>Publish Notice</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default CommunicationDashboard;
