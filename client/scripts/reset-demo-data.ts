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

const DEMO_EMAILS = [
  'demo.presenter@curio.ph',
  'maria.santos@demo.curio.ph',
  'juan.delacruz@demo.curio.ph',
  'ana.reyes@demo.curio.ph',
  'paolo.cruz@demo.curio.ph',
  'joy.dizon@demo.curio.ph',
  'angelo.tan@demo.curio.ph',
  'rhea.santos@demo.curio.ph',
  'mark.valdez@demo.curio.ph',
  'lea.pascual@demo.curio.ph',
  'nico.ramos@demo.curio.ph',
  'kim.lim@demo.curio.ph',
];

async function main() {
  console.log('🗑️ Resetting demo data...');

  const { data: users } = await supabase.auth.admin.listUsers();
  const demoUsers = (users?.users ?? []).filter((user) =>
    DEMO_EMAILS.includes(user.email ?? '')
  );

  const userIds = demoUsers.map((user) => user.id);

  if (userIds.length > 0) {
    const { error: deleteReports } = await supabase
      .from('inventory_reports')
      .delete()
      .in('reported_by', userIds);

    if (deleteReports) {
      console.error('Failed to delete inventory reports:', deleteReports);
    }

    const { error: deleteProfiles } = await supabase
      .from('profiles')
      .delete()
      .in('id', userIds);

    if (deleteProfiles) {
      console.error('Failed to delete profiles:', deleteProfiles);
    }

    for (const user of demoUsers) {
      const { error: deleteUser } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteUser) {
        console.error(`Failed to delete auth user ${user.email}:`, deleteUser);
      }
    }
  }

  console.log('✅ Demo users, profiles, and reports cleared');
  console.log('ℹ️ Pharmacies and medicines are kept to avoid wiping production data.');
}

main().catch((error) => {
  console.error('❌ Reset failed:', error);
  process.exit(1);
});