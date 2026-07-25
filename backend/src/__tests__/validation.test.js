const {
  createStudentSchema,
  createLeadSchema,
  createNoticeSchema,
  createFeePaymentSchema,
  issueBookSchema
} = require('../validators/schemas');

describe('Validation Schemas', () => {
  
  describe('createStudentSchema', () => {
    test('should validate correct student data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '9876543210',
        dateOfBirth: '2000-01-15',
        gender: 'Male'
      };
      
      const { error } = createStudentSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject invalid email', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '9876543210',
        dateOfBirth: '2000-01-15',
        gender: 'Male'
      };
      
      const { error } = createStudentSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    test('should reject invalid phone number', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123',
        dateOfBirth: '2000-01-15',
        gender: 'Male'
      };
      
      const { error } = createStudentSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    test('should reject future date of birth', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '9876543210',
        dateOfBirth: '2030-01-15',
        gender: 'Male'
      };
      
      const { error } = createStudentSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('createLeadSchema', () => {
    test('should validate correct lead data', () => {
      const validData = {
        name: 'Jane Smith',
        phone: '9876543210',
        source: 'Website'
      };
      
      const { error } = createLeadSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject invalid source', () => {
      const invalidData = {
        name: 'Jane Smith',
        phone: '9876543210',
        source: 'InvalidSource'
      };
      
      const { error } = createLeadSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('createNoticeSchema', () => {
    test('should validate correct notice data', () => {
      const validData = {
        title: 'Holiday Announcement',
        content: 'Institute will remain closed on Monday',
        targetAudience: 'All',
        publishDate: new Date()
      };
      
      const { error } = createNoticeSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject short title', () => {
      const invalidData = {
        title: 'Hi',
        content: 'Institute will remain closed on Monday',
        targetAudience: 'All',
        publishDate: new Date()
      };
      
      const { error } = createNoticeSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    test('should reject expiry date before publish date', () => {
      const publishDate = new Date('2024-02-01');
      const expiryDate = new Date('2024-01-01');
      
      const invalidData = {
        title: 'Holiday Announcement',
        content: 'Institute will remain closed on Monday',
        targetAudience: 'All',
        publishDate,
        expiryDate
      };
      
      const { error } = createNoticeSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('createFeePaymentSchema', () => {
    test('should validate correct fee payment data', () => {
      const validData = {
        studentId: 1,
        amount: 5000,
        paymentMethod: 'UPI',
        paymentDate: new Date()
      };
      
      const { error } = createFeePaymentSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject negative amount', () => {
      const invalidData = {
        studentId: 1,
        amount: -5000,
        paymentMethod: 'UPI',
        paymentDate: new Date()
      };
      
      const { error } = createFeePaymentSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('issueBookSchema', () => {
    test('should validate correct book issue data', () => {
      const issueDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      
      const validData = {
        bookId: 1,
        studentId: 5,
        issueDate,
        dueDate
      };
      
      const { error } = issueBookSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject due date before issue date', () => {
      const issueDate = new Date('2024-02-01');
      const dueDate = new Date('2024-01-01');
      
      const invalidData = {
        bookId: 1,
        studentId: 5,
        issueDate,
        dueDate
      };
      
      const { error } = issueBookSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });
});
