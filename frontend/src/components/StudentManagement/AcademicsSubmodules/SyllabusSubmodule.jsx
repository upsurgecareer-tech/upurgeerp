import { Box, Typography, Button } from '@mui/material';
import { Add, Upload } from '@mui/icons-material';

const SyllabusSubmodule = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Syllabus Management</Typography>
        <Button variant="contained" startIcon={<Upload />}>Upload Syllabus</Button>
      </Box>
      <Typography variant="body2" color="textSecondary">Upload and manage course syllabus documents</Typography>
    </Box>
  );
};

export default SyllabusSubmodule;
