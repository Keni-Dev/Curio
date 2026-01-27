# Curio Design System

> **Version:** 1.0  
> **Last Updated:** January 27, 2026  
> **Purpose:** Canonical design reference for all Curio implementations

---

## Overview

This document defines the **single source of truth** for Curio's visual design. All frontend implementations must reference this file for consistency. The design draws from actual prototypes in `/references/` but standardizes variations into a cohesive system.

---

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Border Radius](#border-radius)
5. [Shadows](#shadows)
6. [Components](#components)
7. [Icons](#icons)
8. [Animations](#animations)
9. [Tailwind Configuration](#tailwind-configuration)
10. [Reference File Mapping](#reference-file-mapping)

---

## Color System

### Primary Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `primary` | `#0F766E` | `#0F766E` | Main brand color, CTAs, active states |
| `primary-light` | `#13ECDA` | `#13ECDA` | Highlights, glows, emphasis |
| `accent` | `#F97316` / `#FF7F50` | `#FF7F50` | Secondary CTAs, important actions |

### Semantic Colors

| Token | Color | Usage |
|-------|-------|-------|
| `success` / `in-stock` | `#10B981` (Emerald 500) | In Stock badges, positive states |
| `warning` / `low-stock` | `#F59E0B` (Amber 500) | Low Stock badges, caution states |
| `danger` / `out-of-stock` | `#F43F5E` (Rose 500) | Out of Stock badges, errors |
| `info` | `#3B82F6` (Blue 500) | Information, links |

### Background & Surface

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `background` | `#F6F8F8` | `#112120` |
| `surface` | `#FFFFFF` | `#1A2C2A` |
| `surface-elevated` | `#FFFFFF` | `#203c3a` |

### Text Colors

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `text-primary` | `#0E1B1A` | `#FFFFFF` |
| `text-secondary` | `#64748B` | `#94A3B8` |
| `text-muted` | `#4c9a93` | `#4c9a93` |

### Map Marker Colors

| Status | Color | Hex |
|--------|-------|-----|
| In Stock | Emerald/Teal | `#0F766E` |
| Low Stock | Amber | `#F59E0B` |
| Out of Stock | Rose | `#F43F5E` |

---

## Typography

### Font Families

```css
--font-display: 'Plus Jakarta Sans', sans-serif;
--font-body: 'Noto Sans', sans-serif;
--font-mono: 'Space Mono', monospace;
```

**Google Fonts Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### Type Scale

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| Display | Plus Jakarta Sans | 800 | 48px | 1.1 |
| H1 | Plus Jakarta Sans | 700 | 32px | 1.2 |
| H2 | Plus Jakarta Sans | 700 | 24px | 1.25 |
| H3 | Plus Jakarta Sans | 700 | 20px | 1.3 |
| H4 | Plus Jakarta Sans | 600 | 18px | 1.4 |
| Body | Noto Sans | 400 | 16px | 1.5 |
| Body Small | Noto Sans | 400 | 14px | 1.5 |
| Caption | Noto Sans | 500 | 12px | 1.4 |
| Points/Numbers | Space Mono | 700 | varies | 1.2 |

### Usage Guidelines

- **Plus Jakarta Sans**: All headings, buttons, navigation, labels
- **Noto Sans**: Body text, paragraphs, descriptions
- **Space Mono**: Points display, statistics, timestamps

---

## Spacing & Layout

### Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0px | — |
| `space-1` | 4px | Tiny gaps |
| `space-2` | 8px | Icon gaps, tight spacing |
| `space-3` | 12px | Small padding |
| `space-4` | 16px | Standard padding |
| `space-5` | 20px | Section spacing |
| `space-6` | 24px | Card padding |
| `space-8` | 32px | Large gaps |
| `space-10` | 40px | Section margins |
| `space-12` | 48px | Page sections |

### Container Widths

| Size | Width | Usage |
|------|-------|-------|
| `sm` | 480px | Mobile cards, modals |
| `md` | 768px | Tablet content |
| `lg` | 1024px | Desktop content |
| `xl` | 1200px | Wide desktop |
| `2xl` | 1440px | Max container |

### Touch Targets

**Minimum touch target size: 44×44px**

All interactive elements (buttons, links, icons) must meet this minimum.

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 4px | Small elements, inputs |
| `rounded` | 8px | Default cards, buttons |
| `rounded-lg` | 16px | Large cards, modals |
| `rounded-xl` | 24px | Bottom sheets, major panels |
| `rounded-2xl` | 32px | Hero cards |
| `rounded-full` | 9999px | Pills, avatars, badges |

---

## Shadows

### Elevation System

```css
/* Level 1: Subtle elevation */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Level 2: Cards */
--shadow-card: 0 2px 10px rgba(0, 0, 0, 0.03);

/* Level 3: Dropdowns, popovers */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Level 4: Modals, bottom sheets */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

/* Level 5: High emphasis */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Glass effect */
--shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.07);

/* Glow effects */
--shadow-glow-primary: 0 0 15px rgba(19, 236, 218, 0.5);
--shadow-glow-accent: 0 0 15px rgba(251, 191, 36, 0.5);
```

### Glass Panel Effect

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark .glass-panel {
  background: rgba(17, 33, 32, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

---

## Components

### Stock Status Badges

```html
<!-- In Stock - Green -->
<div class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-full">
  <span class="material-symbols-outlined text-[18px]">check_circle</span>
  <span class="text-xs font-bold">May Stock</span>
</div>

<!-- Low Stock - Amber -->
<div class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-full">
  <span class="material-symbols-outlined text-[18px]">warning</span>
  <span class="text-xs font-bold">Konti Na Lang</span>
</div>

<!-- Out of Stock - Rose -->
<div class="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-full">
  <span class="material-symbols-outlined text-[18px]">cancel</span>
  <span class="text-xs font-bold">Ubos Na</span>
</div>
```

### Primary Button

```html
<button class="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl 
               shadow-lg shadow-primary/20 transition-all active:scale-[0.98]
               flex items-center justify-center gap-2">
  <span class="material-symbols-outlined">search</span>
  <span>Hanapin</span>
</button>
```

### Secondary/Outline Button

```html
<button class="h-12 px-6 border-2 border-primary text-primary hover:bg-primary/10 
               font-bold rounded-xl transition-all active:scale-[0.98]
               flex items-center justify-center gap-2">
  <span class="material-symbols-outlined">call</span>
  <span>Tawagan</span>
</button>
```

### Accent/CTA Button (Coral)

```html
<button class="h-12 px-6 bg-[#FF7F50] hover:bg-[#ff6b3d] text-white font-bold rounded-xl 
               shadow-lg shadow-[#FF7F50]/20 transition-all active:scale-[0.98]
               flex items-center justify-center gap-2">
  <span class="material-symbols-outlined">map</span>
  <span>Hanapin sa mapa</span>
</button>
```

### Search Bar

```html
<div class="glass-panel rounded-full p-1.5 shadow-glass flex items-center">
  <div class="size-11 flex items-center justify-center rounded-full bg-primary/10 text-primary ml-1">
    <span class="material-symbols-outlined">search</span>
  </div>
  <input 
    class="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 
           placeholder:text-slate-400 font-medium h-11 px-3 text-base" 
    placeholder="Maghanap ng gamot..." 
    type="text"
  />
  <button class="size-11 flex items-center justify-center rounded-full hover:bg-black/5 mr-1">
    <span class="material-symbols-outlined text-slate-500">mic</span>
  </button>
</div>
```

### Pharmacy Card

```html
<div class="bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 
            transition-colors p-4 rounded-2xl cursor-pointer group">
  <div class="flex justify-between items-start mb-2">
    <div class="flex gap-3">
      <!-- Logo -->
      <div class="size-10 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0"></div>
      <div>
        <h3 class="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary">
          Mercury Drug - Malolos
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">0.5 km • Open 24 Hours</p>
      </div>
    </div>
    <!-- Status Badge -->
    <span class="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 
                 text-emerald-700 dark:text-emerald-300 text-xs font-bold 
                 border border-emerald-200 dark:border-emerald-800">
      May Stock
    </span>
  </div>
  <!-- Freshness Indicator -->
  <div class="flex items-center gap-1 text-slate-400 text-xs mb-2 pl-[3.25rem]">
    <span class="material-symbols-outlined text-[14px]">schedule</span>
    <span>Updated 5 mins ago</span>
  </div>
</div>
```

### Bottom Sheet Header

```html
<div class="flex justify-center pt-3 pb-1 md:hidden">
  <div class="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
</div>
```

### Map Marker

```html
<!-- Full marker with label -->
<div class="flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-110">
  <div class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-full 
              shadow-lg filter drop-shadow-md">
    <span class="material-symbols-outlined text-[18px]">check_circle</span>
    <span class="text-xs font-bold whitespace-nowrap">May Stock</span>
  </div>
  <div class="w-1 h-3 bg-emerald-600 rounded-full"></div>
  <div class="w-2.5 h-2.5 bg-emerald-600 rounded-full border-2 border-white"></div>
</div>

<!-- Simple dot marker -->
<div class="size-3 bg-emerald-600 border-2 border-white rounded-full shadow-md"></div>
```

### Points Display Card

```html
<div class="relative bg-slate-900 dark:bg-[#081211] rounded-2xl p-6 overflow-hidden">
  <!-- Decorative blurs -->
  <div class="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
  
  <p class="text-primary font-medium text-sm mb-1 uppercase tracking-wider">Available Balance</p>
  <div class="flex items-center gap-3">
    <h2 class="text-5xl font-bold text-white font-mono tracking-tight">320</h2>
    <div class="bg-amber-500/20 p-2 rounded-full border border-amber-500/50 animate-pulse">
      <span class="material-symbols-outlined text-amber-500 text-2xl">monetization_on</span>
    </div>
  </div>
  <p class="text-gray-400 text-xs mt-2 font-mono">Alay Points</p>
</div>
```

### Achievement Badge (Hexagon)

```html
<div class="flex flex-col items-center gap-2 cursor-pointer group">
  <div class="relative w-20 h-20 flex items-center justify-center">
    <svg class="w-full h-full text-amber-500 fill-current drop-shadow-md 
                group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
      <polygon points="50 1 95 25 95 75 50 99 5 75 5 25"></polygon>
    </svg>
    <span class="material-symbols-outlined absolute text-white text-3xl">bolt</span>
  </div>
  <span class="text-xs font-bold text-center">Speedy Scout</span>
</div>
```

---

## Icons

### Icon Library

**Material Symbols Outlined** (Google)

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
```

### Common Icons

| Feature | Icon Name |
|---------|-----------|
| Search | `search` |
| Location | `location_on` |
| Navigation | `near_me` |
| Call | `call` |
| Stock Check | `check_circle` |
| Warning | `warning` |
| Out of Stock | `cancel` |
| Time/Schedule | `schedule` |
| Points/Coins | `monetization_on` |
| Pharmacy | `local_pharmacy` |
| Medicine | `medication` |
| Camera | `photo_camera` |
| Gallery | `photo_library` |
| Mic/Voice | `mic` |
| Send | `send` |
| Back | `arrow_back` |
| Forward | `arrow_forward` |
| Edit | `edit` |
| Settings | `settings` |
| Profile | `person` |
| Streak/Fire | `local_fire_department` |
| Achievement | `military_tech` |
| Leaderboard | `leaderboard` |
| History | `history` |
| Verify | `verified` |
| Community | `diversity_3` |
| Thumb Up | `thumb_up` |
| Thumb Down | `thumb_down` |
| Flash | `flash_on` |
| Camera Switch | `cameraswitch` |
| Close | `close` |
| Add | `add` |

### Icon Sizing

| Size | Class | Usage |
|------|-------|-------|
| Small | `text-[16px]` | Inline text, captions |
| Default | `text-[20px]` | Buttons, lists |
| Medium | `text-[24px]` | Navigation, headers |
| Large | `text-[32px]` | Feature icons, badges |

---

## Animations

### Transitions

```css
/* Default transition */
transition-all duration-200

/* Hover scale */
hover:scale-[1.02] active:scale-[0.98]

/* Button press */
active:scale-95
```

### Loading States

```html
<!-- Pulse animation -->
<div class="animate-pulse bg-slate-200 rounded-lg h-4 w-32"></div>

<!-- Shimmer effect for progress bars -->
<style>
@keyframes shimmer {
  100% { transform: translateX(200%) skewX(-12deg); }
}
.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>
```

### Float Animation (Decorative)

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.animate-float-slow { animation: float 6s ease-in-out infinite; }
.animate-float-medium { animation: float 4s ease-in-out infinite; }
.animate-float-fast { animation: float 3s ease-in-out infinite; }
```

---

## Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary
        'primary': '#0F766E',
        'primary-light': '#13ECDA',
        'accent': '#FF7F50',
        
        // Semantic
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger': '#F43F5E',
        'info': '#3B82F6',
        
        // Background
        'background-light': '#F6F8F8',
        'background-dark': '#112120',
        
        // Surface
        'surface-light': '#FFFFFF',
        'surface-dark': '#1A2C2A',
        
        // Map markers
        'marker-emerald': '#0F766E',
        'marker-amber': '#F59E0B',
        'marker-rose': '#F43F5E',
      },
      fontFamily: {
        'display': ['Plus Jakarta Sans', 'sans-serif'],
        'body': ['Noto Sans', 'sans-serif'],
        'mono': ['Space Mono', 'monospace'],
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        'full': '9999px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'soft': '0 4px 20px -2px rgba(19, 236, 218, 0.15)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 15px rgba(19, 236, 218, 0.5)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite',
        'float-fast': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(200%) skewX(-12deg)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
```

---

## Reference File Mapping

The `/references/` folder contains HTML prototypes. Here's how each maps to the design system:

| Reference File | Primary Colors Used | Fonts | Notes |
|----------------|---------------------|-------|-------|
| `home_map_view_-_live_tracking/` | `#0f756d` (Teal) | Plus Jakarta Sans, Noto Sans | ✅ **Canonical map view** |
| `medicine_search_results/` | `#f45c25` (Orange), `#2A9D8F` (Teal) | Manrope | ⚠️ Different accent color |
| `alay_stock_report_contribution/` | `#11d493` (Mint) | Plus Jakarta Sans | ⚠️ Brighter green variant |
| `prescription_ocr_scanner/` | `#1de2d1` (Cyan) | Lexend | ⚠️ Different display font |
| `medi-bot_ai_assistant/` | `#13ecda` (Primary Light) | Manrope | ✅ Matches primary-light |
| `pharmacy_detail_&_verification/` | `#ee5b2b` (Orange) | Manrope | ⚠️ Different accent |
| `user_profile_&_alay_dashboard/` | `#13ecda`, Gold | Plus Jakarta Sans | ✅ **Canonical profile** |
| `onboarding_-_bayanihan_spirit/` | `#ee5f2b` (Orange) | Plus Jakarta Sans | ⚠️ Different accent |

### Standardization Rules

1. **Primary Color**: Always use `#0F766E` (Teal 700)
2. **Primary Light/Glow**: Use `#13ECDA` for glows and highlights
3. **Accent/CTA**: Use `#FF7F50` (Coral) for call-to-action buttons
4. **Display Font**: Always use `Plus Jakarta Sans`
5. **Body Font**: Always use `Noto Sans`

---

## Accessibility

### Color Contrast

All color combinations must meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 ratio minimum
- Large text (18px+ bold): 3:1 ratio minimum

### Focus States

```css
/* Focus ring for accessibility */
focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
```

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Dark Mode

Toggle dark mode by adding `class="dark"` to the `<html>` element.

All components should support both modes using Tailwind's `dark:` prefix.

---

## File References

When implementing components, reference:
- **This file** (`DESIGN_SYSTEM.md`) for canonical values
- **PROJECT_SPECIFICATIONS.md** for feature requirements
- `/references/` for visual inspiration (but normalize to this system)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 27, 2026 | Initial design system based on reference prototypes |
