const TrainingProgram = require('../models/TrainingProgram');
const { Department, User, Employee } = require('../models');

exports.getPrograms = async (req, res) => {
  try {
    const { status, department_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (department_id) where.department_id = department_id;

    const programs = await TrainingProgram.findAll({
      where,
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
      order: [['start_date', 'DESC']]
    });
    res.json({ programs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createProgram = async (req, res) => {
  try {
    const { title, description, category, trainer_name, mode, start_date, end_date, duration_hours, max_participants, department_id } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    if (department_id) {
      const department = await Department.findByPk(department_id);
      if (!department) {
        return res.status(400).json({ message: 'Invalid department_id: Department not found' });
      }
    }

    const program = await TrainingProgram.create({
      title, description, category, trainer_name, mode, start_date, end_date,
      duration_hours, max_participants, department_id,
      created_by: req.user.id, status: 'Upcoming'
    });
    res.status(201).json({ message: 'Training program created', program });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const program = await TrainingProgram.findByPk(req.params.id);
    if (!program) return res.status(404).json({ message: 'Program not found' });

    if (req.body.department_id && req.body.department_id !== program.department_id) {
      const department = await Department.findByPk(req.body.department_id);
      if (!department) {
        return res.status(400).json({ message: 'Invalid department_id: Department not found' });
      }
    }
    await program.update(req.body);
    res.json({ message: 'Program updated', program });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const program = await TrainingProgram.findByPk(req.params.id);
    if (!program) return res.status(404).json({ message: 'Program not found' });
    await program.destroy();
    res.json({ message: 'Program deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
