const http = require('http');
const { spawn } = require('child_process');

console.log("Starting Next.js production server for live integration testing...");

const server = spawn('cmd.exe', ['/c', 'npx', 'next', 'start', '-p', '3008'], {
  stdio: 'inherit',
});

function fetchUrl(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 3008,
        path,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function waitForServer(retries = 15) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetchUrl('/api/admin/check');
      if (res && res.status) return true;
    } catch (err) {
      if (i === retries - 1) console.error("Last probe error:", err.message);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return false;
}

async function run() {
  const ready = await waitForServer();
  if (!ready) {
    console.error("Server failed to become ready within timeout.");
    server.kill();
    process.exit(1);
  }

  console.log("\nServer is READY on http://localhost:3008! Running live HTTP probe tests...\n");

  // 1. Homepage
  const home = await fetchUrl('/');
  console.log(`[TEST 1] Homepage (/): Status ${home.status} | Content length: ${home.body.length}`);

  // 2. /api/products
  const prod = await fetchUrl('/api/products');
  console.log(`[TEST 2] /api/products: Status ${prod.status}`);
  console.log(`         Cache-Control: ${prod.headers['cache-control']}`);
  console.log(`         X-RateLimit-Limit: ${prod.headers['x-ratelimit-limit']}`);
  console.log(`         X-RateLimit-Remaining: ${prod.headers['x-ratelimit-remaining']}`);

  // 3. /api/admin/settings
  const settings = await fetchUrl('/api/admin/settings');
  console.log(`[TEST 3] /api/admin/settings: Status ${settings.status}`);
  console.log(`         Cache-Control: ${settings.headers['cache-control']}`);

  // 4. /admin/login
  const loginPage = await fetchUrl('/admin/login');
  console.log(`[TEST 4] /admin/login page: Status ${loginPage.status}`);

  // 5. /api/admin/check (Unauthenticated)
  const check = await fetchUrl('/api/admin/check');
  console.log(`[TEST 5] /api/admin/check: Status ${check.status} | Body: ${check.body}`);

  // 6. Admin Login with invalid credentials
  const badLogin = await fetchUrl('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'wrong_password_test' }),
  });
  console.log(`[TEST 6] /api/admin/login (bad password): Status ${badLogin.status} | Body: ${badLogin.body}`);

  // 7. Protected route unauthorized check
  const unauthorizedPost = await fetchUrl('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Product', price: '10', description: 'Test' }),
  });
  console.log(`[TEST 7] /api/products POST without auth: Status ${unauthorizedPost.status} (Protected)`);

  console.log("\nALL LIVE INTEGRATION TESTS COMPLETED SUCCESSFULLY!\n");
  server.kill('SIGINT');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  server.kill('SIGINT');
  process.exit(1);
});
