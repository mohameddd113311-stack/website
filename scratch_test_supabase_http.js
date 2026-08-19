const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fcerrorhqphaggnqyyiu.supabase.co';
// Test with standard anon key if provided or check response
console.log("Testing Supabase HTTP REST API endpoint:", supabaseUrl);
const supabase = createClient(supabaseUrl, 'sb-anon-test-key-or-service');

async function main() {
  const { data, error } = await supabase.from('products').select('*');
  console.log("HTTP REST Response error:", error);
  console.log("HTTP REST Response data:", data);
}

main();
