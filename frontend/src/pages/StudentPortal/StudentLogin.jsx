import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button,
  InputAdornment, IconButton, Alert, CircularProgress, Card, CardContent
} from '@mui/material';
import { Visibility, VisibilityOff, School, Login as LoginIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import logo from '../../assets/upsurgelogo.png';

export default function StudentLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ admission_no: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.admission_no || !formData.password) {
      setError('Please enter admission number and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const res = await api.post('/student-portal/login', formData);
      
      localStorage.setItem('student_token', res.data.token);
      localStorage.setItem('student_info', JSON.stringify(res.data.student));
      
      toast.success('Login successful!');
      navigate('/student-portal/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={10} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <img src={logo} alt="Logo" style={{ height: 60, marginBottom: 16 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Student Portal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Login to access your dashboard
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Admission Number"
                name="admission_no"
                value={formData.admission_no}
                onChange={handleChange}
                margin="normal"
                required
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <School color="action" />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Default password: student123
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                Contact admin if you forgot your credentials
              </Typography>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/login')}
              >
                Back to Admin Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
