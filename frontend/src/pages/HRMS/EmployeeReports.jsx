import { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Grid, Typography, Paper, MenuItem,
  Select, FormControl, InputLabel, Chip, CircularProgress, Alert, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, TextField
} from '@mui/material';
import {
  Download, PictureAsPdf, TableChart, Assessment, People, Work,
  School, TrendingUp, CalendarToday, AttachMoney, BarChart, Analytics
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Modern chart styling options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        font: { family: "'Inter', sans-serif", weight: '500' },
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleFont: { family: "'Inter', sans-serif", size: 14, weight: '700' },
      bodyFont: { family: "'Inter', sans-serif", size: 13 },
      padding: 12,
      cornerRadius: 8,
      displayColors: true
    }
  },
  scales: {
    y: {
      grid: { color: 'rgba(226, 232, 240, 0.5)', drawBorder: false },
      ticks: { font: { family: "'Inter', sans-serif" } }
    },
    x: {
      grid: { display: false, drawBorder: false },
      ticks: { font: { family: "'Inter', sans-serif" } }
    }
  }
};

const pieOptions = {
  ...chartOptions,
  scales: undefined
};

export default function EmployeeReports() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [reportData, setReportData] = useState(null);

  const reportTypes = [
    { value: 'overview', label: 'Employee Overview', icon: <People /> },
    { value: 'department', label: 'Department-wise Report', icon: <Work /> },
    { value: 'attendance', label: 'Attendance Report', icon: <CalendarToday /> },
    { value: 'salary', label: 'Salary Report', icon: <AttachMoney /> },
    { value: 'education', label: 'Education Report', icon: <School /> },
    { value: 'experience', label: 'Experience Report', icon: <TrendingUp /> },
    { value: 'status', label: 'Status Report', icon: <Assessment /> },
    { value: 'joining', label: 'Joining Trend', icon: <BarChart /> }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_quarter', label: 'This Quarter' },
    { value: 'this_year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (reportType && (dateRange !== 'custom' || (startDate && endDate))) {
      generateReport();
    }
  }, [reportType, dateRange, department, startDate, endDate]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/hrms/departments');
      setDepartments(res.data.departments || []);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const generateReport = async () => {
    if (dateRange === 'custom') {
      if (!startDate || !endDate) return;
      if (new Date(startDate) > new Date(endDate)) {
        toast.error('Start Date cannot be after End Date');
        return;
      }
    }
    try {
      setLoading(true);
      const res = await api.get(`/hrms/reports/employees`, {
        params: { type: reportType, dateRange, department, startDate, endDate }
      });
      
      if (res.data && !res.data.message?.includes('not fully implemented')) {
        if (reportType === 'overview') {
          setReportData({
            summary: {
              totalEmployees: res.data.total,
              activeEmployees: res.data.active,
              newJoinings: res.data.newJoinings,
              resignations: res.data.resignations,
              avgAge: 32, // placeholder
              avgExperience: 5.2 // placeholder
            },
            genderDistribution: {
              labels: res.data.genderDistribution.map(g => g.name),
              data: res.data.genderDistribution.map(g => g.value)
            },
            employmentType: {
              labels: res.data.employmentType.map(e => e.name),
              data: res.data.employmentType.map(e => e.value)
            }
          });
        } else if (reportType === 'department') {
          setReportData({
            departments: res.data.data.map(d => ({ name: d.name, employees: d.total, active: d.active, budget: 'N/A' })),
            chart: {
              labels: res.data.data.map(d => d.name),
              data: res.data.data.map(d => d.total)
            }
          });
        } else if (reportType === 'status') {
          setReportData({
            statusBreakdown: res.data.data.map(s => ({ status: s.name, count: s.value, percentage: null })),
            chart: {
              labels: res.data.data.map(s => s.name),
              data: res.data.data.map(s => s.value)
            }
          });
        } else {
          setReportData(getMockReportData(reportType));
        }
      } else {
        setReportData(getMockReportData(reportType));
      }
    } catch (error) {
      console.error(error);
      setReportData(getMockReportData(reportType));
    } finally {
      setLoading(false);
    }
  };

  const getMockReportData = (type) => {
    switch (type) {
      case 'overview':
        return {
          summary: {
            totalEmployees: 150,
            activeEmployees: 142,
            newJoinings: 8,
            resignations: 3,
            avgAge: 32,
            avgExperience: 5.2
          },
          genderDistribution: {
            labels: ['Male', 'Female', 'Other'],
            data: [85, 62, 3]
          },
          employmentType: {
            labels: ['Full-Time', 'Part-Time', 'Contract', 'Intern'],
            data: [120, 15, 10, 5]
          }
        };
      
      case 'department':
        return {
          departments: [
            { name: 'IT', employees: 45, active: 43, budget: '50L' },
            { name: 'HR', employees: 12, active: 12, budget: '15L' },
            { name: 'Sales', employees: 35, active: 33, budget: '40L' },
            { name: 'Marketing', employees: 20, active: 19, budget: '25L' },
            { name: 'Finance', employees: 18, active: 18, budget: '20L' }
          ],
          chart: {
            labels: ['IT', 'HR', 'Sales', 'Marketing', 'Finance'],
            data: [45, 12, 35, 20, 18]
          }
        };
      
      case 'attendance':
        return {
          summary: {
            avgAttendance: '92.5%',
            presentToday: 138,
            absentToday: 4,
            onLeave: 8
          },
          monthlyTrend: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            data: [95, 93, 91, 94]
          }
        };
      
      case 'salary':
        return {
          summary: {
            totalPayroll: '2.5 Cr',
            avgSalary: '8.5 LPA',
            highestSalary: '25 LPA',
            lowestSalary: '3 LPA'
          },
          salaryRanges: {
            labels: ['0-5L', '5-10L', '10-15L', '15-20L', '20L+'],
            data: [25, 60, 40, 20, 5]
          }
        };
      
      case 'education':
        return {
          qualifications: [
            { degree: 'PhD', count: 5 },
            { degree: 'Masters', count: 45 },
            { degree: 'Bachelors', count: 85 },
            { degree: 'Diploma', count: 15 }
          ],
          chart: {
            labels: ['PhD', 'Masters', 'Bachelors', 'Diploma'],
            data: [5, 45, 85, 15]
          }
        };
      
      case 'experience':
        return {
          experienceRanges: [
            { range: '0-2 years', count: 35 },
            { range: '2-5 years', count: 55 },
            { range: '5-10 years', count: 40 },
            { range: '10+ years', count: 20 }
          ],
          chart: {
            labels: ['0-2y', '2-5y', '5-10y', '10+y'],
            data: [35, 55, 40, 20]
          }
        };
      
      case 'status':
        return {
          statusBreakdown: [
            { status: 'Active', count: 142, percentage: 94.7 },
            { status: 'On Leave', count: 5, percentage: 3.3 },
            { status: 'Inactive', count: 3, percentage: 2.0 }
          ],
          chart: {
            labels: ['Active', 'On Leave', 'Inactive'],
            data: [142, 5, 3]
          }
        };
      
      case 'joining':
        return {
          monthlyJoinings: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [12, 8, 15, 10, 18, 14]
          },
          yearlyTrend: {
            labels: ['2020', '2021', '2022', '2023', '2024'],
            data: [85, 102, 125, 138, 150]
          }
        };
      
      default:
        return null;
    }
  };

  const handleExport = (format) => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
    // Implement actual export logic
  };

  const ChartContainer = ({ title, children }) => (
    <Card sx={{ 
      borderRadius: 4, 
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 3 }}>{title}</Typography>
        <Box sx={{ height: 300, position: 'relative', width: '100%', flexGrow: 1 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );

  const renderChart = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'overview':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ChartContainer title="Gender Distribution">
                <Pie
                  data={{
                    labels: reportData.genderDistribution.labels,
                    datasets: [{
                      data: reportData.genderDistribution.data,
                      backgroundColor: ['#6366f1', '#ec4899', '#14b8a6'],
                      borderWidth: 0,
                      hoverOffset: 10
                    }]
                  }}
                  options={pieOptions}
                />
              </ChartContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartContainer title="Employment Type">
                <Bar
                  data={{
                    labels: reportData.employmentType.labels,
                    datasets: [{
                      label: 'Employees',
                      data: reportData.employmentType.data,
                      backgroundColor: '#6366f1',
                      borderRadius: 6
                    }]
                  }}
                  options={chartOptions}
                />
              </ChartContainer>
            </Grid>
          </Grid>
        );
      
      case 'department':
        return (
          <ChartContainer title="Department-wise Employee Count">
            <Bar
              data={{
                labels: reportData.chart.labels,
                datasets: [{
                  label: 'Employees',
                  data: reportData.chart.data,
                  backgroundColor: ['#6366f1', '#ec4899', '#0ea5e9', '#10b981', '#f59e0b'],
                  borderRadius: 6
                }]
              }}
              options={chartOptions}
            />
          </ChartContainer>
        );
      
      case 'attendance':
        return (
          <ChartContainer title="Monthly Attendance Trend">
            <Line
              data={{
                labels: reportData.monthlyTrend.labels,
                datasets: [{
                  label: 'Attendance %',
                  data: reportData.monthlyTrend.data,
                  borderColor: '#8b5cf6',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  borderWidth: 3,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: '#8b5cf6',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointRadius: 5,
                  pointHoverRadius: 7
                }]
              }}
              options={chartOptions}
            />
          </ChartContainer>
        );
      
      case 'salary':
        return (
          <ChartContainer title="Salary Distribution">
            <Bar
              data={{
                labels: reportData.salaryRanges.labels,
                datasets: [{
                  label: 'Employees',
                  data: reportData.salaryRanges.data,
                  backgroundColor: '#10b981',
                  borderRadius: 6
                }]
              }}
              options={chartOptions}
            />
          </ChartContainer>
        );
      
      case 'joining':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ChartContainer title="Monthly Joinings (2024)">
                <Line
                  data={{
                    labels: reportData.monthlyJoinings.labels,
                    datasets: [{
                      label: 'New Joinings',
                      data: reportData.monthlyJoinings.data,
                      borderColor: '#ec4899',
                      backgroundColor: 'rgba(236, 72, 153, 0.2)',
                      borderWidth: 3,
                      tension: 0.4,
                      fill: true,
                      pointBackgroundColor: '#ec4899',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 5
                    }]
                  }}
                  options={chartOptions}
                />
              </ChartContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartContainer title="Yearly Growth Trend">
                <Bar
                  data={{
                    labels: reportData.yearlyTrend.labels,
                    datasets: [{
                      label: 'Total Employees',
                      data: reportData.yearlyTrend.data,
                      backgroundColor: '#0ea5e9',
                      borderRadius: 6
                    }]
                  }}
                  options={chartOptions}
                />
              </ChartContainer>
            </Grid>
          </Grid>
        );
      
      default:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8} sx={{ mx: 'auto' }}>
              <ChartContainer title={`${reportTypes.find(t => t.value === reportType)?.label} Chart`}>
                <Pie
                  data={{
                    labels: reportData.chart?.labels || [],
                    datasets: [{
                      data: reportData.chart?.data || [],
                      backgroundColor: ['#6366f1', '#ec4899', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'],
                      borderWidth: 0,
                      hoverOffset: 10
                    }]
                  }}
                  options={pieOptions}
                />
              </ChartContainer>
            </Grid>
          </Grid>
        );
    }
  };

  const MetricCard = ({ title, value, index }) => {
    // Array of beautiful gradients for metrics
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
    ];
    
    const bgGradient = gradients[index % gradients.length];
    
    return (
      <Grid item xs={6} sm={4} md={2}>
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          background: 'white',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s',
          '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }
        }}>
          {/* Decorative top bar */}
          <Box sx={{ height: 6, width: '100%', background: bgGradient }} />
          <CardContent sx={{ textAlign: 'center', p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ 
              fontWeight: 800, 
              background: bgGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              {value}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderSummary = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'overview':
      case 'attendance':
      case 'salary':
        return (
          <Grid container spacing={2}>
            {Object.entries(reportData.summary).map(([key, value], index) => (
              <MetricCard 
                key={key} 
                title={key.replace(/([A-Z])/g, ' $1').trim()} 
                value={value} 
                index={index} 
              />
            ))}
          </Grid>
        );
      
      case 'department':
        return (
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Total Employees</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Active</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Budget</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.departments.map((dept, index) => (
                  <TableRow key={index} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{dept.name}</TableCell>
                    <TableCell>{dept.employees}</TableCell>
                    <TableCell>
                      <Chip label={dept.active} sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 700, borderRadius: 1.5 }} size="small" />
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 500 }}>{dept.budget}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      
      case 'education':
      case 'experience':
      case 'status':
        const dataKey = reportType === 'education' ? 'qualifications' : 
                       reportType === 'experience' ? 'experienceRanges' : 'statusBreakdown';
        return (
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>
                    {reportType === 'education' ? 'Degree' : reportType === 'experience' ? 'Experience Range' : 'Status'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Count</TableCell>
                  {reportType === 'status' && (
                    <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Percentage</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData[dataKey].map((item, index) => (
                  <TableRow key={index} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{item.degree || item.range || item.status}</TableCell>
                    <TableCell>
                      <Chip label={item.count} sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontWeight: 700, borderRadius: 1.5 }} size="small" />
                    </TableCell>
                    {item.percentage && (
                      <TableCell sx={{ fontWeight: 500, color: '#64748b' }}>{item.percentage}%</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto" }}>
      <Box>
      {/* Header */}
      <Paper sx={{ 
        p: 2.5, 
        mb: 3, 
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main', display: 'flex' }}>
              <Analytics />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Employee Reports & Analytics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" color="primary" startIcon={<Download />} onClick={() => handleExport('csv')} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              CSV
            </Button>
            <Button variant="outlined" color="success" startIcon={<TableChart />} onClick={() => handleExport('excel')} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Excel
            </Button>
            <Button variant="outlined" color="error" startIcon={<PictureAsPdf />} onClick={() => handleExport('pdf')} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              PDF
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Filters */}
      <Paper sx={{ 
        p: 2.5, 
        mb: 4, 
        borderRadius: 3,
        boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="Report Type"
                sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}
              >
                {reportTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 500, color: '#334155' }}>
                      <Box sx={{ color: 'primary.main', display: 'flex' }}>{type.icon}</Box>
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                label="Date Range"
                sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}
              >
                {dateRanges.map(range => (
                  <MenuItem key={range.value} value={range.value} sx={{ fontWeight: 500 }}>{range.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                label="Department"
                sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}
              >
                <MenuItem value="" sx={{ fontWeight: 500 }}>All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.id} sx={{ fontWeight: 500 }}>{dept.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {dateRange === 'custom' && (
            <>
              <Grid item xs={12} md={4}>
                <TextField fullWidth size="small" type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={startDate} onChange={e => setStartDate(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth size="small" type="date" label="End Date" InputLabelProps={{ shrink: true }} value={endDate} onChange={e => setEndDate(e.target.value)} />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Report Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress size={48} thickness={4} />
        </Box>
      ) : !reportData ? (
        <Alert severity="info" sx={{ borderRadius: 3, border: '1px solid #bae6fd' }}>Select report type to generate report</Alert>
      ) : (
        <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
          {/* Summary Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>Key Metrics</Typography>
            {renderSummary()}
          </Box>

          <Divider sx={{ my: 4, borderColor: '#e2e8f0', borderStyle: 'dashed' }} />

          {/* Chart Section */}
          <Box sx={{ mb: 4 }}>
            {renderChart()}
          </Box>
        </Box>
      )}
      </Box>
    </Box>
  );
}
