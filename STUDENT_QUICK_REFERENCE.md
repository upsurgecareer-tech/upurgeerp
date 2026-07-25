# Student Module - Quick Reference Guide

## 🎯 Quick Access

### Admin Panel
- **URL**: `http://localhost:3001/students`
- **Login**: Use admin credentials

### Student Portal
- **URL**: `http://localhost:3001/student-portal`
- **Login**: Use admission number + password

---

## 📋 Common Tasks

### 1. Add New Student
1. Go to Students page
2. Click "Add Student" button
3. Fill required fields: Name, Mobile
4. Optional: Email, DOB, Gender, Parent details
5. Click "Create Student"
6. ✅ Admission number auto-generated

### 2. Bulk Import Students
1. Click "Bulk Import" button
2. Download sample CSV template
3. Fill student data in CSV
4. Upload CSV file
5. Click "Import Students"
6. ✅ View success/failure report

### 3. Mark Attendance (QR Code)
1. Generate QR code for student
2. Student scans QR at class entry
3. ✅ Attendance marked automatically

### 4. Mark Attendance (Manual)
1. Create attendance session for batch
2. Select students and mark Present/Absent/Late
3. Submit attendance
4. ✅ Attendance saved

### 5. Generate ID Card
1. Go to Student Detail page
2. Click "Generate ID Card"
3. ✅ PDF ID card with QR code generated
4. Download or print

### 6. Generate Certificate
1. Verify eligibility (75% attendance + full fee paid)
2. Go to Certificates section
3. Click "Generate Certificate"
4. ✅ PDF certificate created and emailed

### 7. Upload Documents
1. Go to Student Detail page
2. Navigate to Documents tab
3. Select document type
4. Upload file
5. ✅ Document saved

### 8. Track Fee Payments
1. Go to Student Detail page
2. View Fees tab
3. See total, paid, pending amounts
4. ✅ Fee status displayed

### 9. View Attendance Report
1. Go to Student Detail page
2. View Attendance tab
3. See percentage, present/absent count
4. ✅ Visual progress bar

### 10. Student Portal Login
1. Student goes to portal URL
2. Enter admission number
3. Enter password (default: student123)
4. ✅ Access dashboard, attendance, assignments

---

## 🔍 Search & Filter

### Search Options
- Name
- Mobile number
- Email
- Admission number

### Filter Options
1. **Status**: Active, Inactive, Graduated
2. **Gender**: Male, Female, Other
3. **Batch**: Select from dropdown
4. **Course**: Select from dropdown
5. **Fee Status**: Paid, Pending
6. **Attendance**: Below 75%, Above 90%

### Clear Filters
- Click "Clear All Filters" button

---

## 📊 Reports Available

### 1. Student List Report
- Export all students to CSV
- Includes: Admission No, Name, Contact, Status

### 2. Attendance Report
- View attendance percentage per student
- Identify at-risk students (< 75%)
- Export to CSV

### 3. Fee Collection Report
- Total fees collected
- Pending fees
- Fee defaulters list

### 4. Performance Report
- Student-wise performance
- Course completion status
- Grade/percentage

### 5. Admission Report
- New admissions by date
- Course-wise enrollment
- Batch-wise distribution

---

## 🎓 Student Portal Features

### Dashboard
- Personal information
- Attendance percentage
- Fee status
- Upcoming assignments
- Recent announcements

### Attendance
- View daily attendance
- Monthly calendar view
- Attendance percentage
- Present/Absent/Late count

### Assignments
- View all assignments
- Submit assignments
- Upload files
- View grades and feedback

### Study Materials
- Download notes
- View video lectures
- Access e-books
- Track progress

### Exam Results
- View exam scores
- Download marksheets
- See grade/percentage

### Certificates
- View issued certificates
- Download certificates
- Verify authenticity

### Profile
- Update contact details
- Update address
- Update parent information
- Change password

---

## 🔐 Access Levels

### Super Admin
- Full access to all features
- Create/edit/delete students
- Generate reports
- Manage all modules

### Counselor
- Add new students
- Manage admissions
- Track leads
- Follow-ups

### Trainer/Faculty
- Mark attendance
- Grade assignments
- View student list
- Upload study materials

### Student
- View own data only
- Update profile
- Submit assignments
- View results

### Parent
- View child's data
- Track attendance
- View fee status
- Receive notifications

---

## 📱 Notifications

### SMS Notifications
- Admission confirmation
- Fee payment reminder
- Attendance alerts
- Exam schedule
- Result announcement

### Email Notifications
- Welcome email
- Certificate delivery
- Assignment deadlines
- Fee receipts
- Important announcements

### WhatsApp Alerts
- Daily attendance summary
- Fee due reminders
- Exam notifications
- Quick updates

---

## 🎯 Key Metrics

### Student Dashboard Shows:
- Total students
- Active students
- Male/Female count
- Attendance average
- Fee collection rate
- At-risk students

### Individual Student Shows:
- Attendance percentage
- Fee status (paid/pending)
- Document count
- Certificate count
- Course progress
- Performance rating

---

## 🔧 Troubleshooting

### Issue: Student can't login to portal
**Solution**: 
1. Verify admission number is correct
2. Reset password if needed
3. Check if student status is Active
4. Ensure email is registered

### Issue: QR code not working
**Solution**:
1. Regenerate QR code
2. Check if QR is active
3. Verify attendance session is created
4. Ensure proper lighting for scanning

### Issue: Certificate not generating
**Solution**:
1. Check attendance >= 75%
2. Verify all fees are paid
3. Ensure course is completed
4. Check if certificate already exists

### Issue: Bulk import failing
**Solution**:
1. Use provided CSV template
2. Check required fields (name, mobile)
3. Verify mobile numbers are 10 digits
4. Remove duplicate entries

### Issue: Attendance percentage wrong
**Solution**:
1. Verify all sessions are marked
2. Check for duplicate entries
3. Refresh the page
4. Contact admin if issue persists

---

## 📞 Support

### For Technical Issues
- Email: support@upsurgeerp.com
- Check API documentation
- Review error logs

### For Feature Requests
- Submit via admin panel
- Contact development team

### For Training
- User manual available
- Video tutorials
- Live training sessions

---

## 🚀 Best Practices

### Student Management
1. ✅ Always fill required fields
2. ✅ Use bulk import for multiple students
3. ✅ Verify mobile numbers before saving
4. ✅ Upload student photos for ID cards
5. ✅ Keep parent contact updated

### Attendance
1. ✅ Create sessions before marking
2. ✅ Use QR codes for faster marking
3. ✅ Mark attendance daily
4. ✅ Review at-risk students weekly
5. ✅ Send absent notifications

### Fee Management
1. ✅ Set up installment schedules
2. ✅ Send payment reminders
3. ✅ Generate receipts immediately
4. ✅ Track pending fees regularly
5. ✅ Apply discounts properly

### Documents
1. ✅ Upload all required documents
2. ✅ Verify documents promptly
3. ✅ Use proper document types
4. ✅ Keep backups
5. ✅ Maintain document checklist

### Certificates
1. ✅ Verify eligibility before generating
2. ✅ Check certificate details carefully
3. ✅ Email certificates to students
4. ✅ Keep certificate records
5. ✅ Enable QR verification

---

## 📈 Performance Tips

### For Faster Loading
- Use filters to reduce data
- Enable pagination
- Clear browser cache
- Use search instead of scrolling

### For Better Reports
- Export data regularly
- Use date range filters
- Schedule automated reports
- Archive old data

### For Efficient Management
- Use bulk operations
- Set up automated notifications
- Create templates for common tasks
- Train staff on all features

---

## 🎉 Success Metrics

### Track These KPIs:
- Student enrollment rate
- Attendance average (target: >85%)
- Fee collection rate (target: >95%)
- Certificate issuance rate
- Student satisfaction score
- Parent engagement rate
- Portal usage statistics

---

## 📚 Additional Resources

### Documentation
- [API Documentation](./backend/API_DOCUMENTATION.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [Security Audit](./backend/SECURITY_AUDIT.md)

### Video Tutorials
- Student Management Basics
- Attendance System Guide
- Fee Management Tutorial
- Student Portal Walkthrough

### Sample Data
- Sample CSV for bulk import
- Test student accounts
- Demo certificates
- Example reports

---

**Quick Start**: Add a student → Enroll in course → Mark attendance → Track fees → Generate certificate

**Need Help?** Check documentation or contact support@upsurgeerp.com

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
