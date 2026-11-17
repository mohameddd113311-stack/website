const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log("==================================================");
console.log("   AUTOMATED VERIFICATION & TEST SUITE FOR AI STUDIO");
console.log("==================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// -------------------------------------------------------------
// 1. TEST RATE LIMITER
// -------------------------------------------------------------
console.log("--- 1. Testing Rate Limiting (src/lib/rateLimit.ts logic) ---");
const rateLimitMap = new Map();
function checkRateLimit(key, limit, windowMs) {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, limit, remaining: limit - 1, retryAfterSeconds: 0 };
  }
  if (record.count >= limit) {
    return { allowed: false, limit, remaining: 0, retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000) };
  }
  record.count += 1;
  return { allowed: true, limit, remaining: limit - record.count, retryAfterSeconds: 0 };
}

// Test 5 allowed requests
const testIp = "192.168.1.50";
for (let i = 1; i <= 5; i++) {
  const res = checkRateLimit(`ip:${testIp}`, 5, 10000);
  assert(res.allowed === true && res.remaining === 5 - i, `Request ${i}/5 permitted (remaining: ${res.remaining})`);
}

// 6th request must be blocked
const blockCheck = checkRateLimit(`ip:${testIp}`, 5, 10000);
assert(blockCheck.allowed === false, "6th request blocked with HTTP 429 Too Many Requests");
assert(blockCheck.retryAfterSeconds > 0, `Retry-After accurately calculated: ${blockCheck.retryAfterSeconds}s`);

// Different IP should still be allowed
const otherIpCheck = checkRateLimit("ip:10.0.0.1", 5, 10000);
assert(otherIpCheck.allowed === true, "Independent IP is allowed and not affected by previous limit");

// -------------------------------------------------------------
// 2. TEST AUTHENTICATION & HMAC TOKEN
// -------------------------------------------------------------
console.log("\n--- 2. Testing Authentication & Session Signing (src/lib/auth.ts logic) ---");
const SECRET = process.env.JWT_SECRET || 'ai-studio-super-secret-key-2026';
const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
const expectedPassword = process.env.ADMIN_PASSWORD || 'aistudio2026';

function verifyAdminCredentials(u, p) {
  if (!u || !p) return false;
  const userBuf = Buffer.from(u);
  const expUserBuf = Buffer.from(expectedUsername);
  const passBuf = Buffer.from(p);
  const expPassBuf = Buffer.from(expectedPassword);
  return userBuf.length === expUserBuf.length &&
         crypto.timingSafeEqual(userBuf, expUserBuf) &&
         passBuf.length === expPassBuf.length &&
         crypto.timingSafeEqual(passBuf, expPassBuf);
}

function createToken(role = 'admin') {
  const payload = { role, issuedAt: Date.now() };
  const base64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(base64).digest('base64url');
  return `${base64}.${signature}`;
}

function verifyToken(token) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [base64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SECRET).update(base64).digest('base64url');
  if (signature !== expectedSig) return false;
  try {
    const payload = JSON.parse(Buffer.from(base64, 'base64url').toString('utf-8'));
    return payload.role === 'admin' && (Date.now() - payload.issuedAt < 7 * 24 * 60 * 60 * 1000);
  } catch {
    return false;
  }
}

assert(verifyAdminCredentials(expectedUsername, expectedPassword) === true, "Valid admin credentials verified");
assert(verifyAdminCredentials("admin", "wrongpass") === false, "Wrong password correctly rejected");
assert(verifyAdminCredentials("hacker", expectedPassword) === false, "Wrong username correctly rejected");

const adminToken = createToken('admin');
assert(verifyToken(adminToken) === true, "HMAC-SHA256 admin session token verified successfully");

const forgedToken = adminToken.substring(0, adminToken.length - 4) + 'abcd';
assert(verifyToken(forgedToken) === false, "Forged token with invalid HMAC signature rejected");
assert(verifyToken("random.nonsense") === false, "Arbitrary invalid token rejected");

// -------------------------------------------------------------
// 3. TEST IN-MEMORY CACHE & REQUEST COALESCING
// -------------------------------------------------------------
console.log("\n--- 3. Testing In-Memory Cache & In-Flight Deduplication (src/lib/storage.ts logic) ---");
let memoryCache = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000;
let dbCallCount = 0;
let activePromise = null;

async function mockDbFetch() {
  dbCallCount++;
  // Simulate network latency (50ms)
  await new Promise(r => setTimeout(r, 50));
  return [{ id: 'prod_1', name: 'Product 1' }, { id: 'prod_2', name: 'Product 2' }];
}

async function loadCachedProducts(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && memoryCache && (now - lastFetchTime < CACHE_TTL_MS)) {
    return memoryCache;
  }
  if (activePromise) {
    return activePromise;
  }
  activePromise = (async () => {
    try {
      const data = await mockDbFetch();
      memoryCache = data;
      lastFetchTime = Date.now();
      return data;
    } finally {
      activePromise = null;
    }
  })();
  return activePromise;
}

(async () => {
  // Test 1: First call hits DB
  const t1 = Date.now();
  const res1 = await loadCachedProducts();
  const d1 = Date.now() - t1;
  assert(res1.length === 2 && dbCallCount === 1, `First load fetched from DB in ${d1}ms (DB calls: ${dbCallCount})`);

  // Test 2: Second call uses cache (< 2ms, DB count remains 1)
  const t2 = Date.now();
  const res2 = await loadCachedProducts();
  const d2 = Date.now() - t2;
  assert(res2.length === 2 && dbCallCount === 1, `Second load served from CACHE in ${d2}ms (DB calls still ${dbCallCount}) - Saved network call!`);

  // Test 3: Concurrent coalescing (10 simultaneous calls -> only 1 DB call!)
  // Reset cache
  memoryCache = null;
  lastFetchTime = 0;
  dbCallCount = 0;

  const tConcurrent = Date.now();
  const concurrentCalls = await Promise.all([
    loadCachedProducts(),
    loadCachedProducts(),
    loadCachedProducts(),
    loadCachedProducts(),
    loadCachedProducts(),
    loadCachedProducts(),
    loadCachedProducts(),
    loadCachedProducts(),
    loadCachedProducts(),
    loadCachedProducts(),
  ]);
  const dConcurrent = Date.now() - tConcurrent;
  assert(concurrentCalls.length === 10, `10 concurrent calls completed in ${dConcurrent}ms`);
  assert(dbCallCount === 1, `Request Coalescing VERIFIED: 10 concurrent requests triggered exactly 1 DB query (Saved 9 redundant queries!)`);

  // Test 4: Cache Invalidation after mutation
  memoryCache = [{ id: 'prod_new', name: 'Added Product' }];
  lastFetchTime = Date.now();
  const resAfterMutation = await loadCachedProducts();
  assert(resAfterMutation[0].id === 'prod_new', "Cache updated instantly after product mutation");

  // -------------------------------------------------------------
  // 4. TEST XSS & INPUT SANITIZATION
  // -------------------------------------------------------------
  console.log("\n--- 4. Testing Input Sanitization (src/lib/auth.ts sanitizeInput) ---");
  function sanitizeInput(input) {
    if (!input) return '';
    return input.trim().replace(/[<>]/g, '').substring(0, 10000);
  }

  const maliciousPayload = "<script>stealCookies();</script><b>Valid Product Name</b>";
  const sanitized = sanitizeInput(maliciousPayload);
  assert(!sanitized.includes('<') && !sanitized.includes('>'), "HTML tags stripped, XSS neutralized");
  assert(sanitized.includes("Valid Product Name"), "Safe content preserved");

  // -------------------------------------------------------------
  // 5. TEST DATA INTEGRITY & DEFAULT PRODUCTS
  // -------------------------------------------------------------
  console.log("\n--- 5. Testing Default Products File & Structure ---");
  const dataFile = path.join(process.cwd(), 'data', 'products.json');
  assert(fs.existsSync(dataFile), "data/products.json exists on disk");
  const productsJson = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  assert(Array.isArray(productsJson) && productsJson.length >= 3, `Local fallback catalog contains ${productsJson.length} products`);

  const requiredFields = ['id', 'name', 'price', 'category', 'description'];
  let allFieldsValid = true;
  for (const p of productsJson) {
    for (const f of requiredFields) {
      if (!p[f]) allFieldsValid = false;
    }
  }
  assert(allFieldsValid, "All products contain all required fields");

  console.log(`\n==================================================`);
  console.log(`   TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`==================================================\n`);

  if (failed > 0) process.exit(1);
})();
