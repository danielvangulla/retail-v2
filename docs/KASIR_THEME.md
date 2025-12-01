# Kasir Theme Documentation

## Overview
Theme sistem untuk halaman Kasir/POS dengan dark mode design menggunakan Tailwind CSS.

## Color Palette

### Background
- **Main**: Gradient dari `slate-900` → `slate-800` → `slate-900`
- **Card**: Gradient dari `slate-800` → `slate-700`
- **Header**: Gradient dari `slate-700` → `slate-600`
- **Input**: `slate-700/50` (dengan opacity)
- **Modal**: `slate-800`

### Text
- **Primary**: `white`
- **Secondary**: `slate-200`
- **Muted**: `slate-400`
- **Accent**: `blue-400`

### Borders
- **Default**: `slate-600`
- **Focus**: `blue-500` ring

## Button Variants

### Primary (Payment/Action)
```tsx
bg-gradient-to-br from-blue-600 to-blue-500
hover:from-blue-500 hover:to-blue-400
```

### Success (Print)
```tsx
bg-gradient-to-br from-emerald-600 to-emerald-500
hover:from-emerald-500 hover:to-emerald-400
```

### Warning (Diskon)
```tsx
bg-gradient-to-br from-amber-600 to-amber-500
hover:from-amber-500 hover:to-amber-400
```

### Danger (Reset)
```tsx
bg-gradient-to-br from-red-600 to-red-500
hover:from-red-500 hover:to-red-400
```

### Secondary (Komplemen)
```tsx
bg-gradient-to-br from-slate-600 to-slate-500
hover:from-slate-500 hover:to-slate-400
```

### Orange (Piutang)
```tsx
bg-gradient-to-br from-orange-600 to-orange-500
hover:from-orange-500 hover:to-orange-400
```

## Components

### Input Fields
- Background: `slate-700/50`
- Border: `slate-600`
- Focus ring: `blue-500`
- Placeholder: `slate-400`
- Padding: `px-4 py-2.5`
- Rounded: `rounded-lg`

### Tables
- Header: Sticky with gradient `slate-700` → `slate-600`
- Rows: `slate-800/50` dengan hover `slate-700/50`
- Divider: `slate-700`
- Text: `slate-200`

### Cards
- Border: `slate-600`
- Shadow: `shadow-2xl`
- Rounded: `rounded-xl`
- Background: Gradient slate

### Search Results
- Selected: `blue-600` background
- Unselected: `slate-800/50` dengan hover `slate-700`
- Transition: `150ms`

## Typography

### Headers
- Font weight: `font-bold` / `font-semibold`
- Transform: `uppercase` untuk labels
- Tracking: `tracking-wider` untuk headers
- Size hierarchy: `text-3xl` → `text-xl` → `text-sm`

### Data Display
- Numbers: `font-mono` untuk konsistensi
- Currency: `font-semibold` / `font-bold`
- Labels: `text-xs` dengan `uppercase`

## Spacing & Layout

### Padding
- Cards: `p-3` / `p-6`
- Buttons: `px-4 py-2.5` / `px-5 py-2.5`
- Table cells: `px-3 py-3` / `px-3 py-2.5`

### Gaps
- Main layout: `gap-2`
- Button groups: `gap-2`
- Header items: `gap-3`

### Margins
- Bottom spacing: `mb-2` / `mb-4`
- Icon spacing: `gap-2`

## Effects

### Shadows
- Main cards: `shadow-2xl`
- Buttons: `shadow-lg`
- Hover: `hover:shadow-xl`

### Transitions
- Duration: `duration-200` / `duration-150`
- Property: `transition-all` / `transition-colors`

### Hover Effects
- Scale: `hover:scale-105`
- Shadow increase: `hover:shadow-xl`
- Background change: Lighter variant

### Rounded Corners
- Cards: `rounded-xl`
- Inputs/Buttons: `rounded-lg`
- Small elements: `rounded-md`

## Icons
- Size: `h-4 w-4` / `h-5 w-5` / `h-8 w-8`
- Color: Matching button/text color
- Stroke width: `strokeWidth="2"` / `strokeWidth="1.5"`

## Special Features

### Charge/Fee Display
- Color: `text-amber-400`
- Format: Currency with "Rp"

### Discount Display
- Color: `text-green-400`
- Format: Currency with "Rp"

### Quantity Badge
- Background: `blue-600` / `blue-500`
- Interactive: `cursor-pointer`
- Min width: `min-w-12`

### Empty States
- Icon: `h-16 w-16` / `h-12 w-12`
- Color: `slate-600` / `slate-500`
- Text: `slate-400`
- Centered layout

## Responsive Behavior
- Max width untuk search: `max-w-md`
- Max width untuk modal: `max-w-4xl`
- Overflow handling: `overflow-y-auto`
- Height management: `h-[calc(100vh-1rem)]`

## Usage Example

```tsx
import kasirTheme, { cn } from '@/components/kasir/KasirTheme';

// Menggunakan theme
<div className={kasirTheme.background.main}>
  <div className={cn(
    kasirTheme.background.card,
    kasirTheme.border.default,
    kasirTheme.common.rounded,
    kasirTheme.common.shadow
  )}>
    {/* Content */}
  </div>
</div>

// Button dengan variant
<button className={cn(
  kasirTheme.button.primary,
  kasirTheme.common.roundedLg,
  kasirTheme.common.shadowLg,
  kasirTheme.common.transition,
  kasirTheme.common.hover
)}>
  Submit
</button>
```

## Future Implementations
Theme ini siap digunakan untuk:
- Modal pembayaran (F9)
- Modal diskon (F5)
- Modal komplemen (F7)
- Modal piutang (F8)
- Print preview
- Settings page
- Reports page

## Notes
- Semua gradient menggunakan `to-br` (to bottom-right)
- Focus states menggunakan ring system
- Hover states selalu lebih terang
- Consistent spacing scale (2, 3, 4, 6)
- Icons menggunakan Heroicons style
