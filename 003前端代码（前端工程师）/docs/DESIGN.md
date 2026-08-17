---
name: Petal Ledger
colors:
  surface: '#fff8f8'
  surface-dim: '#f9cfd8'
  surface-bright: '#fff8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0f2'
  surface-container: '#ffe8ec'
  surface-container-high: '#ffe1e6'
  surface-container-highest: '#ffd9e0'
  on-surface: '#2c141b'
  on-surface-variant: '#574146'
  inverse-surface: '#432930'
  inverse-on-surface: '#ffecef'
  outline: '#8a7176'
  outline-variant: '#ddbfc5'
  surface-tint: '#ac2a5d'
  primary: '#ac2a5d'
  on-primary: '#ffffff'
  primary-container: '#ff6b9d'
  on-primary-container: '#6e0035'
  inverse-primary: '#ffb1c5'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#91f0e6'
  on-secondary-container: '#006f68'
  tertiary: '#705d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#bb9c00'
  on-tertiary-container: '#413500'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e1'
  primary-fixed-dim: '#ffb1c5'
  on-primary-fixed: '#3f001b'
  on-primary-fixed-variant: '#8c0a46'
  secondary-fixed: '#94f3e9'
  secondary-fixed-dim: '#77d6cd'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504b'
  tertiary-fixed: '#ffe173'
  tertiary-fixed-dim: '#e8c426'
  on-tertiary-fixed: '#221b00'
  on-tertiary-fixed-variant: '#554500'
  background: '#fff8f8'
  on-background: '#2c141b'
  surface-variant: '#ffd9e0'
  bg-soft-pink: '#FFF0F3'
  surface-white: '#FFFFFF'
  expense-red: '#FF6B9D'
  income-teal: '#7EDDD3'
  border-blush: '#FFE0E6'
  text-muted: '#8B6B73'
  text-disabled: '#B8A0A5'
typography:
  display-amount:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  error-text:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-padding: 16px
  card-gap: 12px
  section-margin: 24px
  grid-gutter: 10px
---

## Brand & Style

The brand personality is **playful, warm, and hyper-efficient**. It targets users who find traditional financial apps intimidating or cold, offering instead a "soft-utility" experience. The design follows a **Minimalist-Cute** movement, blending the clean structural principles of Vant 4 with a "kawaii" aesthetic through rounded corners and a confectionery-inspired palette.

The emotional goal is to reduce the "pain" of expense tracking by making the interface feel like a friendly digital diary. The UI prioritizes a **Mobile-First** tactile experience, emphasizing large tap targets and smooth, physics-based transitions.

## Colors

The palette is anchored by **#FF6B9D**, a vibrant pink that serves as both the primary brand identifier and the semantic indicator for expenses. To balance the warmth, **#7EDDD3 (Teal)** is used exclusively for income and positive growth, providing clear visual separation in financial lists.

- **Primary Interaction**: Use the `primary-gradient` (135deg, #FF6B9D to #FF8E8E) for high-impact elements like the Floating Action Button and Hero headers.
- **Backgrounds**: The global background is a very light pink (`#FFF0F3`), ensuring the white content cards (`#FFFFFF`) pop with clarity.
- **Typography**: Avoid pure black. Use **#5A3D44 (Dark Cocoa)** for all primary text to maintain a soft, organic feel that complements the pink tones.

## Typography

The typography system pairs **Plus Jakarta Sans** for headings and numerical displays with **Be Vietnam Pro** for functional body text. This combination offers a friendly, modern geometry with excellent legibility at small sizes.

- **Amount Displays**: Large financial totals should use `display-amount` with slightly tightened letter spacing to feel "solid."
- **Readability**: Maintain high contrast for numbers and category names using the primary text color. Secondary labels should drop to `text-muted` to create a clear information hierarchy.
- **Numbers**: Use tabular figures if possible to ensure that decimal points align vertically in lists and reports.

## Layout & Spacing

This system follows a **Fluid Mobile-First** layout. The horizontal rhythm is governed by a 16px "Safe Zone" on the left and right edges of the viewport.

- **Grid System**: The category selector uses a 4-column fluid grid for mobile. Icons and labels are centered within each grid cell.
- **Vertical Rhythm**: Use 12px spacing between cards in a list. Groups of related information (like "Daily Totals") are separated by 24px margins.
- **Bottom Navigation**: Reserve 56px (plus safe area inset) for the fixed bottom navigation bar to ensure ergonomic thumb-reach.

## Elevation & Depth

To maintain the "Minimalist" goal, the system avoids heavy shadows. Depth is communicated through **Tonal Layering** and **Soft Outlines**.

- **Level 0 (Background)**: `#FFF0F3` (Page base).
- **Level 1 (Surface)**: `#FFFFFF` cards with a 1px solid border of `#FFE0E6`. No shadow.
- **Level 2 (Interactive)**: Buttons and the FAB use a very subtle, diffused shadow: `box-shadow: 0 4px 12px rgba(255, 107, 157, 0.2);`.
- **Modals/Popups**: Use a semi-transparent backdrop blur (`backdrop-filter: blur(4px)`) to keep the user focused on the entry task.

## Shapes

The shape language is consistently **Rounded**, avoiding sharp corners to reinforce the approachable brand personality.

- **Cards & Inputs**: 16px (rounded-lg) for large surfaces and form containers.
- **Buttons**: 24px (rounded-xl) or pill-shaped to create a "squishy," tactile feel when tapped.
- **Icons**: Category icon containers are circular to provide a consistent frame for various Emoji glyphs.

## Components

### 1. Categories (Emoji Icons)
Each category combines an Emoji with a soft-colored background circle (15% opacity of the associated color).

**Expenses (12):**
1.  **Food**: 🍔 (#FF9F43)
2.  **Shopping**: 🛍️ (#FF6B9D)
3.  **Transport**: 🚗 (#54A0FF)
4.  **Housing**: 🏠 (#10AC84)
5.  **Utilities**: 💡 (#FECA57)
6.  **Entertainment**: 🎮 (#5F27CD)
7.  **Health**: 💊 (#FF4D4F)
8.  **Pets**: 🐱 (#FF9FF3)
9.  **Social**: ☕ (#48DBFB)
10. **Education**: 📚 (#222F3E)
11. **Travel**: ✈️ (#00D2D3)
12. **Others**: 📦 (#8395A7)

**Income (6):**
1.  **Salary**: 💰 (#7EDDD3)
2.  **Bonus**: 🧧 (#FF6B9D)
3.  **Investment**: 📈 (#1DD1A1)
4.  **Part-time**: 🕒 (#Feca57)
5.  **Gift**: 🎁 (#FF9FF3)
6.  **Others**: 🪙 (#C8D6E5)

### 2. Buttons & Inputs
- **Primary Button**: Uses the `primary-gradient`, white text, 16px height padding, and rounded-xl corners.
- **Form Inputs**: White background with a 1px `#FFE0E6` border. On focus, the border thickens to 2px and changes to `#FF6B9D`.
- **Record Switch**: A pill-shaped segmented control to toggle between "Expense" and "Income," using a sliding white highlight.

### 3. Cards & Lists
- **Daily Summary Card**: Features a "soft-corner" header with the date and a summary of that day's net flow. 
- **List Item**: Each transaction list item should be 64px tall for easy tapping, with the Emoji icon on the left and the amount aligned to the right.