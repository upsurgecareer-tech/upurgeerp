import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, Chip, CircularProgress, IconButton } from '@mui/material';
import { MenuBook, AssignmentTurnedIn, WarningAmber, Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import Layout from '../../components/Layout';
import { toast } from 'react-toastify';
import api from '../../services/api';

const StatCard = ({ title, value, icon, color, gradient }) => (
  <Paper sx={{ 
    p: 3, 
    borderRadius: 3, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    background: gradient || '#fff',
    color: gradient ? '#fff' : 'inherit',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s',
    '&:hover': { transform: 'translateY(-4px)' }
  }}>
    <Box>
      <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
    </Box>
    <Box sx={{ 
      p: 1.5, 
      borderRadius: '12px', 
      bgcolor: gradient ? 'rgba(255,255,255,0.2)' : `${color}15`, 
      color: gradient ? '#fff' : color 
    }}>
      {icon}
    </Box>
  </Paper>
);

const LibraryDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [overdue, setOverdue] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, issuesRes, overdueRes] = await Promise.all([
        api.get('/library/books'),
        api.get('/library/issues'),
        api.get('/library/issues/overdue')
      ]);
      setBooks(booksRes.data);
      setIssues(issuesRes.data);
      setOverdue(overdueRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load library data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout title="Library Management">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Library Central
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your books, issues, and track overdue items.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={fetchData} sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ px: 3, py: 1, borderRadius: 2 }}>
            Add Book
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <StatCard 
                title="Total Books" 
                value={books.reduce((acc, curr) => acc + curr.quantity, 0)}
                icon={<MenuBook fontSize="large" />} 
                gradient="linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard 
                title="Active Issues" 
                value={issues.filter(i => i.status === 'Issued').length}
                icon={<AssignmentTurnedIn fontSize="large" />} 
                color="#0ea5e9"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard 
                title="Overdue Books" 
                value={overdue.length}
                icon={<WarningAmber fontSize="large" />} 
                color="#ef4444"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Recently Added Books</Typography>
                {books.slice(0, 5).map(book => (
                  <Box key={book.id} sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #f1f5f9' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600">{book.title}</Typography>
                      <Typography variant="body2" color="text.secondary">By {book.author}</Typography>
                    </Box>
                    <Chip 
                      label={`${book.available_quantity} available`} 
                      color={book.available_quantity > 0 ? 'success' : 'error'} 
                      size="small" 
                    />
                  </Box>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#fff0f2', border: '1px solid #ffe4e6' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#be185d' }}>Critical Overdue</Typography>
                {overdue.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No overdue books!</Typography>
                ) : (
                  overdue.slice(0, 5).map(issue => (
                    <Box key={issue.id} sx={{ mb: 2, p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <Typography variant="subtitle2" fontWeight="600" noWrap>{issue.book?.title || 'Unknown Book'}</Typography>
                      <Typography variant="caption" color="error" fontWeight="600">
                        Due: {new Date(issue.due_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Layout>
  );
};

export default LibraryDashboard;
