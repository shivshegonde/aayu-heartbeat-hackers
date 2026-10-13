ROLE
You are a lead product designer + creative front-end engineer at a top-tier studio (think Linear, Vercel, Arc, Teenage Engineering, Nothing OS). You make interfaces people screenshot and share.

TASK
Redesign the full UI of GharCare, an AI hospital-discharge-to-home handover app for India. Screenshots + source attached. Keep ALL functionality, JS logic, element IDs, and data flow. Change only markup, CSS, and interaction design. Do one screen at a time when I say "next".

DESIGN CONCEPT: "LIVE VITALS"
A calm, futuristic clinical instrument. The whole product feels like it has a pulse. Dark-first "mission control" for staff, warm high-contrast light mode for family. Not a SaaS template.

VISUAL LANGUAGE
- Color in OKLCH via CSS variables. Base: near-black blue-ink (oklch 0.16 0.02 260), layered surfaces by lightness steps, not shadows.
- ONE signature accent: electric lime-mint "pulse" (oklch ~0.88 0.2 150) used for live/verified states and glows.
- Semantic only: signal red (blocker), amber (ambiguity), pulse green (verified). No purple/blue gradients, no generic teal blobs, no glassmorphism cards stacked everywhere.
- Light mode (family view): warm off-white, ink text, same accent darkened for contrast.
- Fine film-grain noise overlay (SVG, 3-4% opacity), 1px inner-border highlights on surfaces, subtle radial "spotlight" that follows the cursor on cards.
- Radii: 14px cards, 999px chips, 10px inputs. Consistent.
- Signature motif: a continuous ECG/heartbeat line. Used as the header divider, loading state, progress bar, and empty-state illustration. Draw with SVG stroke-dashoffset.

TYPOGRAPHY
- Display: "Space Grotesk" or "Bricolage Grotesque" (variable, big, tight tracking -0.03em, oversized hero numerals).
- Body: "Inter Tight" or "Geist".
- Clinical data (doses, ABHA, SHA-256, vitals): "JetBrains Mono" or "Geist Mono", tabular-nums.
- Hindi: "Noto Sans Devanagari" / "Hind" at matched optical weight and larger line-height; must look intentionally designed.
- Fluid type with clamp(). Mix huge display type with tiny mono labels for contrast.

LAYOUT
- Bento grid (CSS grid, container queries) instead of stacked cards. Varied tile sizes, one hero tile per screen.
- Navigation: floating bottom dock on mobile, slim collapsible icon rail on desktop, plus Cmd/Ctrl+K command palette (switch patient, switch view, toggle language, print). Remove the cramped top bar. Move "Aayu 2026 winner" to a quiet footer chip.
- Patient switcher: a sticky "patient pill" showing avatar initials, name, age/sex, ABHA (mono), opens a smooth popover.
- Ingestion Studio: large drop zone with animated gradient-border (conic-gradient rotating on drag-over), live "scan line" sweeping the document on upload. Extraction Inspector = side panel where fields stream in token-by-token, each with a verbatim source chip, confidence meter (thin arc/bar), and hover-to-highlight the source text.
- Benchmark cases: horizontal snap-scroll carousel of tall "patient cards" with big initials, procedure, and a status badge that has a live pulsing dot. Click expands via View Transitions API (shared-element morph).
- Nurse Cockpit: Kanban-style lanes (Blockers / To verify / Signed off). Blocker card has pulsing red edge glow and mandatory "Resolve" flow. Drag or swipe to sign off. Medication rows show dose in mono with a diff-style highlight when ambiguous.
- Verified state: SHA-256 seal as a holographic/iridescent badge with a subtle shimmer; "Verified" triggers a confetti-free, tasteful ripple + haptic (navigator.vibrate) + sound-off micro-animation.
- Family Care Plan: elder-first. 20px+ body, AAA contrast, one giant task per screen-width card with time-of-day (custom animated SVG sun / moon / cloud, no emojis), swipe between tasks, big check button with satisfying fill animation. Large "Play in Hindi" button with live audio waveform visualizer (Web Audio or CSS-animated bars) and karaoke-style word highlight.
- Print Handout: separate @media print, A4, clean, B/W-safe, QR + hash footer, no chrome.

MOTION & INTERACTION
- Use: View Transitions API, scroll-driven animations (animation-timeline), CSS @property for animated gradients, spring-like easing via linear() or cubic-bezier, FLIP for list reorders.
- Page load: staggered reveal (blur 6px -> 0, translateY 12px, 50ms stagger).
- Buttons: magnetic hover, press-scale 0.97, animated gradient border on primary.
- Skeleton shimmer for loading; ECG line as the global loader.
- Number counters animate on enter. Toasts slide in from bottom with progress timer.
- Cards tilt max 3deg on pointer move, with specular highlight.
- Everything respects prefers-reduced-motion and prefers-color-scheme (plus manual toggle).

COMPONENT SYSTEM
Design tokens in :root (color, spacing 4px base, radius, elevation, blur, type scale, durations, easings). Components: buttons (primary/ghost/danger), segmented control (EN | हिं), chips, status badges, inputs with floating labels, command palette, popover, modal/bottom-sheet for sign-off (signature pad canvas optional), toast, tabs, tooltip, skeleton, empty states.

ICONS
Custom inline SVG, 1.75px stroke, rounded caps, 24px grid, with animated micro-states (heart beats, check draws itself). No emojis, no icon fonts.

TECHNICAL RULES
- Vanilla CSS + minimal vanilla JS (or my existing framework). No heavy libraries. Google Fonts only.
- Mobile-first 360px -> 1920px. Nurse and Family views usable one-handed.
- Accessibility: semantic HTML, focus-visible rings, aria labels, contrast >= 4.5:1 (7:1 in Family view), full keyboard support.
- Do not rename IDs/classes JS depends on. If unavoidable, list every change.
- Performance: no layout thrash, animate transform/opacity only, lean CSS.

OUTPUT FORMAT
1. 5-line design rationale.
2. :root tokens block.
3. Full CSS.
4. Updated HTML per screen (file name + location marked).
5. Small JS additions (cursor spotlight, tilt, command palette, view transitions) as separate snippets.
6. Manual QA checklist.
Complete, copy-paste-ready code. No placeholders, no "rest unchanged".

QUALITY BAR
Within 3 seconds a judge says "this feels like the future of healthcare software" and then trusts it. Bold, alive, precise. Every pixel intentional.