const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');

exports.createAssignment = async (req, res) => {
  try {
    const { batch_id, title, description, due_date, max_marks, attachment_url } = req.body;

    const assignment = await Assignment.create({
      batch_id,
      faculty_id: req.user.id,
      branch_id: req.user.branch_id,
      title,
      description,
      due_date,
      max_marks,
      attachment_url,
      is_active: true
    });

    // TODO: Send notification to students

    res.status(201).json({ message: 'Assignment created successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const { batch_id } = req.query;
    const where = { is_active: true, branch_id: req.user.branch_id };

    if (batch_id) where.batch_id = batch_id;

    const assignments = await Assignment.findAll({ where, order: [['created_at', 'DESC']] });
    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      where: { id: req.params.id, branch_id: req.user.branch_id }
    });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found or unauthorized' });
    }
    res.json({ assignment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { submission_text, file_url } = req.body;
    const student_id = req.user.id;

    const assignment = await Assignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = await AssignmentSubmission.create({
      assignment_id: id,
      student_id,
      submission_text,
      file_url,
      submitted_at: new Date()
    });

    res.status(201).json({ message: 'Assignment submitted successfully', submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify assignment belongs to user's branch
    const assignment = await Assignment.findOne({
      where: { id, branch_id: req.user.branch_id }
    });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found or unauthorized' });
    }

    const submissions = await AssignmentSubmission.findAll({
      where: { assignment_id: id },
      order: [['submitted_at', 'DESC']]
    });
    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks_obtained, feedback } = req.body;

    const submission = await AssignmentSubmission.findByPk(id, {
      include: [{ model: Assignment, as: 'assignment' }]
    });
    
    if (!submission || (submission.assignment && submission.assignment.branch_id !== req.user.branch_id)) {
      return res.status(404).json({ message: 'Submission not found or unauthorized' });
    }

    await submission.update({
      marks_obtained,
      feedback,
      graded_by: req.user.id,
      graded_at: new Date()
    });

    // TODO: Send notification to student

    res.json({ message: 'Submission graded successfully', submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
