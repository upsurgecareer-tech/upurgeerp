import { Box, Typography, Button, Grid, Card, CardContent, Chip } from '@mui/material';
import { Add, Assignment } from '@mui/icons-material';

const AssignmentsSubmodule = () => {
  const assignments = [
    { id: 1, title: 'Math Assignment 1', course: 'Mathematics', dueDate: '2024-02-15', status: 'Active' },
    { id: 2, title: 'Physics Lab Report', course: 'Physics', dueDate: '2024-02-20', status: 'Active' },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Assignments Management</Typography>
        <Button variant="contained" startIcon={<Add />}>Create Assignment</Button>
      </Box>

      <Grid container spacing={2}>
        {assignments.map((assignment) => (
          <Grid item xs={12} md={6} key={assignment.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="h6">{assignment.title}</Typography>
                    <Typography variant="body2" color="textSecondary">{assignment.course}</Typography>
                    <Typography variant="caption">Due: {assignment.dueDate}</Typography>
                  </Box>
                  <Chip label={assignment.status} color="success" size="small" />
                </Box>
                <Box mt={2}>
                  <Button size="small" variant="outlined">View Details</Button>
                  <Button size="small" sx={{ ml: 1 }}>Grade</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AssignmentsSubmodule;
