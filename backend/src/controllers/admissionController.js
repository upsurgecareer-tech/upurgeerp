const Admission = require('../models/Admission');
const FeeSchedule = require('../models/FeeSchedule');
const Discount = require('../models/Discount');
const Student = require('../models/Student');

exports.createAdmission = async (req, res) => {
  try {
    const { student_id, course_package_id, batch_id, admission_date, total_fee, discount_amount } = req.body;
    const net_payable = total_fee - (discount_amount || 0);

    const admission = await Admission.create({
      student_id,
      course_package_id,
      batch_id,
      counsellor_id: req.user.id,
      admission_date,
      total_fee,
      discount_amount: discount_amount || 0,
      net_payable,
      status: 'Active'
    });

    // Update lead status to Converted if lead_id exists
    const student = await Student.findByPk(student_id);
    if (student && student.lead_id) {
      const Lead = require('../models/Lead');
      await Lead.update({ status: 'Converted' }, { where: { id: student.lead_id } });
    }

    res.status(201).json({ message: 'Admission created successfully', admission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAdmissions = async (req, res) => {
  try {
    const { status, course_package_id } = req.query;
    const where = {};

    if (status) where.status = status;
    if (course_package_id) where.course_package_id = course_package_id;

    // IDOR Protection: only fetch admissions for the user's branch
    const include = [{
      model: Student,
      as: 'student',
      where: req.user.role_id !== 1 ? { branch_id: req.user.branch_id } : {},
      attributes: ['id', 'name', 'branch_id', 'admission_no']
    }];

    const admissions = await Admission.findAll({ 
      where, 
      include,
      order: [['created_at', 'DESC']] 
    });
    res.json({ admissions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAdmissionById = async (req, res) => {
  try {
    const admission = await Admission.findByPk(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }
    res.json({ admission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByPk(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    await admission.update(req.body);
    res.json({ message: 'Admission updated successfully', admission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateAdmissionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const admission = await Admission.findByPk(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    await admission.update({ status });
    res.json({ message: 'Admission status updated successfully', admission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createFeeSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { installments } = req.body;

    // IDOR Check
    const admission = await Admission.findByPk(id, {
      include: [{ model: Student, as: 'student', attributes: ['branch_id'] }]
    });

    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    if (req.user.role_id !== 1 && admission.student && admission.student.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Access denied: Cannot create schedules for another branch' });
    }

    const schedules = await Promise.all(
      installments.map(inst => 
        FeeSchedule.create({
          admission_id: id,
          installment_no: inst.installment_no,
          due_date: inst.due_date,
          amount: inst.amount,
          status: 'Pending'
        })
      )
    );

    res.status(201).json({ message: 'Fee schedule created successfully', installments: schedules });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getFeeSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    // IDOR Check
    const admission = await Admission.findByPk(id, {
      include: [{ model: Student, as: 'student', attributes: ['branch_id'] }]
    });

    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    if (req.user.role_id !== 1 && admission.student && admission.student.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Access denied: Cannot view schedules for another branch' });
    }

    const schedules = await FeeSchedule.findAll({ 
      where: { admission_id: id },
      order: [['installment_no', 'ASC']]
    });
    res.json({ schedules });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.applyDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { discount_type, discount_value, reason } = req.body;

    const discount = await Discount.create({
      admission_id: id,
      discount_type,
      discount_value,
      reason,
      approved_by: req.user.id
    });

    // Update admission net_payable
    const admission = await Admission.findByPk(id);
    const discountAmount = discount_type === 'Percentage' 
      ? (admission.total_fee * discount_value / 100)
      : discount_value;
    
    await admission.update({
      discount_amount: discountAmount,
      net_payable: admission.total_fee - discountAmount
    });

    res.status(201).json({ message: 'Discount applied successfully', discount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
