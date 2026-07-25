import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Tabs, Tab, Grid, Card, CardContent,
  Button, Chip, Avatar, CircularProgress, Alert, LinearProgress, Table,
  TableBody, TableCell, TableHead, TableRow, IconButton, Divider
} from '@mui/material';
import {
  Person, Payment, EventNote, Description, EmojiEvents, ArrowBack,
  Download, CheckCircle, Cancel, Phone, Email, Cake, Home, People
} from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [fees, setFees] = useState(null);
  const [documents, setDocuments] = useState(0);
  const [certificates, setCertificates] = useState(0);
  const [certificateEligible, setCertificateEligible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students/${id}`);
      setStudent(res.data.student);
      setAttendance(res.data.attendance);
      setFees(res.data.fees);
      setDocuments(res.data.documents);
      setCertificates(res.data.certificates);
      setCertificateEligible(res.data.certificateEligible);
    } catch (error) {
      toast.error('Failed to fetch student details');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateIDCard = async () => {
    try {
      const res = await api.post(`/students/${id}/generate-idcard`);
      toast.success('ID Card generated successfully');
      window.open(res.data.downloadUrl, '_blank');
    } catch (error) {
      toast.error('Failed to generate ID card');
    }
  };

  if (loading) {
    return (
      <Layout title="Student Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout title="Student Details">
        <Alert severity="error">Student not found</Alert>
      </Layout>
    );
  }

  const admission = student.admissions?.[0];

  return (
    <Layout title="Student Details">
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/students')}>
              <ArrowBack />
            </IconButton>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 28 }}>
              {student.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">{student.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {student.admission_no} • {admission?.coursePackage?.name || 'No Course Assigned'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Download />} onClick={handleGenerateIDCard}>
              Generate ID Card
            </Button>
            <Button variant="contained" onClick={() => navigate(`/students`)}>
              Edit Profile
            </Button>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: 'success.light', p: 1.5, borderRadius: 2 }}>
                    <EventNote sx={{ color: 'success.dark' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Attendance</Typography>
                    <Typography variant="h5" fontWeight="bold">{attendance?.percentage || 0}%</Typography>
                    <Typography variant="caption">{attendance?.present || 0}/{attendance?.total || 0} classes</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: fees?.status === 'Paid' ? 'success.light' : 'warning.light', p: 1.5, borderRadius: 2 }}>
                    <Payment sx={{ color: fees?.status === 'Paid' ? 'success.dark' : 'warning.dark' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Fee Status</Typography>
                    <Typography variant="h5" fontWeight="bold">₹{fees?.pending || 0}</Typography>
                    <Typography variant="caption">Pending of ₹{fees?.total || 0}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: 'info.light', p: 1.5, borderRadius: 2 }}>
                    <Description sx={{ color: 'info.dark' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Documents</Typography>
                    <Typography variant="h5" fontWeight="bold">{documents}</Typography>
                    <Typography variant="caption">Uploaded</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: certificateEligible ? 'success.light' : 'error.light', p: 1.5, borderRadius: 2 }}>
                    <EmojiEvents sx={{ color: certificateEligible ? 'success.dark' : 'error.dark' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Certificates</Typography>
                    <Typography variant="h5" fontWeight="bold">{certificates}</Typography>
                    <Typography variant="caption">
                      {certificateEligible ? 'Eligible' : 'Not Eligible'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab icon={<Person />} label="Profile" />
            <Tab icon={<Payment />} label="Fees" />
            <Tab icon={<EventNote />} label="Attendance" />
            <Tab icon={<Description />} label="Documents" />
            <Tab icon={<EmojiEvents />} label="Certificates" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Personal Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Phone fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Mobile</Typography>
                    <Typography variant="body1">{student.mobile}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Email fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{student.email || 'N/A'}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Cake fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body1">
                      {student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Person fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Gender</Typography>
                    <Typography variant="body1">{student.gender || 'N/A'}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Home fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Address</Typography>
                    <Typography variant="body1">{student.address || 'N/A'}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CheckCircle fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Chip label={student.status || 'Active'} color="success" size="small" />
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Parent/Guardian Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <People fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Parent Name</Typography>
                    <Typography variant="body1">{student.parent_name || 'N/A'}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Phone fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Parent Mobile</Typography>
                    <Typography variant="body1">{student.parent_mobile || 'N/A'}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {admission && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Course Information</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary">Course</Typography>
                    <Typography variant="body1">{admission.coursePackage?.name || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary">Batch</Typography>
                    <Typography variant="body1">{admission.batch?.name || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary">Admission Date</Typography>
                    <Typography variant="body1">
                      {admission.admission_date ? new Date(admission.admission_date).toLocaleDateString('en-IN') : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>
        )}

        {activeTab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Fee Details</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Total Fee</Typography>
                    <Typography variant="h5" fontWeight="bold">₹{fees?.total || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Paid</Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">₹{fees?.paid || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Pending</Typography>
                    <Typography variant="h5" fontWeight="bold" color="error.main">₹{fees?.pending || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Alert severity={fees?.status === 'Paid' ? 'success' : 'warning'}>
              Fee Status: {fees?.status || 'Pending'}
            </Alert>
          </Paper>
        )}

        {activeTab === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Attendance Summary</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Overall Attendance</Typography>
                <Typography variant="body2" fontWeight="bold">{attendance?.percentage || 0}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={parseFloat(attendance?.percentage || 0)}
                sx={{ height: 10, borderRadius: 5 }}
                color={parseFloat(attendance?.percentage || 0) >= 75 ? 'success' : 'error'}
              />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Total Classes</Typography>
                <Typography variant="h6">{attendance?.total || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Present</Typography>
                <Typography variant="h6" color="success.main">{attendance?.present || 0}</Typography>
              </Grid>
            </Grid>
            {parseFloat(attendance?.percentage || 0) < 75 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Attendance is below 75%. Student may not be eligible for certification.
              </Alert>
            )}
          </Paper>
        )}

        {activeTab === 3 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Documents</Typography>
            <Divider sx={{ mb: 2 }} />
            <Alert severity="info">
              Total {documents} document(s) uploaded. View all documents from Documents page.
            </Alert>
          </Paper>
        )}

        {activeTab === 4 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Certificates</Typography>
            <Divider sx={{ mb: 2 }} />
            <Alert severity={certificateEligible ? 'success' : 'warning'}>
              {certificateEligible
                ? `Student is eligible for certification. ${certificates} certificate(s) issued.`
                : 'Student is not eligible for certification. Requirements: 75%+ attendance and full fee payment.'}
            </Alert>
          </Paper>
        )}
      </Container>
    </Layout>
  );
}
