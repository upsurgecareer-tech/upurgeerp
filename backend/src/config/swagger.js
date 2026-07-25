const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UpsurgeERP API Documentation',
      version: '1.0.0',
      description: 'Complete ERP solution for educational institutions',
      contact: {
        name: 'UpsurgeERP Support',
        email: 'support@upsurgeerp.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.upsurgeerp.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        Student: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'],
          properties: {
            id: { type: 'integer' },
            firstName: { type: 'string', minLength: 2, maxLength: 50 },
            lastName: { type: 'string', minLength: 2, maxLength: 50 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', pattern: '^[0-9]{10}$' },
            dateOfBirth: { type: 'string', format: 'date' },
            gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
            address: { type: 'string' },
            status: { type: 'string', enum: ['Active', 'Inactive', 'Graduated', 'Dropped'] },
            courseId: { type: 'integer' },
            batchId: { type: 'integer' }
          }
        },
        Lead: {
          type: 'object',
          required: ['name', 'phone', 'source'],
          properties: {
            id: { type: 'integer' },
            name: { type: 'string', minLength: 2, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', pattern: '^[0-9]{10}$' },
            courseInterest: { type: 'string' },
            source: { type: 'string', enum: ['Website', 'Walk-in', 'Referral', 'Social Media', 'Advertisement', 'Other'] },
            status: { type: 'string', enum: ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'] },
            assignedTo: { type: 'integer' },
            remarks: { type: 'string' }
          }
        },
        Notice: {
          type: 'object',
          required: ['title', 'content', 'targetAudience', 'publishDate'],
          properties: {
            id: { type: 'integer' },
            title: { type: 'string', minLength: 5, maxLength: 200 },
            content: { type: 'string', minLength: 10 },
            targetAudience: { type: 'string', enum: ['All', 'Students', 'Staff', 'Parents', 'Specific'] },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Urgent'] },
            publishDate: { type: 'string', format: 'date-time' },
            expiryDate: { type: 'string', format: 'date-time' },
            attachments: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean' }
          }
        },
        FeePayment: {
          type: 'object',
          required: ['studentId', 'amount', 'paymentMethod', 'paymentDate'],
          properties: {
            id: { type: 'integer' },
            studentId: { type: 'integer' },
            amount: { type: 'number', minimum: 0 },
            paymentMethod: { type: 'string', enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque'] },
            paymentDate: { type: 'string', format: 'date' },
            dueDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['Pending', 'Paid', 'Overdue'] },
            transactionId: { type: 'string' },
            remarks: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
