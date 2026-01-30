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

async function main() {
  console.log('🗑️ Cleaning up all data for fresh seed...');

  // Delete all inventory reports first (has FK to pharmacies and medicines)
  const { error: irError, count: irCount } = await supabase
    .from('inventory_reports')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (irError) {
    console.error('inventory_reports delete error:', irError);
  } else {
    console.log(`✅ Cleared ${irCount ?? 0} inventory_reports`);
  }

  // Delete all pharmacies
  const { error: phError, count: phCount } = await supabase
    .from('pharmacies')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (phError) {
    console.error('pharmacies delete error:', phError);
  } else {
    console.log(`✅ Cleared ${phCount ?? 0} pharmacies`);
  }

  // Delete all medicines
  const { error: medError, count: medCount } = await supabase
    .from('medicines')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (medError) {
    console.error('medicines delete error:', medError);
  } else {
    console.log(`✅ Cleared ${medCount ?? 0} medicines`);
  }

  console.log('🎉 Cleanup complete! You can now run seed:demo');
}

main().catch(console.error);
