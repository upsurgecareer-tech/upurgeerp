import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, Chip, CircularProgress, Tabs, Tab, IconButton, Card, CardContent, CardMedia, CardActions } from '@mui/material';
import { PlayCircleOutline, PictureAsPdf, Download, Search, Add as AddIcon, Videocam } from '@mui/icons-material';
import Layout from '../../components/Layout';
import { toast } from 'react-toastify';
import api from '../../services/api';

const LMSDashboard = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [notes, setNotes] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vidRes, noteRes] = await Promise.all([
        api.get('/lms/videos'),
        api.get('/lms/notes')
      ]);
      setVideos(vidRes.data.videos || []);
      setNotes(noteRes.data.materials || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load LMS data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout title="LMS & Study Materials">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
            Study Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Access your Video Lectures and PDF Notes here.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ px: 3, py: 1, borderRadius: 2 }}>
            Upload Material
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)}
          sx={{ bgcolor: '#f8fafc', borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Videocam />} iconPosition="start" label="Video Lectures" sx={{ fontWeight: 600 }} />
          <Tab icon={<PictureAsPdf />} iconPosition="start" label="PDF Notes" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {tab === 0 && (
            <Grid container spacing={3}>
              {videos.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
                    <Typography variant="h6" color="text.secondary">No video lectures found.</Typography>
                  </Paper>
                </Grid>
              ) : (
                videos.map(video => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
                    <Card sx={{ 
                      borderRadius: 3, 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={video.thumbnail_url || 'https://via.placeholder.com/300x140?text=Video+Lecture'}
                        alt={video.title}
                      />
                      <CardContent>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1, textTransform: 'uppercase', fontWeight: 700, fontSize: '0.7rem' }}>
                          {video.subject || 'General'}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2 }}>
                          {video.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {video.description || 'No description available.'}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                        <Chip label={`${Math.floor((video.duration_seconds || 0)/60)} mins`} size="small" />
                        <Button size="small" variant="contained" startIcon={<PlayCircleOutline />} sx={{ borderRadius: 2 }}>
                          Watch
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {tab === 1 && (
            <Grid container spacing={3}>
              {notes.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
                    <Typography variant="h6" color="text.secondary">No PDF notes found.</Typography>
                  </Paper>
                </Grid>
              ) : (
                notes.map(note => (
                  <Grid item xs={12} md={6} lg={4} key={note.id}>
                    <Paper sx={{ 
                      p: 3, 
                      borderRadius: 3, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, bgcolor: '#fef2f2', color: '#ef4444', borderRadius: 2 }}>
                          <PictureAsPdf fontSize="large" />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="error" sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.7rem' }}>
                            {note.subject || 'General'}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {note.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Batch: {note.batch?.name || 'All Batches'}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton color="primary" onClick={() => window.open(note.file_url, '_blank')} sx={{ bgcolor: '#eff6ff' }}>
                        <Download />
                      </IconButton>
                    </Paper>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </Box>
      )}
    </Layout>
  );
};

export default LMSDashboard;
