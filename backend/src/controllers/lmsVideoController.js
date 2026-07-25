const LMSVideo = require('../models/LMSVideo');
const VideoWatchProgress = require('../models/VideoWatchProgress');
const { Op } = require('sequelize');

exports.uploadVideo = async (req, res) => {
  try {
    const { title, subject, batch_id, description, video_url, duration_seconds } = req.body;
    const branch_id = req.user.branch_id;

    const video = await LMSVideo.create({
      branch_id,
      batch_id,
      subject,
      title,
      description,
      video_url,
      duration_seconds,
      uploaded_by: req.user.id,
      is_active: true
    });

    res.status(201).json({ message: 'Video uploaded successfully', video });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getVideos = async (req, res) => {
  try {
    const { batch_id, subject, search } = req.query;
    const where = { branch_id: req.user.branch_id, is_active: true };

    if (batch_id) where.batch_id = batch_id;
    if (subject) where.subject = subject;
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const videos = await LMSVideo.findAll({ where, order: [['created_at', 'DESC']] });
    res.json({ videos });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const video = await LMSVideo.findByPk(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    // IDOR Check
    if (video.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Access denied to this video' });
    }
    res.json({ video });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const video = await LMSVideo.findByPk(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    // IDOR Check
    if (video.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await video.update(req.body);
    res.json({ message: 'Video updated successfully', video });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const video = await LMSVideo.findByPk(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    // IDOR Check
    if (video.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await video.update({ is_active: false });
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { watched_seconds, is_completed } = req.body;
    const student_id = req.user.id;

    const [progress, created] = await VideoWatchProgress.findOrCreate({
      where: { video_id: id, student_id },
      defaults: { watched_seconds, is_completed: is_completed || false }
    });

    if (!created) {
      await progress.update({ watched_seconds, is_completed, last_watched_at: new Date() });
    }

    res.json({ message: 'Progress updated successfully', progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user.id;

    const progress = await VideoWatchProgress.findOne({
      where: { video_id: id, student_id }
    });

    res.json({ progress: progress || { watched_seconds: 0, is_completed: false } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
