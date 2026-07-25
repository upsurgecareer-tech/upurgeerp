const CoursePackage = require('../models/CoursePackage');

exports.createCoursePackage = async (req, res) => {
  try {
    const { name, total_fee, duration_months, description } = req.body;
    const branch_id = req.user.branch_id;

    const coursePackage = await CoursePackage.create({
      branch_id,
      name,
      total_fee,
      duration_months,
      description,
      is_active: true
    });

    res.status(201).json({ message: 'Course package created successfully', coursePackage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCoursePackages = async (req, res) => {
  try {
    const packages = await CoursePackage.findAll({
      where: { branch_id: req.user.branch_id, is_active: true },
      order: [['created_at', 'DESC']]
    });
    res.json({ packages });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCoursePackageById = async (req, res) => {
  try {
    const coursePackage = await CoursePackage.findByPk(req.params.id);
    if (!coursePackage) {
      return res.status(404).json({ message: 'Course package not found' });
    }
    res.json({ coursePackage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCoursePackage = async (req, res) => {
  try {
    const coursePackage = await CoursePackage.findByPk(req.params.id);
    if (!coursePackage) {
      return res.status(404).json({ message: 'Course package not found' });
    }

    await coursePackage.update(req.body);
    res.json({ message: 'Course package updated successfully', coursePackage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCoursePackage = async (req, res) => {
  try {
    const coursePackage = await CoursePackage.findByPk(req.params.id);
    if (!coursePackage) {
      return res.status(404).json({ message: 'Course package not found' });
    }

    await coursePackage.update({ is_active: false });
    res.json({ message: 'Course package deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
