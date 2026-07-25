import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent, Button,
  CircularProgress, Grid, IconButton, Alert, Chip
} from '@mui/material';
import { ArrowBack, Refresh, Download, EmojiEvents } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function StudentCertificates() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('student_token');
      const res = await api.get('/student-portal/certificates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertificates(res.data.certificates);
    } catch (error) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 3 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/student-portal/dashboard')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" fontWeight="bold">My Certificates</Typography>
          </Box>
          <IconButton onClick={fetchCertificates}>
            <Refresh />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {certificates.length > 0 ? (
              certificates.map((cert) => (
                <Grid item xs={12} md={6} key={cert.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ bgcolor: 'success.light', p: 1.5, borderRadius: 2 }}>
                          <EmojiEvents sx={{ color: 'success.dark', fontSize: 32 }} />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">{cert.certificate_type}</Typography>
                          <Chip label={cert.certificate_number} size="small" sx={{ mt: 0.5 }} />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Issue Date: {new Date(cert.issue_date).toLocaleDateString('en-IN')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Valid Until: {cert.valid_until ? new Date(cert.valid_until).toLocaleDateString('en-IN') : 'Lifetime'}
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Download />}
                        href={cert.certificate_url}
                        target="_blank"
                        sx={{ mt: 2 }}
                      >
                        Download Certificate
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="info">No certificates issued yet</Alert>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
