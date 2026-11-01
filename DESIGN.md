# Design System: EduBranch AI (Light, Academic)

Source of truth: docs/design/GLOBAL-DESIGN-SYSTEM.md. This file is a compact copy for Stitch. If they differ, GLOBAL-DESIGN-SYSTEM.md wins.

## 1. Visual Theme & Atmosphere
A calm, rigorous, content-first academic authoring tool for university lecturers and students. Think a well-built research or authoring tool, not a consumer SaaS product. LIGHT THEME ONLY. Medium density: generous padding around pages and cards, tightly grouped fields inside a card. Typography (size and weight) leads the hierarchy. Color is reserved for status, learning mode, and exactly one primary action per screen. Never use color as decoration. AI is a function, never a visual identity.

## 2. Color Palette & Roles
- Canvas #F9FAFB: page background. Surface #FFFFFF: cards, panels, modals, inputs. Muted surface #F3F4F6: table headers, skeletons, hover.
- Ink #111827: primary text. Slate #4B5563: secondary text. Fog #9CA3AF: placeholders, timestamps, disabled text.
- Border #E5E7EB: default 1px borders. Strong border #D1D5DB: emphasis dividers.
- Action Blue #2563EB: the single primary action, links, focus ring. Hover #1D4ED8, pressed #1E40AF, disabled #93C5FD, subtle tint #EFF6FF.
- Case status badges (pill, background / text): Draft #F3F4F6 / #4B5563. Reviewed #EFF6FF / #1D4ED8. Approved #FFFBEB / #92400E. Published #F0FDF4 / #166534.
- Learning mode badges: Branching Study #F0FDFA / #0F766E. Review Study #FDF2F8 / #BE185D.
- AI-origin marker: small neutral gray tag (#F3F4F6 / #4B5563) with a flat outline icon and the label "AI Draft". Never colored, glowing, or sparkle-styled. Shown only on cases in Draft status.
- Feedback colors: success #16A34A, warning #D97706, error #DC2626, info #2563EB.

## 3. Typography
System font stack only (ui-sans-serif, system-ui, Segoe UI, Roboto, Arial). No web fonts.
- Page title 28/36 semibold. Section heading 24/32 semibold. Card title 20/28 semibold. Sub-label 16/24 semibold.
- Body 14/20 regular. Emphasized body and field labels 14/20 medium. Caption 12/16 regular.
- Hierarchy comes from weight and size, not color. Long reading text is capped at about 65-80 characters per line.

## 4. Component Styling
- Primary button: Action Blue fill, white text, 8px radius, 40px tall, 16px horizontal padding, rectangular. One per screen or section. Never pill-shaped.
- Secondary button: white fill, 1px Border, Ink text. Destructive: #DC2626 fill, only for irreversible actions, always with a confirmation dialog.
- Inputs and selects: white, 1px Border, 6px radius, 40px tall. Focus: Action Blue border plus a soft 2px ring. Error: red border with a helper line below. Textarea minimum 96px tall.
- Cards: white, 1px Border, 12px radius, 24px padding (16px on mobile), no shadow at rest. A clickable card gets a very light shadow on hover.
- Badges: pill (fully rounded), 12px text, 8px by 2px padding, always a text label.
- Tabs: underline style. Active tab is Ink with a 2px Action Blue underline. Inactive is Slate.
- Tables: header on Muted surface, medium-weight Slate text. Body rows white. Prefer tables over card grids when there are more than about 6 items with 3 or more comparable fields.
- Modals: centered, max width 560px, 16px radius, soft shadow, neutral dark overlay (rgba(17,24,39,0.4)). Only for focused single-purpose tasks.
- Toasts: top-right, 8px radius, white, 4px left accent in the semantic color.
- Empty state: outline icon in Fog, one sentence in Slate, one primary action when relevant. Loading: skeleton blocks in Muted surface. Error: plain-language message with a retry action, never raw server text.

## 5. Layout & Spacing
Spacing scale only: 4, 8, 12, 16, 24, 32, 48, 64 px. 24px between form sections, 12px between related fields, 8px between inline badges. Cards on the canvas are separated by borders, not shadows.

## 6. Never Generate
Dark mode. Indigo, violet or purple accents. Sparkle or star glyphs. Gradients, glow, neon. Pill-shaped buttons. Emoji used as icons. Chat-bubble avatars or typing animations. Scores, grades, pass/fail labels, rankings, or "correct/incorrect" language anywhere. A debate or versus framing for Challenge Support.
