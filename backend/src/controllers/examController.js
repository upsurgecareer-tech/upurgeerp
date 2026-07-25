const Exam = require('../models/Exam');
const QuestionBank = require('../models/QuestionBank');
const ExamAttempt = require('../models/ExamAttempt');
const sequelize = require('../config/database');

exports.createExam = async (req, res) => {
  try {
    const { exam_name, batch_id, subject, exam_type, total_marks, pass_marks, duration_minutes, start_datetime, instructions } = req.body;
    const branch_id = req.user.branch_id;

    const exam = await Exam.create({
      branch_id,
      batch_id,
      subject,
      exam_name,
      exam_type,
      total_marks,
      pass_marks,
      duration_minutes,
      start_datetime,
      instructions,
      status: 'Draft',
      created_by: req.user.id
    });

    res.status(201).json({ message: 'Exam created successfully', exam });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getExams = async (req, res) => {
  try {
    const { batch_id, status, exam_type } = req.query;
    const where = { branch_id: req.user.branch_id };

    if (batch_id) where.batch_id = batch_id;
    if (status) where.status = status;
    if (exam_type) where.exam_type = exam_type;

    const exams = await Exam.findAll({ where, order: [['created_at', 'DESC']] });
    res.json({ exams });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      where: { id: req.params.id, branch_id: req.user.branch_id }
    });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or unauthorized' });
    }
    res.json({ exam });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      where: { id: req.params.id, branch_id: req.user.branch_id }
    });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or unauthorized' });
    }

    await exam.update(req.body);
    res.json({ message: 'Exam updated successfully', exam });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.publishExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      where: { id: req.params.id, branch_id: req.user.branch_id }
    });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or unauthorized' });
    }

    await exam.update({ status: 'Published' });

    // TODO: Send notification to students

    res.json({ message: 'Exam published successfully', exam });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const { question_ids } = req.body;

    const exam = await Exam.findOne({
      where: { id, branch_id: req.user.branch_id }
    });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or unauthorized' });
    }

    await sequelize.transaction(async (t) => {
      await Promise.all(
        question_ids.map((qid, index) =>
          sequelize.query(
            'INSERT INTO exam_questions (exam_id, question_id, order_no, marks) VALUES (?, ?, ?, ?)',
            { replacements: [id, qid, index + 1, 1], transaction: t }
          )
        )
      );
    });

    res.status(201).json({ message: 'Questions added to exam successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.startExam = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user.id; // Or req.user.student_id if authenticated as student
    const branch_id = req.user.branch_id;

    // Verify Exam
    const exam = await Exam.findOne({ where: { id, branch_id } });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or unauthorized' });
    }

    // Check if already attempted
    const existing = await ExamAttempt.findOne({ where: { exam_id: id, student_id } });
    if (existing) {
      return res.status(409).json({ message: 'Exam already attempted' });
    }

    const attempt = await ExamAttempt.create({
      exam_id: id,
      student_id,
      start_time: new Date(),
      status: 'InProgress'
    });

    // Get questions
    const [questions] = await sequelize.query(`
      SELECT qb.* FROM question_bank qb
      JOIN exam_questions eq ON qb.id = eq.question_id
      WHERE eq.exam_id = ?
      ORDER BY eq.order_no
    `, { replacements: [id] });

    res.status(201).json({ message: 'Exam started', attempt_id: attempt.id, questions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.submitExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { attempt_id, answers } = req.body;

    const attempt = await ExamAttempt.findByPk(attempt_id);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    // Save answers and calculate marks
    let total_marks = 0;
    
    await sequelize.transaction(async (t) => {
      for (const ans of answers) {
        const question = await QuestionBank.findByPk(ans.question_id);
        
        // Prevent 500 crash if question_id is invalid
        if (!question) continue;

        const is_correct = question.correct_answer === ans.selected_answer;
        const marks_obtained = is_correct ? question.marks : 0;
        total_marks += marks_obtained;

        await sequelize.query(
          'INSERT INTO student_answers (attempt_id, question_id, selected_answer, is_correct, marks_obtained) VALUES (?, ?, ?, ?, ?)',
          { replacements: [attempt_id, ans.question_id, ans.selected_answer, is_correct, marks_obtained], transaction: t }
        );
      }
    });

    const exam = await Exam.findByPk(id);
    const percentage = (total_marks / exam.total_marks) * 100;
    const result = total_marks >= exam.pass_marks ? 'Pass' : 'Fail';
    const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F';

    await attempt.update({
      end_time: new Date(),
      status: 'Submitted',
      total_marks_obtained: total_marks,
      percentage,
      grade,
      result
    });

    res.json({ message: 'Exam submitted successfully', result: { total_marks, percentage, grade, result } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
