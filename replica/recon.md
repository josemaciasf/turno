# Recon map: Homebase (web + iOS/Android)

Scope: scheduling + time clock + timesheets (the core loop). Messaging, hiring,
HR documents and payroll are out of this slice.
For: a SaaS sold to other small hourly-workforce businesses (restaurants, retail,
services). Multi-tenant from day one, with subscription billing.
Date: 2026-10-30

> Source note: joinhomebase.com could not be fetched from this session (blocked
> by the network policy). This map is built from search results, third-party
> reviews, app-store listings and Homebase marketing snippets surfaced by
> search. Items carry a confidence level. Re-run recon with the site allowed,
> or with the user driving their own Homebase account, to raise confidence and
> capture screenshots into `replica/screens/`.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | marketing: scheduling | https://joinhomebase.com/employee-scheduling | availability, time off, publish, notifications (via search) |
| 2 | marketing: scheduling | https://joinhomebase.com/scheduling/ | trades, open shifts |
| 3 | marketing: shift planning | https://joinhomebase.com/shift-planning/ | templates, trades |
| 4 | marketing: mobile time clock | https://www.joinhomebase.com/time-clock/mobile-time-clock | PIN, any device |
| 5 | marketing: GPS time clock | https://wf.joinhomebase.com/time-clock/mobile-gps-time-clock | geofence, location on timesheet |
| 6 | marketing: time & attendance | https://www.joinhomebase.com/time-clock/time-attendance-software | breaks, approvals, export |
| 7 | pricing (official) | https://joinhomebase.com/pricing | not reachable; tiers from reviews below |
| 8 | review | https://fitsmallbusiness.com/homebase-review/ | plan contents |
| 9 | review | https://www.techrepublic.com/article/homebase-payroll-review/ | payroll add-on pricing |
| 10 | review | https://timeero.com/reviews/homebase-review | kiosk photo, geofence |
| 11 | review | https://www.workyard.com/answers/how-does-homebase-time-tracking-work | time tracking flow |
| 12 | FAQ aggregator | https://www.comparably.com/companies/homebase/faqs | publish button, publish history, employee nav |
| 13 | app store (iOS) | https://apps.apple.com/us/app/homebase-team-management/id871544379 | mobile screens, pitch |
| 14 | Shopify app listing | https://apps.shopify.com/homebase-team-management | All-in-One price |
| 15 | Capterra | https://www.capterra.com/p/212114/Homebase/ | reviews, pricing |
| 16 | pricing summary | https://www.noon.ai/blog/articles/433-homebase-pricing-2026 | Basic limits |

Plans as reported (conflicting, verify): Basic free (1 location, ~10–20
employees), Essentials ~$16–30/mo/location, Plus ~$40–60, All-in-One ~$100.
Payroll is an add-on (~$39/mo + $6/employee). Paid tiers gate: trades and
availability approval, advanced time tracking, labor cost, onboarding, HR.

## Core loop

A manager builds and publishes the week's schedule, employees see it on their
phone and clock in and out against it, and the manager approves the resulting
timesheets and exports them to payroll.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Sign up / create business | /signup | owner account, business name, industry, size | form, stepper | empty, error |
| S02 | Onboarding: location + team | after S01 | add first location, invite employees | form, invite list, CSV import | empty, filled |
| S03 | Team list | /team | everyone at the location, role, wage, status | table, filters, invite button | empty, filled, invited-pending |
| S04 | Employee profile | /team/:id | job roles, wage, PIN, permissions, contact | form, tabs | filled, error |
| S05 | Schedule builder (week) | /schedule | weekly grid by employee or by role; labor cost footer | grid, shift cards, week picker, view toggle, cost bar | empty, draft, published, unpublished-changes, mobile |
| S06 | Shift editor | click a grid cell or shift | set time, role, notes, break, repeat | modal, time pickers, select | new, edit, conflict-warning |
| S07 | Templates / copy week | schedule toolbar | copy last week or apply a saved template | menu, modal | none saved, list |
| S08 | Publish confirmation | "Publish" (top right of S05) | choose who to notify and how | modal, checkbox list | confirm, sent |
| S09 | Requests inbox (manager) | /requests | time off, trades, availability changes to approve | tabs, list, approve/deny | empty, pending, history |
| S10 | Availability | employee app > profile; manager in S04 | recurring weekly availability | day rows, time ranges | empty, filled, pending approval |
| S11 | Shift trade / cover | employee taps own shift | offer shift, pick colleague or post to all | sheet, list | offered, accepted, approved, denied |
| S12 | Open shifts | employee app; manager in S05 | unassigned shifts employees can claim | list, claim button | empty, filled, claimed |
| S13 | Kiosk: PIN pad | tablet in kiosk mode | identify employee | keypad, clock display | idle, wrong PIN |
| S14 | Kiosk: clock action | after S13 | clock in / start break / end break / clock out, photo | big buttons, camera | each action, early-clock-in blocked |
| S15 | Employee app: my schedule | mobile tab "Schedule" | my upcoming shifts, team schedule | list by day, tabs | empty, filled, offline |
| S16 | Employee app: clock in | mobile tab "Clock" | clock in/out, break, geofence check | big button, map pin, timer | outside geofence, on break, clocked in |
| S17 | Timesheets | /timesheets | pay period summary per employee: hours, OT, breaks, cost | table, period picker, flags | empty, with issues, all approved |
| S18 | Timecard detail | click row in S17 | edit punches, add missing, approve | punch list, edit modal, audit log | missing clock-out, edited, approved |
| S19 | Payroll export | S17 toolbar | download CSV / send to payroll provider | modal, format select | ready, exported |
| S20 | Dashboard | / after login | today: who is in, late, labor vs sales | cards, list | empty, live |
| S21 | Settings: location & rules | /settings | geofence radius, break rules, OT rules, early clock-in, pay period | forms, map | defaults, edited |
| S22 | Notifications | bell / push | schedule published, request approved, late alert | list, badges | empty, unread |
| S23 | Billing | /settings/billing | plan, seats/locations, card | plan cards, Stripe checkout | trial, active, past due |
| S24 | Invite acceptance | link from SMS/email | employee creates login, downloads app | form | valid, expired link |

## Flows

```
F01 Owner sets up a business
    S01 -> S02 -> S03
    happy path clicks: ~8
    edge: duplicate email, employee without email (SMS only), CSV with bad rows

F02 Manager builds and publishes next week
    S05 -> S07 (copy last week) -> S06 (adjust shifts) -> S08 -> S22 (team notified)
    happy path clicks: ~6
    edge: shift overlaps time off, outside availability, pushes someone into OT,
          editing after publish (re-notify only affected people), two managers editing

F03 Employee sees new schedule
    push/SMS -> S24 (first time) -> S15
    happy path clicks: 1-2
    edge: no app installed (SMS link to web), time zone of location vs phone

F04 Employee clocks in at kiosk
    S13 -> S14
    happy path clicks: 5 (4-digit PIN + clock in)
    edge: wrong PIN, too early vs schedule, not scheduled today, offline tablet (queue punches)

F05 Employee clocks in on phone
    S16
    happy path clicks: 1
    edge: outside geofence, location permission denied, forgot to clock out

F06 Employee requests time off, manager decides
    S15 -> request form -> S09 -> S22
    happy path clicks: ~5
    edge: blackout date, too little notice, already scheduled that day

F07 Employee trades a shift
    S15 -> S11 -> colleague accepts -> S09 manager approves
    happy path clicks: ~6 across 3 people
    edge: colleague would go into OT, colleague lacks the role

F08 Manager approves timesheets and exports payroll
    S17 -> S18 (fix missing clock-out) -> approve all -> S19
    happy path clicks: ~5
    edge: unapproved cards at period close, edits after export, OT rules per state

F09 Employee sets availability
    S10 -> S09 (if approval required)
    happy path clicks: ~4

F10 New customer subscribes (SaaS)
    S23 -> Stripe checkout -> back to S20
    happy path clicks: ~4
    edge: trial ends, card fails, downgrade over plan limits
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Button | primary, secondary, ghost, danger, giant (kiosk) | default, hover, focus, disabled, loading | all |
| Schedule grid | by employee, by role, day view | empty, draft, published, drag-over | S05 |
| Shift card | assigned, open, conflict, published/draft | default, selected, dragging, warning | S05, S12, S15 |
| Time picker / range | single, range, recurring | default, invalid | S06, S10, S18 |
| Week / period picker | week, pay period | current, past, future | S05, S17 |
| Modal / bottom sheet | form, confirm | open, submitting, error | S06, S08, S11, S18 |
| Data table | sortable, with row flags | empty, loading, filled | S03, S17 |
| PIN keypad | 4, 6 digits | idle, typing, error | S13 |
| Clock button | in, out, break start/end | idle, active timer, blocked | S14, S16 |
| Request card | time off, trade, availability | pending, approved, denied | S09, S15 |
| Labor cost bar | per day, per week | under, near, over target | S05, S20 |
| Toast | success, error, info | shown, dismissed | all |
| Badge / pill | role colour, status | - | S03, S05, S17 |
| Bottom tab nav (mobile) | employee, manager | active tab, badge | S15, S16 |
| Map with radius | view, edit | inside, outside | S16, S21 |

## Inferred data model

```
Company        id, name, industry, plan, stripe_customer_id, created_at
               evidence: S01, S23, pricing tiers per business. confidence: high
Location       id, company_id, name, address, timezone, lat, lng, geofence_radius_m,
               pay_period (weekly|biweekly|semimonthly), week_start_day
               evidence: plans priced per location, GPS clock (src 5). confidence: high
User           id, name, email, phone, password_hash, locale
               evidence: S24, SMS invites. confidence: high
Membership     id, user_id, location_id, role (owner|manager|employee), pin_hash,
               status (invited|active|archived)
               evidence: PIN per employee (src 4), roles. confidence: high
JobRole        id, location_id, name, colour
               evidence: schedule by role view. confidence: medium
MemberJobRole  membership_id, job_role_id, wage_cents, wage_type (hourly|salary)
               evidence: labor cost on schedule. confidence: medium
Shift          id, location_id, membership_id (null = open), job_role_id, start_at,
               end_at, unpaid_break_min, note, published_at, schedule_week_id
               evidence: S05/S06, open shifts. confidence: high
ScheduleWeek   id, location_id, week_start, status (draft|published), published_by,
               published_at, notified (json)
               evidence: publish history (src 12). confidence: medium
ShiftTemplate  id, location_id, name, shifts (json)
               evidence: templates (src 3). confidence: medium
Availability   id, membership_id, weekday, start_time, end_time, kind
               (available|unavailable), status (pending|approved)
               evidence: src 1, approval on paid plans. confidence: high
TimeOffRequest id, membership_id, start_date, end_date, partial_hours, reason,
               status (pending|approved|denied), decided_by, decided_at
               evidence: src 1. confidence: high
ShiftTrade     id, shift_id, from_membership_id, to_membership_id (null = cover by anyone),
               status (offered|accepted|approved|denied|cancelled)
               evidence: src 2, 3. confidence: high
TimeCard       id, membership_id, location_id, shift_id (nullable), clock_in_at,
               clock_out_at, source (kiosk|mobile|web|pos), clock_in_lat/lng,
               photo_url, approved_by, approved_at
               evidence: src 4, 5, 6, 10. confidence: high
Break          id, time_card_id, start_at, end_at, paid (bool)
               evidence: break tracking (src 6). confidence: high
TimeCardEdit   id, time_card_id, editor_id, field, old_value, new_value, at
               evidence: guess (manager edits need an audit trail). confidence: guess
Notification   id, user_id, kind, payload (json), channels, read_at
               evidence: publish via text/email/app (src 12). confidence: high
Subscription   id, company_id, stripe_subscription_id, plan, status, locations_count
               evidence: SaaS requirement, not observed. confidence: guess
```

Relationships: Company 1-n Location; Location 1-n Membership; User 1-n Membership;
Location 1-n JobRole; Membership n-n JobRole (with wage); Location 1-n ScheduleWeek
1-n Shift; Membership 1-n Shift, Availability, TimeOffRequest, TimeCard; Shift 1-n
ShiftTrade; TimeCard 1-n Break, TimeCardEdit; Company 1-1 Subscription.

## Feature matrix

See `features.csv`. Must: 21, should: 10, could: 5, skip: 4.

## Out of scope (cannot or should not be cloned)

- Integrated payroll and tax filing: needs a licensed payroll provider; integrate
  one (Gusto embedded, Check) rather than rebuild.
- POS integrations (Square, Toast, Clover): partner deals; add later through each
  POS's official public API.
- Live HR advisor: a human service.
- Homebase's brand, copy, illustrations, and its existing customers.
- State-by-state labor law rules: the rules themselves are public law, but
  keeping them current is ongoing work you own; start with federal OT + a few states.

## Size

Screens 24, flows 10, entities 16. Hard parts:

1. Time zones and schedule/timesheet math (overnight shifts, DST, OT per state, pay periods).
2. Native mobile apps with GPS geofence, camera, push notifications and offline punch queueing (kiosk and phone).
3. Multi-tenant SaaS: per-company isolation, roles, Stripe billing with per-location plans; plus SMS/push delivery.

Size: L (about a quarter for web + iOS + Android at production quality; an M
web-only MVP of F01–F05 and F08 is a few weeks).
