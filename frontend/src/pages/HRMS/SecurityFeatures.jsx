import { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Paper, Tabs, Tab, Switch, Chip } from '@mui/material';
import { Lock, VpnKey, History, TrackChanges, Shield, SecurityUpdateGood } from '@mui/icons-material';

export default function SecurityFeatures() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Security Dashboard', icon: <Shield /> },
    { label: 'Authentication', icon: <VpnKey /> },
    { label: 'Compliance & Audit', icon: <History /> }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto" }}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.main', display: 'flex' }}>
            <Lock fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Security & Compliance</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage 2FA, session policies, and monitor system audit logs.</Typography>
          </Box>
        </Box>

        <Paper sx={{ 
          mb: 3, 
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)} 
            variant="scrollable" 
            scrollButtons="auto"
            sx={{
              px: 2,
              '& .MuiTab-root': {
                minHeight: 64,
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'none',
                fontSize: '0.95rem',
                '&.Mui-selected': { color: 'warning.main' }
              },
              '& .MuiTabs-indicator': { height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3, bgcolor: 'warning.main' }
            }}
          >
            {tabs.map((tab, idx) => <Tab key={idx} icon={tab.icon} iconPosition="start" label={tab.label} />)}
          </Tabs>
        </Paper>

        <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
          {activeTab === 0 && <SecurityDashboard />}
          {activeTab === 1 && (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
              <VpnKey sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569' }}>Authentication Policies</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Configure SSO, Password Complexity, and Session Timeouts.</Typography>
              <Button variant="contained" color="warning" sx={{ mt: 3, borderRadius: 2 }}>Edit Policies</Button>
            </Paper>
          )}
          {activeTab === 2 && (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
              <History sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569' }}>Audit Trail</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Export verifiable logs of administrative actions and data access.</Typography>
              <Button variant="contained" color="warning" sx={{ mt: 3, borderRadius: 2 }}>Export Logs</Button>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function SecurityDashboard() {
  const features = [
    { title: 'Two-Factor Auth', desc: 'Enforce 2FA for all staff', icon: <SecurityUpdateGood />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', active: true },
    { title: 'IP Whitelisting', desc: 'Restrict access by network', icon: <TrackChanges />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', active: false },
    { title: 'Data Encryption', desc: 'At-rest database encryption', icon: <Lock />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', active: true },
    { title: 'Login Alerts', desc: 'Notify on new device login', icon: <History />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', active: true }
  ];

  return (
    <Grid container spacing={3}>
      {features.map((f, i) => (
        <Grid item xs={12} sm={6} key={i}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: f.bg, color: f.color }}>
                  {f.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>{f.title}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>{f.desc}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                <Switch defaultChecked={f.active} color="warning" />
                <Chip label={f.active ? 'Active' : 'Disabled'} size="small" color={f.active ? 'success' : 'default'} sx={{ fontWeight: 600 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
