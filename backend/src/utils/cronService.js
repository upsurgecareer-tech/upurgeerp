const cron = require('node-cron');
const { Op } = require('sequelize');
const { Student } = require('../models/Student');
const { FeePayment } = require('../models/FeePayment');
const { Exam } = require('../models/Exam');
const { Attendance } = require('../models/Attendance');
const smsService = require('./smsService');
const emailService = require('./emailService');

// Fee Reminder - Daily at 9 AM
const scheduleFeeReminders = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running fee reminder job...');
    try {
      const today = new Date();
      const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

      const pendingPayments = await FeePayment.findAll({
        where: {
          status: 'Pending',
          dueDate: { [Op.between]: [today, threeDaysLater] }
        },
        include: [{ model: Student, as: 'student' }]
      });

      for (const payment of pendingPayments) {
        if (payment.student?.mobile) {
          await smsService.sendFeeReminder(
            payment.student.mobile,
            payment.student.name,
            payment.amount_paid,
            payment.dueDate
          );
        }
        if (payment.student?.email) {
          await emailService.sendFeeReminder(
            payment.student.email,
            payment.student.name,
            payment.amount_paid,
            payment.dueDate
          );
        }
      }
      console.log(`Fee reminders sent: ${pendingPayments.length}`);
    } catch (error) {
      console.error('Fee reminder job error:', error);
    }
  });
};

// Exam Reminder - Daily at 8 AM
const scheduleExamReminders = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running exam reminder job...');
    try {
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      const upcomingExams = await Exam.findAll({
        where: {
          examDate: { [Op.between]: [today, tomorrow] }
        }
      });

      for (const exam of upcomingExams) {
        const students = await Student.findAll({
          where: { batch_id: exam.batch_id }
        });

        for (const student of students) {
          if (student.mobile) {
            await smsService.sendExamReminder(
              student.mobile,
              student.name,
              exam.name,
              exam.exam_date
            );
          }
          if (student.email) {
            await emailService.sendExamNotification(
              student.email,
              student.name,
              exam.name,
              exam.exam_date
            );
          }
        }
      }
      console.log(`Exam reminders sent for ${upcomingExams.length} exams`);
    } catch (error) {
      console.error('Exam reminder job error:', error);
    }
  });
};

// Low Attendance Alert - Weekly on Monday at 10 AM
const scheduleAttendanceAlerts = () => {
  cron.schedule('0 10 * * 1', async () => {
    console.log('Running attendance alert job...');
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const students = await Student.findAll({
        where: { status: 'Active' }
      });

      for (const student of students) {
        const attendanceRecords = await Attendance.findAll({
          where: {
            student_id: student.id,
            '$session.date$': { [Op.gte]: thirtyDaysAgo }
          }
        });

        const totalClasses = attendanceRecords.length;
        const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
        const attendancePercentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;

        if (attendancePercentage < 75 && student.mobile) {
          await smsService.sendAttendanceAlert(
            student.mobile,
            student.name,
            attendancePercentage.toFixed(2)
          );
        }
      }
      console.log('Attendance alerts processed');
    } catch (error) {
      console.error('Attendance alert job error:', error);
    }
  });
};

// Overdue Fee Alert - Daily at 10 AM
const scheduleOverdueFeeAlerts = () => {
  cron.schedule('0 10 * * *', async () => {
    console.log('Running overdue fee alert job...');
    try {
      const today = new Date();

      const overduePayments = await FeePayment.findAll({
        where: {
          status: 'Pending',
          dueDate: { [Op.lt]: today }
        },
        include: [{ model: Student, as: 'student' }]
      });

      for (const payment of overduePayments) {
        if (payment.student?.mobile) {
          await smsService.sendSMS(
            payment.student.mobile,
            `URGENT: Fee payment of Rs.${payment.amount_paid} is overdue. Please pay immediately to avoid penalties. Contact office.`
          );
        }
      }
      console.log(`Overdue alerts sent: ${overduePayments.length}`);
    } catch (error) {
      console.error('Overdue fee alert job error:', error);
    }
  });
};

// Initialize all cron jobs
const initializeCronJobs = () => {
  console.log('Initializing cron jobs...');
  scheduleFeeReminders();
  scheduleExamReminders();
  scheduleAttendanceAlerts();
  scheduleOverdueFeeAlerts();
  console.log('All cron jobs scheduled successfully');
};

module.exports = { initializeCronJobs };
