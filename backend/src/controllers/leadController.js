const Lead = require('../models/Lead');
const LeadActivity = require('../models/LeadActivity');
const { Op } = require('sequelize');

exports.createLead = async (req, res) => {
  try {
    console.log('📥 Received lead data:', req.body);
    console.log('👤 User:', req.user?.id, req.user?.branch_id);
    
    const { name, email, mobile, course_interest, source_id, source, stage, assigned_to, priority } = req.body;
    const branch_id = req.user.branch_id;

    // Validation
    if (!name || !mobile) {
      console.log('❌ Validation failed: name or mobile missing');
      return res.status(400).json({ message: 'Name and mobile are required' });
    }

    console.log('✅ Validation passed');

    // Check duplicate
    const existing = await Lead.findOne({ where: { mobile, branch_id } });
    if (existing) {
      console.log('❌ Duplicate mobile found');
      return res.status(409).json({ message: 'Lead with this mobile already exists' });
    }

    if (source_id) {
      const { LeadSource } = require('../models');
      const sourceObj = await LeadSource.findByPk(source_id);
      if (!sourceObj) {
        return res.status(400).json({ message: 'Invalid source_id: Lead source not found' });
      }
    }

    console.log('✅ No duplicate, creating lead...');
    
    let assigned_counsellor = assigned_to;
    
    // Auto-assignment logic (Round-robin / Load Balancing)
    if (!assigned_counsellor) {
      const { User } = require('../models');
      const counsellors = await User.findAll({
        where: { role_id: 3, branch_id, status: 'active' },
        attributes: ['id']
      });
      if (counsellors.length > 0) {
        // Simple random assignment (for V1). For true round-robin, we'd need a tracking table.
        const randomIndex = Math.floor(Math.random() * counsellors.length);
        assigned_counsellor = counsellors[randomIndex].id;
      }
    }

    const lead = await Lead.create({
      name,
      mobile,
      email,
      course_interest,
      source_id,
      priority: priority || 'Warm',
      stage: 'New',
      branch_id,
      assigned_to: assigned_counsellor,
      created_by: req.user.id,
      last_contact_date: new Date()
    });

    console.log('✅ Lead created:', lead.id);

    await LeadActivity.create({
      lead_id: lead.id,
      user_id: req.user.id,
      activity_type: 'Created',
      details: 'Lead created in the system'
    });

    // Communication Automation (Welcome Email/SMS)
    if (email) {
      const emailService = require('../utils/emailService');
      emailService.sendEmail(email, 'Welcome to Upsurge!', `Hi ${name},\n\nThank you for your interest. One of our expert counsellors will get in touch with you shortly to assist with your educational journey.\n\nBest Regards,\nUpsurge Team`).catch(err => console.error('Failed to send welcome email:', err.message));
    }

    const smsService = require('../utils/smsService');
    smsService.sendSMS(mobile, `Hi ${name}, Thanks for inquiring! A counsellor will contact you soon. - Upsurge Team`).catch(err => console.error('Failed to send welcome sms:', err.message));

    res.status(201).json({ message: 'Lead created successfully', lead });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const { stage, status, source_id, assigned_to, search } = req.query;
    const where = { branch_id: req.user.branch_id };

    if (stage) where.stage = stage;
    if (status) where.status = status;
    if (source_id) where.source_id = source_id;
    if (assigned_to) where.assigned_to = assigned_to;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const leads = await Lead.findAll({ where, order: [['created_at', 'DESC']] });
    res.json({ leads });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json({ lead });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // IDOR Check
    if (req.user.role_id !== 1 && lead.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Permission denied: Lead belongs to another branch' });
    }

    await lead.update(req.body);

    await LeadActivity.create({
      lead_id: lead.id,
      user_id: req.user.id,
      activity_type: 'Updated',
      description: `Lead updated by ${req.user.first_name}`
    });

    res.json({ message: 'Lead updated successfully', lead });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateLeadStage = async (req, res) => {
  try {
    const { stage } = req.body;
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // IDOR Check
    if (req.user.role_id !== 1 && lead.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Permission denied: Lead belongs to another branch' });
    }

    const oldStage = lead.stage;
    await lead.update({ stage });

    // Auto-Conversion to Student
    if (stage === 'Converted' && oldStage !== 'Converted') {
      const { Student } = require('../models');
      const existingStudent = await Student.findOne({ where: { mobile: lead.mobile, branch_id: lead.branch_id } });
      
      if (!existingStudent) {
        // Generate a random admission number for V1 (ideally this should be sequential)
        const admission_no = `ADM-${Date.now().toString().slice(-6)}`;
        await Student.create({
          branch_id: lead.branch_id,
          lead_id: lead.id,
          admission_no,
          name: lead.name,
          mobile: lead.mobile,
          email: lead.email,
          status: 'Active'
        });
        
        await LeadActivity.create({
          lead_id: lead.id,
          user_id: req.user.id,
          activity_type: 'Note',
          details: `Lead automatically converted to Student (Adm No: ${admission_no})`
        });
      }
    }

    await LeadActivity.create({
      lead_id: lead.id,
      user_id: req.user.id,
      activity_type: 'Stage Changed',
      details: `Stage changed from ${oldStage} to ${stage}`
    });

    res.json({ message: 'Lead stage updated successfully', lead });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.assignLead = async (req, res) => {
  try {
    const { counsellor_id } = req.body;
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // IDOR Check
    if (req.user.role_id !== 1 && lead.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Permission denied: Lead belongs to another branch' });
    }

    // Validate Counsellor
    if (counsellor_id) {
      const { User } = require('../models');
      const counsellor = await User.findByPk(counsellor_id);
      if (!counsellor) {
        return res.status(400).json({ message: 'Invalid counsellor_id: User not found' });
      }
    }

    await lead.update({ assigned_to: counsellor_id });

    await LeadActivity.create({
      lead_id: lead.id,
      user_id: req.user.id,
      activity_type: 'Assigned',
      description: `Lead assigned to counsellor ID: ${counsellor_id}`
    });

    res.json({ message: 'Lead assigned successfully', lead });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // IDOR Check
    if (req.user.role_id !== 1 && lead.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Permission denied: Lead belongs to another branch' });
    }

    await lead.destroy();
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLeadActivities = async (req, res) => {
  try {
    const activities = await LeadActivity.findAll({
      where: { lead_id: req.params.id },
      order: [['created_at', 'DESC']]
    });
    res.json({ activities });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addLeadNote = async (req, res) => {
  try {
    const { note } = req.body;
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    await LeadActivity.create({
      lead_id: lead.id,
      user_id: req.user.id,
      activity_type: 'Note Added',
      description: note
    });

    res.json({ message: 'Note added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.importLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    const fs = require('fs');
    const csv = require('csv-parser');
    const results = [];
    const branch_id = req.user.branch_id;
    const { User, LeadSource, LeadActivity, Lead } = require('../models');

    // Pre-fetch counsellors and sources for quick lookup
    const counsellors = await User.findAll({ where: { role_id: 3, branch_id, status: 'active' }, attributes: ['id'] });
    const sources = await LeadSource.findAll({ attributes: ['id', 'name'] });

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        let imported = 0;
        let duplicates = 0;

        for (const row of results) {
          const mobile = row.Mobile || row.mobile || row.Phone || row.phone;
          const name = row.Name || row.name;
          const email = row.Email || row.email || null;
          const course_interest = row.Course || row.course || row.course_interest || null;
          const sourceName = row.Source || row.source || null;
          
          if (!mobile || !name) continue;

          // Check duplicate
          const existing = await Lead.findOne({ where: { mobile, branch_id } });
          if (existing) {
            duplicates++;
            continue;
          }

          // Assign random counsellor
          let assigned_counsellor = null;
          if (counsellors.length > 0) {
            assigned_counsellor = counsellors[Math.floor(Math.random() * counsellors.length)].id;
          }

          // Attempt to match source
          let source_id = null;
          if (sourceName) {
            const matchedSource = sources.find(s => s.name.toLowerCase() === sourceName.toLowerCase());
            if (matchedSource) source_id = matchedSource.id;
          }

          const lead = await Lead.create({
            name,
            mobile,
            email,
            course_interest,
            source_id,
            priority: 'Warm',
            stage: 'New',
            branch_id,
            assigned_to: assigned_counsellor,
            created_by: req.user.id,
            last_contact_date: new Date()
          });

          await LeadActivity.create({
            lead_id: lead.id,
            user_id: req.user.id,
            activity_type: 'Created',
            details: 'Lead imported via CSV'
          });

          imported++;
        }

        // Clean up file
        fs.unlinkSync(req.file.path);
        
        res.json({ message: 'Import completed', imported, duplicates });
      });
  } catch (error) {
    console.error('Import leads error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
