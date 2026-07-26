const { 
  Student, 
  Admission, 
  CoursePackage, 
  Batch, 
  FeeSchedule, 
  FeePayment, 
  Lead, 
  LibraryBook, 
  InventoryItem, 
  Notice 
} = require('../models');
const sequelize = require('../config/database');

const firstNames = [
  'Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Rohan', 'Ananya', 'Diya', 'Ishita', 'Kavya',
  'Pooja', 'Rhea', 'Rahul', 'Vikram', 'Siddharth', 'Neha', 'Priya', 'Sanjay', 'Amit', 'Karan',
  'Divya', 'Sneha', 'Tanvi', 'Kritika', 'Yash', 'Mohit', 'Harsh', 'Mayank', 'Pranav', 'Nikhil',
  'Roshni', 'Swati', 'Meera', 'Tarun', 'Deepak', 'Alok', 'Manoj', 'Varun', 'Ritik', 'Shreya'
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Singh', 'Gupta', 'Kumar', 'Reddy', 'Rao', 'Joshi', 'Nair',
  'Mehta', 'Chopra', 'Malhotra', 'Bhatia', 'Saxena', 'Iyer', 'Menon', 'Das', 'Roy', 'Ghosh'
];

const courses = [
  { id: 1, name: 'Full Stack Web Development (MERN)', fee: 50000 },
  { id: 2, name: 'Data Science & Machine Learning', fee: 60000 },
  { id: 3, name: 'Cloud Computing & DevOps (AWS/Azure)', fee: 45000 },
  { id: 4, name: 'Digital Marketing & Growth Hacking', fee: 30000 }
];

async function up() {
  try {
    console.log('🚀 Starting Comprehensive 100+ Demo Records Seeding across all ERP Modules...');

    // 0. Ensure table schemas match Sequelize models (add columns if missing)
    const alterQueries = [
      "ALTER TABLE students ADD COLUMN gender ENUM('Male', 'Female', 'Other') NULL;",
      "ALTER TABLE students ADD COLUMN city VARCHAR(100) NULL;",
      "ALTER TABLE students ADD COLUMN state VARCHAR(100) NULL;",
      "ALTER TABLE students ADD COLUMN status VARCHAR(20) DEFAULT 'Active';",
      "ALTER TABLE admissions ADD COLUMN net_payable DECIMAL(10, 2) NULL;",
      "ALTER TABLE admissions ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;",
      "ALTER TABLE fee_schedules ADD COLUMN installment_no INT NULL;",
      "ALTER TABLE fee_schedules ADD COLUMN status ENUM('Pending', 'Paid', 'Overdue') DEFAULT 'Pending';",
      "ALTER TABLE fee_payments MODIFY COLUMN payment_mode VARCHAR(50) DEFAULT 'Cash';",
      "ALTER TABLE library_books ADD COLUMN quantity INT DEFAULT 1;",
      "ALTER TABLE library_books ADD COLUMN available_quantity INT DEFAULT 1;",
      "ALTER TABLE notices ADD COLUMN publish_date DATE NULL;",
      "ALTER TABLE notices ADD COLUMN status ENUM('Draft', 'Published', 'Expired') DEFAULT 'Published';"
    ];

    for (const q of alterQueries) {
      await sequelize.query(q).catch(() => {});
    }

    // 1. Ensure basic course packages and batches exist
    for (const c of courses) {
      await CoursePackage.findOrCreate({
        where: { id: c.id },
        defaults: {
          branch_id: 1,
          name: c.name,
          total_fee: c.fee,
          duration_months: 6,
          description: 'Comprehensive professional training course',
          is_active: true
        }
      }).catch(() => {});
    }

    const batchNames = ['Batch Alpha (Morning 9-11 AM)', 'Batch Beta (Evening 6-8 PM)', 'Batch Gamma (Weekend Express)'];
    for (let i = 0; i < batchNames.length; i++) {
      await Batch.findOrCreate({
        where: { id: i + 1 },
        defaults: {
          branch_id: 1,
          name: batchNames[i],
          start_date: '2026-05-01',
          end_date: '2026-11-01',
          is_active: true
        }
      }).catch(() => {});
    }

    // 2. Seed 100 Students & Admissions & Fee Schedules & Fee Payments
    console.log('📚 Seeding 100 Students, Admissions, and Fee Payments...');
    let seededStudents = 0;
    for (let i = 1; i <= 100; i++) {
      const fName = firstNames[i % firstNames.length];
      const lName = lastNames[(i * 3) % lastNames.length];
      const name = `${fName} ${lName}`;
      const email = `student${i + 100}@upsurgeerp.demo`;
      const phone = `98765${String(10000 + i).slice(-5)}`;

      let student = await Student.findOne({ where: { email } });
      if (!student) {
        student = await Student.create({
          branch_id: 1,
          name: name,
          email: email,
          mobile: phone,
          gender: i % 2 === 0 ? 'Female' : 'Male',
          dob: '2003-06-15',
          address: `${100 + i}, Tech Park Boulevard, Silicon City`,
          city: 'Bangalore',
          state: 'Karnataka',
          status: 'Active'
        }).catch(() => null);
      }

      if (student) {
        seededStudents++;
        const courseIdx = i % courses.length;
        const course = courses[courseIdx];
        const batchId = (i % 3) + 1;

        let admission = await Admission.findOne({ where: { student_id: student.id } });
        if (!admission) {
          admission = await Admission.create({
            student_id: student.id,
            course_package_id: course.id,
            batch_id: batchId,
            admission_date: `2026-0${(i % 6) + 1}-10`,
            status: 'Active',
            total_fee: course.fee,
            discount_amount: 0,
            net_payable: course.fee
          }).catch(() => null);
        }

        if (admission) {
          const installmentAmount = course.fee / 2;
          const isPaid = i <= 75;

          let sched1 = await FeeSchedule.findOne({ where: { admission_id: admission.id, installment_no: 1 } });
          if (!sched1) {
            sched1 = await FeeSchedule.create({
              admission_id: admission.id,
              installment_no: 1,
              due_date: '2026-05-15',
              amount: installmentAmount,
              status: isPaid ? 'Paid' : 'Pending'
            }).catch(() => null);
          }

          let sched2 = await FeeSchedule.findOne({ where: { admission_id: admission.id, installment_no: 2 } });
          if (!sched2) {
            sched2 = await FeeSchedule.create({
              admission_id: admission.id,
              installment_no: 2,
              due_date: '2026-08-15',
              amount: installmentAmount,
              status: i <= 30 ? 'Paid' : 'Pending'
            }).catch(() => null);
          }

          if (sched1 && isPaid) {
            const rcpNo = `RCP${String(100000 + i)}`;
            const existingPay = await FeePayment.findOne({ where: { receipt_no: rcpNo } });
            if (!existingPay) {
              await FeePayment.create({
                fee_schedule_id: sched1.id,
                admission_id: admission.id,
                amount_paid: installmentAmount,
                payment_mode: i % 2 === 0 ? 'Online' : 'Cash',
                payment_date: '2026-05-14',
                receipt_no: rcpNo,
                received_by: 1,
                remarks: 'Installment 1 Received in Full'
              }).catch(() => {});
            }
          }
        }
      }
    }

    // 3. Seed 100 CRM Leads
    console.log('📈 Seeding 100 CRM Leads...');
    const leadSources = ['Website Form', 'Google Ads', 'Referral', 'Walk-In Enquiry', 'Social Media Campaign'];
    const leadStages = ['New', 'Contacted', 'Demo Scheduled', 'Interested', 'Converted'];
    for (let j = 1; j <= 100; j++) {
      const fName = firstNames[(j * 2) % firstNames.length];
      const lName = lastNames[j % lastNames.length];
      const email = `lead_enquiry_${j}@upsurgeerp.demo`;
      const mobile = `98111${String(10000 + j).slice(-5)}`;

      const existingLead = await Lead.findOne({ where: { email } });
      if (!existingLead) {
        await Lead.create({
          branch_id: 1,
          name: `${fName} ${lName}`,
          email: email,
          mobile: mobile,
          course_interest: courses[j % courses.length].name,
          source: leadSources[j % leadSources.length],
          stage: leadStages[j % leadStages.length],
          status: 'Active',
          assigned_to: 1,
          remarks: `Enquiry for ${courses[j % courses.length].name}. Needs follow up.`
        }).catch(() => {});
      }
    }

    // 4. Seed Library Books & Inventory Items
    console.log('📖 Seeding Library Books and Inventory Assets...');
    const books = [
      'Clean Code: A Handbook of Agile Software Craftsmanship',
      'JavaScript: The Good Parts',
      'You Don\'t Know JS Yet: Get Started',
      'Design Patterns: Elements of Reusable Object-Oriented Software',
      'Introduction to Algorithms (CLRS)',
      'Deep Learning with Python by François Chollet',
      'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow',
      'Designing Data-Intensive Applications by Martin Kleppmann',
      'Node.js Design Patterns',
      'React Key Concepts: Consolidate your knowledge of React'
    ];

    for (let k = 0; k < books.length; k++) {
      const isbn = `978-0-13-${100000 + k}`;
      await LibraryBook.findOrCreate({
        where: { isbn },
        defaults: {
          branch_id: 1,
          title: books[k],
          author: k % 2 === 0 ? 'Robert C. Martin' : 'Kyle Simpson',
          category: 'Computer Science',
          isbn: isbn,
          quantity: 10,
          available_quantity: 8,
          status: 'Available'
        }
      }).catch(() => {});
    }

    const items = [
      { name: 'Dell Latitude Laptops (i7, 16GB RAM)', qty: 25, price: 65000 },
      { name: 'Logitech Wireless Mouse & Keyboard Combo', qty: 50, price: 1500 },
      { name: 'Whiteboard Marker Boxes (Pack of 10)', qty: 100, price: 300 },
      { name: 'Ergonomic Office Chairs', qty: 30, price: 5500 },
      { name: 'Projector Epson HD', qty: 5, price: 45000 }
    ];

    for (const it of items) {
      await InventoryItem.findOrCreate({
        where: { name: it.name },
        defaults: {
          branch_id: 1,
          name: it.name,
          category: 'Hardware & Office Supplies',
          quantity: it.qty,
          unit_price: it.price,
          status: 'In Stock'
        }
      }).catch(() => {});
    }

    // 5. Seed Notices
    console.log('📢 Seeding Institutional Notices...');
    const notices = [
      { title: 'Welcome to New Academic Term 2026', content: 'We are thrilled to welcome all new admissions to UpsurgeERP tech campus. Classes commence from Monday 9 AM.' },
      { title: 'Fee Payment Deadline Extension', content: 'The last date for second installment fee payment without penalty has been extended to 20th August 2026.' },
      { title: 'Annual Hackathon 2026 Registration Open', content: 'Register your 4-member team for our upcoming 36-hour coding hackathon. Exciting cash prizes to be won!' }
    ];

    for (const n of notices) {
      await Notice.findOrCreate({
        where: { title: n.title },
        defaults: {
          branch_id: 1,
          title: n.title,
          content: n.content,
          publish_date: new Date(),
          status: 'Published'
        }
      }).catch(() => {});
    }

    console.log('🎉 100+ Comprehensive Demo Records Seeded Successfully across ALL modules!');
    return { status: 'success', message: `Seeded ${seededStudents} Students, Admissions, Fees, CRM Leads, Library Books, and Inventory Assets!` };
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    throw err;
  }
}

async function down() {
  console.log('Down migration not required for sample data.');
}

module.exports = { up, down };
