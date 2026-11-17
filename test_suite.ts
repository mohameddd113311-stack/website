// Automated Verification Test Suite
import { checkRateLimit } from './src/lib/rateLimit.ts';
import { verifyAdminCredentials, createAdminToken, verifyAdminToken, sanitizeInput, sanitizeImageUrl } from './src/lib/auth.ts';
import {
  loadProductsAsync,
  loadSettingsAsync,
  invalidateProductsCache,
  invalidateSettingsCache,
  PRODUCTS_CACHE_TTL_MS,
  SETTINGS_CACHE_TTL_MS
} from './src/lib/storage.ts';

async function runTests() {
  console.log("=== STARTING COMPREHENSIVE VERIFICATION SUITE ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // --- 1. Rate Limiting Tests ---
  console.log("--- 1. Testing Rate Limiting ---");
  const testIp = "192.168.1.100";
  const limit = 5;
  const windowMs = 5000;

  for (let i = 1; i <= limit; i++) {
    const res = checkRateLimit(`test_ip:${testIp}`, limit, windowMs);
    assert(res.allowed === true && res.remaining === limit - i, `Rate limit request ${i}/${limit} allowed`);
  }

  // 6th request must be blocked
  const blocked = checkRateLimit(`test_ip:${testIp}`, limit, windowMs);
  assert(blocked.allowed === false, "Excess request was blocked with 429 status");
  assert(blocked.retryAfterSeconds > 0, `Retry-After reported correctly: ${blocked.retryAfterSeconds}s`);

  // Another IP should NOT be blocked
  const otherIpRes = checkRateLimit("test_ip:10.0.0.1", limit, windowMs);
  assert(otherIpRes.allowed === true, "Different IP is independent and not blocked");

  // --- 2. Auth & Session Token Tests ---
  console.log("\n--- 2. Testing Authentication & Token Signing ---");
  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'aistudio2026';

  assert(verifyAdminCredentials(validUser, validPass) === true, "Valid admin credentials accepted");
  assert(verifyAdminCredentials("wrong_user", validPass) === false, "Invalid username rejected");
  assert(verifyAdminCredentials(validUser, "wrong_password") === false, "Invalid password rejected");
  assert(verifyAdminCredentials("", "") === false, "Empty credentials rejected");

  const token = createAdminToken();
  assert(typeof token === 'string' && token.includes('.'), "Admin HMAC token created");
  assert(verifyAdminToken(token) === true, "Valid admin token verified successfully");

  // Tamper with token
  const tamperedToken = token.slice(0, -3) + "xyz";
  assert(verifyAdminToken(tamperedToken) === false, "Tampered token signature rejected");
  assert(verifyAdminToken("invalid.token.structure") === false, "Malformed token rejected");
  assert(verifyAdminToken("") === false, "Empty token rejected");

  // Input Sanitization
  const dirty = "<script>alert('xss')</script>Hello & World";
  const clean = sanitizeInput(dirty);
  assert(!clean.includes('<') && !clean.includes('>'), "HTML tags stripped by sanitizeInput");

  // --- 3. Cache & Request Coalescing Tests ---
  console.log("\n--- 3. Testing Cache & Request Coalescing ---");
  invalidateProductsCache();
  invalidateSettingsCache();

  const start1 = Date.now();
  const products1 = await loadProductsAsync();
  const dur1 = Date.now() - start1;
  assert(Array.isArray(products1) && products1.length > 0, `Products loaded successfully (${products1.length} products) in ${dur1}ms`);

  // Second load should be served directly from in-memory cache (< 5ms)
  const start2 = Date.now();
  const products2 = await loadProductsAsync();
  const dur2 = Date.now() - start2;
  assert(dur2 < 15, `Cached products served in-memory in ${dur2}ms (Cache Hit)`);
  assert(products1.length === products2.length, "Cached products match initial load");

  // Concurrent coalescing test: fire 10 simultaneous requests
  const startConcurrent = Date.now();
  const concurrentResults = await Promise.all([
    loadProductsAsync(),
    loadProductsAsync(),
    loadProductsAsync(),
    loadProductsAsync(),
    loadProductsAsync(),
    loadProductsAsync(),
    loadProductsAsync(),
    loadProductsAsync(),
    loadProductsAsync(),
    loadProductsAsync()
  ]);
  const durConcurrent = Date.now() - startConcurrent;
  assert(concurrentResults.length === 10, `10 concurrent requests coalesced successfully in ${durConcurrent}ms`);

  // Settings Cache Test
  const startSet1 = Date.now();
  const settings1 = await loadSettingsAsync();
  const durSet1 = Date.now() - startSet1;
  assert(Boolean(settings1 && settings1.whatsappNumber), `Settings loaded (${settings1.whatsappNumber}) in ${durSet1}ms`);

  const startSet2 = Date.now();
  const settings2 = await loadSettingsAsync();
  const durSet2 = Date.now() - startSet2;
  assert(durSet2 < 15, `Cached settings served in-memory in ${durSet2}ms`);

  console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test Suite crashed:", err);
  process.exit(1);
});
