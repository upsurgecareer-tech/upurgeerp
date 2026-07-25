const { StudyMaterial, Batch } = require('../models');
const { Op } = require('sequelize');

exports.uploadMaterial = async (req, res) => {
  try {
    const { title, subject, batch_id, course_package_id, description, file_url, file_type } = req.body;
    const branch_id = req.user.branch_id;

    const material = await StudyMaterial.create({
      branch_id,
      batch_id: batch_id || null,
      course_package_id: course_package_id || null,
      title,
      subject,
      description,
      file_url,
      file_type: file_type || 'pdf',
      uploaded_by: req.user.id,
      status: 'Published'
    });

    res.status(201).json({ message: 'Study material uploaded successfully', material });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMaterials = async (req, res) => {
  try {
    const { batch_id, subject, search } = req.query;
    // IDOR protection: only fetch materials belonging to the user's branch
    const where = { branch_id: req.user.branch_id, status: 'Published' };

    if (batch_id) where.batch_id = batch_id;
    if (subject) where.subject = subject;
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const materials = await StudyMaterial.findAll({
      where,
      include: [
        { model: Batch, as: 'batch', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ materials });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMaterialById = async (req, res) => {
  try {
    const material = await StudyMaterial.findByPk(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Study material not found' });
    }
    // IDOR check
    if (material.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Access denied to this material' });
    }
    res.json({ material });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findByPk(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Study material not found' });
    }
    // IDOR check
    if (material.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await material.update(req.body);
    res.json({ message: 'Study material updated successfully', material });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findByPk(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Study material not found' });
    }
    // IDOR check
    if (material.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await material.update({ status: 'Archived' });
    res.json({ message: 'Study material archived successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
