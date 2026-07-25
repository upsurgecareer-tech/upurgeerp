import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Chip, CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const STAGES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const SOURCES = ['Website', 'Referral', 'Walk-in', 'Social Media', 'Other'];

const emptyForm = {
  name: '', email: '', mobile: '', course_interest: '', source: 'Website', stage: 'New', inquiry_date: '',
};

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [viewLead, setViewLead] = useState(null);

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads');
      setLeads(response.data.leads || response.data || []);
    } catch {
      toast.error('Failed to fetch leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (lead = null) => {
    if (lead) {
      setEditId(lead.id);
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        mobile: lead.mobile || '',
        course_interest: lead.course_interest || '',
        source: lead.source || 'Website',
        stage: lead.stage || 'New',
        inquiry_date: lead.inquiry_date ? lead.inquiry_date.split('T')[0] : '',
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
    if (!formData.name || !formData.mobile) {
      toast.error('Name and Mobile are required');
      return;
    }
    try {
      if (editId) {
        await api.put(`/leads/${editId}`, formData);
        toast.success('Lead updated successfully');
      } else {
        await api.post('/leads', formData);
        toast.success('Lead created successfully');
      }
      handleClose();
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save lead');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted');
      fetchLeads();
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const getStageColor = (stage) => ({
    New: 'info', Contacted: 'primary', Qualified: 'warning',
    Converted: 'success', Lost: 'error',
  }[stage] || 'default');

  return (
    <Layout title="Leads Management">
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Leads Management</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            Add Lead
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Course Interest</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No leads found. Create your first lead!</TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.mobile}</TableCell>
                      <TableCell>{lead.course_interest}</TableCell>
                      <TableCell>{lead.source}</TableCell>
                      <TableCell>
                        <Chip label={lead.stage} color={getStageColor(lead.stage)} size="small" />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => setViewLead(lead)}>
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color="info" onClick={() => handleOpen(lead)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(lead.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editId ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Full Name" name="name" value={formData.name}
              onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Email" name="email" type="email" value={formData.email}
              onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Mobile" name="mobile" value={formData.mobile}
              onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Inquiry Date" name="inquiry_date" type="date"
              value={formData.inquiry_date} onChange={handleChange} margin="normal"
              InputLabelProps={{ shrink: true }} />
            <TextField fullWidth label="Course Interest" name="course_interest"
              value={formData.course_interest} onChange={handleChange} margin="normal" />
            <TextField fullWidth select label="Source" name="source" value={formData.source}
              onChange={handleChange} margin="normal">
              {SOURCES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField fullWidth select label="Stage" name="stage" value={formData.stage}
              onChange={handleChange} margin="normal">
              {STAGES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editId ? 'Update' : 'Create'} Lead
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={!!viewLead} onClose={() => setViewLead(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Lead Details</DialogTitle>
          <DialogContent>
            {viewLead && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                <Typography><b>Name:</b> {viewLead.name}</Typography>
                <Typography><b>Email:</b> {viewLead.email}</Typography>
                <Typography><b>Mobile:</b> {viewLead.mobile}</Typography>
                <Typography><b>Course Interest:</b> {viewLead.course_interest}</Typography>
                <Typography><b>Source:</b> {viewLead.source}</Typography>
                <Typography><b>Stage:</b> {viewLead.stage}</Typography>
                <Typography><b>Status:</b> {viewLead.status}</Typography>
                <Typography><b>Created:</b> {new Date(viewLead.created_at).toLocaleDateString()}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewLead(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Leads;
