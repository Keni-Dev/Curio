/**
 * Design System Demo Page
 * Tests all base UI components from DESIGN_SYSTEM.md
 * This is a temporary page for verifying the design system implementation
 */

import { Button, Input, Card, StockBadge, Spinner } from '@/components/ui';

export default function DesignSystemDemo() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 space-y-8 font-body">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-display font-bold text-primary">
          Curio Design System
        </h1>
        <p className="text-body text-text-secondary mt-2">
          Implementation from DESIGN_SYSTEM.md
        </p>
      </div>

      {/* Typography */}
      <Card>
        <h2 className="text-h2 font-display font-bold mb-4">Typography</h2>
        <div className="space-y-3">
          <div>
            <p className="text-caption text-text-muted mb-1">Display (Plus Jakarta Sans)</p>
            <p className="text-display font-display font-extrabold text-primary">
              Find the Cure, Faster
            </p>
          </div>
          <div>
            <p className="text-caption text-text-muted mb-1">H1 (Plus Jakarta Sans)</p>
            <h1 className="text-h1 font-display font-bold">Heading 1</h1>
          </div>
          <div>
            <p className="text-caption text-text-muted mb-1">H2 (Plus Jakarta Sans)</p>
            <h2 className="text-h2 font-display font-bold">Heading 2</h2>
          </div>
          <div>
            <p className="text-caption text-text-muted mb-1">H3 (Plus Jakarta Sans)</p>
            <h3 className="text-h3 font-display font-bold">Heading 3</h3>
          </div>
          <div>
            <p className="text-caption text-text-muted mb-1">Body (Noto Sans)</p>
            <p className="text-body font-body">
              This is body text using Noto Sans. It should be readable and clear.
            </p>
          </div>
          <div>
            <p className="text-caption text-text-muted mb-1">Monospace (Space Mono)</p>
            <p className="text-body font-mono font-bold">320 Alay Points</p>
          </div>
        </div>
      </Card>

      {/* Colors */}
      <Card>
        <h2 className="text-h2 font-display font-bold mb-4">Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="h-20 rounded-lg bg-primary shadow-glow-primary" />
            <p className="text-caption mt-2 text-center">Primary (#0F766E)</p>
          </div>
          <div>
            <div className="h-20 rounded-lg bg-primary-light" />
            <p className="text-caption mt-2 text-center">Primary Light (#13ECDA)</p>
          </div>
          <div>
            <div className="h-20 rounded-lg bg-accent shadow-glow-accent" />
            <p className="text-caption mt-2 text-center">Accent (#FF7F50)</p>
          </div>
          <div>
            <div className="h-20 rounded-lg bg-success" />
            <p className="text-caption mt-2 text-center">Success (#10B981)</p>
          </div>
          <div>
            <div className="h-20 rounded-lg bg-warning" />
            <p className="text-caption mt-2 text-center">Warning (#F59E0B)</p>
          </div>
          <div>
            <div className="h-20 rounded-lg bg-danger" />
            <p className="text-caption mt-2 text-center">Danger (#F43F5E)</p>
          </div>
          <div>
            <div className="h-20 rounded-lg bg-info" />
            <p className="text-caption mt-2 text-center">Info (#3B82F6)</p>
          </div>
        </div>
      </Card>

      {/* Buttons */}
      <Card>
        <h2 className="text-h2 font-display font-bold mb-4">Buttons</h2>
        <div className="space-y-4">
          <div>
            <p className="text-caption text-text-muted mb-2">Variants</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">
                <span className="material-symbols-outlined text-[20px]">search</span>
                Primary
              </Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="accent">
                <span className="material-symbols-outlined text-[20px]">map</span>
                Accent CTA
              </Button>
            </div>
          </div>
          <div>
            <p className="text-caption text-text-muted mb-2">Sizes</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
          <div>
            <p className="text-caption text-text-muted mb-2">States</p>
            <div className="flex flex-wrap gap-3">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Inputs */}
      <Card>
        <h2 className="text-h2 font-display font-bold mb-4">Input Fields</h2>
        <div className="space-y-4 max-w-md">
          <Input
            label="Medicine Name"
            placeholder="Search for Biogesic, Neozep..."
          />
          <Input
            label="With Left Icon"
            placeholder="Enter location..."
            leftIcon={
              <span className="material-symbols-outlined text-[20px]">
                location_on
              </span>
            }
          />
          <Input
            label="With Right Icon"
            placeholder="Search..."
            rightIcon={
              <span className="material-symbols-outlined text-[20px]">
                search
              </span>
            }
          />
          <Input
            label="With Error"
            placeholder="Enter something"
            error="This field is required"
          />
        </div>
      </Card>

      {/* Stock Badges */}
      <Card>
        <h2 className="text-h2 font-display font-bold mb-4">Stock Status Badges</h2>
        <div className="flex flex-wrap gap-3">
          <StockBadge status="in_stock" />
          <StockBadge status="low_stock" />
          <StockBadge status="out_of_stock" />
          <StockBadge status="unknown" />
        </div>
        <p className="text-caption text-text-muted mt-4">
          Note: Uses Taglish labels (May Stock, Konti Na Lang, Ubos Na)
        </p>
      </Card>

      {/* Cards */}
      <Card>
        <h2 className="text-h2 font-display font-bold mb-4">Card Variants</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card padding="sm">
            <p className="text-body-sm">Small Padding</p>
          </Card>
          <Card padding="md">
            <p className="text-body-sm">Medium Padding (Default)</p>
          </Card>
          <Card padding="lg">
            <p className="text-body-sm">Large Padding</p>
          </Card>
          <Card hoverable>
            <p className="text-body-sm">Hoverable Card - Try hovering!</p>
          </Card>
        </div>
      </Card>

      {/* Spinners */}
      <Card>
        <h2 className="text-h2 font-display font-bold mb-4">Loading Spinners</h2>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <Spinner size="sm" />
            <p className="text-caption text-text-muted mt-2">Small</p>
          </div>
          <div className="text-center">
            <Spinner size="md" />
            <p className="text-caption text-text-muted mt-2">Medium</p>
          </div>
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-caption text-text-muted mt-2">Large</p>
          </div>
        </div>
      </Card>

      {/* Icons (Material Symbols) */}
      <Card>
        <h2 className="text-h2 font-display font-bold mb-4">Icons (Material Symbols)</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {[
            'search',
            'location_on',
            'local_pharmacy',
            'medication',
            'map',
            'call',
            'schedule',
            'monetization_on',
            'check_circle',
            'warning',
            'cancel',
            'verified',
          ].map((icon) => (
            <div key={icon} className="text-center">
              <span className="material-symbols-outlined text-[32px] text-primary">
                {icon}
              </span>
              <p className="text-caption text-text-muted mt-1 text-xs">
                {icon}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Glass Effect */}
      <Card padding="none" className="overflow-hidden">
        <div className="relative h-40 bg-gradient-to-br from-primary to-accent p-6">
          <div className="glass-panel rounded-xl p-4 max-w-sm">
            <h3 className="text-h3 font-display font-bold text-text-primary dark:text-white mb-2">
              Glass Panel Effect
            </h3>
            <p className="text-body-sm text-text-secondary dark:text-text-secondary">
              Glassmorphism with backdrop blur from DESIGN_SYSTEM.md
            </p>
          </div>
        </div>
      </Card>

      {/* Shadows */}
      <Card>
        <h2 className="text-h2 font-display font-bold mb-4">Shadow System</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white shadow-sm">
            <p className="text-caption">shadow-sm</p>
          </div>
          <div className="p-4 rounded-lg bg-white shadow-card">
            <p className="text-caption">shadow-card</p>
          </div>
          <div className="p-4 rounded-lg bg-white shadow-md">
            <p className="text-caption">shadow-md</p>
          </div>
          <div className="p-4 rounded-lg bg-white shadow-lg">
            <p className="text-caption">shadow-lg</p>
          </div>
          <div className="p-4 rounded-lg bg-white shadow-xl">
            <p className="text-caption">shadow-xl</p>
          </div>
          <div className="p-4 rounded-lg bg-white shadow-glass">
            <p className="text-caption">shadow-glass</p>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center text-caption text-text-muted pb-8">
        <p>Design System v1.0 • Based on DESIGN_SYSTEM.md</p>
        <p className="mt-1">Tailwind v4 CSS-first configuration</p>
      </div>
    </div>
  );
}
