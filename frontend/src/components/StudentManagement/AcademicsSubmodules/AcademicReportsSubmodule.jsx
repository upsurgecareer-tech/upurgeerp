import { Box, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { Assessment, Download, TrendingUp, EmojiEvents } from '@mui/icons-material';

const AcademicReportsSubmodule = () => {
  const reports = [
    { title: 'Performance Analysis', description: 'Overall student performance metrics', icon: <Assessment /> },
    { title: 'Course Completion', description: 'Course completion statistics', icon: <TrendingUp /> },
    { title: 'Top Performers', description: 'List of top performing students', icon: <EmojiEvents /> },
    { title: 'Subject-wise Analysis', description: 'Subject-wise performance breakdown', icon: <Assessment /> },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Academic Reports</Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Generate comprehensive academic reports and analytics
      </Typography>

      <Grid container spacing={2}>
        {reports.map((report, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  {report.icon}
                  <Box flexGrow={1}>
                    <Typography variant="h6">{report.title}</Typography>
                    <Typography variant="body2" color="textSecondary">{report.description}</Typography>
                  </Box>
                  <Button variant="outlined" startIcon={<Download />} size="small">
                    Export
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AcademicReportsSubmodule;
