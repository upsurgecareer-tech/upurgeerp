const JobPosting = require('../models/JobPosting');
const Candidate = require('../models/Candidate');
const { Department, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// ─── Job Postings ─────────────────────────────────────────────────────────────

exports.getJobPostings = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const jobs = await JobPosting.findAll({
      where,
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });

    // Attach candidate counts
    const result = await Promise.all(jobs.map(async j => {
      const applicants = await Candidate.count({ where: { job_posting_id: j.id } });
      return { ...j.toJSON(), applicants };
    }));

    res.json({ jobs: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createJobPosting = async (req, res) => {
  try {
    const { title, department_id, description, requirements, location, employment_type, min_salary, max_salary, openings, deadline } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    if (department_id) {
      const dept = await Department.findByPk(department_id);
      if (!dept) return res.status(400).json({ message: 'Department not found' });
    }

    const job = await JobPosting.create({
      title, department_id, description, requirements, location,
      employment_type, min_salary, max_salary, openings, deadline,
      posted_by: req.user.id, status: 'Open'
    });

    res.status(201).json({ message: 'Job posting created', job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateJobPosting = async (req, res) => {
  try {
    const job = await JobPosting.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job posting not found' });
    await job.update(req.body);
    res.json({ message: 'Job posting updated', job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteJobPosting = async (req, res) => {
  try {
    const job = await JobPosting.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job posting not found' });
    await job.destroy();
    res.json({ message: 'Job posting deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Candidates ───────────────────────────────────────────────────────────────

exports.getCandidates = async (req, res) => {
  try {
    const { job_posting_id, status } = req.query;
    const where = {};
    if (job_posting_id) where.job_posting_id = job_posting_id;
    if (status) where.status = status;

    const candidates = await Candidate.findAll({
      where,
      include: [{ model: JobPosting, as: 'jobPosting', attributes: ['id', 'title'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ candidates });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createCandidate = async (req, res) => {
  try {
    const { name, email, job_posting_id, phone, experience_years, current_salary, current_in_hand_salary, expected_salary, expected_in_hand_salary, notice_period_days, application_date, notes } = req.body;
    if (!name || !email || !job_posting_id) {
      return res.status(400).json({ message: 'Name, email, and job posting are required' });
    }

    // Block duplicate candidate applications for the same job posting
    const existingCandidate = await Candidate.findOne({ where: { email, job_posting_id } });
    if (existingCandidate) {
      return res.status(400).json({ message: 'Candidate has already applied for this job posting' });
    }

    const candidate = await Candidate.create({ name, email, job_posting_id, phone, experience_years, current_salary, current_in_hand_salary, expected_salary, expected_in_hand_salary, notice_period_days, application_date, notes });
    res.status(201).json({ message: 'Candidate added', candidate });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    await candidate.update(req.body);
    res.json({ message: 'Candidate updated', candidate });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    await candidate.destroy();
    res.json({ message: 'Candidate deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
