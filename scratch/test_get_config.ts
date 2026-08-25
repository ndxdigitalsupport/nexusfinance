async function testGetConfig() {
  try {
    console.log('Logging in as admin...');
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nexus.com', password: 'password123' })
    });
    
    if (!loginRes.ok) {
      console.error('Login failed:', loginRes.status, await loginRes.text());
      return;
    }
    
    const { token } = await loginRes.json();
    console.log('Login succeeded. Token received.');

    console.log('Fetching config...');
    const configRes = await fetch('http://localhost:3001/api/config', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!configRes.ok) {
      console.error('Config fetch failed:', configRes.status, await configRes.text());
      return;
    }
    
    const config = await configRes.json();
    console.log('Config fetch succeeded. Response:', config);
  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

testGetConfig();
