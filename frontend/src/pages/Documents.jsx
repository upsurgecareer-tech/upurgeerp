import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, CircularProgress, Grid, Card, CardContent,
  Alert, Autocomplete, InputAdornment, TablePagination, Tooltip, Chip
} from '@mui/material';
import {
  Add, CloudUpload, Description, Person, Folder, InsertDriveFile,
  Visibility, Delete, Refresh, FileDownload, Search, PictureAsPdf, Image
} from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('');
  const [search, setSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { applyFilters(); }, [documents, search, studentFilter, typeFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const stuRes = await api.get('/students');
      const studentsList = stuRes.data.students || [];
      setStudents(studentsList);
      
      // Fetch all documents
      const allDocs = [];
      for (const student of studentsList) {
        try {
          const docRes = await api.get(`/students/${student.id}/documents`);
          const docs = (docRes.data.documents || []).map(d => ({
            ...d,
            student_name: student.name,
            student_admission_no: student.admission_no,
            student_mobile: student.mobile
          }));
          allDocs.push(...docs);
        } catch (err) {
          // Skip if no documents
        }
      }
      setDocuments(allDocs);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch data');
      setStudents([]);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];
    
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(d =>
        d.student_name?.toLowerCase().includes(query) ||
        d.student_mobile?.includes(query) ||
        d.document_type?.toLowerCase().includes(query) ||
        d.student_admission_no?.toLowerCase().includes(query)
      );
    }
    
    if (studentFilter !== 'All') {
      filtered = filtered.filter(d => d.student_id === parseInt(studentFilter));
    }
    
    if (typeFilter !== 'All') {
      filtered = filtered.filter(d => d.document_type === typeFilter);
    }
    
    setFilteredDocuments(filtered);
    setPage(0);
  };

  const handleUpload = async () => {
    if (!selectedStudent || !file || !docType) {
      toast.error('Please fill all fields');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', docType);

    try {
      await api.post(`/students/${selectedStudent.id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded successfully');
      setOpen(false);
      setFile(null);
      setDocType('');
      setSelectedStudent(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    }
  };

  const handleDelete = async (studentId, docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/students/${studentId}/documents/${docId}`);
      toast.success('Document deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const handleView = (fileUrl) => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';
    window.open(`${baseUrl}${fileUrl}`, '_blank');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Student', 'Admission No', 'Mobile', 'Document Type', 'Upload Date'];
    const rows = filteredDocuments.map(d => [
      d.id,
      d.student_name || 'N/A',
      d.student_admission_no || 'N/A',
      d.student_mobile || 'N/A',
      d.document_type,
      new Date(d.created_at).toLocaleDateString('en-IN')
    ]);
    let csv = headers.join(',') + '\n';
    rows.forEach(row => { csv += row.map(cell => `"${cell}"`).join(',') + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documents_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported successfully');
  };

  const clearFilters = () => {
    setSearch('');
    setStudentFilter('All');
    setTypeFilter('All');
  };

  const docTypes = [
    'Aadhar Card', 'PAN Card', 'Photo', '10th Marksheet', '12th Marksheet',
    'Graduation Certificate', 'Transfer Certificate', 'Character Certificate', 'Other'
  ];

  const paginatedDocuments = filteredDocuments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getFileIcon = (fileUrl) => {
    if (fileUrl?.endsWith('.pdf')) return <PictureAsPdf color="error" />;
    return <Image color="primary" />;
  };

  const StatCard = ({ icon, label, value, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ bgcolor: `${color}.main`, color: 'white', p: 1.5, borderRadius: 2 }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="h5" fontWeight="bold">{value}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Layout title="Documents">
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">Documents Management</Typography>
            <Typography variant="body2" color="text.secondary">
              Total: {filteredDocuments.length} documents {search || studentFilter !== 'All' || typeFilter !== 'All' ? `(filtered from ${documents.length})` : ''}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData}>
              Refresh
            </Button>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
              Upload Document
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <StatCard icon={<Description />} label="Total Documents" value={documents.length} color="primary" />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard icon={<Person />} label="Total Students" value={students.length} color="success" />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard icon={<Folder />} label="Document Types" value={docTypes.length} color="warning" />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard icon={<InsertDriveFile />} label="Uploaded Today" value={documents.filter(d => new Date(d.created_at).toDateString() === new Date().toDateString()).length} color="info" />
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  placeholder="Search by student, mobile, type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="small"
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  select
                  label="Student"
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="All">All Students</MenuItem>
                  {students.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  select
                  label="Document Type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="All">All Types</MenuItem>
                  {docTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={clearFilters}
                  disabled={!search && studentFilter === 'All' && typeFilter === 'All'}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Admission No</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Document Type</TableCell>
                  <TableCell>File Type</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Alert severity="info">No documents found. Upload documents to get started.</Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDocuments.map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell>#{doc.id}</TableCell>
                      <TableCell>{doc.student_name}</TableCell>
                      <TableCell>{doc.student_admission_no || 'N/A'}</TableCell>
                      <TableCell>{doc.student_mobile}</TableCell>
                      <TableCell>
                        <Chip label={doc.document_type} color="primary" size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{getFileIcon(doc.file_url)}</TableCell>
                      <TableCell>{new Date(doc.created_at).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>
                        <Tooltip title="View">
                          <IconButton size="small" color="primary" onClick={() => handleView(doc.file_url)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDelete(doc.student_id, doc.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {!loading && filteredDocuments.length > 0 && (
              <TablePagination
                component="div"
                count={filteredDocuments.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            )}
          </TableContainer>
        )}

        {/* Upload Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
              <Autocomplete
                options={students}
                getOptionLabel={(s) => `${s.name} (${s.admission_no || s.mobile})`}
                onChange={(e, val) => setSelectedStudent(val)}
                renderInput={(params) => <TextField {...params} label="Select Student" required />}
              />
              <TextField
                select
                label="Document Type"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                required
              >
                {docTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
              >
                {file ? file.name : 'Choose File (PDF, JPG, PNG)'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </Button>
              {file && (
                <Alert severity="success">
                  File: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} variant="contained" disabled={!selectedStudent || !file || !docType}>
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Documents;
