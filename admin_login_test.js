const http = require('http');

async function checkPage() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:80/control-room-7f92x/login', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 && data.includes('AUTHENTICATE')) {
          resolve(true);
        } else {
          reject(new Error(`Login page check failed. Status: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

async function testLogin() {
  const credentials = JSON.stringify({
    email: 'admin@centralcalendar.org',
    password: 'CentralCalendar2024!'
  });

  const options = {
    hostname: 'localhost',
    port: 80,
    path: '/api/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': credentials.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Login failed with status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(credentials);
    req.end();
  });
}

(async () => {
    try {
        console.log('Checking login page accessibility...');
        await checkPage();
        console.log('Login page is accessible and contains AUTHENTICATE button.');

        console.log('Verifying credentials via API...');
        const res = await testLogin();
        console.log('Login Response:', res);
        if (res.success && res.token) {
            console.log('SUCCESS: Admin login verified.');
            console.log('Token received:', res.token.substring(0, 20) + '...');
        } else {
            console.error('FAILURE: Login response unsuccessful.');
            process.exit(1);
        }
    } catch (err) {
        console.error('FAILURE:', err.message);
        process.exit(1);
    }
})();
