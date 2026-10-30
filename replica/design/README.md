# Turno design system

Original system for the Homebase-style clone. It rebuilds the patterns, not
Homebase's look: the original could not be measured (site blocked from the
session) and its logo, colours, copy and illustrations are not used.

| file | what |
| --- | --- |
| `tokens.json` | single source: colour roles, type, spacing, radius, shadow, motion, layout |
| `build_tokens.py` | generates `tokens.css`, `tailwind.preset.js` (web) and `theme.ts` (Expo) |
| `components.md` | 22 component specs: variants, states, tokens, accessibility, screens |
| `preview.html` | the primitives rendered from the tokens; screenshots `preview-desktop.png`, `preview-mobile.png` |

- Accent `#3451c7` is a neutral placeholder; `/replica-brand` replaces it.
- Contrast: 34 text/UI pairs, 0 WCAG AA failures:
  `python3 .claude/skills/replica-design/contrast.py replica/design/tokens.json`
- Font Inter (OFL), icons Lucide (ISC), web base Radix/shadcn, maps MapLibre + OpenStreetMap.
- After any palette change: run `build_tokens.py`, then the contrast check.
