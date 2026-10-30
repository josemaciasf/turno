# Components: Turno design system

Source of values: `tokens.json` (generated into `tokens.css`,
`tailwind.preset.js`, `theme.ts`). Components use role names only
(`bg-surface text-text-muted`), never raw hex.

Original visuals could not be measured (joinhomebase.com was blocked from
the session), so this is an original system built on the patterns the recon
found, not a copy of Homebase's look. Icons: Lucide (ISC). Font: Inter (OFL).
All labels and empty states are written fresh; the copy below is ours.

Web base: Radix primitives via shadcn/ui (dialog, popover, select, tabs,
toast, dropdown), styled with the preset. Mobile base: React Native core +
`@gorhom/bottom-sheet`, styled from `theme.ts`.

Global rules:
- Focus: every interactive element shows a 2px `focus` ring with 2px offset on
  `:focus-visible`. Never remove outlines without this replacement.
- Tap targets: 44px minimum on touch (`layout.tap-target`); 88px keys on the kiosk.
- Numbers: times, hours and money use `font-variant-numeric: tabular-nums`.
- Times display in the location's time zone, with the zone shown when the
  viewer's differs.
- Motion: `motion.base` with `motion.ease`; honour `prefers-reduced-motion`
  (no slide, fade only).

---

```
Button
  variants  primary (bg accent, text on-accent), secondary (bg bg, border border-input, text text),
            ghost (transparent, text text, hover bg surface), danger (bg danger, text on-danger),
            giant (kiosk only, see ClockButton)
  sizes     sm 32px, md 40px, lg 48px (mobile default lg)
  states    default, hover (primary: accent-hover), active, focus-visible, disabled (40% opacity,
            not focusable via pointer, keeps aria-disabled for SR), loading (spinner replaces icon,
            label kept, aria-busy=true, clicks ignored)
  tokens    radius md, font sm/600, padding x 4 (16px)
  a11y      real <button>; icon-only buttons need aria-label; destructive actions confirm in a Modal
  used on   all
```

```
IconButton
  variants  ghost, secondary
  sizes     32, 40, 44 (touch)
  states    as Button
  a11y      aria-label required; tooltip on hover/focus with the same text
  used on   S05 toolbar, S17 rows, S22
```

```
Input / Textarea / Select
  variants  text, phone (country code + number), email, number, search (leading icon), PIN (masked, numeric keypad)
  sizes     md 40px web, lg 48px mobile
  states    default (border border-input), hover, focus-visible (border focus + ring), disabled (bg surface),
            read-only, error (border danger, message below in danger xs), with helper text (text-muted xs)
  tokens    radius md, font base (16px on mobile so iOS does not zoom)
  a11y      <label> always visible (no placeholder-only labels); error linked via aria-describedby and
            aria-invalid; phone uses autocomplete=tel, inputmode=tel
  used on   S01, S02, S04, S06, S10, S18, S21, S24
```

```
TimePicker / TimeRange
  variants  single, range (start–end, shows duration "7h 30m"), recurring (weekday rows, S10)
  states    default, open (listbox in 15-min steps + free typing "9", "9:30p", "21:30"), invalid
            (end before start shows "ends next day" hint instead of error — overnight is valid), disabled
  tokens    as Input; duration pill text-muted xs
  a11y      combobox pattern; typed entry always allowed; 12/24 h from the location locale
  used on   S06, S10, S18
```

```
DateRangePicker / WeekPicker / PeriodPicker
  variants  week (prev / this week / next, label "Nov 2 – 8"), pay period, free range (time off)
  states    current, past, future, disabled dates (blackout dates in time off)
  a11y      arrows are buttons with labels "Previous week"; calendar grid uses roving tabindex
  used on   S05, S09, S15, S17
```

```
ScheduleGrid
  layout    sticky first column (layout.grid-name-col 200px) with person or job role; 7 day columns
            (min 120px) starting on the location's week_start_day; sticky header with day + date + daily
            hours/cost; footer row LaborCostBar; horizontal scroll below lg with sticky first column
  variants  by person, by job role, day view (hours as x-axis, lg+ only)
  states    empty week (illustration-free: text "No shifts yet" + buttons "Copy last week", "Add shift"),
            loading (skeleton rows), draft (banner warning-soft "Unpublished changes · Publish"),
            published (no banner), read-only (employee view: no hover add), realtime update from another
            manager (changed card flashes accent-soft once)
  interactions  click empty cell = new shift for that person/day; drag card to move; drag edge to resize
            (15-min snap); alt-drag to copy; keyboard: arrows move focus between cells, Enter opens editor,
            Ctrl/Cmd+C / V copy a shift, Delete removes (with undo toast)
  a11y      role=grid with row/column headers; every card is a gridcell button "Ana, Cook, 9:00 to 17:00";
            drag has a keyboard alternative (Move… menu)
  used on   S05
```

```
ShiftCard
  variants  assigned (bg role-n, text role-n-text, left 3px bar role-n-text), open (dashed border-input,
            bg bg, text text-muted, "Open"), draft (corner dot accent), conflict (border warning 2px +
            warning icon), time off overlay (striped surface, text "Off")
  content   time range (sm/600, tabular), job role (xs), break minutes (xs muted), note icon
  states    default, hover (shadow card), selected (focus ring), dragging (shadow drag, 0.9 opacity),
            disabled (past days, read-only)
  tokens    radius sm, min height layout.shift-card-min-h 44px, padding 2 (8px)
  a11y      colour is never the only signal: role name is always printed; conflict has an icon and text
  used on   S05, S12, S15
```

```
Modal / Dialog (web) · BottomSheet (mobile)
  variants  form, confirm, destructive confirm (danger primary button)
  sizes     sm 400px, md 560px, lg 720px; mobile full-width sheet with snap points 50% / 90%
  states    open, submitting (buttons loading, fields read-only), error (Banner danger at top)
  tokens    bg surface-raised, radius lg, shadow pop, overlay rgba(18,22,32,.45)
  a11y      Radix Dialog: focus trap, Esc closes, focus returns to the trigger, aria-labelledby title
  used on   S06, S07, S08, S11, S18, S19
```

```
DataTable
  variants  default, with row flags (warning/danger icon column), selectable (checkbox column)
  states    empty (text + primary action), loading (5 skeleton rows), filled, error (Banner + retry),
            sorted (aria-sort), row hover (bg surface), row selected (bg accent-soft)
  tokens    header xs/600 text-muted uppercase off (sentence case), row height 48px, border-b border
  a11y      real <table> with <th scope>; sort buttons inside headers; mobile collapses to cards below md
  used on   S03, S17
```

```
PinKeypad (kiosk)
  layout    3x4 grid, keys layout.kiosk-key 88px, digits display as dots above
  variants  4 digits, 6 digits
  states    idle, typing, wrong (shake 200ms + "Wrong PIN, try again" kiosk-text; reduced motion: no shake),
            locked after 5 tries ("Ask a manager" + countdown)
  tokens    bg kiosk-bg, keys bg #ffffff10 with kiosk-text type xl, radius lg
  a11y      keys are buttons with digit labels; hardware keyboard digits work; no reading of entered digits
  used on   S13
```

```
ClockButton
  variants  clock in (bg clock-in), clock out (bg clock-out), start break / end break (secondary, kiosk-bg
            on kiosk / bg on mobile)
  sizes     mobile: full width 64px; kiosk: 50% width 120px
  states    idle, pressed, loading (spinner, label kept), blocked (disabled + reason line beneath: "Your
            shift starts at 9:00. You can clock in from 8:50."), outside geofence (allowed, warning line
            "You seem to be away from Centro. This punch will be flagged."), offline (queued badge "Saved,
            will sync")
  content   label lg/600 on-clock + live elapsed timer (tabular) while clocked in
  a11y      announce result via aria-live polite: "Clocked in at 8:58"
  used on   S14, S16
```

```
RequestCard
  variants  time off, trade, availability change, open-shift claim
  content   who (Avatar + name), what (dates or shift), when filed, note; status Badge
  states    pending (actions Approve primary / Deny secondary), approved (success Badge), denied
            (danger Badge), cancelled (muted), conflict (warning Banner: "Ana is scheduled on Nov 4")
  a11y      actions name the subject: "Approve Ana's time off"
  used on   S09, S15
```

```
LaborCostBar
  content   scheduled hours, projected cost, % of sales target when set
  variants  per day (in grid footer), per week (summary)
  states    no target (just hours + cost), under target (success), near (≥ 90%, warning), over (danger)
  a11y      text values always present; colour is supplementary
  used on   S05, S20
```

```
Toast
  variants  success, error, info, undo (with "Undo" button, 6s)
  states    shown, dismissing; stack max 3, bottom-center mobile / bottom-right web
  tokens    bg text, text text-inverse, radius md, shadow pop
  a11y      role=status (aria-live polite); error uses role=alert; pauses on hover/focus
  used on   all
```

```
Banner
  variants  info, success, warning, danger (soft bg + strong text of the same role, leading icon)
  states    static, dismissible
  used on   S05 (unpublished), S17 (issues), S23 (past due), S16 (location denied)
```

```
Badge / Pill
  variants  status (pending warning-soft/warning, approved success-soft/success, denied danger-soft/danger,
            invited info-soft/info, archived surface/text-muted), job role (role-n / role-n-text), count
            (bg danger, on-danger, for nav)
  tokens    radius pill, font xs/500, height 20px
  used on   S03, S05, S09, S17, nav
```

```
Avatar
  variants  photo, initials (bg role-n by member, text role-n-text)
  sizes     24, 32, 40
  a11y      decorative when the name is next to it (alt="")
  used on   S03, S05, S09, S20
```

```
AppShell (web)
  layout    left Sidebar (layout.sidebar 240px; collapsed 64px below xl; drawer below md) + Header
            (layout.header 56px: location switcher, week context, notifications bell, account menu)
  nav       Dashboard, Schedule, Team, Requests (count Badge), Timesheets, Settings
  a11y      skip link "Skip to content"; nav landmark; current page aria-current
  used on   S03–S09, S17–S23
```

```
BottomTabs (mobile)
  employee  Schedule, Clock, Requests, Me
  manager   Today, Schedule, Requests (badge), Team, More
  states    active (accent icon + label), badge count
  a11y      tab labels always visible, not icon-only
  used on   S15, S16
```

```
MapRadius
  variants  view (pin + circle), edit (drag pin, radius slider 25–5000 m)
  states    inside (success line), outside (warning line), location permission denied (Banner with
            "Open settings")
  base      react-native-maps on mobile; MapLibre GL + OpenStreetMap tiles on web (no paid key)
  used on   S16, S21
```

```
EmptyState
  content   one-line title (lg), one-line explanation (text-muted), one primary action; no stock art
  used on   S03, S05, S09, S12, S15, S17, S22
```

```
Skeleton
  tokens    bg surface, shimmer disabled under prefers-reduced-motion
  used on   every async list
```
