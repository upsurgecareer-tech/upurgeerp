const safeAddIndex = async (queryInterface, table, fields) => {
  try {
    await queryInterface.addIndex(table, fields);
    console.log(`✅ Index added on ${table} (${fields.join(', ')})`);
  } catch (error) {
    console.log(`⚠️ Skipped index on ${table} (${fields.join(', ')}): ${error.message}`);
  }
};

const safeRemoveIndex = async (queryInterface, table, fields) => {
  try {
    await queryInterface.removeIndex(table, fields);
  } catch (error) {
    // ignore
  }
};

module.exports = {
  up: async (queryInterface) => {
    // Students table indexes
    await safeAddIndex(queryInterface, 'students', ['email']);
    await safeAddIndex(queryInterface, 'students', ['phone']);
    await safeAddIndex(queryInterface, 'students', ['batch_id']);
    
    // Leads table indexes
    await safeAddIndex(queryInterface, 'leads', ['assigned_to']);
    await safeAddIndex(queryInterface, 'leads', ['source']);
    await safeAddIndex(queryInterface, 'leads', ['created_at']);
    
    // Fee payments indexes
    await safeAddIndex(queryInterface, 'fee_schedules', ['status']);
    await safeAddIndex(queryInterface, 'fee_schedules', ['due_date']);
    await safeAddIndex(queryInterface, 'fee_payments', ['payment_date']);
    
    // Attendance indexes
    await safeAddIndex(queryInterface, 'attendance', ['student_id', 'date']);
    await safeAddIndex(queryInterface, 'attendance', ['batch_id', 'date']);
    await safeAddIndex(queryInterface, 'attendance', ['status']);
    
    // Transactions indexes
    await safeAddIndex(queryInterface, 'transactions', ['organization_id', 'transaction_date']);
    await safeAddIndex(queryInterface, 'transactions', ['type']);
    
    // Transaction entries indexes
    await safeAddIndex(queryInterface, 'transaction_entries', ['transaction_id']);
    await safeAddIndex(queryInterface, 'transaction_entries', ['account_head_id']);
    
    // Book issues indexes
    await safeAddIndex(queryInterface, 'book_issues', ['student_id', 'status']);
    await safeAddIndex(queryInterface, 'book_issues', ['book_id']);
    await safeAddIndex(queryInterface, 'book_issues', ['due_date']);
    
    // Staff indexes
    await safeAddIndex(queryInterface, 'staff', ['department_id']);
    await safeAddIndex(queryInterface, 'staff', ['email']);
    
    // Exams indexes
    await safeAddIndex(queryInterface, 'exams', ['batch_id', 'exam_date']);
    await safeAddIndex(queryInterface, 'exams', ['course_id']);
    
    // Batches indexes
    await safeAddIndex(queryInterface, 'batches', ['start_date']);
  },

  down: async (queryInterface) => {
    await safeRemoveIndex(queryInterface, 'batches', ['start_date']);
    await safeRemoveIndex(queryInterface, 'exams', ['batch_id', 'exam_date']);
    await safeRemoveIndex(queryInterface, 'exams', ['course_id']);
    await safeRemoveIndex(queryInterface, 'staff', ['department_id']);
    await safeRemoveIndex(queryInterface, 'staff', ['email']);
    await safeRemoveIndex(queryInterface, 'book_issues', ['student_id', 'status']);
    await safeRemoveIndex(queryInterface, 'book_issues', ['book_id']);
    await safeRemoveIndex(queryInterface, 'book_issues', ['due_date']);
    await safeRemoveIndex(queryInterface, 'transaction_entries', ['transaction_id']);
    await safeRemoveIndex(queryInterface, 'transaction_entries', ['account_head_id']);
    await safeRemoveIndex(queryInterface, 'transactions', ['organization_id', 'transaction_date']);
    await safeRemoveIndex(queryInterface, 'transactions', ['type']);
    await safeRemoveIndex(queryInterface, 'attendance', ['student_id', 'date']);
    await safeRemoveIndex(queryInterface, 'attendance', ['batch_id', 'date']);
    await safeRemoveIndex(queryInterface, 'attendance', ['status']);
    await safeRemoveIndex(queryInterface, 'fee_schedules', ['status']);
    await safeRemoveIndex(queryInterface, 'fee_schedules', ['due_date']);
    await safeRemoveIndex(queryInterface, 'fee_payments', ['payment_date']);
    await safeRemoveIndex(queryInterface, 'leads', ['assigned_to']);
    await safeRemoveIndex(queryInterface, 'leads', ['source']);
    await safeRemoveIndex(queryInterface, 'leads', ['created_at']);
    await safeRemoveIndex(queryInterface, 'students', ['email']);
    await safeRemoveIndex(queryInterface, 'students', ['phone']);
    await safeRemoveIndex(queryInterface, 'students', ['batch_id']);
  }
};
