import { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, Button,
  CircularProgress, Chip, List, ListItem, ListItemText, ListItemIcon,
  Avatar, IconButton, Divider, Paper, Alert
} from '@mui/material';
import {
  TrendingUp, People, Phone, CheckCircle, Warning, Schedule,
  ArrowForward, WhatsApp, Email, PersonAdd, Refresh
} from '@mui/icons-material';
import { Pie, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../../components/Layout';

ChartJS.register(
  ArcElement, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend
);

const STAGE_COLORS = {
  New: '#2196F3',
  Contacted: '#FF9800',
  Qualified: '#9C27B0',
  Negotiation: '#FFC107',
  Converted: '#4CAF50',
  Lost: '#F44336'
};

export default function CRMDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    total_leads: 0,
    new_leads_today: 0,
    hot_leads: 0,
    conversion_rate: 0,
    pending_followups: 0
  });
  const [stageData, setStageData] = useState(null);
  const [sourceData, setSourceData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [todayFollowUps, setTodayFollowUps] = useState([]);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Fetch leads
      let allLeads = [];
      try {
        const leadsRes = await api.get('/leads');
        allLeads = leadsRes.data.leads || leadsRes.data || [];
      } catch (err) {
        console.error('Leads fetch error:', err);
        setError('Failed to load leads data');
      }

      // Fetch followups
      let followUps = [];
      try {
        const followUpsRes = await api.get('/followups/today');
        followUps = followUpsRes.data.followUps || [];
      } catch (err) {
        console.error('FollowUps fetch error:', err);
        // Don't set error, just use empty array
      }

      const today = new Date().toISOString().split('T')[0];
      const newToday = allLeads.filter(l => {
        if (!l.created_at) return false;
        try {
          const leadDate = new Date(l.created_at).toISOString().split('T')[0];
          return leadDate === today;
        } catch {
          return false;
        }
      });
      const converted = allLeads.filter(l => l.stage === 'Converted').length;
      const conversionRate = allLeads.length > 0 ? ((converted / allLeads.length) * 100).toFixed(1) : 0;

      setMetrics({
        total_leads: allLeads.length,
        new_leads_today: newToday.length,
        hot_leads: allLeads.filter(l => l.stage === 'Qualified').length,
        conversion_rate: conversionRate,
        pending_followups: followUps.filter(f => f.status === 'Pending').length
      });

      setRecentLeads(allLeads.slice(0, 5));
      setTodayFollowUps(followUps);

      // Stage Distribution
      const stageCounts = {};
      allLeads.forEach(lead => {
        stageCounts[lead.stage] = (stageCounts[lead.stage] || 0) + 1;
      });
      
      const stageLabels = Object.keys(stageCounts);
      if (stageLabels.length > 0) {
        setStageData({
          labels: stageLabels,
          datasets: [{
            data: Object.values(stageCounts),
            backgroundColor: stageLabels.map(s => STAGE_COLORS[s] || '#999')
          }]
        });
      }

      // Source Distribution
      const sourceCounts = {};
      allLeads.forEach(lead => {
        if (lead.source) {
          sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
        }
      });
      
      const sourceLabels = Object.keys(sourceCounts);
      if (sourceLabels.length > 0) {
        setSourceData({
          labels: sourceLabels,
          datasets: [{
            label: 'Leads by Source',
            data: Object.values(sourceCounts),
            backgroundColor: '#1976d2'
          }]
        });
      }

      // Trend Data - Last 7 days (use actual lead dates if available)
      const last7Days = [];
      const trendCounts = [];
      
      if (allLeads.length > 0) {
        const leadDates = allLeads.map(l => new Date(l.created_at)).filter(d => !isNaN(d));
        if (leadDates.length > 0) {
          const newestDate = new Date(Math.max(...leadDates));
          
          for (let i = 6; i >= 0; i--) {
            const date = new Date(newestDate);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            const count = allLeads.filter(l => {
              if (!l.created_at) return false;
              try {
                const leadDate = new Date(l.created_at).toISOString().split('T')[0];
                return leadDate === dateStr;
              } catch {
                return false;
              }
            }).length;
            trendCounts.push(count);
          }
        }
      }

      setTrendData({
        labels: last7Days,
        datasets: [{
          label: 'New Leads',
          data: trendCounts,
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          tension: 0.4
        }]
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const MetricCard = ({ title, value, icon, color, subtitle, onClick, gradient }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 4,
        background: gradient || 'white',
        color: gradient ? 'white' : 'inherit',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        '&:hover': { 
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 25px -5px rgba(0,0,0,0.15)' 
        }
      }} 
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            bgcolor: gradient ? 'rgba(255,255,255,0.2)' : `${color}15`, 
            color: gradient ? 'white' : color, 
            p: 1.5, 
            borderRadius: 3,
            mr: 2,
            backdropFilter: gradient ? 'blur(10px)' : 'none'
          }}>
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="800">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 500 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout title="CRM Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="CRM Dashboard">
      <Container maxWidth="xl">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              CRM Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete overview of your leads and sales pipeline
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard
              title="Total Leads"
              value={metrics.total_leads}
              icon={<People fontSize="large" />}
              color="#1976d2"
              gradient="linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)"
              onClick={() => navigate('/crm/leads')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard
              title="New Today"
              value={metrics.new_leads_today}
              icon={<TrendingUp fontSize="large" />}
              color="#10b981"
              subtitle="Fresh leads"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard
              title="Hot Leads"
              value={metrics.hot_leads}
              icon={<CheckCircle fontSize="large" />}
              color="#f59e0b"
              subtitle="Qualified"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard
              title="Conversion Rate"
              value={`${metrics.conversion_rate}%`}
              icon={<PersonAdd fontSize="large" />}
              color="#0ea5e9"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard
              title="Follow-ups"
              value={metrics.pending_followups}
              icon={<Schedule fontSize="large" />}
              color="#ef4444"
              onClick={() => navigate('/crm/followups')}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Lead Trend Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Lead Trend (Last 7 Days)
                </Typography>
                {trendData && <Line data={trendData} options={{ responsive: true, maintainAspectRatio: true }} />}
              </CardContent>
            </Card>
          </Grid>

          {/* Stage Distribution */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Lead Pipeline
                </Typography>
                {stageData ? (
                  <Pie data={stageData} options={{ responsive: true, maintainAspectRatio: true }} />
                ) : (
                  <Typography color="text.secondary">No data</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Source Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Lead Sources
                </Typography>
                {sourceData ? (
                  <Bar data={sourceData} options={{ responsive: true, maintainAspectRatio: true }} />
                ) : (
                  <Typography color="text.secondary">No data</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Leads */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Recent Leads
                  </Typography>
                  <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/crm/leads')}>
                    View All
                  </Button>
                </Box>
                <List>
                  {recentLeads.length === 0 ? (
                    <Typography color="text.secondary">No recent leads</Typography>
                  ) : (
                    recentLeads.map((lead) => (
                      <ListItem key={lead.id} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.875rem' }}>
                            {lead.name?.charAt(0)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={lead.name}
                          secondary={`${lead.mobile} • ${lead.course_interest || 'N/A'}`}
                        />
                        <Chip label={lead.stage} size="small" sx={{ bgcolor: STAGE_COLORS[lead.stage], color: 'white' }} />
                      </ListItem>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Today's Follow-ups */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Today's Follow-ups
                  </Typography>
                  <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/crm/followups')}>
                    View All
                  </Button>
                </Box>
                {todayFollowUps.length === 0 ? (
                  <Typography color="text.secondary">No follow-ups scheduled for today</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {todayFollowUps.slice(0, 4).map((fu) => (
                      <Grid item xs={12} sm={6} md={3} key={fu.id}>
                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {fu.lead_name || `Lead #${fu.lead_id}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {fu.follow_up_type} • {new Date(fu.follow_up_date).toLocaleTimeString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {fu.notes}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <IconButton size="small" color="primary">
                              <Phone fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="success">
                              <WhatsApp fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="info">
                              <Email fontSize="small" />
                            </IconButton>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}
                      onClick={() => navigate('/crm/leads')}
                    >
                      Add New Lead
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}
                      onClick={() => navigate('/crm/kanban')}
                    >
                      View Kanban
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}
                      onClick={() => navigate('/crm/followups')}
                    >
                      Schedule Follow-up
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}
                      onClick={() => navigate('/crm/analytics')}
                    >
                      View Analytics
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
}
