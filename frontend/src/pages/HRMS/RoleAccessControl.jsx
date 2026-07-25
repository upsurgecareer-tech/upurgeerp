import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Paper, CircularProgress,
  Alert, Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Avatar, Divider, Tooltip, IconButton
} from '@mui/material';
import { Security, People, AdminPanelSettings, Badge, Verified } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const roleColor = {
  admin: { bg: '#fee2e2', color: '#991b1b', icon: '👑' },
  manager: { bg: '#fef9c3', color: '#854d0e', icon: '🎯' },
  hr: { bg: '#eff6ff', color: '#1d4ed8', icon: '👥' },
  staff: { bg: '#f0fdf4', color: '#166534', icon: '🧑‍💼' },
  teacher: { bg: '#f5f3ff', color: '#6d28d9', icon: '📚' },
  student: { bg: '#ecfdf5', color: '#065f46', icon: '🎓' },
};

export default function RoleAccessControl() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch users with their roles
      const [usersRes, rolesRes] = await Promise.allSettled([
        api.get('/staff/list'),
        api.get('/auth/roles').catch(() => api.get('/staff/roles'))
      ]);

      const usersData = usersRes.status === 'fulfilled' ? (usersRes.value.data.staff || usersRes.value.data.users || []) : [];
      const rolesData = rolesRes.status === 'fulfilled' ? (rolesRes.value.data.roles || []) : [];

      setUsers(usersData);
      setRoles(rolesData);

      // Calculate stats
      const s = {};
      usersData.forEach(u => {
        const r = u.role?.name || u.role || 'Unknown';
        s[r] = (s[r] || 0) + 1;
      });
      setStats(s);
    } catch (e) {
      toast.error('Failed to load user data');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const getRoleStyle = (roleName) => {
    const key = (roleName || '').toLowerCase();
    for (const [k, v] of Object.entries(roleColor)) {
      if (key.includes(k)) return v;
    }
    return { bg: '#f1f5f9', color: '#475569', icon: '👤' };
  };

  const roleGroups = Object.entries(stats).sort((a, b) => b[1] - a[1]);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(239,68,68,0.12)', color: '#ef4444', display: 'flex' }}>
          <Security fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Role & Access Control</Typography>
          <Typography variant="body2" color="text.secondary">View user roles and access levels across the system.</Typography>
        </Box>
      </Box>

      {/* Role Summary Cards */}
      {roleGroups.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {roleGroups.slice(0, 6).map(([role, count]) => {
            const style = getRoleStyle(role);
            return (
              <Grid item xs={6} sm={4} md={2} key={role}>
                <Card sx={{ bgcolor: style.bg, border: `1px solid ${style.color}22`, borderRadius: 3, textAlign: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                  <CardContent sx={{ py: '12px !important' }}>
                    <Typography sx={{ fontSize: '1.5rem' }}>{style.icon}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: style.color }}>{count}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'capitalize' }}>{role}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>All Users & Roles ({users.length})</Typography>

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        : users.length === 0 ? <Alert severity="info">No users found.</Alert>
        : (
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
                    {['User', 'Email', 'Role', 'Branch', 'Status'].map(h =>
                      <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(u => {
                    const roleName = u.role?.name || u.role || 'Unknown';
                    const style = getRoleStyle(roleName);
                    return (
                      <TableRow key={u.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: style.color, width: 36, height: 36, fontSize: '0.85rem' }}>
                              {u.first_name?.[0]}{u.last_name?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={700}>{u.first_name} {u.last_name}</Typography>
                              <Typography variant="caption" color="text.secondary">{u.username || u.phone}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell><Typography variant="body2">{u.email || '—'}</Typography></TableCell>
                        <TableCell>
                          <Chip label={`${style.icon} ${roleName}`} size="small" sx={{ fontWeight: 700, bgcolor: style.bg, color: style.color }} />
                        </TableCell>
                        <TableCell>{u.branch?.name || '—'}</TableCell>
                        <TableCell>
                          <Chip label={u.is_active ? 'Active' : 'Inactive'} size="small" sx={{ fontWeight: 700, bgcolor: u.is_active ? '#dcfce7' : '#fee2e2', color: u.is_active ? '#166534' : '#991b1b' }} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
    </Box>
  );
}
