const axios = require('axios');

async function testFrontendFlow() {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'admin@renetech.com',
      password: 'Redowan173123'
    });
    const token = loginRes.data.token;
    console.log('Login successful. Token acquired.');

    console.log('Fetching dashboard stats...');
    const statsRes = await axios.get('http://127.0.0.1:5000/api/dashboard/stats?branchId=all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Dashboard Stats:', statsRes.data);
  } catch(e) {
    if (e.response) {
      console.error('API ERROR:', e.response.status, e.response.data);
    } else {
      console.error('NETWORK ERROR:', e.message);
    }
  }
}

testFrontendFlow();
