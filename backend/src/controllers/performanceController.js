const { Performance, Employee, User } = require('../models');

// GET /hrms/performance
// Optional query param: employee_id
exports.getReviews = async (req, res) => {
  try {
    const { employee_id } = req.query;
    const where = {};
    if (employee_id) where.employee_id = employee_id;

    const reviews = await Performance.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'first_name', 'last_name', 'email'],
              where: { branch_id: req.user.branch_id }
            }
          ]
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /hrms/performance
// Create a new performance review; auto-calculates overall_rating
exports.createReview = async (req, res) => {
  try {
    const {
      employee_id,
      review_period,
      reviewer_id,
      technical_skills,
      communication,
      teamwork,
      punctuality,
      quality_of_work,
      strengths,
      areas_of_improvement,
      goals,
      comments
    } = req.body;

    if (!employee_id || !review_period || !reviewer_id) {
      return res.status(400).json({
        message: 'employee_id, review_period, and reviewer_id are required'
      });
    }

    // Validate employee exists and is in the same branch
    const employee = await Employee.findOne({
      where: { id: employee_id },
      include: [{ model: User, as: 'user', where: { branch_id: req.user.branch_id } }]
    });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found or unauthorized' });
    }

    // Auto-calculate overall_rating as average of 5 skill fields
    const skills = [
      Number(technical_skills) || 0,
      Number(communication) || 0,
      Number(teamwork) || 0,
      Number(punctuality) || 0,
      Number(quality_of_work) || 0
    ];
    const overall_rating = (skills.reduce((sum, s) => sum + s, 0) / skills.length).toFixed(2);

    const review = await Performance.create({
      employee_id,
      review_period,
      reviewer_id,
      technical_skills: skills[0],
      communication: skills[1],
      teamwork: skills[2],
      punctuality: skills[3],
      quality_of_work: skills[4],
      overall_rating,
      strengths: strengths || null,
      areas_of_improvement: areas_of_improvement || null,
      goals: goals || null,
      comments: comments || null,
      status: 'Submitted'
    });

    res.status(201).json({ message: 'Performance review created', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /hrms/performance/:id
// Update an existing performance review
exports.updateReview = async (req, res) => {
  try {
    const review = await Performance.findByPk(req.params.id, {
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: User, as: 'user' }]
      }]
    });
    
    if (!review || !review.employee || !review.employee.user || review.employee.user.branch_id !== req.user.branch_id) {
      return res.status(404).json({ message: 'Performance review not found or unauthorized' });
    }

    const {
      review_period,
      reviewer_id,
      technical_skills,
      communication,
      teamwork,
      punctuality,
      quality_of_work,
      strengths,
      areas_of_improvement,
      goals,
      comments,
      status
    } = req.body;

    // Re-calculate overall_rating if any skill field is updated
    const skills = [
      Number(technical_skills !== undefined ? technical_skills : review.technical_skills),
      Number(communication !== undefined ? communication : review.communication),
      Number(teamwork !== undefined ? teamwork : review.teamwork),
      Number(punctuality !== undefined ? punctuality : review.punctuality),
      Number(quality_of_work !== undefined ? quality_of_work : review.quality_of_work)
    ];
    const overall_rating = (skills.reduce((sum, s) => sum + s, 0) / skills.length).toFixed(2);

    await review.update({
      review_period: review_period !== undefined ? review_period : review.review_period,
      reviewer_id: reviewer_id !== undefined ? reviewer_id : review.reviewer_id,
      technical_skills: skills[0],
      communication: skills[1],
      teamwork: skills[2],
      punctuality: skills[3],
      quality_of_work: skills[4],
      overall_rating,
      strengths: strengths !== undefined ? strengths : review.strengths,
      areas_of_improvement: areas_of_improvement !== undefined ? areas_of_improvement : review.areas_of_improvement,
      goals: goals !== undefined ? goals : review.goals,
      comments: comments !== undefined ? comments : review.comments,
      status: status !== undefined ? status : review.status
    });

    res.json({ message: 'Performance review updated', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /hrms/performance/:id
// Delete a performance review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Performance.findByPk(req.params.id, {
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: User, as: 'user' }]
      }]
    });
    
    if (!review || !review.employee || !review.employee.user || review.employee.user.branch_id !== req.user.branch_id) {
      return res.status(404).json({ message: 'Performance review not found or unauthorized' });
    }

    await review.destroy();
    res.json({ message: 'Performance review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /hrms/performance/:id/acknowledge
// Employee acknowledges their performance review
exports.acknowledgeReview = async (req, res) => {
  try {
    const review = await Performance.findByPk(req.params.id, {
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: User, as: 'user' }]
      }]
    });
    
    if (!review || !review.employee || !review.employee.user || review.employee.user.branch_id !== req.user.branch_id) {
      return res.status(404).json({ message: 'Performance review not found or unauthorized' });
    }

    // Verify authorization: only the employee who owns this review (or an admin) can acknowledge it
    if (req.user.role_id !== 1) {
      const employee = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!employee || employee.id !== review.employee_id) {
        return res.status(403).json({ message: 'Unauthorized to acknowledge this performance review' });
      }
    }

    await review.update({ status: 'Acknowledged' });
    res.json({ message: 'Performance review acknowledged', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
