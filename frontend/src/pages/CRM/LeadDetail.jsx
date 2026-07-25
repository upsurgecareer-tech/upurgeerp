import { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, Button, Chip,
  Avatar, IconButton, Divider, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, List, ListItem, ListItemText,
  ListItemAvatar, Paper, Tabs, Tab, CircularProgress, Alert, Tooltip
} from '@mui/material';
import {
  ArrowBack, Edit, Delete, Phone, WhatsApp, Email, Person,
  Business, CalendarToday, Source, TrendingUp, Schedule,
  Add, Check, Close, Notes as NotesIcon, Timeline, Save
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';

const STAGES = ['New', 'Contacted', 'Qualified', 'Negotiation', 'Converted', 'Lost'];
const SOURCES = ['Website', 'Referral', 'Walk-in', 'Social Media', 'Other'];
const PRIORITIES = ['Hot', 'Warm', 'Cold'];

const STAGE_COLORS = {
  New: 'info',
  Contacted: 'primary',
  Qualified: 'warning',
  Negotiation: 'secondary',
  Converted: 'success',
  Lost: 'error'
};

const PRIORITY_COLORS = {
  Hot: 'error',
  Warm: 'warning',
  Cold: 'info'
};

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tab, setTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [editData, setEditData] = useState({});
  const [followUpData, setFollowUpData] = useState({
    follow_up_date: '',
    follow_up_type: 'Call',
    notes: ''
  });

  useEffect(() => { fetchLeadDetails(); }, [id]);

  const fetchLeadDetails = async () => {
    setLoading(true);
    try {
      const [leadRes, followUpsRes] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/followups/leads/${id}`)
      ]);

      const leadData = leadRes.data.lead || leadRes.data;
      setLead(leadData);
      setEditData(leadData);
      setFollowUps(followUpsRes.data.followUps || []);

      // Mock activities (you can create API endpoint later)
      setActivities([
        { id: 1, type: 'created', description: 'Lead created', date: leadData.created_at, user: 'System' },
        { id: 2, type: 'stage_change', description: `Stage changed to ${leadData.stage}`, date: leadData.updated_at, user: 'Admin' }
      ]);

      // Mock notes (you can create API endpoint later)
      setNotes([]);

    } catch (error) {
      console.error('Error fetching lead details:', error);
      toast.error('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      await api.put(`/leads/${id}`, editData);
      toast.success('Lead updated successfully');
      setEditOpen(false);
      fetchLeadDetails();
    } catch (error) {
      toast.error('Failed to update lead');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted successfully');
      navigate('/crm/leads');
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const handleAddNote = () => {
    if (!noteText.trim()) {
      toast.error('Note cannot be empty');
      return;
    }
    const newNote = {
      id: Date.now(),
      text: noteText,
      date: new Date().toISOString(),
      user: 'Current User'
    };
    setNotes([newNote, ...notes]);
    setNoteText('');
    setNoteOpen(false);
    toast.success('Note added');
  };

  const handleScheduleFollowUp = async () => {
    if (!followUpData.follow_up_date) {
      toast.error('Date and time are required');
      return;
    }
    try {
      await api.post(`/followups/leads/${id}`, followUpData);
      toast.success('Follow-up scheduled');
      setFollowUpOpen(false);
      setFollowUpData({ follow_up_date: '', follow_up_type: 'Call', notes: '' });
      fetchLeadDetails();
    } catch (error) {
      toast.error('Failed to schedule follow-up');
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'call':
        window.location.href = `tel:${lead.mobile}`;
        break;
      case 'whatsapp':
        window.open(`https://wa.me/91${lead.mobile.replace(/\D/g, '')}`, '_blank');
        break;
      case 'email':
        if (lead.email) {
          window.location.href = `mailto:${lead.email}`;
        } else {
          toast.warning('No email available');
        }
        break;
    }
  };

  const InfoRow = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body1" fontWeight={500}>{value || 'N/A'}</Typography>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Layout title="Lead Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!lead) {
    return (
      <Layout title="Lead Details">
        <Alert severity="error">Lead not found</Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Lead Details">
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/crm/leads')}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight="bold">Lead Details</Typography>
              <Typography variant="body2" color="text.secondary">
                Complete information and activity history
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column - Lead Profile */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                {/* Avatar & Name */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    {lead.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold">{lead.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1 }}>
                    <Chip
                      label={lead.stage}
                      color={STAGE_COLORS[lead.stage] || 'default'}
                      size="small"
                    />
                    {lead.priority && (
                      <Chip
                        label={lead.priority}
                        color={PRIORITY_COLORS[lead.priority] || 'default'}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Quick Actions */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Phone />}
                    onClick={() => handleQuickAction('call')}
                  >
                    Call
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    startIcon={<WhatsApp />}
                    onClick={() => handleQuickAction('whatsapp')}
                  >
                    WhatsApp
                  </Button>
                  {lead.email && (
                    <Button
                      variant="contained"
                      color="info"
                      fullWidth
                      startIcon={<Email />}
                      onClick={() => handleQuickAction('email')}
                    >
                      Email
                    </Button>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Contact Information */}
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Contact Information
                </Typography>
                <InfoRow icon={<Phone fontSize="small" />} label="Mobile" value={lead.mobile} />
                <InfoRow icon={<Email fontSize="small" />} label="Email" value={lead.email} />

                <Divider sx={{ my: 2 }} />

                {/* Lead Information */}
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Lead Information
                </Typography>
                <InfoRow icon={<Business fontSize="small" />} label="Course Interest" value={lead.course_interest} />
                <InfoRow icon={<Source fontSize="small" />} label="Source" value={lead.source} />
                <InfoRow icon={<TrendingUp fontSize="small" />} label="Stage" value={lead.stage} />
                <InfoRow
                  icon={<CalendarToday fontSize="small" />}
                  label="Created Date"
                  value={lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : 'N/A'}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Tabs */}
          <Grid item xs={12} md={8}>
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                  <Tab label={`Follow-ups (${followUps.length})`} icon={<Schedule />} iconPosition="start" />
                  <Tab label={`Activity (${activities.length})`} icon={<Timeline />} iconPosition="start" />
                  <Tab label={`Notes (${notes.length})`} icon={<NotesIcon />} iconPosition="start" />
                </Tabs>
              </Box>

              <CardContent>
                {/* Follow-ups Tab */}
                {tab === 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">Follow-ups</Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => setFollowUpOpen(true)}
                      >
                        Schedule Follow-up
                      </Button>
                    </Box>
                    {followUps.length === 0 ? (
                      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                        <Schedule sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">No follow-ups scheduled</Typography>
                      </Paper>
                    ) : (
                      <List>
                        {followUps.map((fu) => (
                          <ListItem
                            key={fu.id}
                            sx={{
                              border: 1,
                              borderColor: 'divider',
                              borderRadius: 1,
                              mb: 1,
                              bgcolor: fu.status === 'Done' ? 'success.50' : fu.status === 'Cancelled' ? 'error.50' : 'background.paper'
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: fu.status === 'Done' ? 'success.main' : 'warning.main' }}>
                                {fu.status === 'Done' ? <Check /> : <Schedule />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography fontWeight={600}>{fu.follow_up_type}</Typography>
                                  <Chip label={fu.status} size="small" color={fu.status === 'Done' ? 'success' : fu.status === 'Cancelled' ? 'error' : 'warning'} />
                                </Box>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" color="text.secondary">
                                    {new Date(fu.follow_up_date).toLocaleString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Typography>
                                  {fu.notes && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                      {fu.notes}
                                    </Typography>
                                  )}
                                </>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                )}

                {/* Activity Tab */}
                {tab === 1 && (
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Activity Timeline</Typography>
                    {activities.length === 0 ? (
                      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                        <Timeline sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">No activities yet</Typography>
                      </Paper>
                    ) : (
                      <List>
                        {activities.map((activity) => (
                          <ListItem key={activity.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'info.main' }}>
                                <Timeline />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={activity.description}
                              secondary={`${activity.user} • ${new Date(activity.date).toLocaleString('en-IN')}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                )}

                {/* Notes Tab */}
                {tab === 2 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">Notes</Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => setNoteOpen(true)}
                      >
                        Add Note
                      </Button>
                    </Box>
                    {notes.length === 0 ? (
                      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                        <NotesIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">No notes added yet</Typography>
                      </Paper>
                    ) : (
                      <List>
                        {notes.map((note) => (
                          <ListItem key={note.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                <NotesIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={note.text}
                              secondary={`${note.user} • ${new Date(note.date).toLocaleString('en-IN')}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Name"
                value={editData.name || ''}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Mobile"
                value={editData.mobile || ''}
                onChange={(e) => setEditData({ ...editData, mobile: e.target.value })}
                fullWidth
              />
              <TextField
                label="Email"
                value={editData.email || ''}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                fullWidth
              />
              <TextField
                label="Course Interest"
                value={editData.course_interest || ''}
                onChange={(e) => setEditData({ ...editData, course_interest: e.target.value })}
                fullWidth
              />
              <TextField
                select
                label="Source"
                value={editData.source || ''}
                onChange={(e) => setEditData({ ...editData, source: e.target.value })}
                fullWidth
              >
                {SOURCES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField
                select
                label="Stage"
                value={editData.stage || ''}
                onChange={(e) => setEditData({ ...editData, stage: e.target.value })}
                fullWidth
              >
                {STAGES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField
                select
                label="Priority"
                value={editData.priority || ''}
                onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                fullWidth
              >
                {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Add Note Dialog */}
        <Dialog open={noteOpen} onClose={() => setNoteOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Note</DialogTitle>
          <DialogContent>
            <TextField
              label="Note"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              multiline
              rows={4}
              fullWidth
              sx={{ mt: 1 }}
              placeholder="Add your note here..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNote} variant="contained" startIcon={<Save />}>
              Save Note
            </Button>
          </DialogActions>
        </Dialog>

        {/* Schedule Follow-up Dialog */}
        <Dialog open={followUpOpen} onClose={() => setFollowUpOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Schedule Follow-up</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                select
                label="Type"
                value={followUpData.follow_up_type}
                onChange={(e) => setFollowUpData({ ...followUpData, follow_up_type: e.target.value })}
                fullWidth
              >
                <MenuItem value="Call">Call</MenuItem>
                <MenuItem value="Meeting">Meeting</MenuItem>
                <MenuItem value="Demo">Demo</MenuItem>
                <MenuItem value="Email">Email</MenuItem>
              </TextField>
              <TextField
                label="Date & Time"
                type="datetime-local"
                value={followUpData.follow_up_date}
                onChange={(e) => setFollowUpData({ ...followUpData, follow_up_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Notes"
                value={followUpData.notes}
                onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFollowUpOpen(false)}>Cancel</Button>
            <Button onClick={handleScheduleFollowUp} variant="contained">Schedule</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}
