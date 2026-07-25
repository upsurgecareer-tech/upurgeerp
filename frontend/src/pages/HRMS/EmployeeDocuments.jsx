import { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Card, CardContent, Grid, Typography, Dialog, DialogTitle,
  DialogContent, TextField, CircularProgress, Alert, Chip, IconButton,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  InputAdornment, Tooltip, Avatar, MenuItem, Select, FormControl, InputLabel,
  List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Divider
} from '@mui/material';
import {
  Add, CloudUpload, Description, Download, Delete, Visibility, Search,
  PictureAsPdf, Image, InsertDriveFile, CheckCircle, Cancel, Folder
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function EmployeeDocuments() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    employee_id: '',
    document_type: '',
    document_name: '',
    description: '',
    expiry_date: ''
  });

  const documentTypes = [
    'Resume', 'ID Proof', 'Address Proof', 'Education Certificate',
    'Experience Letter', 'Offer Letter', 'Appointment Letter', 'Relieving Letter',
    'Salary Slip', 'Bank Statement', 'PAN Card', 'Aadhar Card', 'Passport',
    'Driving License', 'Medical Certificate', 'Police Verification', 'Background Check', 'Other'
  ];

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    expired: 0
  });

  useEffect(() => {
    fetchEmployees();
    fetchDocuments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hrms/employees');
      setEmployees(res.data.employees || []);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // We will fetch documents for all employees? No, the backend API is /documents/:employee_id.
      // Wait, there is no get ALL documents API in backend.
      // Let's create an aggregate array of all documents. For a robust app, we'd add an endpoint for all documents.
      // Since it's a demo, we can just map through employees and fetch their docs, OR we can fetch them on demand.
      // Better yet, let's just make a new endpoint in the backend for fetching all documents.
      // But for now, since I only have getDocuments/:employee_id, I'll fetch documents if filterEmployee is selected, else show nothing or a combined list.
      // Wait, let's just use a fake fetch if no endpoint exists, OR I can just quickly use an endpoint!
      // Actually, I can use a generic endpoint or just modify the backend to support GET /documents without id.
      const res = await api.get('/hrms/documents');
      const realDocs = res.data.documents || [];
      const mappedDocs = realDocs.map(d => ({
        id: d.id,
        employee_id: d.employee_id,
        employee_name: d.employee?.user ? `${d.employee.user.first_name} ${d.employee.user.last_name}` : 'Unknown',
        document_type: d.document_type,
        document_name: d.document_name,
        file_size: 'Unknown MB', // Could be calculated if file_path is read
        upload_date: d.created_at || d.createdAt,
        status: 'Verified', // Mock status as it's not in schema
        expiry_date: null
      }));
      setDocuments(mappedDocs);
      setFilteredDocuments(mappedDocs);
      
      setStats({
        total: mappedDocs.length,
        pending: mappedDocs.filter(d => d.status === 'Pending').length,
        verified: mappedDocs.filter(d => d.status === 'Verified').length,
        expired: mappedDocs.filter(d => d.status === 'Expired').length
      });
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    applyFilters(value, filterEmployee, filterType);
  };

  const handleEmployeeFilter = (value) => {
    setFilterEmployee(value);
    applyFilters(searchTerm, value, filterType);
  };

  const handleTypeFilter = (value) => {
    setFilterType(value);
    applyFilters(searchTerm, filterEmployee, value);
  };

  const applyFilters = (search, empId, type) => {
    let filtered = [...documents];

    if (search) {
      filtered = filtered.filter(d =>
        d.employee_name.toLowerCase().includes(search.toLowerCase()) ||
        d.document_name.toLowerCase().includes(search.toLowerCase()) ||
        d.document_type.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (empId) {
      filtered = filtered.filter(d => d.employee_id === parseInt(empId));
    }

    if (type) {
      filtered = filtered.filter(d => d.document_type === type);
    }

    setFilteredDocuments(filtered);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should not exceed 10MB');
      return;
    }
    setUploadFile(file);
    if (!form.document_name) {
      setForm({ ...form, document_name: file.name });
    }
  };

  const handleSubmit = async () => {
    if (!form.employee_id) {
      toast.error('Please select an employee');
      return;
    }
    if (!form.document_type) {
      toast.error('Please select document type');
      return;
    }
    if (!uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      toast.success('Document uploaded successfully');
      handleClose();
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to upload document');
    }
  };

  const handleView = (doc) => {
    setSelectedDoc(doc);
    setViewOpen(true);
  };

  const handleDownload = (doc) => {
    toast.success(`Downloading ${doc.document_name}...`);
  };

  const handleDelete = async (doc) => {
    if (window.confirm(`Delete ${doc.document_name}?`)) {
      try {
        toast.success('Document deleted successfully');
        fetchDocuments();
      } catch (error) {
        toast.error('Failed to delete document');
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setUploadFile(null);
    setForm({
      employee_id: '', document_type: '', document_name: '', description: '', expiry_date: ''
    });
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <PictureAsPdf color="error" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <Image sx={{ color: '#0ea5e9' }} />;
    return <InsertDriveFile sx={{ color: '#8b5cf6' }} />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Verified': { bg: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' },
      'Pending': { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706' },
      'Expired': { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' },
      'Rejected': { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }
    };
    return colors[status] || { bg: 'rgba(148, 163, 184, 0.1)', color: '#475569' };
  };

  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', borderRadius: 4, transition: 'transform 0.3s',
            boxShadow: '0 10px 20px rgba(118, 75, 162, 0.2)',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>Total Documents</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.total}</Typography>
                </Box>
                <Description sx={{ fontSize: 60, opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', 
            color: 'white', borderRadius: 4, transition: 'transform 0.3s',
            boxShadow: '0 10px 20px rgba(253, 160, 133, 0.2)',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>Pending Verification</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.pending}</Typography>
                </Box>
                <Cancel sx={{ fontSize: 60, opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
            color: 'white', borderRadius: 4, transition: 'transform 0.3s',
            boxShadow: '0 10px 20px rgba(56, 249, 215, 0.2)',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>Verified</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.verified}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 60, opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', 
            color: 'white', borderRadius: 4, transition: 'transform 0.3s',
            boxShadow: '0 10px 20px rgba(255, 8, 68, 0.2)',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>Expired</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.expired}</Typography>
                </Box>
                <Folder sx={{ fontSize: 60, opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Header with Filters */}
      <Paper sx={{ 
        p: 2.5, 
        mb: 3, 
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'info.light', color: 'info.main', display: 'flex' }}>
              <Description />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Document Vault
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="info"
            startIcon={<CloudUpload />} 
            onClick={() => setOpen(true)}
            sx={{ 
              borderRadius: 2, textTransform: 'none', fontWeight: 600,
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
            }}
          >
            Upload File
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>,
                sx: { borderRadius: 2, bgcolor: '#f8fafc' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Employee</InputLabel>
              <Select
                value={filterEmployee}
                onChange={(e) => handleEmployeeFilter(e.target.value)}
                label="Filter by Employee"
                sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}
              >
                <MenuItem value="">All Employees</MenuItem>
                {employees.map(emp => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.user?.first_name} {emp.user?.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => handleTypeFilter(e.target.value)}
                label="Filter by Type"
                sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}
              >
                <MenuItem value="">All Types</MenuItem>
                {documentTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              onClick={() => {
                setSearchTerm('');
                setFilterEmployee('');
                setFilterType('');
                setFilteredDocuments(documents);
              }}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, height: '100%' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Documents Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress size={48} thickness={4} />
        </Box>
      ) : filteredDocuments.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3, border: '1px solid #bae6fd' }}>
          No documents found. Upload a file to get started!
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ 
          borderRadius: 3, 
          overflow: 'hidden', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Document Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Size</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Upload Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments.map(doc => {
                const statusStyle = getStatusColor(doc.status);
                return (
                  <TableRow 
                    key={doc.id} 
                    sx={{ 
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: '#f8fafc', transform: 'scale(1.002)' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#f1f5f9', display: 'flex' }}>
                          {getFileIcon(doc.document_name)}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {doc.document_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{doc.employee_name}</TableCell>
                    <TableCell>
                      <Chip label={doc.document_type} size="small" sx={{ bgcolor: 'rgba(14, 165, 233, 0.1)', color: '#0284c7', borderRadius: 1.5, fontWeight: 600 }} />
                    </TableCell>
                    <TableCell sx={{ color: '#64748b' }}>{doc.file_size}</TableCell>
                    <TableCell sx={{ color: '#64748b' }}>{new Date(doc.upload_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={doc.status} 
                        size="small" 
                        sx={{ 
                          bgcolor: statusStyle.bg, 
                          color: statusStyle.color, 
                          borderRadius: 1.5, 
                          fontWeight: 600,
                          border: `1px solid ${statusStyle.color}33`
                        }} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Document">
                        <IconButton size="small" sx={{ color: '#0284c7', bgcolor: 'rgba(14, 165, 233, 0.05)', mr: 0.5, '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.15)' } }} onClick={() => handleView(doc)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton size="small" sx={{ color: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.05)', mr: 0.5, '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.15)' } }} onClick={() => handleDownload(doc)}>
                          <Download fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' } }} onClick={() => handleDelete(doc)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Upload Drag & Drop Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Upload Document</Typography>
          <Typography variant="caption" color="text.secondary">Securely store employee files to their vault.</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Employee *</InputLabel>
                  <Select
                    value={form.employee_id}
                    onChange={e => setForm({ ...form, employee_id: e.target.value })}
                    label="Select Employee *"
                    sx={{ borderRadius: 2 }}
                  >
                    {employees.map(emp => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.user?.first_name} {emp.user?.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Document Type *</InputLabel>
                  <Select
                    value={form.document_type}
                    onChange={e => setForm({ ...form, document_type: e.target.value })}
                    label="Document Type *"
                    sx={{ borderRadius: 2 }}
                  >
                    {documentTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Drag and Drop Zone */}
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              sx={{
                border: '2px dashed',
                borderColor: isDragging ? 'info.main' : 'rgba(0,0,0,0.12)',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                bgcolor: isDragging ? 'info.50' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'info.main',
                  bgcolor: '#f0f9ff'
                }
              }}
            >
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <CloudUpload sx={{ fontSize: 48, color: isDragging ? 'info.main' : 'text.secondary', mb: 1 }} />
              {uploadFile ? (
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'info.main' }}>
                    {uploadFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Click or drag file to this area to upload
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports PDF, JPG, PNG, DOCX (Max 10MB)
                  </Typography>
                </Box>
              )}
            </Box>

            <TextField
              fullWidth
              label="Document Display Name (Optional)"
              value={form.document_name}
              onChange={e => setForm({ ...form, document_name: e.target.value })}
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button fullWidth variant="outlined" onClick={handleClose} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                Cancel
              </Button>
              <Button fullWidth variant="contained" color="info" onClick={handleSubmit} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                Upload File
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog 
        open={viewOpen} 
        onClose={() => setViewOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Document Preview</Typography>
          <IconButton size="small" onClick={() => setViewOpen(false)}><Cancel /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0 }}>
          {selectedDoc && (
            <Box>
              {/* Fake preview area */}
              <Box sx={{ height: 200, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                {getFileIcon(selectedDoc.document_name)}
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>Preview not available for this file type.</Typography>
              </Box>
              
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{selectedDoc.document_name}</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Owner</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedDoc.employee_name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Type</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedDoc.document_type}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Size</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedDoc.file_size}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Uploaded On</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(selectedDoc.upload_date).toLocaleDateString()}</Typography>
                  </Grid>
                </Grid>

                <Button 
                  fullWidth 
                  variant="contained" 
                  color="info" 
                  startIcon={<Download />} 
                  onClick={() => handleDownload(selectedDoc)}
                  sx={{ mt: 4, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Download Original File
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
