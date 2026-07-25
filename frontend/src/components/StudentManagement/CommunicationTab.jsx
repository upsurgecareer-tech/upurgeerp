import { useState } from 'react';
import {
  Box, Typography, Button, Paper, Grid, TextField, MenuItem, Chip, Alert
} from '@mui/material';
import { Message, Send, Email, Sms } from '@mui/icons-material';
import { toast } from 'react-toastify';

const CommunicationTab = () => {
  const [messageType, setMessageType] = useState('email');
  const [recipient, setRecipient] = useState('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    toast.success(`${messageType === 'email' ? 'Email' : 'SMS'} sent successfully to ${recipient} students`);
    setSubject('');
    setMessage('');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Student Communication</Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Send emails and SMS to students and parents
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Message Type"
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Recipients"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                >
                  <MenuItem value="all">All Students</MenuItem>
                  <MenuItem value="active">Active Students</MenuItem>
                  <MenuItem value="pending_fee">Pending Fee Students</MenuItem>
                  <MenuItem value="low_attendance">Low Attendance Students</MenuItem>
                </TextField>
              </Grid>
              {messageType === 'email' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  multiline
                  rows={6}
                  placeholder={messageType === 'email' ? 'Enter email content...' : 'Enter SMS text (max 160 characters)...'}
                  helperText={messageType === 'sms' ? `${message.length}/160 characters` : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={messageType === 'email' ? <Email /> : <Sms />}
                  endIcon={<Send />}
                  onClick={handleSend}
                  fullWidth
                >
                  Send {messageType === 'email' ? 'Email' : 'SMS'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Quick Templates</Typography>
            <Box display="flex" flexDirection="column" gap={1} mt={2}>
              <Chip
                label="Fee Reminder"
                onClick={() => setMessage('Dear Student, your fee payment is pending. Please pay at the earliest.')}
                clickable
              />
              <Chip
                label="Attendance Alert"
                onClick={() => setMessage('Your attendance is below 75%. Please attend classes regularly.')}
                clickable
              />
              <Chip
                label="Exam Notification"
                onClick={() => setMessage('Your exam is scheduled on [DATE]. Please be prepared.')}
                clickable
              />
              <Chip
                label="Result Published"
                onClick={() => setMessage('Your exam results have been published. Check your portal.')}
                clickable
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Communication Stats</Typography>
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">Emails Sent (This Month)</Typography>
              <Typography variant="h5" fontWeight="bold">156</Typography>
            </Box>
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">SMS Sent (This Month)</Typography>
              <Typography variant="h5" fontWeight="bold">89</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CommunicationTab;
