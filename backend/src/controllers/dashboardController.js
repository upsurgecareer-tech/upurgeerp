const sequelize = require('../config/database');
const { Op } = require('sequelize');

// Main Dashboard Overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [overview] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM students WHERE branch_id = ? AND status = 'Active') as total_students,
        (SELECT COUNT(*) FROM students WHERE branch_id = ? AND DATE(created_at) = CURDATE()) as new_students_today,
        (SELECT COUNT(*) FROM leads WHERE branch_id = ? AND stage != 'Converted') as active_leads,
        (SELECT COUNT(*) FROM leads WHERE branch_id = ? AND DATE(created_at) = CURDATE()) as new_leads_today,
        (SELECT COALESCE(SUM(amount_paid), 0) FROM fee_payments WHERE branch_id = ? AND DATE(payment_date) >= ?) as revenue_this_month,
        (SELECT COALESCE(SUM(amount_paid), 0) FROM fee_payments WHERE branch_id = ? AND DATE(payment_date) = CURDATE()) as revenue_today,
        (SELECT COUNT(*) FROM users WHERE branch_id = ? AND role_id IN (SELECT id FROM roles WHERE name IN ('Teacher', 'Staff'))) as total_staff,
        (SELECT COUNT(*) FROM batches WHERE branch_id = ? AND status = 'Active') as active_batches
    `, { replacements: [branch_id, branch_id, branch_id, branch_id, branch_id, startOfMonth, branch_id, branch_id, branch_id] });

    res.json({ success: true, data: overview[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Real-Time Stats (for WebSocket updates)
exports.getRealTimeStats = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    
    const [stats] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM attendance_sessions WHERE branch_id = ? AND DATE(date) = CURDATE()) as today_attendance_sessions,
        (SELECT COUNT(*) FROM fee_payments WHERE branch_id = ? AND DATE(payment_date) = CURDATE()) as today_payments,
        (SELECT COUNT(*) FROM leads WHERE branch_id = ? AND DATE(created_at) = CURDATE()) as today_leads,
        (SELECT COUNT(*) FROM students WHERE branch_id = ? AND DATE(created_at) = CURDATE()) as today_admissions
    `, { replacements: [branch_id, branch_id, branch_id, branch_id] });

    res.json({ success: true, data: stats[0], timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Revenue Trends (Last 12 months)
exports.getRevenueTrends = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    
    const [trends] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(payment_date, '%Y-%m') as month,
        COALESCE(SUM(amount_paid), 0) as revenue,
        COUNT(*) as payment_count
      FROM fee_payments 
      WHERE branch_id = ? AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
      ORDER BY month ASC
    `, { replacements: [branch_id] });

    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Student Growth Trends
exports.getStudentGrowthTrends = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    
    const [trends] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as new_students,
        SUM(COUNT(*)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m')) as cumulative_students
      FROM students 
      WHERE branch_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `, { replacements: [branch_id] });

    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lead Conversion Funnel
exports.getLeadFunnel = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    
    const [funnel] = await sequelize.query(`
      SELECT 
        stage,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM leads WHERE branch_id = ?), 2) as percentage
      FROM leads 
      WHERE branch_id = ?
      GROUP BY stage
      ORDER BY 
        CASE stage
          WHEN 'New' THEN 1
          WHEN 'Contacted' THEN 2
          WHEN 'Qualified' THEN 3
          WHEN 'Negotiation' THEN 4
          WHEN 'Converted' THEN 5
          WHEN 'Lost' THEN 6
        END
    `, { replacements: [branch_id, branch_id] });

    res.json({ success: true, data: funnel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Attendance Overview
exports.getAttendanceOverview = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    
    const [overview] = await sequelize.query(`
      SELECT 
        DATE(date) as date,
        COUNT(DISTINCT student_id) as total_present,
        (SELECT COUNT(*) FROM students WHERE branch_id = ? AND status = 'Active') as total_students,
        ROUND(COUNT(DISTINCT student_id) * 100.0 / (SELECT COUNT(*) FROM students WHERE branch_id = ? AND status = 'Active'), 2) as attendance_percentage
      FROM attendance_sessions 
      WHERE branch_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(date)
      ORDER BY date DESC
    `, { replacements: [branch_id, branch_id, branch_id] });

    res.json({ success: true, data: overview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Top Performing Courses
exports.getTopCourses = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    
    const [courses] = await sequelize.query(`
      SELECT 
        c.name as course_name,
        COUNT(DISTINCT s.id) as student_count,
        COUNT(DISTINCT b.id) as batch_count,
        COALESCE(SUM(fp.amount), 0) as total_revenue
      FROM courses c
      LEFT JOIN batches b ON b.course_id = c.id
      LEFT JOIN students s ON s.id IN (
        SELECT student_id FROM batch_students WHERE batch_id = b.id
      )
      LEFT JOIN fee_payments fp ON fp.student_id = s.id
      WHERE c.branch_id = ?
      GROUP BY c.id, c.name
      ORDER BY student_count DESC
      LIMIT 10
    `, { replacements: [branch_id] });

    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fee Collection Status
exports.getFeeCollectionStatus = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    
    const [status] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT CASE WHEN fp.id IS NOT NULL THEN s.id END) as paid_students,
        COUNT(DISTINCT CASE WHEN fp.id IS NULL THEN s.id END) as pending_students,
        COALESCE(SUM(fp.amount_paid), 0) as collected_amount,
        0 as pending_amount
      FROM students s
      LEFT JOIN fee_payments fp ON fp.student_id = s.id AND MONTH(fp.payment_date) = MONTH(CURDATE())
      WHERE s.branch_id = ? AND s.status = 'Active'
    `, { replacements: [branch_id] });

    res.json({ success: true, data: status[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upcoming Events & Deadlines
exports.getUpcomingEvents = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    
    const [events] = await sequelize.query(`
      SELECT 'Exam' as type, e.name as title, e.exam_date as date, e.id
      FROM exams e WHERE e.branch_id = ? AND e.exam_date >= CURDATE()
      UNION ALL
      SELECT 'Notice' as type, n.title, n.publish_date as date, n.id
      FROM notices n WHERE n.branch_id = ? AND n.publish_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 'Batch Start' as type, b.name as title, b.start_date as date, b.id
      FROM batches b WHERE b.branch_id = ? AND b.start_date >= CURDATE()
      ORDER BY date ASC
      LIMIT 10
    `, { replacements: [branch_id, branch_id, branch_id] });

    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Smart Alerts & Notifications
exports.getSmartAlerts = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    const alerts = [];

    // Low attendance students
    const [lowAttendance] = await sequelize.query(`
      SELECT s.id, s.name, 
        COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as present_count,
        COUNT(*) as total_sessions,
        ROUND(COUNT(CASE WHEN a.status = 'Present' THEN 1 END) * 100.0 / COUNT(*), 2) as attendance_percentage
      FROM students s
      LEFT JOIN attendance_records a ON a.student_id = s.id
      WHERE s.branch_id = ? AND s.status = 'Active'
      GROUP BY s.id, s.name
      HAVING attendance_percentage < 75
      LIMIT 5
    `, { replacements: [branch_id] });

    if (lowAttendance.length > 0) {
      alerts.push({
        type: 'warning',
        category: 'attendance',
        title: 'Low Attendance Alert',
        message: `${lowAttendance.length} students have attendance below 75%`,
        data: lowAttendance,
        priority: 'high'
      });
    }

    // Pending fee payments
    const [pendingFees] = await sequelize.query(`
      SELECT COUNT(DISTINCT s.id) as count, 0 as amount
      FROM students s
      LEFT JOIN fee_payments fp ON fp.student_id = s.id AND MONTH(fp.payment_date) = MONTH(CURDATE())
      WHERE s.branch_id = ? AND s.status = 'Active' AND fp.id IS NULL
    `, { replacements: [branch_id] });

    if (pendingFees[0].count > 0) {
      alerts.push({
        type: 'info',
        category: 'fees',
        title: 'Pending Fee Payments',
        message: `${pendingFees[0].count} students have pending fee payments`,
        amount: pendingFees[0].amount,
        priority: 'medium'
      });
    }

    // Uncontacted leads
    const [uncontactedLeads] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM leads 
      WHERE branch_id = ? AND stage = 'New' AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `, { replacements: [branch_id] });

    if (uncontactedLeads[0].count > 0) {
      alerts.push({
        type: 'warning',
        category: 'leads',
        title: 'Uncontacted Leads',
        message: `${uncontactedLeads[0].count} leads are pending contact for more than 24 hours`,
        priority: 'high'
      });
    }

    // Upcoming exams
    const [upcomingExams] = await sequelize.query(`
      SELECT COUNT(*) as count, MIN(exam_date) as next_exam_date
      FROM exams 
      WHERE branch_id = ? AND exam_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    `, { replacements: [branch_id] });

    if (upcomingExams[0].count > 0) {
      alerts.push({
        type: 'info',
        category: 'exams',
        title: 'Upcoming Exams',
        message: `${upcomingExams[0].count} exams scheduled in next 7 days`,
        next_exam: upcomingExams[0].next_exam_date,
        priority: 'medium'
      });
    }

    res.json({ success: true, data: alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Staff Performance Overview
exports.getStaffPerformance = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    
    const [performance] = await sequelize.query(`
      SELECT 
        u.id, u.first_name, u.last_name, r.name as role,
        COUNT(DISTINCT l.id) as leads_handled,
        COUNT(DISTINCT CASE WHEN l.stage = 'Converted' THEN l.id END) as leads_converted,
        COUNT(DISTINCT b.id) as batches_assigned,
        COALESCE(AVG(sa.rating), 0) as avg_rating
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN leads l ON l.assigned_to = u.id
      LEFT JOIN batches b ON b.instructor_id = u.id
      LEFT JOIN staff_attendance sa ON sa.user_id = u.id
      WHERE u.branch_id = ? AND r.name IN ('Teacher', 'Counselor', 'Staff')
      GROUP BY u.id, u.first_name, u.last_name, r.name
      ORDER BY leads_converted DESC
      LIMIT 10
    `, { replacements: [branch_id] });

    res.json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Comparative Analysis (YoY, MoM)
exports.getComparativeAnalysis = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    const { type = 'monthly' } = req.query; // monthly, yearly

    let dateFormat = '%Y-%m';
    let interval = 'MONTH';
    
    if (type === 'yearly') {
      dateFormat = '%Y';
      interval = 'YEAR';
    }

    const [analysis] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(created_at, ?) as period,
        COUNT(DISTINCT s.id) as students,
        COUNT(DISTINCT l.id) as leads,
        COALESCE(SUM(fp.amount), 0) as revenue
      FROM (
        SELECT created_at FROM students WHERE branch_id = ?
        UNION ALL
        SELECT created_at FROM leads WHERE branch_id = ?
        UNION ALL
        SELECT payment_date as created_at FROM fee_payments WHERE branch_id = ?
      ) dates
      LEFT JOIN students s ON DATE_FORMAT(s.created_at, ?) = DATE_FORMAT(dates.created_at, ?) AND s.branch_id = ?
      LEFT JOIN leads l ON DATE_FORMAT(l.created_at, ?) = DATE_FORMAT(dates.created_at, ?) AND l.branch_id = ?
      LEFT JOIN fee_payments fp ON DATE_FORMAT(fp.payment_date, ?) = DATE_FORMAT(dates.created_at, ?) AND fp.branch_id = ?
      WHERE dates.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 ${interval})
      GROUP BY period
      ORDER BY period ASC
    `, { replacements: [dateFormat, branch_id, branch_id, branch_id, dateFormat, dateFormat, branch_id, dateFormat, dateFormat, branch_id, dateFormat, dateFormat, branch_id] });

    res.json({ success: true, data: analysis, type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Widget Data (for customizable dashboard)
exports.getWidgetData = async (req, res) => {
  try {
    const { widget_type } = req.params;
    const branch_id = req.user.branch_id;

    let data;

    switch (widget_type) {
      case 'student_count':
        [data] = await sequelize.query(`SELECT COUNT(*) as count FROM students WHERE branch_id = ? AND status = 'Active'`, { replacements: [branch_id] });
        break;
      
      case 'revenue_today':
        [data] = await sequelize.query(`SELECT COALESCE(SUM(amount_paid), 0) as amount FROM fee_payments WHERE branch_id = ? AND DATE(payment_date) = CURDATE()`, { replacements: [branch_id] });
        break;
      
      case 'active_leads':
        [data] = await sequelize.query(`SELECT COUNT(*) as count FROM leads WHERE branch_id = ? AND stage != 'Converted' AND stage != 'Lost'`, { replacements: [branch_id] });
        break;
      
      case 'attendance_today':
        [data] = await sequelize.query(`SELECT COUNT(DISTINCT student_id) as count FROM attendance_records WHERE branch_id = ? AND DATE(date) = CURDATE()`, { replacements: [branch_id] });
        break;

      default:
        return res.status(400).json({ error: 'Invalid widget type' });
    }

    res.json({ success: true, widget_type, data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
