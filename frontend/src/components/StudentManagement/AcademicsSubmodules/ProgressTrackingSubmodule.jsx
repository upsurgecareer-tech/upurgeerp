import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress, Chip } from '@mui/material';

const ProgressTrackingSubmodule = () => {
  const students = [
    { id: 1, name: 'John Doe', course: 'Web Development', progress: 75, status: 'On Track' },
    { id: 2, name: 'Jane Smith', course: 'Data Science', progress: 90, status: 'Excellent' },
    { id: 3, name: 'Mike Johnson', course: 'Mobile App Dev', progress: 45, status: 'Needs Attention' },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Student Progress Tracking</Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Monitor student progress, course completion, and performance metrics
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.course}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinearProgress variant="determinate" value={student.progress} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
                    <Typography variant="body2">{student.progress}%</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={student.status}
                    color={student.progress >= 75 ? 'success' : student.progress >= 50 ? 'warning' : 'error'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProgressTrackingSubmodule;
