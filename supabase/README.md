# Curio - Supabase Setup

This directory contains the database schema, functions, RLS policies, and seed data for the Curio medicine finder application.

## Quick Start

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project named `curio-malolos`
3. Select **Singapore** region for optimal latency in the Philippines
4. Save your project URL and anon key

### 2. Configure Environment Variables

Copy the environment template and add your Supabase credentials:

```bash
cd client
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Migrations

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your project's **SQL Editor** in the Supabase Dashboard
2. Run each migration file in order:
   - `migrations/001_initial_schema.sql` - Tables and triggers
   - `migrations/002_functions.sql` - Database functions
   - `migrations/003_rls_policies.sql` - Row Level Security
   - `migrations/004_seed_data.sql` - Sample data

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

### 4. Enable Realtime (Optional - for live updates)

Realtime is already configured in the migrations! The `inventory_reports` table is set up for realtime subscriptions. If you need to verify or manually enable it:

**Option A: Via SQL Editor** (Easiest)
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_reports;
```

**Option B: Via Supabase CLI**
```bash
# Check realtime status
supabase inspect db replication-publication

# The table should already be in the supabase_realtime publication
```

**Note**: The "Replication" page in the dashboard is for external data warehouses (Iceberg, BigQuery), not for realtime subscriptions. Realtime for your app works automatically once the table is in the publication.

### 5. Seed Test Data (Optional)

After creating a test user (via Auth), run this to create sample inventory reports:

```sql
-- Replace with your test user's UUID
SELECT seed_inventory_reports('your-user-uuid-here');
```

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `pharmacies` | Pharmacy locations with PostGIS geography points |
| `medicines` | Medicine catalog with full-text search (tsvector) |
| `inventory_reports` | Crowdsourced stock reports (4-hour expiry) |
| `profiles` | User profiles for Alay gamification |
| `helpful_votes` | User votes on report accuracy |

### Functions

| Function | Description |
|----------|-------------|
| `find_nearby_pharmacies(lat, lng, radius)` | Find pharmacies within radius using PostGIS |
| `search_medicines(query, limit)` | Full-text medicine search with ranking |
| `get_pharmacy_stock(pharmacy_id)` | Get current stock for a pharmacy |
| `get_medicine_availability(lat, lng, radius)` | Get availability count per medicine |
| `get_leaderboard(limit, offset)` | Get top contributors |

### RLS Policies

| Table | Read | Write |
|-------|------|-------|
| `pharmacies` | Public | Service role only |
| `medicines` | Public | Service role only |
| `inventory_reports` | Public | Authenticated (own reports) |
| `profiles` | Public | Own profile only |
| `helpful_votes` | Public | One vote per user per report |

## Usage Examples

### TypeScript Client

```typescript
import { supabase, findNearbyPharmacies, searchMedicines } from '@/lib/supabase';

// Find nearby pharmacies
const { data: pharmacies } = await findNearbyPharmacies(14.8527, 120.8150, 2000);

// Search medicines
const { data: medicines } = await searchMedicines('paracetamol');

// Get pharmacy stock
const { data: stock } = await supabase.rpc('get_pharmacy_stock', {
  p_pharmacy_id: 'pharmacy-uuid'
});

// Subscribe to stock updates
import { subscribeToInventoryUpdates } from '@/lib/supabase';

const unsubscribe = subscribeToInventoryUpdates((payload) => {
  console.log('Stock update:', payload.eventType, payload.new);
});

// Cleanup on unmount
unsubscribe();
```

### Direct Supabase Queries

```typescript
// Get all pharmacies in Malolos
const { data } = await supabase
  .from('pharmacies')
  .select('*')
  .eq('city', 'Malolos');

// Insert a stock report
const { data, error } = await supabase
  .from('inventory_reports')
  .insert({
    pharmacy_id: 'pharmacy-uuid',
    medicine_id: 'medicine-uuid',
    reported_by: userId,
    status: 'in_stock',
    price: 8.50
  });
```

## Troubleshooting

### PostGIS Extension Not Enabled

If you get errors about `geography` type, enable PostGIS:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Full-Text Search Not Working

Ensure the search vector trigger is running:
```sql
-- Manually update all search vectors
UPDATE medicines SET updated_at = NOW();
```

### Realtime Not Working

1. Check that realtime is enabled for the table
2. Verify your anon key has the correct permissions
3. Check browser console for WebSocket errors

## File Structure

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql   # Tables, indexes, triggers
│   ├── 002_functions.sql        # Database functions
│   ├── 003_rls_policies.sql     # Row Level Security
│   └── 004_seed_data.sql        # Sample data
└── README.md                    # This file

client/src/
├── lib/
│   └── supabase.ts              # Typed Supabase client
└── types/
    └── database.ts              # Database type definitions
```
