import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function test() {
  console.log('Testing direct pharmacy query...');
  const start = Date.now();
  
  const { data, error } = await supabase.from('pharmacies').select('id, name').limit(3);
  
  console.log('Time:', Date.now() - start, 'ms');
  if (error) console.error('Error:', error);
  else console.log('Pharmacies:', data);
  
  console.log('\nTesting RPC find_nearby_pharmacies...');
  const start2 = Date.now();
  
  const { data: rpcData, error: rpcError } = await supabase.rpc('find_nearby_pharmacies', {
    user_lat: 14.8527,
    user_lng: 120.815,
    radius_meters: 5000
  });
  
  console.log('Time:', Date.now() - start2, 'ms');
  if (rpcError) console.error('RPC Error:', rpcError);
  else console.log('RPC returned:', rpcData?.length ?? 0, 'pharmacies');
}

test().catch(console.error);
