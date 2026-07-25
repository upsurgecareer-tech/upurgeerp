const QuestionBank = require('../models/QuestionBank');
const { Op } = require('sequelize');

exports.createQuestion = async (req, res) => {
  try {
    const { subject, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, marks } = req.body;
    const branch_id = req.user.branch_id;

    const question = await QuestionBank.create({
      branch_id,
      subject,
      question_text,
      question_type,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      marks: marks || 1,
      created_by: req.user.id
    });

    res.status(201).json({ message: 'Question added successfully', question });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const { subject, question_type, search } = req.query;
    const where = { branch_id: req.user.branch_id };

    if (subject) where.subject = subject;
    if (question_type) where.question_type = question_type;
    if (search) {
      where.question_text = { [Op.like]: `%${search}%` };
    }

    const questions = await QuestionBank.findAll({ where, order: [['created_at', 'DESC']] });
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const question = await QuestionBank.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ question });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const question = await QuestionBank.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await question.update(req.body);
    res.json({ message: 'Question updated successfully', question });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await QuestionBank.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await question.destroy();
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
