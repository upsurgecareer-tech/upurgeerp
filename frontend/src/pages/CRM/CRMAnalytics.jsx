import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, CircularProgress,
  Paper, Divider, Chip, LinearProgress, Button, TextField, MenuItem, Alert
} from '@mui/material';
import { Pie, Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend, PointElement, LineElement
} from 'chart.js';
import {
  TrendingUp, People, CheckCircle, HourglassEmpty,
  BarChart, PieChart, Refresh, FileDownload, Timeline
} from '@mui/icons-material';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { toast } from 'react-toastify';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const chartOpts = (type) => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } },
    title: { display: false },
  },
  scales: type === 'bar' ? {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
  } : undefined,
});

export default function CRMAnalytics() {
  const [loading, setLoading] = useState(true);
  const [sourceData, setSourceData] = useState(null);
  const [stageData, setStageData] = useState(null);
  const [conversionRate, setConversionRate] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [convertedLeads, setConvertedLeads] = useState(0);
  const [trendData, setTrendData] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [leads, setLeads] = useState([]);

  useEffect(() => { fetchAnalytics(); }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads');
      const allLeads = res.data.leads || [];
      setLeads(allLeads);

      // Filter by date range
      const days = parseInt(dateRange);
      let filteredLeads = allLeads;
      
      if (days < 365) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        filteredLeads = allLeads.filter(l => {
          if (!l.created_at) return false;
          try {
            return new Date(l.created_at) >= startDate;
          } catch {
            return false;
          }
        });
      }
      
      // If no leads in range, show all leads
      if (filteredLeads.length === 0) {
        filteredLeads = allLeads;
      }

      // Source Distribution
      const sourceCounts = {};
      filteredLeads.forEach(lead => {
        if (lead.source) {
          sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
        }
      });
      
      if (Object.keys(sourceCounts).length > 0) {
        setSourceData({
          labels: Object.keys(sourceCounts),
          datasets: [{
            data: Object.values(sourceCounts),
            backgroundColor: COLORS,
            borderWidth: 2,
            borderColor: '#fff',
          }],
        });
      }

      // Stage Distribution
      const stageCounts = {};
      filteredLeads.forEach(lead => {
        stageCounts[lead.stage] = (stageCounts[lead.stage] || 0) + 1;
      });
      
      if (Object.keys(stageCounts).length > 0) {
        setStageData({
          labels: Object.keys(stageCounts),
          datasets: [{
            label: 'Leads',
            data: Object.values(stageCounts),
            backgroundColor: COLORS,
            borderRadius: 6,
            borderSkipped: false,
          }],
        });
      }

      // Trend Data - Use actual date range of leads
      const trendCounts = [];
      const trendLabels = [];
      
      if (filteredLeads.length > 0) {
        // Get date range from actual leads
        const leadDates = filteredLeads.map(l => new Date(l.created_at)).filter(d => !isNaN(d));
        if (leadDates.length > 0) {
          const oldestDate = new Date(Math.min(...leadDates));
          const newestDate = new Date(Math.max(...leadDates));
          const daysDiff = Math.ceil((newestDate - oldestDate) / (1000 * 60 * 60 * 24)) + 1;
          const displayDays = Math.min(daysDiff, parseInt(dateRange));
          
          for (let i = displayDays - 1; i >= 0; i--) {
            const date = new Date(newestDate);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            trendLabels.push(date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }));
            const count = filteredLeads.filter(l => {
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
        labels: trendLabels,
        datasets: [{
          label: 'New Leads',
          data: trendCounts,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        }]
      });

      const total = filteredLeads.length;
      const converted = filteredLeads.filter(l => l.stage === 'Converted').length;
      setTotalLeads(total);
      setConvertedLeads(converted);
      setConversionRate(total > 0 ? ((converted / total) * 100).toFixed(1) : 0);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Mobile', 'Email', 'Source', 'Stage', 'Priority', 'Created Date'];
    const rows = leads.map(l => [
      l.name, l.mobile, l.email || 'N/A', l.source || 'N/A', l.stage, 
      l.priority || 'N/A', l.created_at ? new Date(l.created_at).toLocaleDateString('en-IN') : 'N/A'
    ]);
    let csv = headers.join(',') + '\n';
    rows.forEach(row => { csv += row.map(cell => `"${cell}"`).join(',') + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Analytics exported successfully');
  };

  const StatCard = ({ icon, label, value, color, subtitle }) => (
    <Paper sx={{ p: 2.5, borderTop: 3, borderColor: `${color}.main`, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ bgcolor: `${color}.main`, color: 'white', p: 1, borderRadius: 2, display: 'flex' }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Typography variant="h5" fontWeight="bold">{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Layout title="CRM Analytics">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">CRM Analytics & Insights</Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive lead performance and conversion analysis
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              select
              size="small"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              sx={{ width: 150 }}
            >
              <MenuItem value="7">Last 7 Days</MenuItem>
              <MenuItem value="30">Last 30 Days</MenuItem>
              <MenuItem value="90">Last 90 Days</MenuItem>
              <MenuItem value="365">Last Year</MenuItem>
            </TextField>
            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchAnalytics} disabled={loading}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<FileDownload />} onClick={exportToCSV}>
              Export CSV
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress size={48} />
          </Box>
        ) : totalLeads === 0 ? (
          <Alert severity="info" sx={{ mt: 4 }}>
            No leads data available for the selected period. Try changing the date range.
          </Alert>
        ) : (
          <Grid container spacing={3}>

            {/* Stat Cards */}
            <Grid item xs={6} sm={3}>
              <StatCard icon={<People />} label="Total Leads" value={totalLeads} color="primary" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard icon={<CheckCircle />} label="Converted" value={convertedLeads} color="success" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard icon={<TrendingUp />} label="Conversion Rate" value={`${conversionRate}%`} color="warning" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={<HourglassEmpty />}
                label="Active Leads"
                value={totalLeads - convertedLeads}
                color="info"
                subtitle="In pipeline"
              />
            </Grid>

            {/* Conversion Progress */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp color="primary" />
                      <Typography fontWeight={600}>Overall Conversion Progress</Typography>
                    </Box>
                    <Chip label={`${conversionRate}%`} color="primary" size="small" />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(Number(conversionRate), 100)}
                    sx={{ height: 12, borderRadius: 6, bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': { borderRadius: 6 } }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">{convertedLeads} converted</Typography>
                    <Typography variant="caption" color="text.secondary">{totalLeads} total</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Lead Trend */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Timeline color="primary" />
                    <Typography fontWeight={600}>Lead Generation Trend</Typography>
                    <Chip label={`Last ${dateRange} days`} size="small" variant="outlined" sx={{ ml: 'auto' }} />
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {trendData ? (
                    <Line data={trendData} options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: { mode: 'index', intersect: false }
                      },
                      scales: {
                        x: { grid: { display: false } },
                        y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { stepSize: 1 } }
                      }
                    }} />
                  ) : (
                    <Typography color="text.secondary" textAlign="center" py={4}>No trend data</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Stage Distribution */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BarChart color="secondary" />
                    <Typography fontWeight={600}>Lead Stage Distribution</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {stageData ? (
                    <Bar data={stageData} options={chartOpts('bar')} />
                  ) : (
                    <Typography color="text.secondary" textAlign="center" py={4}>No data available</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Source Distribution */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PieChart color="primary" />
                    <Typography fontWeight={600}>Lead Source Breakdown</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {sourceData ? (
                    <Box sx={{ maxWidth: 320, mx: 'auto' }}>
                      <Doughnut data={sourceData} options={chartOpts('doughnut')} />
                    </Box>
                  ) : (
                    <Typography color="text.secondary" textAlign="center" py={4}>No data available</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        )}
      </Box>
    </Layout>
  );
}
