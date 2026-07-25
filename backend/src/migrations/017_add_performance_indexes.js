module.exports = {
  up: async (queryInterface) => {
    // Students table indexes
    await queryInterface.addIndex('students', ['organization_id', 'status']);
    await queryInterface.addIndex('students', ['email']);
    await queryInterface.addIndex('students', ['phone']);
    await queryInterface.addIndex('students', ['batch_id']);
    
    // Leads table indexes
    await queryInterface.addIndex('leads', ['organization_id', 'status']);
    await queryInterface.addIndex('leads', ['assigned_to']);
    await queryInterface.addIndex('leads', ['source']);
    await queryInterface.addIndex('leads', ['created_at']);
    
    // Fee payments indexes
    await queryInterface.addIndex('fee_payments', ['student_id', 'status']);
    await queryInterface.addIndex('fee_payments', ['due_date']);
    await queryInterface.addIndex('fee_payments', ['payment_date']);
    
    // Attendance indexes
    await queryInterface.addIndex('attendance', ['student_id', 'date']);
    await queryInterface.addIndex('attendance', ['batch_id', 'date']);
    await queryInterface.addIndex('attendance', ['status']);
    
    // Transactions indexes
    await queryInterface.addIndex('transactions', ['organization_id', 'transaction_date']);
    await queryInterface.addIndex('transactions', ['type']);
    
    // Transaction entries indexes
    await queryInterface.addIndex('transaction_entries', ['transaction_id']);
    await queryInterface.addIndex('transaction_entries', ['account_head_id']);
    
    // Book issues indexes
    await queryInterface.addIndex('book_issues', ['student_id', 'status']);
    await queryInterface.addIndex('book_issues', ['book_id']);
    await queryInterface.addIndex('book_issues', ['due_date']);
    
    // Staff indexes
    await queryInterface.addIndex('staff', ['organization_id', 'status']);
    await queryInterface.addIndex('staff', ['department_id']);
    await queryInterface.addIndex('staff', ['email']);
    
    // Exams indexes
    await queryInterface.addIndex('exams', ['batch_id', 'exam_date']);
    await queryInterface.addIndex('exams', ['course_id']);
    
    // Batches indexes
    await queryInterface.addIndex('batches', ['course_id', 'status']);
    await queryInterface.addIndex('batches', ['start_date']);
  },

  down: async (queryInterface) => {
    // Remove indexes in reverse order
    await queryInterface.removeIndex('batches', ['course_id', 'status']);
    await queryInterface.removeIndex('batches', ['start_date']);
    await queryInterface.removeIndex('exams', ['batch_id', 'exam_date']);
    await queryInterface.removeIndex('exams', ['course_id']);
    await queryInterface.removeIndex('staff', ['organization_id', 'status']);
    await queryInterface.removeIndex('staff', ['department_id']);
    await queryInterface.removeIndex('staff', ['email']);
    await queryInterface.removeIndex('book_issues', ['student_id', 'status']);
    await queryInterface.removeIndex('book_issues', ['book_id']);
    await queryInterface.removeIndex('book_issues', ['due_date']);
    await queryInterface.removeIndex('transaction_entries', ['transaction_id']);
    await queryInterface.removeIndex('transaction_entries', ['account_head_id']);
    await queryInterface.removeIndex('transactions', ['organization_id', 'transaction_date']);
    await queryInterface.removeIndex('transactions', ['type']);
    await queryInterface.removeIndex('attendance', ['student_id', 'date']);
    await queryInterface.removeIndex('attendance', ['batch_id', 'date']);
    await queryInterface.removeIndex('attendance', ['status']);
    await queryInterface.removeIndex('fee_payments', ['student_id', 'status']);
    await queryInterface.removeIndex('fee_payments', ['due_date']);
    await queryInterface.removeIndex('fee_payments', ['payment_date']);
    await queryInterface.removeIndex('leads', ['organization_id', 'status']);
    await queryInterface.removeIndex('leads', ['assigned_to']);
    await queryInterface.removeIndex('leads', ['source']);
    await queryInterface.removeIndex('leads', ['created_at']);
    await queryInterface.removeIndex('students', ['organization_id', 'status']);
    await queryInterface.removeIndex('students', ['email']);
    await queryInterface.removeIndex('students', ['phone']);
    await queryInterface.removeIndex('students', ['batch_id']);
  }
};
