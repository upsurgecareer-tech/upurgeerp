import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Chip, IconButton,
  Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, CircularProgress, TextField, MenuItem, Tooltip, Badge
} from '@mui/material';
import {
  Phone, WhatsApp, Email, Visibility, Edit, Refresh, FilterList,
  Search, Add
} from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const STAGES = ['New', 'Contacted', 'Qualified', 'Negotiation', 'Converted', 'Lost'];
const STAGE_COLORS = {
  New: '#2196F3',
  Contacted: '#FF9800',
  Qualified: '#9C27B0',
  Negotiation: '#FFC107',
  Converted: '#4CAF50',
  Lost: '#F44336'
};

export default function LeadKanban() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState({});
  const [filteredLeads, setFilteredLeads] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [draggedLead, setDraggedLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sources, setSources] = useState([]);

  useEffect(() => { fetchLeads(); }, []);
  useEffect(() => { applyFilters(); }, [leads, searchQuery, sourceFilter, priorityFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads');
      const allLeads = res.data.leads || res.data || [];
      
      // Extract unique sources
      const uniqueSources = [...new Set(allLeads.map(l => l.source).filter(Boolean))];
      setSources(uniqueSources);
      
      const grouped = STAGES.reduce((acc, stage) => {
        acc[stage] = allLeads.filter(lead => lead.stage === stage);
        return acc;
      }, {});
      
      setLeads(grouped);
      setFilteredLeads(grouped);
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filtered = {};
    
    STAGES.forEach(stage => {
      let stageLeads = leads[stage] || [];
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        stageLeads = stageLeads.filter(lead => 
          lead.name?.toLowerCase().includes(query) ||
          lead.mobile?.includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.course_interest?.toLowerCase().includes(query)
        );
      }
      
      // Source filter
      if (sourceFilter !== 'All') {
        stageLeads = stageLeads.filter(lead => lead.source === sourceFilter);
      }
      
      // Priority filter
      if (priorityFilter !== 'All') {
        stageLeads = stageLeads.filter(lead => lead.priority === priorityFilter);
      }
      
      filtered[stage] = stageLeads;
    });
    
    setFilteredLeads(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSourceFilter('All');
    setPriorityFilter('All');
  };

  const getTotalLeads = () => {
    return Object.values(filteredLeads).reduce((sum, arr) => sum + arr.length, 0);
  };

  const getStageValue = (stage) => {
    const stageLeads = filteredLeads[stage] || [];
    // Rough estimate: assume average deal value based on stage
    const multipliers = { New: 0.1, Contacted: 0.3, Qualified: 0.5, Negotiation: 0.7, Converted: 1, Lost: 0 };
    return stageLeads.length * 50000 * (multipliers[stage] || 0); // Assuming 50k average deal
  };

  const handleDragStart = (lead, sourceStage) => {
    setDraggedLead({ lead, sourceStage });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, destStage) => {
    e.preventDefault();
    
    if (!draggedLead || draggedLead.sourceStage === destStage) {
      setDraggedLead(null);
      return;
    }

    const { lead, sourceStage } = draggedLead;

    // Update UI optimistically
    const newLeads = { ...leads };
    const newFiltered = { ...filteredLeads };
    
    newLeads[sourceStage] = newLeads[sourceStage].filter(l => l.id !== lead.id);
    newFiltered[sourceStage] = newFiltered[sourceStage].filter(l => l.id !== lead.id);
    
    lead.stage = destStage;
    
    newLeads[destStage] = [...newLeads[destStage], lead];
    newFiltered[destStage] = [...newFiltered[destStage], lead];
    
    setLeads(newLeads);
    setFilteredLeads(newFiltered);
    setDraggedLead(null);

    // Update backend
    try {
      await api.put(`/leads/${lead.id}`, { stage: destStage });
      toast.success(`Lead moved to ${destStage}`);
    } catch (error) {
      toast.error('Failed to update lead stage');
      fetchLeads(); // Revert on error
    }
  };

  const handleQuickAction = (action, lead) => {
    switch (action) {
      case 'call':
        window.location.href = `tel:${lead.mobile}`;
        break;
      case 'whatsapp':
        const cleanNumber = lead.mobile.replace(/\D/g, '');
        window.open(`https://wa.me/91${cleanNumber}`, '_blank');
        break;
      case 'email':
        if (lead.email) {
          window.location.href = `mailto:${lead.email}`;
        } else {
          toast.warning('No email available');
        }
        break;
      case 'view':
        setSelectedLead(lead);
        setViewOpen(true);
        break;
      case 'edit':
        navigate(`/crm/leads`);
        break;
      default:
        break;
    }
  };

  const LeadCard = ({ lead, stage }) => (
    <Card
      draggable
      onDragStart={() => handleDragStart(lead, stage)}
      sx={{
        mb: 1.5,
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        '&:hover': { boxShadow: 3 },
        transition: 'box-shadow 0.2s'
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: STAGE_COLORS[stage], fontSize: '0.875rem' }}>
            {lead.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1 }}>
            {lead.name}
          </Typography>
          {lead.priority && (
            <Chip 
              label={lead.priority} 
              size="small" 
              color={lead.priority === 'Hot' ? 'error' : lead.priority === 'Warm' ? 'warning' : 'info'}
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.813rem' }}>
          📞 {lead.mobile}
        </Typography>
        
        {lead.email && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.813rem' }}>
            📧 {lead.email}
          </Typography>
        )}
        
        {lead.course_interest && (
          <Chip 
            label={lead.course_interest} 
            size="small" 
            variant="outlined"
            sx={{ mt: 1, fontSize: '0.7rem', height: 22 }}
          />
        )}
        
        {lead.source && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Source: {lead.source}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleQuickAction('call', lead); }}>
              <Phone fontSize="small" />
            </IconButton>
            <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleQuickAction('whatsapp', lead); }}>
              <WhatsApp fontSize="small" />
            </IconButton>
            {lead.email && (
              <IconButton size="small" color="info" onClick={(e) => { e.stopPropagation(); handleQuickAction('email', lead); }}>
                <Email fontSize="small" />
              </IconButton>
            )}
          </Box>
          <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleQuickAction('view', lead); }}>
            <Visibility fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout title="Lead Kanban">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Sales Pipeline">
      <Container maxWidth="xl">
        {/* Header with Filters */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">Sales Pipeline</Typography>
              <Typography variant="body2" color="text.secondary">
                {getTotalLeads()} leads • Drag and drop to update stages
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                startIcon={<Refresh />} 
                onClick={fetchLeads}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={() => navigate('/crm/leads')}
              >
                Add Lead
              </Button>
            </Box>
          </Box>

          {/* Filters */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ py: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Source"
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                  >
                    <MenuItem value="All">All Sources</MenuItem>
                    {sources.map(source => (
                      <MenuItem key={source} value={source}>{source}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Priority"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <MenuItem value="All">All Priorities</MenuItem>
                    <MenuItem value="Hot">Hot</MenuItem>
                    <MenuItem value="Warm">Warm</MenuItem>
                    <MenuItem value="Cold">Cold</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    onClick={clearFilters}
                    disabled={!searchQuery && sourceFilter === 'All' && priorityFilter === 'All'}
                  >
                    Clear Filters
                  </Button>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Pipeline Value: ₹{Object.keys(filteredLeads).reduce((sum, stage) => sum + getStageValue(stage), 0).toLocaleString('en-IN')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
          {STAGES.map(stage => {
            const stageLeads = filteredLeads[stage] || [];
            const stageValue = getStageValue(stage);
            
            return (
              <Box key={stage} sx={{ minWidth: 300, flex: 1 }}>
                <Box sx={{ 
                  bgcolor: STAGE_COLORS[stage], 
                  color: 'white', 
                  p: 1.5, 
                  borderRadius: 1,
                  mb: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {stage}
                    </Typography>
                    <Chip 
                      label={stageLeads.length} 
                      size="small" 
                      sx={{ bgcolor: 'white', color: STAGE_COLORS[stage], fontWeight: 'bold' }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    ₹{stageValue.toLocaleString('en-IN')}
                  </Typography>
                </Box>

                <Box
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage)}
                  sx={{
                    bgcolor: '#f5f5f5',
                    p: 1.5,
                    borderRadius: 1,
                    minHeight: 500,
                    maxHeight: 'calc(100vh - 350px)',
                    overflowY: 'auto',
                    border: draggedLead && draggedLead.sourceStage !== stage ? '2px dashed #1976d2' : 'none',
                    transition: 'border 0.2s'
                  }}
                >
                  {stageLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} stage={stage} />
                  ))}
                  
                  {stageLeads.length === 0 && (
                    <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {draggedLead && draggedLead.sourceStage !== stage ? 'Drop here' : 'No leads'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Dialog open={viewOpen} onClose={() => { setViewOpen(false); setSelectedLead(null); }} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: STAGE_COLORS[selectedLead?.stage] || 'primary.main', width: 48, height: 48 }}>
                {selectedLead?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{selectedLead?.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip 
                    label={selectedLead?.stage} 
                    size="small" 
                    sx={{ bgcolor: STAGE_COLORS[selectedLead?.stage], color: 'white' }}
                  />
                  {selectedLead?.priority && (
                    <Chip 
                      label={selectedLead?.priority} 
                      size="small" 
                      color={selectedLead?.priority === 'Hot' ? 'error' : selectedLead?.priority === 'Warm' ? 'warning' : 'info'}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedLead && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Mobile Number</Typography>
                  <Typography variant="body1" fontWeight="500">{selectedLead.mobile}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Email Address</Typography>
                  <Typography variant="body1" fontWeight="500">{selectedLead.email || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Course Interest</Typography>
                  <Typography variant="body1" fontWeight="500">{selectedLead.course_interest || 'Not specified'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Lead Source</Typography>
                  <Typography variant="body1" fontWeight="500">{selectedLead.source || 'Unknown'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Typography variant="body1" fontWeight="500">{selectedLead.status}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Created Date</Typography>
                  <Typography variant="body1" fontWeight="500">
                    {selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    }) : 'N/A'}
                  </Typography>
                </Grid>
                {selectedLead.inquiry_date && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">Inquiry Date</Typography>
                    <Typography variant="body1" fontWeight="500">
                      {new Date(selectedLead.inquiry_date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => { setViewOpen(false); setSelectedLead(null); }}>Close</Button>
            <Button 
              variant="outlined" 
              startIcon={<Phone />} 
              onClick={() => window.location.href = `tel:${selectedLead?.mobile}`}
            >
              Call
            </Button>
            <Button 
              variant="outlined" 
              color="success"
              startIcon={<WhatsApp />} 
              onClick={() => window.open(`https://wa.me/91${selectedLead?.mobile.replace(/\D/g, '')}`, '_blank')}
            >
              WhatsApp
            </Button>
            <Button 
              variant="contained" 
              startIcon={<Edit />} 
              onClick={() => { navigate(`/crm/leads`); setViewOpen(false); }}
            >
              Edit Lead
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}
