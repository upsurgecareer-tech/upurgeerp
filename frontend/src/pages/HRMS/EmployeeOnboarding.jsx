import { useState, useEffect, useRef } from 'react';
import {
  Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Paper, Typography, Stepper, Step, StepLabel, Card, CardContent,
  MenuItem, Checkbox, FormControlLabel, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Alert, CircularProgress, Tabs, Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { 
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Download as DownloadIcon, 
  Save as SaveIcon, Print as PrintIcon,
  BusinessCenter, Person, Home, Phone, Badge, School, FamilyRestroom, AssignmentTurnedIn 
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { authService } from '../../services/authService';

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient( 136deg, #00f2fe 0%, #4facfe 50%, #00f2fe 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient( 136deg, #00f2fe 0%, #4facfe 50%, #00f2fe 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  ...(ownerState.active && {
    backgroundImage: 'linear-gradient( 136deg, #00f2fe 0%, #4facfe 50%, #00f2fe 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    transform: 'scale(1.1)'
  }),
  ...(ownerState.completed && {
    backgroundImage: 'linear-gradient( 136deg, #00f2fe 0%, #4facfe 50%, #00f2fe 100%)',
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className } = props;
  const icons = {
    1: <BusinessCenter />,
    2: <Person />,
    3: <Home />,
    4: <Phone />,
    5: <Badge />,
    6: <School />,
    7: <FamilyRestroom />,
    8: <AssignmentTurnedIn />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

const EmployeeOnboarding = () => {
  const printRef = useRef();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [openChecklist, setOpenChecklist] = useState(false);
  const [checklistMode, setChecklistMode] = useState('add');
  const [copyAddress, setCopyAddress] = useState(false);
  const [existingProfileId, setExistingProfileId] = useState(null);

  const [formData, setFormData] = useState({
    // For Office Use
    employee_id: '',
    department_id: '',
    designation: '',
    date_of_joining: '',
    client: '',
    location: '',
    salary_gross: '',
    client_location: '',
    state: '',
    pf_number: '',
    esi_number: '',

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
    father_name: '',
    father_mobile: '',
    mother_name: '',
    mother_mobile: '',
    marital_status: 'Single',
    wedding_date: '',
    spouse_name: '',
    spouse_dob: '',
    spouse_gender: '',

    // Children
    children: [],

    // Address
    present_address_door: '',
    present_address_building: '',
    present_address_street: '',
    present_address_location: '',
    present_address_city: '',
    present_address_district: '',
    present_address_pin: '',
    present_address_state: '',

    permanent_address_door: '',
    permanent_address_building: '',
    permanent_address_street: '',
    permanent_address_location: '',
    permanent_address_city: '',
    permanent_address_district: '',
    permanent_address_pin: '',
    permanent_address_state: '',

    // Contact Details
    employee_mobile: '',
    employee_email: '',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_mobile: '',

    // Bank Details
    bank_account_name: '',
    bank_name: '',
    bank_branch: '',
    bank_account_number: '',
    bank_ifsc: '',

    // Personal IDs
    aadhar_number: '',
    pan_number: '',
    driving_license_number: '',
    driving_license_issue_date: '',
    driving_license_expiry_date: '',
    passport_number: '',
    passport_issue_date: '',
    passport_expiry_date: '',

    // Languages
    languages: {
      english_read: false,
      english_write: false,
      english_speak: false,
      hindi_read: false,
      hindi_write: false,
      hindi_speak: false,
      marathi_read: false,
      marathi_write: false,
      marathi_speak: false,
    },

    // Education
    education: [],

    // Experience
    total_experience_years: 0,
    total_experience_months: 0,
    previous_employers: [],

    // References
    references: [],

    // Family Details
    family_details: [],

    // Checklist
    checklist: {
      resume: false,
      education_10th: false,
      education_12th: false,
      education_graduation: false,
      education_postgrad: false,
      education_other: false,
      prev_employment_service_cert: false,
      prev_employment_relieving: false,
      prev_employment_appointment: false,
      prev_employment_payslip: false,
      pan_card: false,
      passport: false,
      aadhar: false,
      bank_proof: false,
      photographs: false,
    },
    checklist_completion_date: '',
    checklist_hr_signature: '',
  });

  const [errors, setErrors] = useState({});

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    switch(stepNumber) {
      case 0: // Office Use & Basic Info
        if (!formData.employee_id?.trim()) newErrors.employee_id = 'Employee ID';
        if (!formData.department_id) newErrors.department_id = 'Department';
        if (!formData.designation?.trim()) newErrors.designation = 'Designation';
        if (!formData.date_of_joining?.trim()) newErrors.date_of_joining = 'Date of Joining';
        if (!formData.salary_gross || formData.salary_gross === '' || formData.salary_gross === 0) newErrors.salary_gross = 'Gross Salary';
        break;
      
      case 1: // Personal Details
        if (!formData.first_name?.trim()) newErrors.first_name = 'First Name';
        if (!formData.last_name?.trim()) newErrors.last_name = 'Last Name';
        if (!formData.date_of_birth?.trim()) newErrors.date_of_birth = 'Date of Birth';
        if (!formData.gender?.trim()) newErrors.gender = 'Gender';
        if (!formData.father_name?.trim()) newErrors.father_name = 'Father Name';
        if (!formData.mother_name?.trim()) newErrors.mother_name = 'Mother Name';
        break;
      
      case 2: // Address
        if (!formData.present_address_door?.trim()) newErrors.present_address_door = 'Present Door No';
        if (!formData.present_address_city?.trim()) newErrors.present_address_city = 'Present City';
        if (!formData.present_address_state?.trim()) newErrors.present_address_state = 'Present State';
        if (!formData.permanent_address_door?.trim()) newErrors.permanent_address_door = 'Permanent Door No';
        if (!formData.permanent_address_city?.trim()) newErrors.permanent_address_city = 'Permanent City';
        if (!formData.permanent_address_state?.trim()) newErrors.permanent_address_state = 'Permanent State';
        break;
      
      case 3: // Contact & Bank
        if (!formData.employee_mobile?.trim()) newErrors.employee_mobile = 'Mobile';
        else if (!/^\d{10}$/.test(formData.employee_mobile)) newErrors.employee_mobile = 'Mobile (10 digits)';
        
        if (!formData.employee_email?.trim()) newErrors.employee_email = 'Email';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.employee_email)) newErrors.employee_email = 'Email (invalid)';
        
        if (!formData.emergency_contact_name?.trim()) newErrors.emergency_contact_name = 'Emergency Contact Name';
        if (!formData.emergency_contact_mobile?.trim()) newErrors.emergency_contact_mobile = 'Emergency Contact Mobile';
        else if (!/^[6-9]\d{9}$/.test(formData.emergency_contact_mobile)) newErrors.emergency_contact_mobile = 'Emergency Mobile (10 digits starting with 6-9)';
        
        if (!formData.bank_account_name?.trim()) newErrors.bank_account_name = 'Account Holder Name';
        if (!formData.bank_name?.trim()) newErrors.bank_name = 'Bank Name';
        if (!formData.bank_account_number?.toString().trim()) newErrors.bank_account_number = 'Account Number';
        if (!formData.bank_ifsc?.trim()) newErrors.bank_ifsc = 'IFSC Code';
        else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bank_ifsc.toUpperCase())) newErrors.bank_ifsc = 'IFSC Code (invalid format, e.g., SBIN0001234)';
        break;
      
      case 4: // IDs & Languages
        if (!formData.aadhar_number?.trim()) newErrors.aadhar_number = 'Aadhar';
        else if (!/^\d{12}$/.test(formData.aadhar_number)) newErrors.aadhar_number = 'Aadhar (12 digits)';
        
        if (!formData.pan_number?.trim()) newErrors.pan_number = 'PAN';
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number.toUpperCase())) newErrors.pan_number = 'PAN (invalid format, e.g., ABCDE1234F)';
        break;
      
      default:
        break;
    }
    
    console.log(`Step ${stepNumber} validation:`, newErrors);
    console.log('Form data:', formData);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const steps = [
    'Office Use & Basic Info',
    'Personal Details',
    'Address Details',
    'Contact & Bank',
    'IDs & Languages',
    'Education & Experience',
    'References & Family',
    'Joining Checklist'
  ];

  const designations = [
    'HR Manager', 'HR Executive', 'Senior Accountant', 'Junior Accountant',
    'General Manager', 'Project Manager', 'QA Manager', 'QA Engineer',
    'Software Engineer', 'Senior Software Engineer', 'Full Stack Developer',
    'Frontend Developer', 'Backend Developer', 'DevOps Engineer',
    'Sales Manager', 'Marketing Manager', 'Operations Manager', 'Team Lead'
  ];

  useEffect(() => {
    fetchDepartments();
    fetchSelfProfile();
  }, []);

  const fetchSelfProfile = async () => {
    try {
      const res = await api.get('/hrms/employees/self/profile');
      if (res.data && res.data.employee) {
        const emp = res.data.employee;
        setExistingProfileId(emp.id);
        setFormData(prev => ({
          ...prev,
          employee_id: emp.employee_code || prev.employee_id,
          department_id: emp.department_id || prev.department_id,
          designation: emp.designation || prev.designation,
          date_of_joining: emp.joining_date ? emp.joining_date.substring(0, 10) : prev.date_of_joining,
          first_name: emp.user?.first_name || prev.first_name,
          last_name: emp.user?.last_name || prev.last_name,
          employee_email: emp.user?.email || prev.employee_email,
          employee_mobile: emp.user?.phone || prev.employee_mobile,
          date_of_birth: emp.date_of_birth ? emp.date_of_birth.substring(0, 10) : prev.date_of_birth,
          gender: emp.gender || prev.gender,
          blood_group: emp.blood_group || prev.blood_group,
          pan_number: emp.pan_number || prev.pan_number,
          aadhar_number: emp.aadhar_number || prev.aadhar_number,
          bank_name: emp.bank_name || prev.bank_name,
          bank_account_number: emp.bank_account_number || prev.bank_account_number,
          bank_ifsc: emp.bank_ifsc || prev.bank_ifsc,
          emergency_contact_name: emp.emergency_contact_name || prev.emergency_contact_name,
          emergency_contact_mobile: emp.emergency_contact_phone || prev.emergency_contact_mobile
        }));
      }
    } catch (error) {
      console.log('No existing self profile found, starting fresh onboarding');
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/hrms/departments');
      setDepartments(res.data.departments || res.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLanguageChange = (lang, type) => {
    setFormData(prev => ({
      ...prev,
      languages: {
        ...prev.languages,
        [lang]: !prev.languages[lang]
      }
    }));
  };

  const handleChecklistChange = (field) => {
    setFormData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [field]: !prev.checklist[field]
      }
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { course: '', institution: '', university: '', year: '', marks: '', specialization: '' }]
    }));
  };

  const updateEducation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => i === index ? { ...edu, [field]: value } : edu)
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addPreviousEmployer = () => {
    setFormData(prev => ({
      ...prev,
      previous_employers: [...prev.previous_employers, { company_name: '', address: '', from_date: '', to_date: '', designation: '', industry: '', ctc: '' }]
    }));
  };

  const updatePreviousEmployer = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      previous_employers: prev.previous_employers.map((emp, i) => i === index ? { ...emp, [field]: value } : emp)
    }));
  };

  const removePreviousEmployer = (index) => {
    setFormData(prev => ({
      ...prev,
      previous_employers: prev.previous_employers.filter((_, i) => i !== index)
    }));
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, { name: '', designation: '', organization: '', address: '', contact: '', years_acquaintance: '' }]
    }));
  };

  const updateReference = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => i === index ? { ...ref, [field]: value } : ref)
    }));
  };

  const removeReference = (index) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  const addFamily = () => {
    setFormData(prev => ({
      ...prev,
      family_details: [...prev.family_details, { relation: '', name: '', mobile: '', email: '', age: '', designation: '' }]
    }));
  };

  const updateFamily = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      family_details: prev.family_details.map((fam, i) => i === index ? { ...fam, [field]: value } : fam)
    }));
  };

  const removeFamily = (index) => {
    setFormData(prev => ({
      ...prev,
      family_details: prev.family_details.filter((_, i) => i !== index)
    }));
  };

  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      children: [...prev.children, { name: '', dob: '', gender: '' }]
    }));
  };

  const updateChild = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.map((child, i) => i === index ? { ...child, [field]: value } : child)
    }));
  };

  const removeChild = (index) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const handleCopyAddress = (e) => {
    const isChecked = e.target.checked;
    setCopyAddress(isChecked);
    
    if (isChecked) {
      // Copy present address to permanent address
      setFormData(prev => ({
        ...prev,
        permanent_address_door: prev.present_address_door,
        permanent_address_building: prev.present_address_building,
        permanent_address_street: prev.present_address_street,
        permanent_address_location: prev.present_address_location,
        permanent_address_city: prev.present_address_city,
        permanent_address_district: prev.present_address_district,
        permanent_address_pin: prev.present_address_pin,
        permanent_address_state: prev.present_address_state
      }));
      toast.info('Permanent Address copied from Present Address');
    }
  };

  const handleSaveAndNext = () => {
    console.log('Save & Next clicked, current step:', activeStep);
    console.log('Current form data:', formData);
    
    // Validate current step
    const { isValid, errors: validationErrors } = validateStep(activeStep);
    console.log('Validation result:', isValid);
    console.log('Validation errors:', validationErrors);
    
    if (!isValid) {
      setErrors(validationErrors);
      const errorFields = Object.values(validationErrors).filter(Boolean);
      const errorMessage = errorFields.length > 0 
        ? `Please fill required fields: ${errorFields.join(', ')}`
        : 'Please fill all required fields';
      toast.error(errorMessage);
      return;
    }

    // Clear errors and move to next step
    setErrors({});
    toast.success(`Step ${activeStep + 1} completed`);
    setActiveStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    console.log('Submit clicked, validating all steps...');
    
    // Validate all previous steps first
    for (let i = 0; i < steps.length; i++) {
      const { isValid, errors: validationErrors } = validateStep(i);
      if (!isValid) {
        console.log(`Step ${i} validation failed:`, validationErrors);
        setErrors(validationErrors);
        setActiveStep(i);
        const errorFields = Object.values(validationErrors).filter(Boolean);
        toast.error(`Please complete Step ${i + 1}: ${errorFields.join(', ')}`);
        return;
      }
    }

    try {
      setLoading(true);
      console.log('All validations passed, submitting form...');
      
      // Get current user ID from authService
      const currentUser = authService.getCurrentUser() || {};
      console.log('Current user:', currentUser);
      
      // Validate required fields before sending
      if (!currentUser.id) {
        toast.error('User not logged in. Please login again.');
        setLoading(false);
        return;
      }
      
      if (!formData.department_id) {
        toast.error('Department is required');
        setLoading(false);
        return;
      }
      
      const payload = {
        user_id: parseInt(currentUser.id),
        department_id: parseInt(formData.department_id),
        designation: formData.designation.trim(),
        joining_date: formData.date_of_joining,
        employment_type: 'Full-Time',
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        blood_group: formData.blood_group || null,
        address: `${formData.present_address_door}, ${formData.present_address_building}, ${formData.present_address_street}, ${formData.present_address_city}, ${formData.present_address_state}, ${formData.present_address_pin}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim(),
        emergency_contact_name: formData.emergency_contact_name.trim(),
        emergency_contact_phone: formData.emergency_contact_mobile.trim(),
        bank_name: formData.bank_name?.trim() || null,
        bank_account_number: formData.bank_account_number?.toString().trim() || null,
        bank_ifsc: formData.bank_ifsc?.trim().toUpperCase() || null,
        pan_number: formData.pan_number?.trim().toUpperCase() || null,
        aadhar_number: formData.aadhar_number?.trim() || null
      };

      console.log('Payload to send:', JSON.stringify(payload, null, 2));
      let res;
      if (existingProfileId) {
        console.log('Updating existing self profile:', existingProfileId);
        res = await api.put('/hrms/employees/self/profile', payload);
      } else {
        console.log('Creating new employee profile');
        res = await api.post('/hrms/employees', payload);
      }
      console.log('Response:', res.data);
      
      toast.success('Employee Onboarding Form Submitted Successfully!');
      resetForm();
      setActiveStep(0);
      setErrors({});
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error status:', error.response?.status);
      
      // Show detailed validation errors
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => `${err.field}: ${err.message}`).join('\n');
        toast.error(`Validation failed:\n${errorMessages}`);
      } else {
        toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to submit form');
      }
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({
      employee_id: '',
      department_id: '',
      designation: '',
      date_of_joining: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      blood_group: '',
      employee_mobile: '',
      employee_email: '',
      bank_account_number: '',
      aadhar_number: '',
      pan_number: '',
      children: [],
      education: [],
      previous_employers: [],
      references: [],
      family_details: [],
      languages: {
        english_read: false,
        english_write: false,
        english_speak: false,
        hindi_read: false,
        hindi_write: false,
        hindi_speak: false,
        marathi_read: false,
        marathi_write: false,
        marathi_speak: false,
      },
      checklist: {
        resume: false,
        education_10th: false,
        education_12th: false,
        education_graduation: false,
        education_postgrad: false,
        education_other: false,
        prev_employment_service_cert: false,
        prev_employment_relieving: false,
        prev_employment_appointment: false,
        prev_employment_payslip: false,
        pan_card: false,
        passport: false,
        aadhar: false,
        bank_proof: false,
        photographs: false,
      }
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=600');
    const employeeName = `${formData.first_name} ${formData.middle_name} ${formData.last_name}`.trim();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Employee Onboarding Form - ${employeeName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .section { margin-bottom: 20px; page-break-inside: avoid; }
            .section-title { font-size: 16px; font-weight: bold; color: #1976d2; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .row { display: flex; gap: 20px; margin-bottom: 10px; flex-wrap: wrap; }
            .field { flex: 1; min-width: 200px; }
            .field-label { font-weight: bold; font-size: 12px; color: #666; }
            .field-value { font-size: 13px; margin-top: 3px; padding: 5px; background-color: #f5f5f5; border-radius: 3px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th { background-color: #1976d2; color: white; padding: 8px; text-align: left; }
            td { border: 1px solid #ddd; padding: 8px; }
            .checkbox-group { display: flex; gap: 15px; flex-wrap: wrap; }
            .checkbox-item { font-size: 12px; }
            .signature-section { margin-top: 30px; display: flex; gap: 40px; }
            .signature-line { flex: 1; }
            .line { border-top: 1px solid #000; margin-top: 30px; padding-top: 5px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>UPSURGE INFOTECH</h2>
            <h3>New Employee Onboarding Form</h3>
            <p>Thane West & Andheri West</p>
          </div>

          <div class="section">
            <div class="section-title">Office Use Only</div>
            <div class="row">
              <div class="field">
                <div class="field-label">Employee ID</div>
                <div class="field-value">${formData.employee_id || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Date of Joining</div>
                <div class="field-value">${formData.date_of_joining || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Department</div>
                <div class="field-value">${formData.designation || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">PF Number</div>
                <div class="field-value">${formData.pf_number || 'N/A'}</div>
              </div>
            </div>
            <div class="row">
              <div class="field">
                <div class="field-label">Client</div>
                <div class="field-value">${formData.client || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Salary / Gross</div>
                <div class="field-value">${formData.salary_gross || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">ESI Number</div>
                <div class="field-value">${formData.esi_number || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Personal Details</div>
            <div class="row">
              <div class="field">
                <div class="field-label">First Name</div>
                <div class="field-value">${formData.first_name || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Middle Name</div>
                <div class="field-value">${formData.middle_name || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Last Name</div>
                <div class="field-value">${formData.last_name || 'N/A'}</div>
              </div>
            </div>
            <div class="row">
              <div class="field">
                <div class="field-label">Date of Birth</div>
                <div class="field-value">${formData.date_of_birth || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Gender</div>
                <div class="field-value">${formData.gender || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Blood Group</div>
                <div class="field-value">${formData.blood_group || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Nationality</div>
                <div class="field-value">${formData.nationality || 'N/A'}</div>
              </div>
            </div>
            <div class="row">
              <div class="field">
                <div class="field-label">Father's Name</div>
                <div class="field-value">${formData.father_name || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Mother's Name</div>
                <div class="field-value">${formData.mother_name || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Marital Status</div>
                <div class="field-value">${formData.marital_status || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Address for Correspondence</div>
            <div class="row">
              <div class="field" style="flex: 1 0 100%;">
                <div class="field-label">Present Address</div>
                <div class="field-value">${formData.present_address_door || ''} ${formData.present_address_building || ''}, ${formData.present_address_street || ''}, ${formData.present_address_city || ''}, ${formData.present_address_pin || ''}</div>
              </div>
            </div>
            <div class="row">
              <div class="field" style="flex: 1 0 100%;">
                <div class="field-label">Permanent Address</div>
                <div class="field-value">${formData.permanent_address_door || ''} ${formData.permanent_address_building || ''}, ${formData.permanent_address_street || ''}, ${formData.permanent_address_city || ''}, ${formData.permanent_address_pin || ''}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Contact & Bank Details</div>
            <div class="row">
              <div class="field">
                <div class="field-label">Mobile</div>
                <div class="field-value">${formData.employee_mobile || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Email</div>
                <div class="field-value">${formData.employee_email || 'N/A'}</div>
              </div>
            </div>
            <div class="row">
              <div class="field">
                <div class="field-label">Emergency Contact</div>
                <div class="field-value">${formData.emergency_contact_name || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Emergency Contact Mobile</div>
                <div class="field-value">${formData.emergency_contact_mobile || 'N/A'}</div>
              </div>
            </div>
            <div class="row">
              <div class="field">
                <div class="field-label">Bank Name</div>
                <div class="field-value">${formData.bank_name || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Account Number</div>
                <div class="field-value">${formData.bank_account_number || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">IFSC Code</div>
                <div class="field-value">${formData.bank_ifsc || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Personal IDs</div>
            <div class="row">
              <div class="field">
                <div class="field-label">Aadhar Number</div>
                <div class="field-value">${formData.aadhar_number || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">PAN Number</div>
                <div class="field-value">${formData.pan_number || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Driving License</div>
                <div class="field-value">${formData.driving_license_number || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Passport</div>
                <div class="field-value">${formData.passport_number || 'N/A'}</div>
              </div>
            </div>
          </div>

          ${formData.education.length > 0 ? `
          <div class="section">
            <div class="section-title">Education Details</div>
            <table>
              <tr>
                <th>Course</th>
                <th>Institution</th>
                <th>University</th>
                <th>Year</th>
                <th>Marks %</th>
              </tr>
              ${formData.education.map(edu => `
              <tr>
                <td>${edu.course || ''}</td>
                <td>${edu.institution || ''}</td>
                <td>${edu.university || ''}</td>
                <td>${edu.year || ''}</td>
                <td>${edu.marks || ''}</td>
              </tr>
              `).join('')}
            </table>
          </div>
          ` : ''}

          ${formData.previous_employers.length > 0 ? `
          <div class="section">
            <div class="section-title">Work Experience</div>
            <table>
              <tr>
                <th>Company</th>
                <th>Designation</th>
                <th>From</th>
                <th>To</th>
                <th>CTC</th>
              </tr>
              ${formData.previous_employers.map(emp => `
              <tr>
                <td>${emp.company_name || ''}</td>
                <td>${emp.designation || ''}</td>
                <td>${emp.from_date || ''}</td>
                <td>${emp.to_date || ''}</td>
                <td>${emp.ctc || ''}</td>
              </tr>
              `).join('')}
            </table>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Declaration by Employee</div>
            <p style="font-size: 12px; line-height: 1.6;">
              I hereby attest that all statements made in this application are true and correct to the best of my knowledge. 
              I understand and agree that any deception, fraud on providing false or misleading statements of material facts 
              in this application may cause the forfeiture of all rights to employment or immediate termination if discovered after employment.
            </p>
          </div>

          <div class="signature-section">
            <div class="signature-line">
              <div style="font-size: 12px; font-weight: bold;">Employee Signature</div>
              <div class="line"></div>
            </div>
            <div class="signature-line">
              <div style="font-size: 12px; font-weight: bold;">HR Name & Signature</div>
              <div class="line"></div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const employeeName = `${formData.first_name} ${formData.middle_name} ${formData.last_name}`.trim();
      
      // Create a simple HTML-to-Image approach using canvas and PDF
      // For a better solution, consider installing jsPDF package
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Employee Onboarding Form - ${employeeName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .header h2 { margin: 5px 0; color: #1976d2; }
              .section { margin-bottom: 20px; }
              .section-title { font-size: 14px; font-weight: bold; color: #1976d2; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
              .row { display: flex; gap: 20px; margin-bottom: 8px; flex-wrap: wrap; }
              .field { flex: 1; min-width: 150px; }
              .field-label { font-weight: bold; font-size: 11px; color: #555; }
              .field-value { font-size: 11px; margin-top: 2px; padding: 3px; background-color: #f9f9f9; border: 1px solid #eee; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
              th { background-color: #1976d2; color: white; padding: 6px; text-align: left; }
              td { border: 1px solid #ddd; padding: 6px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>UPSURGE INFOTECH</h2>
              <p>New Employee Onboarding Form</p>
              <p>Thane West & Andheri West</p>
            </div>

            <div class="section">
              <div class="section-title">Employee Information</div>
              <div class="row">
                <div class="field">
                  <div class="field-label">Employee Name</div>
                  <div class="field-value">${employeeName}</div>
                </div>
                <div class="field">
                  <div class="field-label">Email</div>
                  <div class="field-value">${formData.employee_email}</div>
                </div>
                <div class="field">
                  <div class="field-label">Mobile</div>
                  <div class="field-value">${formData.employee_mobile}</div>
                </div>
              </div>
              <div class="row">
                <div class="field">
                  <div class="field-label">Employee ID</div>
                  <div class="field-value">${formData.employee_id}</div>
                </div>
                <div class="field">
                  <div class="field-label">Designation</div>
                  <div class="field-value">${formData.designation}</div>
                </div>
                <div class="field">
                  <div class="field-label">Date of Joining</div>
                  <div class="field-value">${formData.date_of_joining}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Personal Details</div>
              <div class="row">
                <div class="field">
                  <div class="field-label">DOB</div>
                  <div class="field-value">${formData.date_of_birth}</div>
                </div>
                <div class="field">
                  <div class="field-label">Gender</div>
                  <div class="field-value">${formData.gender}</div>
                </div>
                <div class="field">
                  <div class="field-label">Blood Group</div>
                  <div class="field-value">${formData.blood_group}</div>
                </div>
                <div class="field">
                  <div class="field-label">Aadhar</div>
                  <div class="field-value">${formData.aadhar_number}</div>
                </div>
              </div>
              <div class="row">
                <div class="field">
                  <div class="field-label">PAN</div>
                  <div class="field-value">${formData.pan_number}</div>
                </div>
                <div class="field">
                  <div class="field-label">Marital Status</div>
                  <div class="field-value">${formData.marital_status}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Address</div>
              <div class="row">
                <div class="field" style="flex: 1 0 100%;">
                  <div class="field-label">Present Address</div>
                  <div class="field-value">${formData.present_address_door} ${formData.present_address_building}, ${formData.present_address_street}, ${formData.present_address_city}, ${formData.present_address_pin}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Bank Details</div>
              <div class="row">
                <div class="field">
                  <div class="field-label">Bank Name</div>
                  <div class="field-value">${formData.bank_name}</div>
                </div>
                <div class="field">
                  <div class="field-label">Account No</div>
                  <div class="field-value">${formData.bank_account_number}</div>
                </div>
                <div class="field">
                  <div class="field-label">IFSC</div>
                  <div class="field-value">${formData.bank_ifsc}</div>
                </div>
              </div>
            </div>

            <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #666;">
              <p>This is a system-generated document. Please retain for official records.</p>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
          </body>
        </html>
      `;

      // Create blob and download as HTML (user can save as PDF from browser)
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Employee_Onboarding_${employeeName.replace(/\s+/g, '_')}_${new Date().getTime()}.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Form downloaded! You can print/save as PDF from your browser.');
    } catch (error) {
      toast.error('Failed to download form');
      console.error('Error:', error);
    }
  };

  // Render Step Content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Typography variant="h6" sx={{ mb: 2, width: '100%' }}>For Office Use Only</Typography>
            <Grid item xs={12} sm={6}>
              <TextField label="Employee ID *" name="employee_id" value={formData.employee_id} onChange={handleChange} fullWidth size="small" required error={!!errors.employee_id} helperText={errors.employee_id} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Department *" name="department_id" value={formData.department_id} onChange={handleChange} fullWidth size="small" required error={!!errors.department_id} helperText={errors.department_id}>
                <MenuItem value="">Select Department</MenuItem>
                {departments.map(dept => <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Designation *" name="designation" value={formData.designation} onChange={handleChange} fullWidth size="small" required error={!!errors.designation} helperText={errors.designation}>
                <MenuItem value="">Select Designation</MenuItem>
                {designations.map(des => <MenuItem key={des} value={des}>{des}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Date of Joining *" name="date_of_joining" type="date" value={formData.date_of_joining} onChange={handleChange} fullWidth size="small" required InputLabelProps={{ shrink: true }} error={!!errors.date_of_joining} helperText={errors.date_of_joining} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Client" name="client" value={formData.client} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Location" name="location" value={formData.location} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Salary / Gross *" name="salary_gross" type="number" value={formData.salary_gross} onChange={handleChange} fullWidth size="small" required error={!!errors.salary_gross} helperText={errors.salary_gross} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Client Location" name="client_location" value={formData.client_location} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="State" name="state" value={formData.state} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="PF Number" name="pf_number" value={formData.pf_number} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="ESI Number" name="esi_number" value={formData.esi_number} onChange={handleChange} fullWidth size="small" />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Typography variant="h6" sx={{ mb: 2, width: '100%' }}>Personal Details</Typography>
            <Grid item xs={12} sm={4}>
              <TextField label="First Name *" name="first_name" value={formData.first_name} onChange={handleChange} fullWidth size="small" required error={!!errors.first_name} helperText={errors.first_name} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Middle Name" name="middle_name" value={formData.middle_name} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Last Name *" name="last_name" value={formData.last_name} onChange={handleChange} fullWidth size="small" required error={!!errors.last_name} helperText={errors.last_name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Date of Birth *" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} fullWidth size="small" required InputLabelProps={{ shrink: true }} error={!!errors.date_of_birth} helperText={errors.date_of_birth} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Gender *" name="gender" value={formData.gender} onChange={handleChange} fullWidth size="small" required error={!!errors.gender} helperText={errors.gender}>
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Place of Birth" name="place_of_birth" value={formData.place_of_birth} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Religion" name="religion" value={formData.religion} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Blood Group" name="blood_group" value={formData.blood_group} onChange={handleChange} fullWidth size="small">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <MenuItem key={bg} value={bg}>{bg}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Father's Name *" name="father_name" value={formData.father_name} onChange={handleChange} fullWidth size="small" required error={!!errors.father_name} helperText={errors.father_name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Father's Mobile" name="father_mobile" value={formData.father_mobile} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Mother's Name *" name="mother_name" value={formData.mother_name} onChange={handleChange} fullWidth size="small" required error={!!errors.mother_name} helperText={errors.mother_name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Mother's Mobile" name="mother_mobile" value={formData.mother_mobile} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Marital Status" name="marital_status" value={formData.marital_status} onChange={handleChange} fullWidth size="small">
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Married">Married</MenuItem>
                <MenuItem value="Widow">Widow</MenuItem>
                <MenuItem value="Separated">Separated</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Wedding Date" name="wedding_date" type="date" value={formData.wedding_date} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Spouse Name" name="spouse_name" value={formData.spouse_name} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Spouse DOB" name="spouse_dob" type="date" value={formData.spouse_dob} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>

            {/* Children */}
            <Grid item xs={12}>
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1">Children Details</Typography>
                  <Table size="small" sx={{ mt: 1 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>Name</TableCell>
                        <TableCell>DOB</TableCell>
                        <TableCell>Gender</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.children.map((child, idx) => (
                        <TableRow key={idx}>
                          <TableCell><TextField size="small" value={child.name} onChange={(e) => updateChild(idx, 'name', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" type="date" value={child.dob} onChange={(e) => updateChild(idx, 'dob', e.target.value)} InputLabelProps={{ shrink: true }} /></TableCell>
                          <TableCell>
                            <TextField select size="small" value={child.gender} onChange={(e) => updateChild(idx, 'gender', e.target.value)}>
                              <MenuItem value="Male">Male</MenuItem>
                              <MenuItem value="Female">Female</MenuItem>
                            </TextField>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={() => removeChild(idx)}><DeleteIcon fontSize="small" /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button startIcon={<AddIcon />} onClick={addChild} sx={{ mt: 1 }} size="small">Add Child</Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={2}>
            <Typography variant="h6" sx={{ mb: 2, width: '100%' }}>Address for Correspondence</Typography>

            {/* Present Address */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Present Address</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Door No & Floor *" name="present_address_door" value={formData.present_address_door} onChange={handleChange} fullWidth size="small" required error={!!errors.present_address_door} helperText={errors.present_address_door} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Building Name & Wing" name="present_address_building" value={formData.present_address_building} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Street Name & Number" name="present_address_street" value={formData.present_address_street} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Location" name="present_address_location" value={formData.present_address_location} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="City *" name="present_address_city" value={formData.present_address_city} onChange={handleChange} fullWidth size="small" required error={!!errors.present_address_city} helperText={errors.present_address_city} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="District/Taluka" name="present_address_district" value={formData.present_address_district} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Pin Code" name="present_address_pin" value={formData.present_address_pin} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="State *" name="present_address_state" value={formData.present_address_state} onChange={handleChange} fullWidth size="small" required error={!!errors.present_address_state} helperText={errors.present_address_state} />
            </Grid>

            {/* Permanent Address */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Permanent Address</Typography>
                <FormControlLabel
                  control={<Checkbox checked={copyAddress} onChange={handleCopyAddress} />}
                  label="Same as Present Address"
                  sx={{ mb: 1 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Door No & Floor *" name="permanent_address_door" value={formData.permanent_address_door} onChange={handleChange} fullWidth size="small" required error={!!errors.permanent_address_door} helperText={errors.permanent_address_door} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Building Name & Wing" name="permanent_address_building" value={formData.permanent_address_building} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Street Name & Number" name="permanent_address_street" value={formData.permanent_address_street} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Location" name="permanent_address_location" value={formData.permanent_address_location} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="City *" name="permanent_address_city" value={formData.permanent_address_city} onChange={handleChange} fullWidth size="small" required error={!!errors.permanent_address_city} helperText={errors.permanent_address_city} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="District/Taluka" name="permanent_address_district" value={formData.permanent_address_district} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Pin Code" name="permanent_address_pin" value={formData.permanent_address_pin} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="State *" name="permanent_address_state" value={formData.permanent_address_state} onChange={handleChange} fullWidth size="small" required error={!!errors.permanent_address_state} helperText={errors.permanent_address_state} />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={2}>
            <Typography variant="h6" sx={{ mb: 2, width: '100%' }}>Contact & Bank Details</Typography>

            <Typography variant="subtitle2" sx={{ mb: 1, width: '100%', fontWeight: 'bold' }}>Contact Details</Typography>
            <Grid item xs={12} sm={6}>
              <TextField label="Employee Mobile *" name="employee_mobile" value={formData.employee_mobile} onChange={handleChange} fullWidth size="small" required error={!!errors.employee_mobile} helperText={errors.employee_mobile} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Employee Email *" name="employee_email" type="email" value={formData.employee_email} onChange={handleChange} fullWidth size="small" required error={!!errors.employee_email} helperText={errors.employee_email} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Emergency Contact Name *" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} fullWidth size="small" required error={!!errors.emergency_contact_name} helperText={errors.emergency_contact_name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Relationship" name="emergency_contact_relationship" value={formData.emergency_contact_relationship} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Emergency Contact Mobile *" name="emergency_contact_mobile" value={formData.emergency_contact_mobile} onChange={handleChange} fullWidth size="small" required error={!!errors.emergency_contact_mobile} helperText={errors.emergency_contact_mobile || 'Enter 10 digit mobile starting with 6-9'} inputProps={{ maxLength: 10 }} />
            </Grid>

            <Typography variant="subtitle2" sx={{ mb: 1, width: '100%', fontWeight: 'bold', mt: 2 }}>Bank Account Details</Typography>
            <Grid item xs={12} sm={6}>
              <TextField label="Name as per Bank *" name="bank_account_name" value={formData.bank_account_name} onChange={handleChange} fullWidth size="small" required error={!!errors.bank_account_name} helperText={errors.bank_account_name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Bank Name *" name="bank_name" value={formData.bank_name} onChange={handleChange} fullWidth size="small" required error={!!errors.bank_name} helperText={errors.bank_name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Branch" name="bank_branch" value={formData.bank_branch} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Account Number *" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} fullWidth size="small" required error={!!errors.bank_account_number} helperText={errors.bank_account_number} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="IFSC Code *" name="bank_ifsc" value={formData.bank_ifsc} onChange={handleChange} fullWidth size="small" required error={!!errors.bank_ifsc} helperText={errors.bank_ifsc || 'e.g., SBIN0001234'} inputProps={{ style: { textTransform: 'uppercase' }, maxLength: 11 }} />
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={2}>
            <Typography variant="h6" sx={{ mb: 2, width: '100%' }}>Personal IDs & Languages</Typography>

            <Typography variant="subtitle2" sx={{ mb: 1, width: '100%', fontWeight: 'bold' }}>Personal IDs</Typography>
            <Grid item xs={12} sm={6}>
              <TextField label="Aadhar Number *" name="aadhar_number" value={formData.aadhar_number} onChange={handleChange} fullWidth size="small" required error={!!errors.aadhar_number} helperText={errors.aadhar_number} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="PAN Number *" name="pan_number" value={formData.pan_number} onChange={handleChange} fullWidth size="small" required error={!!errors.pan_number} helperText={errors.pan_number || 'e.g., ABCDE1234F'} inputProps={{ style: { textTransform: 'uppercase' }, maxLength: 10 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Driving License Number" name="driving_license_number" value={formData.driving_license_number} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="License Issue Date" name="driving_license_issue_date" type="date" value={formData.driving_license_issue_date} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="License Expiry Date" name="driving_license_expiry_date" type="date" value={formData.driving_license_expiry_date} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Passport Number" name="passport_number" value={formData.passport_number} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Passport Issue Date" name="passport_issue_date" type="date" value={formData.passport_issue_date} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Passport Expiry Date" name="passport_expiry_date" type="date" value={formData.passport_expiry_date} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>

            <Typography variant="subtitle2" sx={{ mb: 1, width: '100%', fontWeight: 'bold', mt: 2 }}>Languages Known</Typography>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {['English', 'Hindi', 'Marathi'].map(lang => (
                  <Grid item xs={12} sm={4} key={lang}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2">{lang}</Typography>
                        <FormControlLabel control={<Checkbox checked={formData.languages[`${lang.toLowerCase()}_read`]} onChange={() => handleLanguageChange(`${lang.toLowerCase()}_read`)} />} label="Read" />
                        <FormControlLabel control={<Checkbox checked={formData.languages[`${lang.toLowerCase()}_write`]} onChange={() => handleLanguageChange(`${lang.toLowerCase()}_write`)} />} label="Write" />
                        <FormControlLabel control={<Checkbox checked={formData.languages[`${lang.toLowerCase()}_speak`]} onChange={() => handleLanguageChange(`${lang.toLowerCase()}_speak`)} />} label="Speak" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        );

      case 5:
        return (
          <Grid container spacing={2}>
            <Typography variant="h6" sx={{ mb: 2, width: '100%' }}>Education & Work Experience</Typography>

            {/* Education */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Educational Qualification</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>Course</TableCell>
                        <TableCell>Institution</TableCell>
                        <TableCell>University</TableCell>
                        <TableCell>Year</TableCell>
                        <TableCell>Marks %</TableCell>
                        <TableCell>Specialization</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.education.map((edu, idx) => (
                        <TableRow key={idx}>
                          <TableCell><TextField size="small" value={edu.course} onChange={(e) => updateEducation(idx, 'course', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" value={edu.institution} onChange={(e) => updateEducation(idx, 'institution', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" value={edu.university} onChange={(e) => updateEducation(idx, 'university', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" type="number" value={edu.year} onChange={(e) => updateEducation(idx, 'year', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" type="number" value={edu.marks} onChange={(e) => updateEducation(idx, 'marks', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" value={edu.specialization} onChange={(e) => updateEducation(idx, 'specialization', e.target.value)} /></TableCell>
                          <TableCell align="center"><IconButton size="small" onClick={() => removeEducation(idx)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button startIcon={<AddIcon />} onClick={addEducation} sx={{ mt: 1 }} size="small">Add Education</Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Experience */}
            <Grid item xs={12} sm={6}>
              <TextField label="Total Experience (Years)" name="total_experience_years" type="number" value={formData.total_experience_years} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Total Experience (Months)" name="total_experience_months" type="number" value={formData.total_experience_months} onChange={handleChange} fullWidth size="small" />
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Previous Employment Details</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>Company</TableCell>
                        <TableCell>From</TableCell>
                        <TableCell>To</TableCell>
                        <TableCell>Designation</TableCell>
                        <TableCell>Industry</TableCell>
                        <TableCell>CTC</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.previous_employers.map((emp, idx) => (
                        <TableRow key={idx}>
                          <TableCell><TextField size="small" value={emp.company_name} onChange={(e) => updatePreviousEmployer(idx, 'company_name', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" type="date" value={emp.from_date} onChange={(e) => updatePreviousEmployer(idx, 'from_date', e.target.value)} InputLabelProps={{ shrink: true }} /></TableCell>
                          <TableCell><TextField size="small" type="date" value={emp.to_date} onChange={(e) => updatePreviousEmployer(idx, 'to_date', e.target.value)} InputLabelProps={{ shrink: true }} /></TableCell>
                          <TableCell><TextField size="small" value={emp.designation} onChange={(e) => updatePreviousEmployer(idx, 'designation', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" value={emp.industry} onChange={(e) => updatePreviousEmployer(idx, 'industry', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" type="number" value={emp.ctc} onChange={(e) => updatePreviousEmployer(idx, 'ctc', e.target.value)} /></TableCell>
                          <TableCell align="center"><IconButton size="small" onClick={() => removePreviousEmployer(idx)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button startIcon={<AddIcon />} onClick={addPreviousEmployer} sx={{ mt: 1 }} size="small">Add Employer</Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 6:
        return (
          <Grid container spacing={2}>
            <Typography variant="h6" sx={{ mb: 2, width: '100%' }}>References & Family Details</Typography>

            {/* References */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Reference Details</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>Name</TableCell>
                        <TableCell>Designation</TableCell>
                        <TableCell>Organization</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Years Known</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.references.map((ref, idx) => (
                        <TableRow key={idx}>
                          <TableCell><TextField size="small" value={ref.name} onChange={(e) => updateReference(idx, 'name', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" value={ref.designation} onChange={(e) => updateReference(idx, 'designation', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" value={ref.organization} onChange={(e) => updateReference(idx, 'organization', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" value={ref.contact} onChange={(e) => updateReference(idx, 'contact', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" type="number" value={ref.years_acquaintance} onChange={(e) => updateReference(idx, 'years_acquaintance', e.target.value)} /></TableCell>
                          <TableCell align="center"><IconButton size="small" onClick={() => removeReference(idx)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button startIcon={<AddIcon />} onClick={addReference} sx={{ mt: 1 }} size="small">Add Reference</Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Family Details */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Family Details</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>Relation</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Mobile</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Age</TableCell>
                        <TableCell>Designation</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.family_details.map((fam, idx) => (
                        <TableRow key={idx}>
                          <TableCell><TextField size="small" value={fam.relation} onChange={(e) => updateFamily(idx, 'relation', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" value={fam.name} onChange={(e) => updateFamily(idx, 'name', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" value={fam.mobile} onChange={(e) => updateFamily(idx, 'mobile', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" value={fam.email} onChange={(e) => updateFamily(idx, 'email', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" type="number" value={fam.age} onChange={(e) => updateFamily(idx, 'age', e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" value={fam.designation} onChange={(e) => updateFamily(idx, 'designation', e.target.value)} /></TableCell>
                          <TableCell align="center"><IconButton size="small" onClick={() => removeFamily(idx)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button startIcon={<AddIcon />} onClick={addFamily} sx={{ mt: 1 }} size="small">Add Family Member</Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 7:
        return (
          <Grid container spacing={2}>
            <Typography variant="h6" sx={{ mb: 2, width: '100%' }}>New Employee Joining Formalities Checklist</Typography>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>Document Checklist</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <FormControlLabel control={<Checkbox checked={formData.checklist.resume} onChange={() => handleChecklistChange('resume')} />} label="Resume" />
                    </Grid>
                    <Grid item xs={12} sx={{ pl: 4 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Education Certificates</Typography>
                      <FormControlLabel control={<Checkbox checked={formData.checklist.education_10th} onChange={() => handleChecklistChange('education_10th')} />} label="X Standard" />
                      <FormControlLabel control={<Checkbox checked={formData.checklist.education_12th} onChange={() => handleChecklistChange('education_12th')} />} label="XII Standard" />
                      <FormControlLabel control={<Checkbox checked={formData.checklist.education_graduation} onChange={() => handleChecklistChange('education_graduation')} />} label="Graduation" />
                      <FormControlLabel control={<Checkbox checked={formData.checklist.education_postgrad} onChange={() => handleChecklistChange('education_postgrad')} />} label="Post-Graduation" />
                      <FormControlLabel control={<Checkbox checked={formData.checklist.education_other} onChange={() => handleChecklistChange('education_other')} />} label="Other Qualifications" />
                    </Grid>
                    <Grid item xs={12} sx={{ pl: 4 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Previous Employment Proofs</Typography>
                      <FormControlLabel control={<Checkbox checked={formData.checklist.prev_employment_service_cert} onChange={() => handleChecklistChange('prev_employment_service_cert')} />} label="Service Certificate" />
                      <FormControlLabel control={<Checkbox checked={formData.checklist.prev_employment_relieving} onChange={() => handleChecklistChange('prev_employment_relieving')} />} label="Relieving Letter" />
                      <FormControlLabel control={<Checkbox checked={formData.checklist.prev_employment_appointment} onChange={() => handleChecklistChange('prev_employment_appointment')} />} label="Appointment Letter" />
                      <FormControlLabel control={<Checkbox checked={formData.checklist.prev_employment_payslip} onChange={() => handleChecklistChange('prev_employment_payslip')} />} label="Last 3 Months Pay Slip" />
                    </Grid>
                    <Grid item xs={12} sx={{ pl: 4 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>ID & Address Proof</Typography>
                      <FormControlLabel control={<Checkbox checked={formData.checklist.pan_card} onChange={() => handleChecklistChange('pan_card')} />} label="PAN Card (Mandatory)" />
                      <FormControlLabel control={<Checkbox checked={formData.checklist.aadhar} onChange={() => handleChecklistChange('aadhar')} />} label="Aadhar Card (Mandatory)" />
                    </Grid>
                    <Grid item xs={12} sx={{ pl: 4 }}>
                      <FormControlLabel control={<Checkbox checked={formData.checklist.bank_proof} onChange={() => handleChecklistChange('bank_proof')} />} label="Bank Proof (Cancelled Cheque/Passbook)" />
                      <FormControlLabel control={<Checkbox checked={formData.checklist.photographs} onChange={() => handleChecklistChange('photographs')} />} label="Photographs (3)" />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="Completion Date" name="checklist_completion_date" type="date" value={formData.checklist_completion_date} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="HR Name & Signature" name="checklist_hr_signature" value={formData.checklist_hr_signature} onChange={handleChange} fullWidth size="small" />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, background: 'linear-gradient(45deg, #1976d2, #9c27b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Employee Onboarding Portal
        </Typography>

      <Box sx={{ mb: 5, display: { xs: 'none', md: 'block' } }}>
        <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      {/* Mobile Stepper Fallback */}
      <Box sx={{ mb: 3, display: { xs: 'block', md: 'none' } }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
        </Typography>
      </Box>

      <Paper sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 3, 
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {renderStepContent()}
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
            Print Form
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadPDF}>
            Download Form
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0}>
            Previous
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSubmit} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleSaveAndNext} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save & Next'}
            </Button>
          )}
        </Box>
      </Box>
      </Box>
    </Box>
  );
};


export default EmployeeOnboarding;
