const User = require('./User');
const Role = require('./Role');
const Organization = require('./Organization');
const Branch = require('./Branch');
const Lead = require('./Lead');
const FollowUp = require('./FollowUp');
const Employee = require('./Employee');
const Department = require('./Department');
const Leave = require('./Leave');
const LeaveBalance = require('./LeaveBalance');
const Performance = require('./Performance');
const EmployeeDocument = require('./EmployeeDocument');
const EmployeeExperience = require('./EmployeeExperience');
const EmployeeEducation = require('./EmployeeEducation');
const EmployeeStatusHistory = require('./EmployeeStatusHistory');
const EmployeeAttendance = require('./EmployeeAttendance');
const Shift = require('./Shift');
const Student = require('./Student');
const Admission = require('./Admission');
const CoursePackage = require('./CoursePackage');
const Batch = require('./Batch');
const StudentDocument = require('./StudentDocument');
const JobPosting = require('./JobPosting');
const Candidate = require('./Candidate');
const TrainingProgram = require('./TrainingProgram');
const Asset = require('./Asset');
const Task = require('./Task');
const Timesheet = require('./Timesheet');

// Library & Inventory Models
const LibraryBook = require('./LibraryBook');
const BookIssue = require('./BookIssue');
const InventoryItem = require('./InventoryItem');
const InventoryTransaction = require('./InventoryTransaction');

// Coaching Classes Models
const StudyMaterial = require('./StudyMaterial');
const LMSVideo = require('./LMSVideo');
const VideoWatchProgress = require('./VideoWatchProgress');
const FeeSchedule = require('./FeeSchedule');

// Define Associations

// Organization -> Branch (One to Many)
Organization.hasMany(Branch, {
  foreignKey: 'organization_id',
  as: 'branches'
});
Branch.belongsTo(Organization, {
  foreignKey: 'organization_id',
  as: 'organization'
});

// Branch -> User (One to Many)
Branch.hasMany(User, {
  foreignKey: 'branch_id',
  as: 'users'
});
User.belongsTo(Branch, {
  foreignKey: 'branch_id',
  as: 'branch'
});

// Role -> User (One to Many)
Role.hasMany(User, {
  foreignKey: 'role_id',
  as: 'users'
});
User.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role'
});

// Lead -> FollowUp (One to Many)
Lead.hasMany(FollowUp, {
  foreignKey: 'lead_id',
  as: 'followUps'
});
FollowUp.belongsTo(Lead, {
  foreignKey: 'lead_id',
  as: 'lead'
});

// HRMS Associations
// User -> Employee (One to One)
User.hasOne(Employee, {
  foreignKey: 'user_id',
  as: 'employee'
});
Employee.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Department -> Employee (One to Many)
Department.hasMany(Employee, {
  foreignKey: 'department_id',
  as: 'employees'
});
Employee.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department'
});

// Employee -> Leave (One to Many)
Employee.hasMany(Leave, {
  foreignKey: 'employee_id',
  as: 'leaves'
});
Leave.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

// Employee -> LeaveBalance (One to Many)
Employee.hasMany(LeaveBalance, {
  foreignKey: 'employee_id',
  as: 'leaveBalances'
});
LeaveBalance.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

// Employee -> Performance (One to Many)
Employee.hasMany(Performance, {
  foreignKey: 'employee_id',
  as: 'performances'
});
Performance.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

// User -> Performance (Reviewer)
User.hasMany(Performance, {
  foreignKey: 'reviewer_id',
  as: 'reviewedPerformances'
});
Performance.belongsTo(User, {
  foreignKey: 'reviewer_id',
  as: 'reviewer'
});

// Employee -> EmployeeDocument (One to Many)
Employee.hasMany(EmployeeDocument, {
  foreignKey: 'employee_id',
  as: 'documents'
});
EmployeeDocument.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

// Employee -> EmployeeExperience (One to Many)
Employee.hasMany(EmployeeExperience, {
  foreignKey: 'employee_id',
  as: 'experiences'
});
EmployeeExperience.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

// Employee -> EmployeeEducation (One to Many)
Employee.hasMany(EmployeeEducation, {
  foreignKey: 'employee_id',
  as: 'educations'
});
EmployeeEducation.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

// Employee -> EmployeeStatusHistory (One to Many)
Employee.hasMany(EmployeeStatusHistory, {
  foreignKey: 'employee_id',
  as: 'statusHistory'
});
EmployeeStatusHistory.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

// Employee -> EmployeeAttendance (One to Many)
Employee.hasMany(EmployeeAttendance, {
  foreignKey: 'employee_id',
  as: 'attendances'
});
EmployeeAttendance.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

// User -> EmployeeStatusHistory (One to Many)
User.hasMany(EmployeeStatusHistory, {
  foreignKey: 'changed_by',
  as: 'statusChanges'
});
EmployeeStatusHistory.belongsTo(User, {
  foreignKey: 'changed_by',
  as: 'changer'
});

// Student Associations
// Student -> Admission (One to Many)
Student.hasMany(Admission, {
  foreignKey: 'student_id',
  as: 'admissions'
});
Admission.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student'
});

// Admission -> CoursePackage (Many to One)
Admission.belongsTo(CoursePackage, {
  foreignKey: 'course_package_id',
  as: 'coursePackage'
});
CoursePackage.hasMany(Admission, {
  foreignKey: 'course_package_id',
  as: 'admissions'
});

// Admission -> Batch (Many to One)
Admission.belongsTo(Batch, {
  foreignKey: 'batch_id',
  as: 'batch'
});
Batch.hasMany(Admission, {
  foreignKey: 'batch_id',
  as: 'admissions'
});

// Student -> StudentDocument (One to Many)
Student.hasMany(StudentDocument, {
  foreignKey: 'student_id',
  as: 'documents'
});
StudentDocument.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student'
});

// JobPosting Associations
Department.hasMany(JobPosting, { foreignKey: 'department_id', as: 'jobPostings' });
JobPosting.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// Candidate -> JobPosting
JobPosting.hasMany(Candidate, { foreignKey: 'job_posting_id', as: 'candidates' });
Candidate.belongsTo(JobPosting, { foreignKey: 'job_posting_id', as: 'jobPosting' });

// TrainingProgram -> Department
Department.hasMany(TrainingProgram, { foreignKey: 'department_id', as: 'trainingPrograms' });
TrainingProgram.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// Asset -> Employee
Employee.hasMany(Asset, { foreignKey: 'assigned_to', as: 'assets' });
Asset.belongsTo(Employee, { foreignKey: 'assigned_to', as: 'assignedEmployee' });

// Task -> Employee (Assignee)
Employee.hasMany(Task, { foreignKey: 'assigned_to', as: 'tasks' });
Task.belongsTo(Employee, { foreignKey: 'assigned_to', as: 'assignee' });

// Timesheet -> User
User.hasMany(Timesheet, { foreignKey: 'user_id', as: 'timesheets' });
Timesheet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// LibraryBook -> BookIssue
LibraryBook.hasMany(BookIssue, { foreignKey: 'book_id', as: 'issues' });
BookIssue.belongsTo(LibraryBook, { foreignKey: 'book_id', as: 'book' });

// Student -> BookIssue
Student.hasMany(BookIssue, { foreignKey: 'student_id', as: 'bookIssues' });
BookIssue.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// InventoryItem -> InventoryTransaction
InventoryItem.hasMany(InventoryTransaction, { foreignKey: 'item_id', as: 'transactions' });
InventoryTransaction.belongsTo(InventoryItem, { foreignKey: 'item_id', as: 'item' });

// Coaching Classes Associations

// Branch -> LMSVideo / StudyMaterial
Branch.hasMany(LMSVideo, { foreignKey: 'branch_id', as: 'videos' });
LMSVideo.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });

Branch.hasMany(StudyMaterial, { foreignKey: 'branch_id', as: 'studyMaterials' });
StudyMaterial.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });

// Batch -> LMSVideo / StudyMaterial
Batch.hasMany(LMSVideo, { foreignKey: 'batch_id', as: 'videos' });
LMSVideo.belongsTo(Batch, { foreignKey: 'batch_id', as: 'batch' });

Batch.hasMany(StudyMaterial, { foreignKey: 'batch_id', as: 'studyMaterials' });
StudyMaterial.belongsTo(Batch, { foreignKey: 'batch_id', as: 'batch' });

// Student -> VideoWatchProgress
Student.hasMany(VideoWatchProgress, { foreignKey: 'student_id', as: 'videoProgress' });
VideoWatchProgress.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

LMSVideo.hasMany(VideoWatchProgress, { foreignKey: 'video_id', as: 'progressList' });
VideoWatchProgress.belongsTo(LMSVideo, { foreignKey: 'video_id', as: 'video' });

// Admission -> FeeSchedule
Admission.hasMany(FeeSchedule, { foreignKey: 'admission_id', as: 'feeSchedules' });
FeeSchedule.belongsTo(Admission, { foreignKey: 'admission_id', as: 'admission' });

module.exports = {
  User,
  Role,
  Organization,
  Branch,
  Lead,
  FollowUp,
  Employee,
  Department,
  Leave,
  LeaveBalance,
  Performance,
  EmployeeDocument,
  EmployeeExperience,
  EmployeeEducation,
  EmployeeStatusHistory,
  EmployeeAttendance,
  Shift,
  Student,
  Admission,
  CoursePackage,
  Batch,
  StudentDocument,
  JobPosting,
  Candidate,
  TrainingProgram,
  Asset,
  Task,
  Timesheet,
  LibraryBook,
  BookIssue,
  InventoryItem,
  InventoryTransaction,
  StudyMaterial,
  LMSVideo,
  VideoWatchProgress,
  FeeSchedule
};
