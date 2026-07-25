import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { Add, Quiz, Assessment } from '@mui/icons-material';

const ExamsSubmodule = () => {
  const [subTab, setSubTab] = useState(0);

  const exams = [
    { id: 1, name: 'Mid Term Exam', course: 'Mathematics', date: '2024-02-25', type: 'Written' },
    { id: 2, name: 'Final Exam', course: 'Physics', date: '2024-03-15', type: 'Online' },
  ];

  const results = [
    { id: 1, student: 'John Doe', exam: 'Mid Term', marks: 85, grade: 'A' },
    { id: 2, student: 'Jane Smith', exam: 'Mid Term', marks: 92, grade: 'A+' },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Exams & Results Management</Typography>

      <Tabs value={subTab} onChange={(e, v) => setSubTab(v)} sx={{ mb: 2 }}>
        <Tab label="Exam Scheduling" />
        <Tab label="Online Exams" />
        <Tab label="Results" />
        <Tab label="Question Bank" />
      </Tabs>

      {subTab === 0 && (
        <Box>
          <Button variant="contained" startIcon={<Add />} sx={{ mb: 2 }}>Schedule Exam</Button>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Exam Name</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>{exam.name}</TableCell>
                    <TableCell>{exam.course}</TableCell>
                    <TableCell>{exam.date}</TableCell>
                    <TableCell><Chip label={exam.type} size="small" /></TableCell>
                    <TableCell><Button size="small">Edit</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {subTab === 1 && (
        <Box>
          <Button variant="contained" startIcon={<Quiz />} sx={{ mb: 2 }}>Create Online Test</Button>
          <Typography variant="body2" color="textSecondary">Create MCQ and descriptive online tests with auto-evaluation</Typography>
        </Box>
      )}

      {subTab === 2 && (
        <Box>
          <Button variant="contained" startIcon={<Assessment />} sx={{ mb: 2 }}>Enter Results</Button>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Exam</TableCell>
                  <TableCell>Marks</TableCell>
                  <TableCell>Grade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.student}</TableCell>
                    <TableCell>{result.exam}</TableCell>
                    <TableCell>{result.marks}</TableCell>
                    <TableCell><Chip label={result.grade} color="success" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {subTab === 3 && (
        <Box>
          <Button variant="contained" startIcon={<Add />} sx={{ mb: 2 }}>Add Question</Button>
          <Typography variant="body2" color="textSecondary">Manage question bank with categories and difficulty levels</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ExamsSubmodule;
