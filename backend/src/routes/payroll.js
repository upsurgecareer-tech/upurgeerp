const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authenticate');
const { validate } = require('../middlewares/validate');
const { salaryStructureSchema, generatePayrollSchema } = require('../validators/schemas');
const hrmsPayrollController = require('../controllers/hrmsPayrollController');
const payrollController = require('../controllers/payrollController');

router.get('/employees', authenticate, hrmsPayrollController.getEmployeesWithSalary);
router.get('/salary-structure/:employee_id', authenticate, hrmsPayrollController.getEmployeeSalaryStructure);
router.post('/salary-structure', authenticate, validate(salaryStructureSchema), hrmsPayrollController.createOrUpdateSalaryStructure);
router.get('/', authenticate, hrmsPayrollController.getPayrollList);
router.post('/generate', authenticate, validate(generatePayrollSchema), hrmsPayrollController.generatePayrollForEmployee);
router.put('/:id/approve', authenticate, hrmsPayrollController.approvePayroll);

module.exports = router;
