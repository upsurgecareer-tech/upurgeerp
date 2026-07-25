import { Box, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { Add, VideoLibrary, PictureAsPdf, MenuBook } from '@mui/icons-material';

const StudyMaterialsSubmodule = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Study Materials</Typography>
        <Button variant="contained" startIcon={<Add />}>Upload Material</Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <VideoLibrary color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h6" mt={1}>Video Lectures</Typography>
              <Typography variant="body2" color="textSecondary">24 videos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <PictureAsPdf color="error" sx={{ fontSize: 40 }} />
              <Typography variant="h6" mt={1}>PDF Documents</Typography>
              <Typography variant="body2" color="textSecondary">156 files</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <MenuBook color="success" sx={{ fontSize: 40 }} />
              <Typography variant="h6" mt={1}>e-Books</Typography>
              <Typography variant="body2" color="textSecondary">42 books</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudyMaterialsSubmodule;
