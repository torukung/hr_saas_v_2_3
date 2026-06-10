# Adeptio Adaptive HR — Platform UI · v2.3

UI/UX preview for the dev team, built 1:1 against **Structure Blueprint v2.3 (modular architecture + split data)**. Five personas, web **and** mobile, with a selectable persona/device menu, working navigation (1–3 levels deep per menu), and a live in-memory demo of the shared-ID ledger. No backend, no build step, no dependencies — open `index.html` or deploy the folder as-is.

**This is the design contract, not the product.** Screens fix layout, navigation, color discipline and flow shape; the build phase replaces the demo store with real cells per the six-socket contract.

## Run / deploy

Local: double-click `index.html` (everything is relative-path, file:// safe).

GitHub Pages: push this folder as a repo → Settings → Pages → deploy from branch → root. `.nojekyll` is included. No build pipeline needed.

## Try this first (the ledger demo)

1. Launcher → **Manager → Web** → Approvals: approve `LV-0481`.
2. Switch persona to **Staff** → Requests: `LV-0481` is now *Approved*.
3. Switch to **System Admin** → Audit log: `leave.approved · LV-0481` sits at the top of the tail.

One write, many lenses — the §11 sync model, demonstrated in the UI.

## Structure

```
index.html              entry — loads everything, no bundler
css/tokens.css          design tokens (Atelier Pastel + persona accents) — single source of styling truth
css/app.css             all component & shell styles, sectioned and commented
js/i18n.js              EN live · ລາວ staged — every label goes through t(); Noto Sans Lao already in the stack
js/ui.js                icon set (inline SVG), components (kpi/card/table/queue/steps), hand-rolled SVG charts
js/data.js              demo data + pub/sub store — THE FILE THE BUILD PHASE REPLACES with real cell APIs
js/screens/staff.js     Staff (ESS) — ochre
js/screens/manager.js   Manager (MSS) — sage
js/screens/hr.js        HR (People Ops) — blue
js/screens/ceo.js       CEO / Shareholder — plum · read-only
js/screens/sysadmin.js  System Admin — teal · platform only
js/app.js               hash router, launcher, web rail / mobile frame shells, action handlers
```

## Routing & menu depth

Route shape: `#/{persona}/{device}/{screen}[/{param}]`

| Persona | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| Staff | My day · Time · Requests · Payslips · Documents · Me | New request · Request detail · Payslip detail | Type-prefilled forms (`request-new/Claim`) |
| Manager | Overview · Approvals · Team · Schedule · Reports | Approval detail (conflict check) · Member detail | — |
| HR | Pulse · Approvals · Comms · People · Time · Leave · Payroll · Docs · Reports | Person record · Pay-run stepper · L2 settle | Run actions (validate → approve → disburse) |
| CEO | Board · Trends · Divisions · Compliance · Packs | Division drill | — |
| SysAdmin | Health · Templates · Channels · Roles · Integrations · Audit | Template editor | — |

Nav highlighting: deep screens declare a `parent` (web) / `tabParent` (mobile) so the owning menu item stays lit while you drill. Breadcrumbs render on every level-2+ screen.

## Design system (do not drift)

- Persona accents are fixed by the blueprint: Staff ochre `#C28A4A` · Manager sage `#6E9A6E` · HR blue `#6E8FC0` · CEO plum `#9279B8` · SysAdmin teal `#5E91A0`. One attribute (`<body data-persona>`) recolors the whole shell — components only ever reference `--acc/--acc-d/--acc-bg/--acc-ln`.
- Type: Manrope (UI + display), JetBrains Mono (shared IDs `LV-0481`, code), Noto Sans Lao staged.
- Surfaces: warm cream canvas `#F2F1EC`, white cards, hairline `#E7E3DA`, soft long shadows. Accent appears only in: active nav, primary buttons, key numbers, chart primary series.
- Text-overlap discipline: no absolute-positioned text; rows truncate with ellipsis (`min-width:0` on every flex text column); long IDs wrap as chips, never overflow.
- A11y: visible `:focus-visible` rings, `aria-current` on nav/tabs, `aria-pressed` on toggles, reduced-motion respected, status conveyed by text+color (never color alone).

## What the build phase swaps

| Preview piece | Real platform piece (per Blueprint §) |
|---|---|
| `js/data.js` pub/sub store | Cell APIs `api/v1/*` + event bus (§04 sockets `api`, `events`) |
| `DATA.approve()/ret()` | Requests & Approvals cell, chains/SLA from `db_workflow` (§05) |
| Hard-coded nav arrays | Module registry manifests filling nav/dashboard/report slots (R6) |
| `i18n.js` dictionaries | Full EN·ລາວ packs via kernel i18n service |
| SVG chart helpers | Reporting warehouse `dw_reports` projections (§05) |
| Toast "audit-logged" | Append-only `db_audit` ledger |

Mobile contract: the phone frame fixes tab sets (Staff Home·Time·Requests·Me / Manager Home·Approvals·Team·Alerts / HR Queue·Alerts·Me / CEO Board·Trends·Me / SysAdmin Health·Templates·Audit), back-stack behavior and the clock-in hero. HR/CEO/SysAdmin mobile are *deliberately light* — that is a product decision from §12, not a gap.

## Multi-language (English / ລາວ) — staged

All shell labels resolve through `t(key)` (`js/i18n.js`). The `lo` pack exists with a few seeded strings and falls back to EN; the topbar toggle explains the staging. To ship Lao: fill the `lo` dictionary, flip `ready("lo")`, done — no markup changes. Screen-body copy is intentionally EN-literal at this stage; route it through keys as screens harden.

---
Structure & flow per **Adeptio Adaptive HR — Structure Blueprint v2.3** · demo data is fictional · © 2026 Adeptio.
