import { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Paper, Tabs, Tab, Chip } from '@mui/material';
import { PhoneAndroid, Fingerprint, Email, Payment, Api, CloudSync, AppShortcut } from '@mui/icons-material';

export default function MobileIntegration() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Integrations Hub', icon: <Api /> },
    { label: 'Mobile Apps', icon: <AppShortcut /> },
    { label: 'Cloud Sync', icon: <CloudSync /> }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto" }}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.light', color: 'success.main', display: 'flex' }}>
            <Api fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Integrations Ecosystem</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Connect third-party services, manage API keys, and configure mobile apps.</Typography>
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
                '&.Mui-selected': { color: 'success.main' }
              },
              '& .MuiTabs-indicator': { height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3, bgcolor: 'success.main' }
            }}
          >
            {tabs.map((tab, idx) => <Tab key={idx} icon={tab.icon} iconPosition="start" label={tab.label} />)}
          </Tabs>
        </Paper>

        <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
          {activeTab === 0 && <IntegrationHub />}
          {activeTab === 1 && (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
              <AppShortcut sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569' }}>Mobile Applications</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Configure push notifications and branding for iOS/Android employee apps.</Typography>
              <Button variant="contained" color="success" sx={{ mt: 3, borderRadius: 2 }}>App Settings</Button>
            </Paper>
          )}
          {activeTab === 2 && (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
              <CloudSync sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569' }}>Data Synchronization</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Manage Active Directory, Google Workspace, and biometric hardware sync schedules.</Typography>
              <Button variant="contained" color="success" sx={{ mt: 3, borderRadius: 2 }}>Sync Now</Button>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function IntegrationHub() {
  const services = [
    { title: 'Biometric Devices', desc: 'Fingerprint, face recognition, RFID', icon: <Fingerprint />, color: '#8b5cf6', status: 'Connected' },
    { title: 'Payment Gateways', desc: 'Stripe, Razorpay for payroll', icon: <Payment />, color: '#10b981', status: 'Connected' },
    { title: 'Email Servers', desc: 'SMTP configuration, templates', icon: <Email />, color: '#f59e0b', status: 'Pending' },
    { title: 'REST Webhooks', desc: 'Real-time event broadcasting', icon: <Api />, color: '#3b82f6', status: 'Connected' }
  ];

  return (
    <Grid container spacing={3}>
      {services.map((s, i) => (
        <Grid item xs={12} md={6} key={i}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' } }}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${s.color}15`, color: s.color }}>
                  {s.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>{s.title}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>{s.desc}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                <Chip label={s.status} size="small" color={s.status === 'Connected' ? 'success' : 'warning'} sx={{ fontWeight: 600 }} />
                <Button size="small" variant="text" sx={{ color: '#64748b' }}>Configure</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
