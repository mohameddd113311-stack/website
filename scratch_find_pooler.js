const net = require('net');

const regions = [
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-eu-west-2.pooler.supabase.com',
  'aws-0-eu-west-3.pooler.supabase.com',
  'aws-0-me-central-1.pooler.supabase.com',
  'aws-0-me-south-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com'
];

async function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2500);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function run() {
  console.log("Searching for working Supabase Pooler region...");
  for (const r of regions) {
    const p6543 = await checkPort(r, 6543);
    const p5432 = await checkPort(r, 5432);
    if (p6543 || p5432) {
      console.log(`FOUND WORKING POOLER: ${r} (port 6543: ${p6543}, port 5432: ${p5432})`);
    }
  }
  console.log("Search finished.");
}

run();
