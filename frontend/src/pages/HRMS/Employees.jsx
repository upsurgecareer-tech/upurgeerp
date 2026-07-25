import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, TextField, MenuItem, Chip, IconButton, CircularProgress, Alert, Grid, Typography, Card, CardContent, Paper, TableContainer, InputAdornment, Avatar, Tooltip, TablePagination, Menu, ListItemIcon, ListItemText, Divider, Checkbox, FormControlLabel } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, Search as SearchIcon, FilterList, Download, Upload, People, PersonAdd, Work, Business, TrendingUp, MoreVert, Print, Email, Sms, GridView, ViewList, Sort, CheckCircle, Cancel } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function Employees({ onAdd }) {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exportMenu, setExportMenu] = useState(null);
  const [importDialog, setImportDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [bulkActionMenu, setBulkActionMenu] = useState(null);
  const fileInputRef = useRef(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    departments: 0
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [form, setForm] = useState({
    // Basic Info
    user_id: '',
    employee_code: '',
    department_id: '',
    designation: '',
    joining_date: '',
    employment_type: 'Full-Time',
    location: '',
    salary: '',
    
    // Personal Details
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    place_of_birth: '',
    religion: '',
    nationality: 'Indian',
    blood_group: '',
    marital_status: 'Single',
    wedding_date: '',
    
    // Family Details
    father_name: '',
    father_mobile: '',
    mother_name: '',
    mother_mobile: '',
    spouse_name: '',
    spouse_dob: '',
    spouse_gender: '',
    
    // Address
    present_address: '',
    present_building: '',
    present_street: '',
    present_location: '',
    present_city: '',
    present_district: '',
    present_pincode: '',
    present_state: '',
    permanent_address: '',
    permanent_building: '',
    permanent_street: '',
    permanent_location: '',
    permanent_city: '',
    permanent_district: '',
    permanent_pincode: '',
    permanent_state: '',
    
    // Contact Details
    mobile: '',
    email: '',
    emergency_contact_name: '',
    emergency_relationship: '',
    emergency_contact_phone: '',
    
    // Bank Details
    bank_account_name: '',
    bank_name: '',
    bank_branch: '',
    bank_account_number: '',
    bank_ifsc: '',
    
    // Government IDs
    aadhar_number: '',
    pan_number: '',
    driving_license: '',
    dl_issue_date: '',
    dl_valid_upto: '',
    passport_number: '',
    
    // Education
    ssc_institution: '',
    ssc_university: '',
    ssc_year: '',
    ssc_percentage: '',
    hsc_institution: '',
    hsc_university: '',
    hsc_year: '',
    hsc_percentage: '',
    ug_institution: '',
    ug_university: '',
    ug_year: '',
    ug_percentage: '',
    ug_specialization: '',
    pg_institution: '',
    pg_university: '',
    pg_year: '',
    pg_percentage: '',
    pg_specialization: '',
    
    // Experience
    total_experience: '',
    previous_company1: '',
    prev_from1: '',
    prev_to1: '',
    prev_designation1: '',
    prev_ctc1: '',
    
    // Documents Checklist
    has_resume: false,
    has_education_cert: false,
    has_previous_employment: false,
    has_pan: false,
    has_aadhar: false,
    has_bank_proof: false,
    has_photos: false
  });
  
  const [activeStep, setActiveStep] = useState(0);

  // Designations loaded from database
  const [designations, setDesignations] = useState([]);


  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (isMounted) {
        await fetchEmployees();
        await fetchUsers();
        await fetchDepartments();
        await fetchDesignations();
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hrms/employees');
      
      let empData = [];
      if (res.data && Array.isArray(res.data.employees)) {
        empData = res.data.employees;
      } else if (Array.isArray(res.data)) {
        empData = res.data;
      }
      
      setEmployees(empData);
      setFilteredEmployees(empData);
      
      // Calculate stats safely
      setStats({
        total: empData.length,
        active: empData.filter(e => e && e.status === 'Active').length,
        inactive: empData.filter(e => e && e.status === 'Inactive').length,
        departments: [...new Set(empData.map(e => e && e.department_id).filter(Boolean))].length
      });
    } catch (error) {
      console.error('Fetch Employees Error:', error);
      if (error.response?.status === 429) {
        toast.warning('Too many requests. Please wait a moment.');
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch employees';
        toast.error(`Error fetching employees: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/staff');
      setUsers(res.data.staff || []);
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn('Rate limit reached for users API');
      } else {
        console.error('Failed to fetch users:', error.message);
      }
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/hrms/departments');
      setDepartments(res.data.departments || []);
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn('Rate limit reached for departments API');
      } else {
        console.error('Failed to fetch departments:', error.message);
      }
    }
  };

  const fetchDesignations = async () => {
    try {
      const res = await api.get('/hrms/designations');
      const desigs = (res.data.designations || []).map(d => d.title).filter(Boolean);
      // Add common designations as fallback if DB has none yet
      if (desigs.length === 0) {
        setDesignations(['HR Manager','HR Executive','Software Engineer','Sales Manager','Accountant','Team Lead','Manager','Intern','Coordinator','Supervisor']);
      } else {
        setDesignations([...new Set(desigs)]);
      }
    } catch {
      setDesignations(['HR Manager','HR Executive','Software Engineer','Sales Manager','Accountant','Team Lead','Manager','Intern']);
    }
  };

  const handleSubmit = async () => {
    try {
      setValidationErrors({});
      if (editMode) {
        await api.put(`/hrms/employees/${selectedEmployee.id}`, form);
        toast.success('Employee updated successfully');
      } else {
        await api.post('/hrms/employees', form);
        toast.success('Employee created successfully');
      }
      setOpen(false);
      setEditMode(false);
      setSelectedEmployee(null);
      fetchEmployees();
      setForm({
        user_id: '',
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        department_id: '',
        designation: '',
        joining_date: '',
        employment_type: 'Full-Time',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        bank_name: '',
        bank_account_number: '',
        bank_ifsc: '',
        pan_number: '',
        aadhar_number: ''
      });
    } catch (error) {
      if (error.response?.data?.errors) {
        const errors = {};
        error.response.data.errors.forEach(err => {
          errors[err.field] = err.message;
        });
        setValidationErrors(errors);
        toast.error('Please fix the validation errors in the form.');
      } else {
        toast.error(error.response?.data?.message || 'Operation failed');
      }
    }
  };

  const handleEdit = (emp) => {
    setEditMode(true);
    setValidationErrors({});
    setSelectedEmployee(emp);
    setForm({
      user_id: emp.user_id,
      department_id: emp.department_id || '',
      designation: emp.designation,
      joining_date: emp.joining_date?.split('T')[0] || '',
      employment_type: emp.employment_type,
      date_of_birth: emp.date_of_birth?.split('T')[0] || '',
      gender: emp.gender || '',
      blood_group: emp.blood_group || '',
      address: emp.address || '',
      emergency_contact_name: emp.emergency_contact_name || '',
      emergency_contact_phone: emp.emergency_contact_phone || '',
      bank_name: emp.bank_name || '',
      bank_account_number: emp.bank_account_number || '',
      bank_ifsc: emp.bank_ifsc || '',
      pan_number: emp.pan_number || '',
      aadhar_number: emp.aadhar_number || ''
    });
    setOpen(true);
  };

  const handleAdd = () => {
    if (onAdd) {
      onAdd();
    } else {
      setEditMode(false);
      setValidationErrors({});
      setForm({
        user_id: '', first_name: '', last_name: '', email: '', mobile: '', employee_code: '', department_id: '', designation: '', joining_date: '',
        employment_type: 'Full-Time', location: '', salary: '', date_of_birth: '', gender: '',
        blood_group: '', address: '', emergency_contact_name: '', emergency_contact_phone: '',
        bank_name: '', bank_account_number: '', bank_ifsc: '', pan_number: '', aadhar_number: ''
      });
      setOpen(true);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/hrms/employees/${id}/status`, { status });
      toast.success('Status updated successfully');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleView = (emp) => {
    setSelectedEmployee(emp);
    setViewOpen(true);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    applyFilters(value, filterDept, filterStatus);
  };

  const handleDeptFilter = (value) => {
    setFilterDept(value);
    applyFilters(searchTerm, value, filterStatus);
  };

  const handleStatusFilter = (value) => {
    setFilterStatus(value);
    applyFilters(searchTerm, filterDept, value);
  };

  const applyFilters = (search, dept, status) => {
    let filtered = [...employees];

    if (search) {
      filtered = filtered.filter(emp => 
        emp.user?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.user?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        emp.employee_code?.toLowerCase().includes(search.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (dept) {
      filtered = filtered.filter(emp => emp.department_id === parseInt(dept));
    }

    if (status) {
      filtered = filtered.filter(emp => emp.status === status);
    }

    setFilteredEmployees(filtered);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Employee Code', 'Name', 'Email', 'Designation', 'Department', 'Employment Type', 'Status', 'Joining Date'];
    const rows = filteredEmployees.map(emp => [
      emp.employee_code,
      `${emp.user?.first_name} ${emp.user?.last_name}`,
      emp.user?.email,
      emp.designation,
      emp.department?.name || 'N/A',
      emp.employment_type,
      emp.status,
      emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Exported to CSV successfully');
    setExportMenu(null);
  };

  // Export to Excel (CSV format compatible with Excel)
  const handleExportExcel = () => {
    handleExportCSV();
    toast.success('Exported to Excel format');
  };

  // Print Employee List
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const printContent = `
      <html>
        <head>
          <title>Employee List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #1976d2; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1976d2; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Employee List</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEmployees.map(emp => `
                <tr>
                  <td>${emp.employee_code}</td>
                  <td>${emp.user?.first_name} ${emp.user?.last_name}</td>
                  <td>${emp.user?.email}</td>
                  <td>${emp.designation}</td>
                  <td>${emp.department?.name || 'N/A'}</td>
                  <td>${emp.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    setExportMenu(null);
  };

  // Handle Import
  const handleImportClick = () => {
    setImportDialog(true);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast.error('Please select a CSV file');
      }
    }
  };

  const handleImportSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // await api.post('/hrms/employees/import', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });
      toast.success('Employees imported successfully');
      setImportDialog(false);
      setSelectedFile(null);
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to import employees');
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ['employee_code', 'first_name', 'last_name', 'email', 'designation', 'department', 'employment_type', 'joining_date', 'status'];
    const sampleRow = ['EMP001', 'John', 'Doe', 'john@example.com', 'Software Engineer', 'IT', 'Full-Time', '2024-01-01', 'Active'];
    
    const csvContent = [
      headers.join(','),
      sampleRow.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    a.click();
    toast.success('Template downloaded');
  };

  // Bulk Selection
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedEmployees(filteredEmployees.map(e => e.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (empId) => {
    if (selectedEmployees.includes(empId)) {
      setSelectedEmployees(selectedEmployees.filter(id => id !== empId));
    } else {
      setSelectedEmployees([...selectedEmployees, empId]);
    }
  };

  // Bulk Actions
  const handleBulkStatusChange = async (status) => {
    try {
      await Promise.all(selectedEmployees.map(id => 
        api.patch(`/hrms/employees/${id}/status`, { status })
      ));
      toast.success(`${selectedEmployees.length} employees updated`);
      setSelectedEmployees([]);
      setBulkActionMenu(null);
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to update employees');
    }
  };

  const handleBulkEmail = () => {
    const emails = employees
      .filter(e => selectedEmployees.includes(e.id))
      .map(e => e.user?.email)
      .filter(Boolean)
      .join(',');
    window.location.href = `mailto:${emails}`;
    setBulkActionMenu(null);
  };

  // Sorting
  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(field);
    
    const sorted = [...filteredEmployees].sort((a, b) => {
      let aVal, bVal;
      
      switch(field) {
        case 'name':
          aVal = `${a.user?.first_name} ${a.user?.last_name}`.toLowerCase();
          bVal = `${b.user?.first_name} ${b.user?.last_name}`.toLowerCase();
          break;
        case 'code':
          aVal = a.employee_code;
          bVal = b.employee_code;
          break;
        case 'joining_date':
          aVal = new Date(a.joining_date);
          bVal = new Date(b.joining_date);
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return isAsc ? -1 : 1;
      if (aVal > bVal) return isAsc ? 1 : -1;
      return 0;
    });
    
    setFilteredEmployees(sorted);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #3A1C71 0%, #D76D77 50%, #FFAF7B 100%)', 
            color: 'white',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 20px -10px rgba(0,0,0,0.15)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%', left: '-50%', width: '200%', height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%)'
            }
          }}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Total Employees</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>{stats.total}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1.5, borderRadius: 3, backdropFilter: 'blur(10px)' }}>
                  <People sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', 
            color: 'white',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 20px -10px rgba(0,0,0,0.15)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%', left: '-50%', width: '200%', height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%)'
            }
          }}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Active</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>{stats.active}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1.5, borderRadius: 3, backdropFilter: 'blur(10px)' }}>
                  <TrendingUp sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #FF8008 0%, #FFC837 100%)', 
            color: 'white',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 20px -10px rgba(0,0,0,0.15)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%', left: '-50%', width: '200%', height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%)'
            }
          }}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Inactive</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>{stats.inactive}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1.5, borderRadius: 3, backdropFilter: 'blur(10px)' }}>
                  <PersonAdd sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
            color: 'white',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 20px -10px rgba(0,0,0,0.15)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%', left: '-50%', width: '200%', height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%)'
            }
          }}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Departments</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>{departments.length}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1.5, borderRadius: 3, backdropFilter: 'blur(10px)' }}>
                  <Business sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Header with Actions */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3, 
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #1976d2, #9c27b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Employee Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {selectedEmployees.length > 0 && (
              <>
                <Chip 
                  label={`${selectedEmployees.length} selected`} 
                  color="primary" 
                  onDelete={() => setSelectedEmployees([])}
                  sx={{ borderRadius: 2, fontWeight: 'bold' }}
                />
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={(e) => setBulkActionMenu(e.currentTarget)}
                  sx={{ borderRadius: 2 }}
                >
                  Bulk Actions
                </Button>
              </>
            )}
            <Button 
              variant="outlined" 
              startIcon={<Download />} 
              size="small"
              onClick={(e) => setExportMenu(e.currentTarget)}
              sx={{ borderRadius: 2 }}
            >
              Export
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Upload />} 
              size="small"
              onClick={handleImportClick}
              sx={{ borderRadius: 2 }}
            >
              Import
            </Button>
            <IconButton 
              size="small" 
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              color="primary"
              sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', borderRadius: 2, p: 1 }}
            >
              {viewMode === 'table' ? <GridView /> : <ViewList />}
            </IconButton>
            <Button variant="contained" startIcon={<PersonAdd />} onClick={handleAdd} sx={{ borderRadius: 2, background: 'linear-gradient(45deg, #1976d2, #9c27b0)' }}>Add Employee</Button>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, email, code..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: '#f8fafc' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Department"
              value={filterDept}
              onChange={(e) => handleDeptFilter(e.target.value)}
              InputProps={{ sx: { borderRadius: 2, bgcolor: '#f8fafc' } }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Status"
              value={filterStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              InputProps={{ sx: { borderRadius: 2, bgcolor: '#f8fafc' } }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<FilterList />}
                sx={{ borderRadius: 2, height: '100%', minHeight: 40 }}
                onClick={() => {
                  setSearchTerm('');
                  setFilterDept('');
                  setFilterStatus('');
                  setFilteredEmployees(employees);
                }}
              >
                Clear
              </Button>
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => handleSort('name')}
              >
                <Sort />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Employee Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredEmployees.length === 0 ? (
        <Alert severity="info">No employees found. {searchTerm || filterDept || filterStatus ? 'Try adjusting your filters.' : 'Add your first employee!'}</Alert>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                  <TableCell padding="checkbox" sx={{ color: 'white' }}>
                    <Checkbox
                      checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                      indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < filteredEmployees.length}
                      onChange={handleSelectAll}
                      sx={{ color: 'white' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Employee</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Code</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Designation</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Department</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(emp => (
                  <TableRow key={emp.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedEmployees.includes(emp.id)}
                        onChange={() => handleSelectEmployee(emp.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', boxShadow: '0 4px 10px rgba(37,99,235,0.2)' }}>
                          {getInitials(emp.user?.first_name, emp.user?.last_name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {emp.user?.first_name} {emp.user?.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {emp.user?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={emp.employee_code} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{emp.designation}</TableCell>
                    <TableCell>
                      <Chip 
                        label={emp.department?.name || 'N/A'} 
                        size="small" 
                        sx={{ bgcolor: '#e0f2fe', color: '#0284c7', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={emp.employment_type} 
                        size="small" 
                        sx={{ 
                          bgcolor: emp.employment_type === 'Full-Time' ? '#dcfce7' : '#f1f5f9', 
                          color: emp.employment_type === 'Full-Time' ? '#166534' : '#475569',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={emp.status} 
                        sx={{ 
                          bgcolor: emp.status === 'Active' ? '#dcfce7' : '#fee2e2', 
                          color: emp.status === 'Active' ? '#166534' : '#991b1b',
                          fontWeight: 600
                        }}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton size="small" color="info" onClick={() => handleView(emp)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => handleEdit(emp)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={emp.status === 'Active' ? 'Deactivate' : 'Activate'}>
                        <IconButton 
                          size="small" 
                          color={emp.status === 'Active' ? 'error' : 'success'}
                          onClick={() => handleStatusChange(emp.id, emp.status === 'Active' ? 'Inactive' : 'Active')}
                        >
                          {emp.status === 'Active' ? <DeleteIcon fontSize="small" /> : <PersonAdd fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredEmployees.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' } }}>
        <DialogTitle sx={{ background: 'linear-gradient(45deg, #1976d2, #9c27b0)', color: 'white', fontWeight: 600 }}>
          {editMode ? 'Edit Employee Details' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ mt: 2 }}>
            {/* Basic Information */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 3, color: '#1976d2', fontWeight: 700, borderBottom: '2px solid #e0e0e0', pb: 1 }}>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              {!editMode && !selectedEmployee && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth 
                      label="First Name *" 
                      value={form.first_name || ''} error={!!validationErrors.first_name} helperText={validationErrors.first_name}
                      onChange={e => setForm({...form, first_name: e.target.value})} 
                      required={!form.user_id}
                      disabled={!!form.user_id}
                      placeholder="Employee First Name"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth 
                      label="Last Name" 
                      value={form.last_name || ''} error={!!validationErrors.last_name} helperText={validationErrors.last_name}
                      onChange={e => setForm({...form, last_name: e.target.value})} 
                      disabled={!!form.user_id}
                      placeholder="Employee Last Name"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth 
                      type="email"
                      label="Email Address *" 
                      value={form.email || ''} error={!!validationErrors.email} helperText={validationErrors.email}
                      onChange={e => setForm({...form, email: e.target.value})} 
                      required={!form.user_id}
                      disabled={!!form.user_id}
                      placeholder="employee@company.com"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth 
                      label="Mobile Number *" 
                      value={form.mobile || ''} error={!!validationErrors.mobile} helperText={validationErrors.mobile}
                      onChange={e => setForm({...form, mobile: e.target.value})} 
                      required={!form.user_id}
                      disabled={!!form.user_id}
                      placeholder="10-digit mobile number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      select 
                      fullWidth 
                      label="Or Link to Existing Staff Account (Optional)" 
                      value={form.user_id} error={!!validationErrors.user_id} helperText={validationErrors.user_id || "Optional: Select if you already created a login account in Staff Management."}
                      onChange={e => {
                        const uid = e.target.value;
                        const u = users.find(usr => usr.id === uid || usr.id === parseInt(uid));
                        setForm({
                          ...form, 
                          user_id: uid,
                          first_name: u ? u.first_name : '',
                          last_name: u ? u.last_name : '',
                          email: u ? u.email : '',
                          mobile: u ? u.phone : ''
                        });
                      }}
                    >
                      <MenuItem value="">-- Enter New Employee Details Above (Auto-Create Account) --</MenuItem>
                      {users.filter(u => selectedEmployee || !employees.some(emp => emp.user_id === u.id)).map(u => (
                        <MenuItem key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={6}>
                <TextField 
                  select 
                  fullWidth 
                  label="Department" 
                  value={form.department_id} error={!!validationErrors.department_id} helperText={validationErrors.department_id} 
                  onChange={e => setForm({...form, department_id: e.target.value})}
                >
                  <MenuItem value="">Select Department</MenuItem>
                  {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  select 
                  fullWidth 
                  label="Designation *" 
                  value={form.designation} error={!!validationErrors.designation} helperText={validationErrors.designation} 
                  onChange={e => setForm({...form, designation: e.target.value})} 
                  required
                >
                  <MenuItem value="">Select Designation</MenuItem>
                  {designations.map((desig, idx) => (
                    <MenuItem key={idx} value={desig}>{desig}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  type="date" 
                  label="Joining Date *" 
                  InputLabelProps={{shrink: true}} 
                  value={form.joining_date} error={!!validationErrors.joining_date} helperText={validationErrors.joining_date} 
                  onChange={e => setForm({...form, joining_date: e.target.value})} 
                  required 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  select 
                  fullWidth 
                  label="Employment Type *" 
                  value={form.employment_type} error={!!validationErrors.employment_type} helperText={validationErrors.employment_type} 
                  onChange={e => setForm({...form, employment_type: e.target.value})}
                >
                  <MenuItem value="Full-Time">Full-Time</MenuItem>
                  <MenuItem value="Part-Time">Part-Time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Intern">Intern</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {/* Personal Information */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  type="date" 
                  label="Date of Birth" 
                  InputLabelProps={{shrink: true}} 
                  value={form.date_of_birth} error={!!validationErrors.date_of_birth} helperText={validationErrors.date_of_birth} 
                  onChange={e => setForm({...form, date_of_birth: e.target.value})} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  select 
                  fullWidth 
                  label="Gender" 
                  value={form.gender} error={!!validationErrors.gender} helperText={validationErrors.gender} 
                  onChange={e => setForm({...form, gender: e.target.value})}
                >
                  <MenuItem value="">Select Gender</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  select 
                  fullWidth 
                  label="Blood Group" 
                  value={form.blood_group} error={!!validationErrors.blood_group} helperText={validationErrors.blood_group} 
                  onChange={e => setForm({...form, blood_group: e.target.value})}
                >
                  <MenuItem value="">Select Blood Group</MenuItem>
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Address" 
                  value={form.address} error={!!validationErrors.address} helperText={validationErrors.address} 
                  onChange={e => setForm({...form, address: e.target.value})} 
                  placeholder="Full Address"
                />
              </Grid>
            </Grid>

            {/* Emergency Contact */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
              Emergency Contact
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Emergency Contact Name" 
                  value={form.emergency_contact_name} error={!!validationErrors.emergency_contact_name} helperText={validationErrors.emergency_contact_name} 
                  onChange={e => setForm({...form, emergency_contact_name: e.target.value})} 
                  placeholder="Contact Person Name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Emergency Contact Phone" 
                  value={form.emergency_contact_phone} error={!!validationErrors.emergency_contact_phone} helperText={validationErrors.emergency_contact_phone} 
                  onChange={e => setForm({...form, emergency_contact_phone: e.target.value})} 
                  placeholder="10-digit mobile number"
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
            </Grid>

            {/* Bank Details */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
              Bank Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Bank Name" 
                  value={form.bank_name} error={!!validationErrors.bank_name} helperText={validationErrors.bank_name} 
                  onChange={e => setForm({...form, bank_name: e.target.value})} 
                  placeholder="e.g., HDFC Bank, SBI"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Bank Account Number" 
                  value={form.bank_account_number} error={!!validationErrors.bank_account_number} helperText={validationErrors.bank_account_number} 
                  onChange={e => setForm({...form, bank_account_number: e.target.value})} 
                  placeholder="Account Number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="IFSC Code" 
                  value={form.bank_ifsc} error={!!validationErrors.bank_ifsc} helperText={validationErrors.bank_ifsc} 
                  onChange={e => setForm({...form, bank_ifsc: e.target.value.toUpperCase()})} 
                  placeholder="e.g., HDFC0001234"
                  inputProps={{ maxLength: 11 }}
                />
              </Grid>
            </Grid>

            {/* Government IDs */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
              Government IDs
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="PAN Number" 
                  value={form.pan_number} error={!!validationErrors.pan_number} helperText={validationErrors.pan_number} 
                  onChange={e => setForm({...form, pan_number: e.target.value.toUpperCase()})} 
                  placeholder="e.g., ABCDE1234F"
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Aadhar Number" 
                  value={form.aadhar_number} error={!!validationErrors.aadhar_number} helperText={validationErrors.aadhar_number} 
                  onChange={e => setForm({...form, aadhar_number: e.target.value})} 
                  placeholder="12-digit Aadhar number"
                  inputProps={{ maxLength: 12 }}
                />
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 5 }}>
              <Button fullWidth variant="outlined" onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
              <Button fullWidth variant="contained" onClick={handleSubmit} sx={{ borderRadius: 2, background: 'linear-gradient(45deg, #1976d2, #9c27b0)' }}>Submit Changes</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* View Employee Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' } }}>
        <DialogTitle sx={{ background: 'linear-gradient(45deg, #11998e, #38ef7d)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              {selectedEmployee && getInitials(selectedEmployee.user?.first_name, selectedEmployee.user?.last_name)}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {selectedEmployee?.user?.first_name} {selectedEmployee?.user?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedEmployee?.employee_code}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Basic Info */}
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>Basic Information</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedEmployee.user?.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selectedEmployee.user?.phone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Designation</Typography>
                  <Typography variant="body1">{selectedEmployee.designation}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Department</Typography>
                  <Typography variant="body1">{selectedEmployee.department?.name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Employment Type</Typography>
                  <Typography variant="body1">{selectedEmployee.employment_type}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Joining Date</Typography>
                  <Typography variant="body1">{selectedEmployee.joining_date ? new Date(selectedEmployee.joining_date).toLocaleDateString() : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip label={selectedEmployee.status} color={selectedEmployee.status === 'Active' ? 'success' : 'error'} size="small" />
                </Grid>

                {/* Personal Info */}
                {(selectedEmployee.date_of_birth || selectedEmployee.gender || selectedEmployee.blood_group) && (
                  <>
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Typography variant="h6" color="primary" gutterBottom>Personal Information</Typography>
                    </Grid>
                    {selectedEmployee.date_of_birth && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                        <Typography variant="body1">{new Date(selectedEmployee.date_of_birth).toLocaleDateString()}</Typography>
                      </Grid>
                    )}
                    {selectedEmployee.gender && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Gender</Typography>
                        <Typography variant="body1">{selectedEmployee.gender}</Typography>
                      </Grid>
                    )}
                    {selectedEmployee.blood_group && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Blood Group</Typography>
                        <Typography variant="body1">{selectedEmployee.blood_group}</Typography>
                      </Grid>
                    )}
                    {selectedEmployee.address && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Address</Typography>
                        <Typography variant="body1">{selectedEmployee.address}</Typography>
                      </Grid>
                    )}
                  </>
                )}

                {/* Emergency Contact */}
                {(selectedEmployee.emergency_contact_name || selectedEmployee.emergency_contact_phone) && (
                  <>
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Typography variant="h6" color="primary" gutterBottom>Emergency Contact</Typography>
                    </Grid>
                    {selectedEmployee.emergency_contact_name && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Contact Name</Typography>
                        <Typography variant="body1">{selectedEmployee.emergency_contact_name}</Typography>
                      </Grid>
                    )}
                    {selectedEmployee.emergency_contact_phone && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Contact Phone</Typography>
                        <Typography variant="body1">{selectedEmployee.emergency_contact_phone}</Typography>
                      </Grid>
                    )}
                  </>
                )}

                {/* Bank Details */}
                {(selectedEmployee.bank_name || selectedEmployee.bank_account_number) && (
                  <>
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Typography variant="h6" color="primary" gutterBottom>Bank Details</Typography>
                    </Grid>
                    {selectedEmployee.bank_name && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Bank Name</Typography>
                        <Typography variant="body1">{selectedEmployee.bank_name}</Typography>
                      </Grid>
                    )}
                    {selectedEmployee.bank_account_number && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Account Number</Typography>
                        <Typography variant="body1">{selectedEmployee.bank_account_number}</Typography>
                      </Grid>
                    )}
                    {selectedEmployee.bank_ifsc && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">IFSC Code</Typography>
                        <Typography variant="body1">{selectedEmployee.bank_ifsc}</Typography>
                      </Grid>
                    )}
                  </>
                )}

                {/* Government IDs */}
                {(selectedEmployee.pan_number || selectedEmployee.aadhar_number) && (
                  <>
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Typography variant="h6" color="primary" gutterBottom>Government IDs</Typography>
                    </Grid>
                    {selectedEmployee.pan_number && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">PAN Number</Typography>
                        <Typography variant="body1">{selectedEmployee.pan_number}</Typography>
                      </Grid>
                    )}
                    {selectedEmployee.aadhar_number && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Aadhar Number</Typography>
                        <Typography variant="body1">{selectedEmployee.aadhar_number}</Typography>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 5, borderTop: '1px solid #e0e0e0', pt: 3 }}>
                <Button fullWidth variant="outlined" onClick={() => setViewOpen(false)} sx={{ borderRadius: 2 }}>Close Window</Button>
                <Button fullWidth variant="contained" onClick={() => { setViewOpen(false); handleEdit(selectedEmployee); }} sx={{ borderRadius: 2, background: 'linear-gradient(45deg, #11998e, #38ef7d)' }}>Edit Employee</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenu}
        open={Boolean(exportMenu)}
        onClose={() => setExportMenu(null)}
      >
        <MenuItem onClick={handleExportCSV}>
          <ListItemIcon><Download fontSize="small" /></ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon><Download fontSize="small" /></ListItemIcon>
          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>
        <MenuItem onClick={handlePrint}>
          <ListItemIcon><Print fontSize="small" /></ListItemIcon>
          <ListItemText>Print List</ListItemText>
        </MenuItem>
      </Menu>

      {/* Bulk Action Menu */}
      <Menu
        anchorEl={bulkActionMenu}
        open={Boolean(bulkActionMenu)}
        onClose={() => setBulkActionMenu(null)}
      >
        <MenuItem onClick={() => handleBulkStatusChange('Active')}>
          <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Activate Selected</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkStatusChange('Inactive')}>
          <ListItemIcon><Cancel fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Deactivate Selected</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleBulkEmail}>
          <ListItemIcon><Email fontSize="small" /></ListItemIcon>
          <ListItemText>Send Email to Selected</ListItemText>
        </MenuItem>
      </Menu>

      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Employees</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Upload a CSV file with employee data. Make sure the file follows the template format.
            </Alert>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadTemplate}
              sx={{ mb: 3 }}
            >
              Download CSV Template
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ mb: 2 }}
            >
              {selectedFile ? selectedFile.name : 'Select CSV File'}
            </Button>

            {selectedFile && (
              <Alert severity="success" sx={{ mb: 2 }}>
                File selected: {selectedFile.name}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={() => {
                  setImportDialog(false);
                  setSelectedFile(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                fullWidth 
                variant="contained" 
                onClick={handleImportSubmit}
                disabled={!selectedFile}
              >
                Import
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
