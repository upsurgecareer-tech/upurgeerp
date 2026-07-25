import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent, Button,
  CircularProgress, Grid, IconButton, Alert, Chip
} from '@mui/material';
import { ArrowBack, Refresh, Download, PictureAsPdf, VideoLibrary, Description } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function StudentStudyMaterials() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('student_token');
      const res = await api.get('/student-portal/study-materials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(res.data.materials);
    } catch (error) {
      toast.error('Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'PDF': return <PictureAsPdf />;
      case 'Video': return <VideoLibrary />;
      default: return <Description />;
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
            <Typography variant="h4" fontWeight="bold">Study Materials</Typography>
          </Box>
          <IconButton onClick={fetchMaterials}>
            <Refresh />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {materials.length > 0 ? (
              materials.map((material) => (
                <Grid item xs={12} md={6} key={material.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ bgcolor: 'primary.light', p: 1, borderRadius: 1 }}>
                          {getIcon(material.type)}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">{material.title}</Typography>
                          <Chip label={material.type} size="small" sx={{ mt: 0.5 }} />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {material.description}
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Download />}
                        href={material.file_url}
                        target="_blank"
                      >
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="info">No study materials available</Alert>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
