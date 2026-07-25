const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';
const LOGIN_EMAIL = 'admin@upsurgeerp.com';
const LOGIN_PASSWORD = 'admin123';

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
  // Random date between 1 April 2024 to 16 May 2024
  const startDate = new Date('2024-04-01');
  const endDate = new Date('2024-05-16');
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
};

const addLeads = async () => {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD
    });
    
    console.log('Login Response:', JSON.stringify(loginRes.data, null, 2));
    const token = loginRes.data.token || loginRes.data.data?.token;
    
    if (!token) {
      console.error('No token received from login!');
      return;
    }
    
    console.log('Login successful!\n');
    console.log('Adding 50 leads...\n');
    
    for (let i = 0; i < 50; i++) {
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const fullName = `${firstName} ${lastName}`;
      
      const leadData = {
        name: fullName,
        mobile: generateMobile(),
        email: generateEmail(fullName),
        course_interest: getRandomItem(courses),
        source: getRandomItem(sources),
        stage: getRandomItem(stages),
        priority: getRandomItem(priorities),
        remarks: `Interested in ${getRandomItem(courses)}. Follow up required.`,
        created_at: getRandomDate()
      };

      try {
        const response = await axios.post(`${API_URL}/leads`, leadData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`✓ Lead ${i + 1}/50: ${fullName} - ${leadData.mobile}`);
      } catch (error) {
        console.log(`✗ Lead ${i + 1}/50 failed:`, error.response?.data || error.message);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n✅ All 50 leads added successfully!');
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

addLeads();
