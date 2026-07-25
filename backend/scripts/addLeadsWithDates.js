const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'upsurgeerp'
};

const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rohan', 'Pooja', 'Arjun', 'Kavya', 
  'Sanjay', 'Neha', 'Karan', 'Divya', 'Rajesh', 'Meera', 'Aditya', 'Riya', 'Manish', 'Shreya',
  'Vishal', 'Ananya', 'Nikhil', 'Sakshi', 'Deepak', 'Ishita', 'Gaurav', 'Tanvi', 'Harsh', 'Nisha',
  'Akash', 'Simran', 'Varun', 'Kritika', 'Suresh', 'Pallavi', 'Mohit', 'Swati', 'Abhishek', 'Preeti',
  'Naveen', 'Aarti', 'Pankaj', 'Shweta', 'Ramesh', 'Madhuri', 'Sandeep', 'Rekha', 'Ajay', 'Sunita'];

const lastNames = ['Sharma', 'Kumar', 'Singh', 'Patel', 'Verma', 'Gupta', 'Reddy', 'Rao', 'Joshi', 'Mehta'];

const courses = ['Web Development', 'Data Science', 'Digital Marketing', 'Graphic Design', 'Python Programming', 
  'Java Full Stack', 'Mobile App Development', 'Cloud Computing', 'Cyber Security', 'AI & Machine Learning'];

const sources = ['Website', 'Facebook', 'Instagram', 'Google Ads', 'Referral', 'Walk-in', 'WhatsApp', 'LinkedIn'];

const stages = ['New', 'Contacted', 'Qualified', 'Negotiation'];

const priorities = ['Hot', 'Warm', 'Cold'];

const generateMobile = () => {
  return '9' + Math.floor(100000000 + Math.random() * 900000000);
};

const generateEmail = (name) => {
  return name.toLowerCase().replace(' ', '.') + Math.floor(Math.random() * 1000) + '@gmail.com';
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomDate = () => {
  const startDate = new Date('2024-04-01');
  const endDate = new Date('2024-05-16');
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  const date = new Date(randomTime);
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const addLeadsDirectly = async () => {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected!\n');
    console.log('Adding 50 leads with dates from 1 April to 16 May 2024...\n');
    
    for (let i = 0; i < 50; i++) {
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const fullName = `${firstName} ${lastName}`;
      const createdDate = getRandomDate();
      
      const leadData = {
        branch_id: 1,
        name: fullName,
        mobile: generateMobile(),
        email: generateEmail(fullName),
        course_interest: getRandomItem(courses),
        source: getRandomItem(sources),
        stage: getRandomItem(stages),
        priority: getRandomItem(priorities),
        status: 'Active',
        remarks: `Interested in ${getRandomItem(courses)}. Follow up required.`,
        created_at: createdDate,
        updated_at: createdDate
      };

      try {
        const [result] = await connection.execute(
          `INSERT INTO leads (branch_id, name, mobile, email, course_interest, source, stage, priority, status, remarks, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            leadData.branch_id,
            leadData.name,
            leadData.mobile,
            leadData.email,
            leadData.course_interest,
            leadData.source,
            leadData.stage,
            leadData.priority,
            leadData.status,
            leadData.remarks,
            leadData.created_at,
            leadData.updated_at
          ]
        );
        console.log(`✓ Lead ${i + 1}/50: ${fullName} - ${leadData.mobile} - Date: ${createdDate.split(' ')[0]}`);
      } catch (error) {
        console.log(`✗ Lead ${i + 1}/50 failed:`, error.message);
      }
    }

    console.log('\n✅ All 50 leads added successfully with random dates!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
};

addLeadsDirectly();
