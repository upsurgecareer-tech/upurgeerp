import { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Paper, Tabs, Tab } from '@mui/material';
import { Email, Sms, WhatsApp, Campaign, Notifications, Send, FormatQuote } from '@mui/icons-material';

export default function CommunicationManagement() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Broadcast Hub', icon: <Campaign /> },
    { label: 'Email Campaigns', icon: <Email /> },
    { label: 'SMS & WhatsApp', icon: <WhatsApp /> },
    { label: 'Auto Reminders', icon: <Notifications /> }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto" }}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'error.light', color: 'error.main', display: 'flex' }}>
            <Campaign fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Internal Communication</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage company-wide announcements, newsletters, and automated notifications.</Typography>
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
                '&.Mui-selected': { color: 'error.main' }
              },
              '& .MuiTabs-indicator': { height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3, bgcolor: 'error.main' }
            }}
          >
            {tabs.map((tab, idx) => <Tab key={idx} icon={tab.icon} iconPosition="start" label={tab.label} />)}
          </Tabs>
        </Paper>

        <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
          {activeTab === 0 && <BroadcastHub />}
          {activeTab === 1 && (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
              <Email sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569' }}>Email Templates & Dispatch</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Send HTML rich emails and newsletters to specific departments.</Typography>
              <Button variant="contained" sx={{ mt: 3, borderRadius: 2 }}>Compose Email</Button>
            </Paper>
          )}
          {activeTab === 2 && (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
              <WhatsApp sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569' }}>Instant Messaging</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Trigger instant SMS alerts and WhatsApp templates for urgent updates.</Typography>
              <Button variant="contained" sx={{ mt: 3, borderRadius: 2 }}>New SMS/WhatsApp</Button>
            </Paper>
          )}
          {activeTab === 3 && (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
              <Notifications sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569' }}>Automated Reminders</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Set up triggers for birthdays, work anniversaries, and timesheet reminders.</Typography>
              <Button variant="contained" sx={{ mt: 3, borderRadius: 2 }}>Configure Rules</Button>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function BroadcastHub() {
  const cards = [
    { title: 'New Announcement', desc: 'Pin to company portal', icon: <Campaign />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
    { title: 'Quick Poll', desc: 'Gather employee feedback', icon: <FormatQuote />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { title: 'Send Alert', desc: 'Emergency SMS/WhatsApp', icon: <Sms />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { title: 'Drafts', desc: 'Saved communications', icon: <Send />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' }
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((c, i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' } }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: c.bg, color: c.color, mb: 1 }}>
                {c.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1, mb: 0.5 }}>{c.title}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#64748b' }}>{c.desc}</Typography>
              <Button fullWidth variant="outlined" sx={{ mt: 2, borderRadius: 2, borderColor: '#e2e8f0', color: '#475569' }}>Go</Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
