import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Button, Grid, Card, CardContent, TextField } from '@mui/material';
import { Add, EmojiEvents, Description, Verified } from '@mui/icons-material';

const CertificatesSubmodule = () => {
  const [subTab, setSubTab] = useState(0);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Certificates & Marksheets</Typography>

      <Tabs value={subTab} onChange={(e, v) => setSubTab(v)} sx={{ mb: 2 }}>
        <Tab label="Certificates" />
        <Tab label="Marksheets" />
        <Tab label="Verification" />
      </Tabs>

      {subTab === 0 && (
        <Box>
          <Button variant="contained" startIcon={<Add />} sx={{ mb: 2 }}>Generate Certificate</Button>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Course Completion Certificate</Typography>
                  <Typography variant="body2" color="textSecondary">Template for course completion</Typography>
                  <Button size="small" variant="outlined" sx={{ mt: 2 }}>Use Template</Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Merit Certificate</Typography>
                  <Typography variant="body2" color="textSecondary">Template for top performers</Typography>
                  <Button size="small" variant="outlined" sx={{ mt: 2 }}>Use Template</Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {subTab === 1 && (
        <Box>
          <Button variant="contained" startIcon={<Description />} sx={{ mb: 2 }}>Generate Marksheet</Button>
          <Typography variant="body2" color="textSecondary">Generate and print digital marksheets for students</Typography>
        </Box>
      )}

      {subTab === 2 && (
        <Box>
          <Typography variant="body2" color="textSecondary" gutterBottom>Verify certificate authenticity</Typography>
          <TextField
            fullWidth
            label="Enter Certificate Number"
            placeholder="CERT-2024-001"
            sx={{ mb: 2 }}
          />
          <Button variant="contained" startIcon={<Verified />}>Verify Certificate</Button>
        </Box>
      )}
    </Box>
  );
};

export default CertificatesSubmodule;
