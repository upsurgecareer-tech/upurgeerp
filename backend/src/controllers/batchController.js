const Batch = require('../models/Batch');
const BatchStudent = require('../models/BatchStudent');
const Timetable = require('../models/Timetable');
const Student = require('../models/Student');

exports.createBatch = async (req, res) => {
  try {
    const { name, course_package_id, faculty_id, start_date, end_date, timing, max_students } = req.body;
    const branch_id = req.user.branch_id;

    if (!branch_id) {
      return res.status(400).json({ message: 'Branch ID is required' });
    }

    const batch = await Batch.create({
      branch_id,
      course_package_id,
      name,
      faculty_id: faculty_id || null,
      start_date,
      end_date: end_date || null,
      timing: timing || null,
      max_students: max_students || 30,
      status: 'Upcoming'
    });

    res.status(201).json({ message: 'Batch created successfully', batch });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBatches = async (req, res) => {
  try {
    const { status, course_package_id } = req.query;
    const where = { branch_id: req.user.branch_id };

    if (status) where.status = status;
    if (course_package_id) where.course_package_id = course_package_id;

    const batches = await Batch.findAll({ where, order: [['created_at', 'DESC']] });
    res.json({ batches });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findByPk(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.json({ batch });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByPk(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    await batch.update(req.body);
    res.json({ message: 'Batch updated successfully', batch });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateBatchStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['Upcoming', 'Active', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const batch = await Batch.findByPk(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    await batch.update({ status });
    res.json({ message: 'Batch status updated successfully', batch });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addStudentToBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, admission_id } = req.body;

    const batch = await Batch.findByPk(id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const existing = await BatchStudent.findOne({
      where: { batch_id: id, student_id, status: 'Active' }
    });
    if (existing) {
      return res.status(409).json({ message: 'Student already enrolled in this batch' });
    }

    const currentCount = await BatchStudent.count({
      where: { batch_id: id, status: 'Active' }
    });
    if (currentCount >= batch.max_students) {
      return res.status(400).json({ message: 'Batch is full' });
    }

    const batchStudent = await BatchStudent.create({
      batch_id: id,
      student_id,
      admission_id: admission_id || null,
      status: 'Active'
    });

    res.status(201).json({ message: 'Student added to batch successfully', batchStudent });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBatchStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const students = await BatchStudent.findAll({
      where: { batch_id: id, status: 'Active' }
    });
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.removeStudentFromBatch = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const batchStudent = await BatchStudent.findOne({
      where: { batch_id: id, student_id: studentId }
    });

    if (!batchStudent) {
      return res.status(404).json({ message: 'Student not found in batch' });
    }

    await batchStudent.update({ status: 'Dropped' });
    res.json({ message: 'Student removed from batch successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, faculty_id, day_of_week, start_time, end_time, room } = req.body;

    const batch = await Batch.findByPk(id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const timetable = await Timetable.create({
      batch_id: id,
      subject,
      faculty_id: faculty_id || null,
      day_of_week,
      start_time,
      end_time,
      room: room || null
    });

    res.status(201).json({ message: 'Timetable entry created successfully', timetable });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const timetable = await Timetable.findAll({
      where: { batch_id: id },
      order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
    });
    res.json({ timetable });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
