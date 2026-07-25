import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent, Button,
  CircularProgress, Grid, IconButton, TextField, Avatar
} from '@mui/material';
import { ArrowBack, Edit, Save } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function StudentProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    email: '',
    mobile: '',
    address: '',
    parent_name: '',
    parent_mobile: ''
  });
  const studentInfo = JSON.parse(localStorage.getItem('student_info') || '{}');

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('student_token');
      await api.put('/student-portal/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 3 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/student-portal/dashboard')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" fontWeight="bold">My Profile</Typography>
          </Box>
          {!editing && (
            <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          )}
        </Box>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
                {studentInfo.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">{studentInfo.name}</Typography>
                <Typography variant="body2" color="text.secondary">{studentInfo.admission_no}</Typography>
                <Typography variant="body2" color="text.secondary">{studentInfo.course}</Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mobile"
                  name="mobile"
                  value={profile.mobile}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  disabled={!editing}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Parent Name"
                  name="parent_name"
                  value={profile.parent_name}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Parent Mobile"
                  name="parent_mobile"
                  value={profile.parent_mobile}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>
            </Grid>

            {editing && (
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => setEditing(false)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
