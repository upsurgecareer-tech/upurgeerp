import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Paper, CircularProgress,
  Alert, Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Dialog, DialogTitle, DialogContent, TextField, Avatar, InputAdornment
} from '@mui/material';
import { Work, Add, Search, People } from '@mui/icons-material';
import api from '../../services/api';

export default function Designations() {
  const [designations, setDesignations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/hrms/designations');
      const data = res.data.designations || [];
      setDesignations(data);
      setFiltered(data);
    } catch {
      // If API fails, show empty state
      setDesignations([]);
      setFiltered([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    if (!search) { setFiltered(designations); return; }
    setFiltered(designations.filter(d =>
      d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.department_name?.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, designations]);

  const colors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316','#14b8a6'];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(249,115,22,0.12)', color: '#f97316', display: 'flex' }}>
          <Work fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Designations</Typography>
          <Typography variant="body2" color="text.secondary">All active designations across departments (pulled from employee records).</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField size="small" placeholder="Search designation or department..." value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>, sx: { borderRadius: 2, minWidth: 300 } }} />
        <Chip label={`${filtered.length} designations`} sx={{ bgcolor: '#eff6ff', color: '#3b82f6', fontWeight: 700 }} />
      </Box>

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        : filtered.length === 0 ? (
          <Alert severity="info">
            {search ? 'No designations match your search.' : 'No designations found. Add employees with designations in the Employees module to see them here.'}
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {filtered.map((d, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <Card sx={{ borderRadius: 3, border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' } }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: `${colors[i % colors.length]}22`, color: colors[i % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                      <Work fontSize="large" />
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b', mb: 0.5 }}>{d.title}</Typography>
                    <Chip label={d.department_name || 'No Dept'} size="small" sx={{ bgcolor: `${colors[i % colors.length]}11`, color: colors[i % colors.length], fontWeight: 600 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
    </Box>
  );
}
