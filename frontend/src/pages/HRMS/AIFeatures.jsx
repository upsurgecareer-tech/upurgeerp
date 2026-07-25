import { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, Paper, Avatar, InputAdornment, IconButton } from '@mui/material';
import { SmartToy, Send, AutoAwesome, Mic, Psychology } from '@mui/icons-material';

export default function AIFeatures() {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! I am your AI HR Assistant. I can help you with policies, leave balances, or payroll summaries. What do you need?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { type: 'user', text: input }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'My generative AI capabilities are currently being configured by the administrative team. Soon, I will be able to instantly resolve this for you!' 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto" }}>
      <Box sx={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', display: 'flex' }}>
            <AutoAwesome fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Copilot HR
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Generative AI assistant for employees and managers.</Typography>
          </Box>
        </Box>

        <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden', background: '#f8fafc' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#ede9fe', color: '#8b5cf6' }}><Psychology /></Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>HR Copilot Model v1.2</Typography>
              <Typography variant="caption" sx={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} /> Online
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((msg, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 1 }}>
                {msg.type === 'bot' && <Avatar sx={{ width: 28, height: 28, bgcolor: '#ede9fe', color: '#8b5cf6' }}><SmartToy sx={{ fontSize: 16 }} /></Avatar>}
                <Paper sx={{ 
                  p: 2, 
                  px: 2.5,
                  maxWidth: '75%',
                  borderRadius: msg.type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: msg.type === 'user' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'white',
                  color: msg.type === 'user' ? 'white' : '#334155',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{msg.text}</Typography>
                </Paper>
              </Box>
            ))}
            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#ede9fe', color: '#8b5cf6' }}><SmartToy sx={{ fontSize: 16 }} /></Avatar>
                <Paper sx={{ p: 2, borderRadius: '20px 20px 20px 4px', bgcolor: 'white' }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>Copilot is thinking...</Typography>
                </Paper>
              </Box>
            )}
          </Box>

          <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
            <TextField 
              fullWidth 
              placeholder="Ask anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 8,
                  bgcolor: '#f1f5f9',
                  pr: 1
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" sx={{ color: '#94a3b8' }}><Mic /></IconButton>
                    <IconButton onClick={handleSend} sx={{ bgcolor: '#8b5cf6', color: 'white', ml: 1, '&:hover': { bgcolor: '#7c3aed' } }}>
                      <Send fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
