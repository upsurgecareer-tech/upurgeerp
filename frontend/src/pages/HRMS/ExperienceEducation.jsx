import { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Grid, Typography, Dialog, DialogTitle,
  DialogContent, TextField, CircularProgress, Alert, Chip, IconButton,
  Paper, InputAdornment, Tooltip, Avatar, MenuItem, Select, FormControl,
  InputLabel, Divider, LinearProgress, Stack
} from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector, 
  TimelineContent, TimelineDot, TimelineOppositeContent, timelineOppositeContentClasses 
} from '@mui/lab';
import {
  Add, Edit, Delete, Search, School, Work, Star, TrendingUp,
  EmojiEvents, Business, CalendarToday, AssuredWorkload, AutoAwesome
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function ExperienceEducation() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [educationData, setEducationData] = useState([]);
  const [experienceData, setExperienceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openEdu, setOpenEdu] = useState(false);
  const [openExp, setOpenExp] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [eduForm, setEduForm] = useState({
    degree: '',
    institution: '',
    university: '',
    specialization: '',
    start_year: '',
    end_year: '',
    percentage: '',
    grade: ''
  });

  const [expForm, setExpForm] = useState({
    company_name: '',
    designation: '',
    department: '',
    start_date: '',
    end_date: '',
    current: false,
    ctc: '',
    location: '',
    responsibilities: '',
    achievements: ''
  });

  const degrees = [
    'High School (10th)', 'Higher Secondary (12th)', 'Diploma',
    'Bachelor of Arts (BA)', 'Bachelor of Science (BSc)', 'Bachelor of Commerce (BCom)',
    'Bachelor of Engineering (BE)', 'Bachelor of Technology (BTech)', 'Bachelor of Computer Applications (BCA)',
    'Bachelor of Business Administration (BBA)', 'Master of Arts (MA)', 'Master of Science (MSc)',
    'Master of Commerce (MCom)', 'Master of Engineering (ME)', 'Master of Technology (MTech)',
    'Master of Computer Applications (MCA)', 'Master of Business Administration (MBA)', 'PhD', 'Other'
  ];

  const [stats, setStats] = useState({
    totalEducation: 0,
    totalExperience: 0,
    avgExperience: 0,
    highestQualification: 'N/A'
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeData();
    } else {
      setEducationData([]);
      setExperienceData([]);
      setStats({
        totalEducation: 0, totalExperience: 0, avgExperience: 0, highestQualification: 'N/A'
      });
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hrms/employees');
      setEmployees(res.data.employees || []);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const [eduRes, expRes] = await Promise.all([
        api.get(`/hrms/employees/${selectedEmployee}/education`),
        api.get(`/hrms/employees/${selectedEmployee}/experience`)
      ]);

      const education = eduRes.data.education || [];
      const experience = expRes.data.experience || [];

      setEducationData(education);
      setExperienceData(experience);

      // Calculate total experience
      const totalMonths = experience.reduce((acc, exp) => {
        const start = new Date(exp.start_date);
        const end = exp.current || !exp.end_date ? new Date() : new Date(exp.end_date);
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        return acc + months;
      }, 0);

      setStats({
        totalEducation: education.length,
        totalExperience: experience.length,
        avgExperience: (totalMonths / 12).toFixed(1),
        highestQualification: education[0]?.degree || 'N/A'
      });
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEducation = () => {
    setEditMode(false);
    setEduForm({ degree: '', institution: '', university: '', specialization: '', start_year: '', end_year: '', percentage: '', grade: '' });
    setOpenEdu(true);
  };

  const handleEditEducation = (edu) => {
    setEditMode(true);
    setSelectedItem(edu);
    setEduForm(edu);
    setOpenEdu(true);
  };

  const handleDeleteEducation = async (edu) => {
    if (window.confirm('Delete this education record?')) {
      try {
        await api.delete(`/hrms/employees/education/${edu.id}`);
        setEducationData(educationData.filter(e => e.id !== edu.id));
        toast.success('Education record deleted');
      } catch (error) {
        toast.error('Failed to delete education record');
      }
    }
  };

  const handleSubmitEducation = async () => {
    if (!eduForm.degree || !eduForm.institution) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      if (editMode) {
        const res = await api.put(`/hrms/employees/education/${selectedItem.id}`, eduForm);
        setEducationData(educationData.map(e => e.id === selectedItem.id ? res.data.education : e));
        toast.success('Education updated successfully');
      } else {
        const res = await api.post(`/hrms/employees/${selectedEmployee}/education`, eduForm);
        setEducationData([res.data.education, ...educationData]); // Add to top for timeline
        toast.success('Education added successfully');
      }
      setOpenEdu(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save education');
    }
  };

  const handleAddExperience = () => {
    setEditMode(false);
    setExpForm({ company_name: '', designation: '', department: '', start_date: '', end_date: '', current: false, ctc: '', location: '', responsibilities: '', achievements: '' });
    setOpenExp(true);
  };

  const handleEditExperience = (exp) => {
    setEditMode(true);
    setSelectedItem(exp);
    setExpForm(exp);
    setOpenExp(true);
  };

  const handleDeleteExperience = async (exp) => {
    if (window.confirm('Delete this experience record?')) {
      try {
        await api.delete(`/hrms/employees/experience/${exp.id}`);
        setExperienceData(experienceData.filter(e => e.id !== exp.id));
        toast.success('Experience record deleted');
      } catch (error) {
        toast.error('Failed to delete experience record');
      }
    }
  };

  const handleSubmitExperience = async () => {
    if (!expForm.company_name || !expForm.designation || !expForm.start_date) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      // Clean up current boolean for end date logic
      const payload = { ...expForm };
      if (payload.current) payload.end_date = null;

      if (editMode) {
        const res = await api.put(`/hrms/employees/experience/${selectedItem.id}`, payload);
        setExperienceData(experienceData.map(e => e.id === selectedItem.id ? res.data.experience : e));
        toast.success('Experience updated successfully');
      } else {
        const res = await api.post(`/hrms/employees/${selectedEmployee}/experience`, payload);
        setExperienceData([res.data.experience, ...experienceData]);
        toast.success('Experience added successfully');
      }
      setOpenExp(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save experience');
    }
  };

  const calculateDuration = (start, end, current) => {
    const startDate = new Date(start);
    const endDate = current ? new Date() : new Date(end);
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years > 0 ? years + 'y ' : ''}${remainingMonths}m`;
  };

  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', borderRadius: 4, transition: 'transform 0.3s',
            boxShadow: '0 10px 20px rgba(118, 75, 162, 0.2)',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>Education Records</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.totalEducation}</Typography>
                </Box>
                <School sx={{ fontSize: 60, opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', 
            color: 'white', borderRadius: 4, transition: 'transform 0.3s',
            boxShadow: '0 10px 20px rgba(253, 160, 133, 0.2)',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>Experience Records</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.totalExperience}</Typography>
                </Box>
                <Work sx={{ fontSize: 60, opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
            color: 'white', borderRadius: 4, transition: 'transform 0.3s',
            boxShadow: '0 10px 20px rgba(56, 249, 215, 0.2)',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>Avg Experience</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.avgExperience}y</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 60, opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', 
            color: 'white', borderRadius: 4, transition: 'transform 0.3s',
            boxShadow: '0 10px 20px rgba(255, 8, 68, 0.2)',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>Highest Qualification</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 1 }}>
                    {stats.highestQualification.substring(0, 15)}{stats.highestQualification.length > 15 ? '...' : ''}
                  </Typography>
                </Box>
                <EmojiEvents sx={{ fontSize: 60, opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Employee Selection */}
      <Paper sx={{ 
        p: 2.5, 
        mb: 4, 
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f1f5f9', color: '#475569', display: 'flex' }}>
            <Search />
          </Box>
          <FormControl fullWidth sx={{ maxWidth: 400 }}>
            <InputLabel>Select an Employee to view details</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              label="Select an Employee to view details"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Select Employee</MenuItem>
              {employees.map(emp => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.user?.first_name} {emp.user?.last_name} ({emp.employee_code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {selectedEmployee && (
        <Grid container spacing={4}>
          {/* Education Timeline */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, color: '#1e293b' }}>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.50', color: 'primary.main', display: 'flex' }}><School /></Box>
                  Education History
                </Typography>
                <Button variant="outlined" size="small" startIcon={<Add />} onClick={handleAddEducation} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                  Add
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
              ) : educationData.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>No education records found.</Alert>
              ) : (
                <Timeline sx={{ p: 0, [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.2 } }}>
                  {educationData.map((edu, index) => (
                    <TimelineItem key={edu.id}>
                      <TimelineOppositeContent color="text.secondary" sx={{ pt: 2, pl: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1 }}>
                          {edu.end_year}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="primary" sx={{ boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)' }}>
                          <School fontSize="small" />
                        </TimelineDot>
                        {index < educationData.length - 1 && <TimelineConnector sx={{ bgcolor: 'rgba(99, 102, 241, 0.2)' }} />}
                      </TimelineSeparator>
                      <TimelineContent sx={{ pb: 4 }}>
                        <Card sx={{ 
                          borderRadius: 3, 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                          border: '1px solid #f1f5f9',
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: 'primary.300', boxShadow: '0 10px 20px rgba(99,102,241,0.1)' }
                        }}>
                          <CardContent sx={{ p: 2, pb: '16px !important' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>{edu.degree}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                  <AssuredWorkload fontSize="inherit" /> {edu.institution}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                                  {edu.specialization && <Chip label={edu.specialization} size="small" sx={{ bgcolor: 'primary.50', color: 'primary.700', fontWeight: 600 }} />}
                                  <Chip label={`${edu.percentage}%`} size="small" sx={{ bgcolor: 'success.50', color: 'success.700', fontWeight: 600 }} />
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton size="small" onClick={() => handleEditEducation(edu)} sx={{ bgcolor: 'rgba(99, 102, 241, 0.05)', color: 'primary.main', '&:hover': { bgcolor: 'primary.100' } }}><Edit fontSize="small" /></IconButton>
                                <IconButton size="small" onClick={() => handleDeleteEducation(edu)} sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)', color: 'error.main', '&:hover': { bgcolor: 'error.100' } }}><Delete fontSize="small" /></IconButton>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              )}
            </Paper>
          </Grid>

          {/* Experience Timeline */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, color: '#1e293b' }}>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'secondary.50', color: 'secondary.main', display: 'flex' }}><Work /></Box>
                  Work Experience
                </Typography>
                <Button variant="outlined" color="secondary" size="small" startIcon={<Add />} onClick={handleAddExperience} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                  Add
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
              ) : experienceData.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>No experience records found.</Alert>
              ) : (
                <Timeline sx={{ p: 0, [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.2 } }}>
                  {experienceData.map((exp, index) => (
                    <TimelineItem key={exp.id}>
                      <TimelineOppositeContent color="text.secondary" sx={{ pt: 2, pl: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block', mb: 0.5 }}>
                          {new Date(exp.start_date).getFullYear()}
                        </Typography>
                        <br />
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          {calculateDuration(exp.start_date, exp.end_date, exp.current)}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="secondary" sx={{ boxShadow: '0 0 0 4px rgba(192, 38, 211, 0.1)' }}>
                          <Business fontSize="small" />
                        </TimelineDot>
                        {index < experienceData.length - 1 && <TimelineConnector sx={{ bgcolor: 'rgba(192, 38, 211, 0.2)' }} />}
                      </TimelineSeparator>
                      <TimelineContent sx={{ pb: 4 }}>
                        <Card sx={{ 
                          borderRadius: 3, 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                          border: '1px solid #f1f5f9',
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: 'secondary.300', boxShadow: '0 10px 20px rgba(192, 38, 211,0.1)' }
                        }}>
                          <CardContent sx={{ p: 2, pb: '16px !important' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>{exp.designation}</Typography>
                                <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 600, mb: 1 }}>{exp.company_name}</Typography>
                                
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5, mb: 1.5 }}>
                                  {exp.current && <Chip label="Present" size="small" sx={{ bgcolor: 'secondary.50', color: 'secondary.700', fontWeight: 600 }} />}
                                  <Chip label={exp.location} size="small" variant="outlined" sx={{ color: 'text.secondary', borderColor: '#cbd5e1' }} />
                                </Box>

                                {exp.achievements && (
                                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, color: 'text.secondary', mt: 1, bgcolor: '#f8fafc', p: 1, borderRadius: 2 }}>
                                    <AutoAwesome fontSize="inherit" sx={{ color: '#f59e0b', mt: 0.2 }} /> {exp.achievements}
                                  </Typography>
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton size="small" onClick={() => handleEditExperience(exp)} sx={{ bgcolor: 'rgba(192, 38, 211, 0.05)', color: 'secondary.main', '&:hover': { bgcolor: 'secondary.100' } }}><Edit fontSize="small" /></IconButton>
                                <IconButton size="small" onClick={() => handleDeleteExperience(exp)} sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)', color: 'error.main', '&:hover': { bgcolor: 'error.100' } }}><Delete fontSize="small" /></IconButton>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Education Dialog */}
      <Dialog open={openEdu} onClose={() => setOpenEdu(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{editMode ? 'Edit Education' : 'Add Education Record'}</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Degree *</InputLabel>
                <Select
                  value={eduForm.degree}
                  onChange={e => setEduForm({ ...eduForm, degree: e.target.value })}
                  label="Degree *"
                  sx={{ borderRadius: 2 }}
                >
                  {degrees.map(deg => <MenuItem key={deg} value={deg}>{deg}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Institution Name *" value={eduForm.institution} onChange={e => setEduForm({ ...eduForm, institution: e.target.value })} InputProps={{ sx: { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="University/Board" value={eduForm.university} onChange={e => setEduForm({ ...eduForm, university: e.target.value })} InputProps={{ sx: { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Specialization" value={eduForm.specialization} onChange={e => setEduForm({ ...eduForm, specialization: e.target.value })} InputProps={{ sx: { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Start Year" type="number" value={eduForm.start_year} onChange={e => setEduForm({ ...eduForm, start_year: e.target.value })} InputProps={{ sx: { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="End Year" type="number" value={eduForm.end_year} onChange={e => setEduForm({ ...eduForm, end_year: e.target.value })} InputProps={{ sx: { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Percentage / CGPA" value={eduForm.percentage} onChange={e => setEduForm({ ...eduForm, percentage: e.target.value })} InputProps={{ sx: { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Grade" value={eduForm.grade} onChange={e => setEduForm({ ...eduForm, grade: e.target.value })} placeholder="e.g., First Class" InputProps={{ sx: { borderRadius: 2 } }} />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button fullWidth variant="outlined" onClick={() => setOpenEdu(false)} sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
            <Button fullWidth variant="contained" onClick={handleSubmitEducation} sx={{ borderRadius: 2, fontWeight: 600 }}>
              {editMode ? 'Update Record' : 'Save Record'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Experience Dialog */}
      <Dialog open={openExp} onClose={() => setOpenExp(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{editMode ? 'Edit Experience' : 'Add Work Experience'}</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Company Name *" value={expForm.company_name} onChange={e => setExpForm({ ...expForm, company_name: e.target.value })} InputProps={{ sx: { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Designation *" value={expForm.designation} onChange={e => setExpForm({ ...expForm, designation: e.target.value })} InputProps={{ sx: { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Department" value={expForm.department} onChange={e => setExpForm({ ...expForm, department: e.target.value })} InputProps={{ sx: { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="Start Date *" value={expForm.start_date} onChange={e => setExpForm({ ...expForm, start_date: e.target.value })} InputLabelProps={{ shrink: true }} InputProps={{ sx: { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="End Date" value={expForm.end_date} onChange={e => setExpForm({ ...expForm, end_date: e.target.value })} InputLabelProps={{ shrink: true }} disabled={expForm.current} InputProps={{ sx: { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant={expForm.current ? 'contained' : 'outlined'}
                color="secondary"
                onClick={() => setExpForm({ ...expForm, current: !expForm.current })}
                fullWidth
                sx={{ height: '100%', borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
              >
                {expForm.current ? 'Currently Working Here' : 'Mark as Current'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Location" value={expForm.location} onChange={e => setExpForm({ ...expForm, location: e.target.value })} InputProps={{ sx: { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Key Responsibilities" value={expForm.responsibilities} onChange={e => setExpForm({ ...expForm, responsibilities: e.target.value })} multiline rows={2} InputProps={{ sx: { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Key Achievements" value={expForm.achievements} onChange={e => setExpForm({ ...expForm, achievements: e.target.value })} multiline rows={2} InputProps={{ sx: { borderRadius: 2 } }} />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button fullWidth variant="outlined" onClick={() => setOpenExp(false)} sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
            <Button fullWidth variant="contained" color="secondary" onClick={handleSubmitExperience} sx={{ borderRadius: 2, fontWeight: 600 }}>
              {editMode ? 'Update Record' : 'Save Record'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
