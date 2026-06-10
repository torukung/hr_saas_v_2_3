/* ============================================================
   ADEPTIO · HR persona (People Ops) — blue
   Web (full console): Pulse · Approvals L2 · Communication ·
     People(→person) · Time · Leave · Payroll(→run) · Documents · Reports
   Mobile (deliberately light): Queue · Alerts · Me
   ============================================================ */
(function () {
  const { icon, kpi, card, badge, idtag, rowitem, rowlist, table, steps, empty, avatar, sparkline, bars, lines2, donut, kip } = UI;

  const allStaff = [
    { name: "Souksavanh Phommachanh", id: "EMP-0214", div: "Production", pos: "Machine Operator", since: "Mar 2023", state: "active" },
    { name: "Khamla Sisouphanh", id: "EMP-0098", div: "Production", pos: "Supervisor · Line A", since: "Jan 2020", state: "active" },
    { name: "Manysone Vongphachanh", id: "EMP-0231", div: "Production", pos: "Machine Operator", since: "Aug 2024", state: "active" },
    { name: "Davone Phanthavong", id: "EMP-0244", div: "Sales", pos: "Account Executive", since: "Feb 2026", state: "probation" },
    { name: "Keo Sayavong", id: "EMP-0193", div: "Production", pos: "Forklift Driver", since: "Jun 2022", state: "flagged" },
    { name: "Latsamy Vorachit", id: "EMP-0156", div: "Finance", pos: "Payroll Officer", since: "Sep 2021", state: "active" }
  ];

  function l2queue(device, compact) {
    const q = DATA.pendingL2();
    if (!q.length) return empty("check", "L2 queue clear", "Nothing waiting on HR / Finance.");
    return q.map(r => `
      <div class="qrow">
        <div class="qmain" data-go="hr/${device === "mobile" ? "mobile/approval" : "web/approval"}/${r.id}" role="button" tabindex="0">
          <div class="qt">${idtag(r.id)} ${UI.esc(r.who)} · ${UI.esc(r.detail)} <span class="sla">${r.sla}</span></div>
          <div class="qs">L1 ✓ Khamla S. · ${r.dates}</div>
        </div>
        <div class="qact">
          <button class="btn ok sm" data-act="approve:${r.id}">${icon("check")}${compact ? "" : " Settle"}</button>
          <button class="btn danger sm" data-act="return:${r.id}">${icon("x")}${compact ? "" : " Return"}</button>
        </div>
      </div>`).join("");
  }

  /* ---------- WEB ---------- */
  const web = {
    pulse() {
      return {
        title: "HR pulse", sub: "The org today — every count is one click from its queue.",
        actions: `<button class="btn soft" data-go="hr/web/comms">${icon("megaphone")} Announce</button>
                  <button class="btn" data-go="hr/web/payroll/PR-2026-06">${icon("banknote")} Run payroll</button>`,
        body: `
        <div class="grid cols-4">
          ${kpi("Headcount", "248", `<span class="up">+3</span> this month`, { hero: 1 })}
          ${kpi("Present today", "95.1%", "236 of 248 · 4 late")}
          ${kpi("Approvals L2", String(DATA.pendingL2().length + 22), "oldest 1.8 d")}
          ${kpi("Payroll cut-off", "15 d", "Jun 25 · run in draft")}
        </div>
        <div class="grid cols-3" style="margin-top:14px">
          <div class="span-2" style="display:flex;flex-direction:column;gap:14px">
            ${card("Needs attention", rowlist([
          rowitem({ icon: "inbox", title: "L2 approvals waiting", sub: "1 claim settle + 22 cross-module", side: `<b class="num">23</b>`, go: "hr/web/approvals" }),
          rowitem({ icon: "banknote", title: "Payroll run PR-2026-06 in draft", sub: "3 OT batches pending L1 upstream", side: badge("draft"), go: "hr/web/payroll/PR-2026-06" }),
          rowitem({ icon: "alert", title: "Contracts expiring ≤ 30 days", sub: "3 staff · renewal letters from template", side: `<b class="num">3</b>`, go: "hr/web/docs" }),
          rowitem({ icon: "x", title: "Failed sends — LINE webhook", sub: "Channel down since 09:31 · SysAdmin notified", side: badge("failed"), go: "hr/web/comms" })
        ]), { icon: "bell" })}
            ${card("Attendance board — today", `
              <div class="grid cols-4" style="gap:10px;margin-bottom:14px">
                ${["Present|236|ok", "Late|4|warn", "Absent|3|bad", "On leave|5|"].map(s => { const [l, v, tn] = s.split("|"); return `<div style="text-align:center;padding:10px 6px;border:1px solid var(--line);border-radius:12px"><div class="num" style="font-size:22px;font-weight:650">${v}</div><span class="badge ${tn}">${l}</span></div>`; }).join("")}
              </div>
              ${sparkline(DATA.attendanceTrend)}<div class="small muted" style="margin-top:6px">Org present % · trailing 10 working days</div>`, { icon: "pulse", link: "hr/web/time" })}
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            ${card("Payroll run", steps([{ t: "Draft", s: "pull ledgers" }, { t: "Validate", s: "PIT · SSO" }, { t: "Approve", s: "L2" }, { t: "Disburse", s: "bank file" }], DATA.payrollRuns[0].step - 1) + `<button class="btn sm soft" style="margin-top:10px" data-go="hr/web/payroll/PR-2026-06">Open run ${icon("chevR")}</button>`, { icon: "banknote" })}
            ${card("KPIs", rowlist([
          rowitem({ icon: "trend", title: "Attrition (12-mo)", sub: "vs 8.4% last year", side: `<b class="num">7.2%</b>` }),
          rowitem({ icon: "clock", title: "Time-to-approve", sub: "median, all flows", side: `<b class="num">6.1 h</b>` }),
          rowitem({ icon: "check", title: "Payroll accuracy", sub: "May run", side: `<b class="num">99.97%</b>` })
        ]), { icon: "chart" })}
            ${card(t("common.quickActions"), `<div class="choice-row">
              <button class="choice" data-go="hr/web/people">${icon("plus")} New hire</button>
              <button class="choice" data-go="hr/web/comms">${icon("megaphone")} Announce</button>
              <button class="choice" data-go="hr/web/docs">${icon("file")} Generate doc</button>
              <button class="choice" data-go="hr/web/approvals">${icon("inbox")} Approvals</button>
            </div>`, { icon: "sparkle" })}
          </div>
        </div>`
      };
    },

    approvals() {
      return {
        title: "Approvals — L2 · cross-module", sub: "Final checkpoint before the ledger: claims settle, corrections post, chains close.",
        body: `
        <div class="grid cols-4">
          ${kpi("Waiting on HR", String(DATA.pendingL2().length + 22), "all modules", { hero: 1 })}
          ${kpi("Claims to settle", String(DATA.pendingL2().length), "via payroll or finance")}
          ${kpi("Median age", "0.9 d", "SLA 2 d")}
          ${kpi("Escalations", "0", "this week")}
        </div>
        ${card("Settle now", l2queue("web"), { icon: "inbox" })}
        ${card("Cross-module queue (sample)", table(
          [{ h: "ID" }, { h: "Type" }, { h: "Who" }, { h: "Stage" }, { h: "Age", r: 1 }, { h: "", r: 1 }],
          [
            { cells: [idtag("TC-0109"), "Correction", "Latsamy V.", "Adjust ledger", `<span class="num">0.4 d</span>`, `<button class="btn xs soft" data-act="toast:Ledger adjusted — audit-logged">Post</button>`] },
            { cells: [idtag("PRF-0042"), "Profile change", "Davone P.", "Bank account update", `<span class="num">0.7 d</span>`, `<button class="btn xs soft" data-act="toast:Profile change approved">Approve</button>`] },
            { cells: [idtag("DOC-0290"), "Document", "Manysone V.", "Salary certificate", `<span class="num">0.2 d</span>`, `<button class="btn xs soft" data-act="toast:Generated — serial DOC-0290, e-signed">Generate</button>`] }
          ]), { icon: "layers" })}`
      };
    },

    approval(id) {
      const r = DATA.requests.find(x => x.id === id) || DATA.requests[0];
      return {
        title: `Settle — ${r.detail}`, sub: "L1 approved upstream; HR / Finance closes the chain and the ledger syncs.",
        crumbs: [{ label: "Approvals", go: "hr/web/approvals" }, { label: r.id }],
        actions: `${idtag(r.id)} ${badge(r.status)}`,
        body: `
        <div class="grid cols-3">
          <div class="span-2">${card("Chain", steps([
          { t: "Staff", s: r.who.split(" ")[0] }, { t: "Manager · L1", s: "Approved ✓" },
          { t: "HR / Finance · L2", s: "You are here" }, { t: "Ledger", s: "Payroll sync" }
        ], 2), { icon: "layers" })}
          ${card("Item", table([{ h: "Field" }, { h: "Value" }], [
          { cells: ["Who", r.who] }, { cells: ["What", r.detail] },
          { cells: ["Evidence", "Receipt photo · verified"] }, { cells: ["Cost center", "PRD-A-110"] },
          { cells: ["Reimburse via", "June payroll run (PR-2026-06)"] }
        ]), { icon: "file" })}</div>
          <div>${r.status === "pending" ? card("Decide", `<div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn ok" data-act="approve:${r.id}">${icon("check")} Settle via payroll</button>
            <button class="btn ghost" data-act="toast:Routed to finance export instead">${icon("send")} Settle via finance</button>
            <button class="btn danger" data-act="return:${r.id}">${icon("x")} Return</button>
          </div>`, { icon: "settings" }) : card("Done", `<p class="small muted">Settled — lands on pay run PR-2026-06 as a reimbursement line.</p>`, { icon: "check" })}</div>
        </div>`
      };
    },

    comms() {
      const sent = DATA.state.sent;
      return {
        title: "Communication", sub: "One composer — pick who, pick how; System-Admin templates keep every send on-brand.",
        body: `
        <div class="grid cols-3">
          <div class="card span-2">
            <div class="card-head"><span class="t">${icon("send")} Compose</span><span class="badge acc">from template</span></div>
            <div class="field"><label>To — audience</label>
              <div class="choice-row" id="aud-row">
                ${["Broadcast — all 248", "Division · Production", "Level · Supervisors", "Site · Plant 1", "Individual"].map((a, i) => `<button class="choice" ${i === 1 ? 'aria-pressed="true"' : ""} data-act="pick:aud">${a}</button>`).join("")}
              </div>
            </div>
            <div class="field"><label>Channels — one or many, with fallback</label>
              <div class="choice-row" id="ch-row">
                <button class="choice" aria-pressed="true" data-act="pick:ch">${icon("mail")} Email</button>
                <button class="choice" aria-pressed="true" data-act="pick:ch">${icon("phone")} Push</button>
                <button class="choice" data-act="pick:ch">${icon("send")} SMS · Pro+</button>
              </div>
            </div>
            <div class="field"><label>Template</label>
              <select class="input"><option>Town hall announcement — EN · ລາວ (TPL-019)</option><option>Document expiry notice (TPL-026)</option><option>Shift reminder — SMS (TPL-023)</option></select>
              <span class="hint">Dear {{first_name}}, you're invited to the Q3 town hall on {{date}} at {{site}}…</span>
            </div>
            <div class="grid cols-2">
              <div class="field"><label>Schedule</label><div class="choice-row">
                <button class="choice" aria-pressed="true" data-act="pick:sch">Send now</button><button class="choice" data-act="pick:sch">Schedule</button><button class="choice" data-act="pick:sch">Recurring</button></div></div>
              <div class="field"><label>Fallback</label><select class="input"><option>Push first → SMS if unread in 4h</option><option>None</option></select></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
              <span class="small muted">≈ <b class="num" style="color:var(--ink)">142 recipients</b> · Production · 2 channels</span>
              <button class="btn" data-act="send-comms">${icon("send")} Send</button>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            ${card("Delivery — last 7 days", rowlist([
          rowitem({ icon: "mail", title: "Email", sub: "412 sent today", side: `<b class="num">99.2%</b>` }),
          rowitem({ icon: "phone", title: "Push / in-app", sub: "1,240 sent today", side: `<b class="num">99.9%</b>` }),
          rowitem({ icon: "send", title: "SMS", sub: "86 sent today", side: `<b class="num">97.8%</b>` }),
          rowitem({ icon: "x", title: "LINE webhook", sub: "down since 09:31", side: badge("failed") })
        ]), { icon: "pulse" })}
            ${card("Sent log", sent.length ? rowlist(sent.map(s => rowitem({ icon: "check", title: `${s.id} · ${s.audience}`, sub: `${s.ch} · ${s.ts}`, side: `<b class="num">${s.est}</b>` }))) : rowlist([
          rowitem({ icon: "check", title: "MSG-0087 · Safety drill notice", sub: "Email · Push · Jun 08", side: `<b class="num">248</b>` }),
          rowitem({ icon: "check", title: "MSG-0086 · Payslip ready (auto)", sub: "Push · Jun 01", side: `<b class="num">246</b>` })
        ]), { icon: "history" })}
          </div>
        </div>`
      };
    },

    people() {
      return {
        title: "People & Org", sub: "Master record and the org backbone — every other module reads from here.",
        actions: `<button class="btn soft" data-act="toast:Org chart export queued">${icon("download")} Org chart</button><button class="btn" data-act="toast:Onboarding flow opens here (EMP-#### · flow F)">${icon("plus")} New hire</button>`,
        body: `
        <div class="grid cols-4">
          ${kpi("Headcount", "248", "+3 MoM", { hero: 1 })}
          ${kpi("Divisions", "5", "12 departments")}
          ${kpi("On probation", "6", "2 ending this month")}
          ${kpi("Open lifecycle", "4", "1 onboard · 2 transfer · 1 exit")}
        </div>
        ${card("Directory", `
          <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">
            <input class="input" style="max-width:280px" placeholder="Search name, ID, position…">
            <div class="choice-row"><button class="choice" aria-pressed="true">All</button><button class="choice">Production</button><button class="choice">Sales</button><button class="choice">Finance</button></div>
          </div>` + table(
          [{ h: "Employee" }, { h: "Division" }, { h: "Position" }, { h: "Since" }, { h: "Status" }, { h: "", r: 1 }],
          allStaff.map(p => ({
            go: `hr/web/person/${p.id}`,
            cells: [
              `<div style="display:flex;align-items:center;gap:10px">${avatar(p.name)}<div><div class="strong">${p.name}</div><div class="small muted">${p.id}</div></div></div>`,
              p.div, p.pos, p.since,
              p.state === "active" ? badge("active") : p.state === "probation" ? `<span class="badge warn">Probation</span>` : badge("flagged"),
              icon("chevR")
            ]
          }))), { icon: "users" })}`
      };
    },

    person(id) {
      const p = allStaff.find(x => x.id === id) || allStaff[0];
      return {
        title: p.name, sub: `${p.pos} · ${p.div} — the master record (full HR lens).`,
        crumbs: [{ label: "People & Org", go: "hr/web/people" }, { label: p.id }],
        actions: `<button class="btn ghost" data-act="toast:Letter generated from TPL-014 — serial DOC-0294">${icon("file")} Generate letter</button><button class="btn soft" data-act="toast:Edit mode is a build-phase feature">${icon("edit")} Edit</button>`,
        body: `
        <div class="grid cols-3">
          <div class="card span-2">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">${avatar(p.name, 1)}
              <div><div style="font-weight:800;font-size:16px">${p.name}</div><div class="small muted">${p.id} · ${p.div} · since ${p.since}</div></div>
              <span style="margin-left:auto">${badge(p.state === "active" ? "active" : p.state)}</span></div>
            ${table([{ h: "Field" }, { h: "Value" }], [
          { cells: ["Position / grade", p.pos + " · G4"] },
          { cells: ["Employment", "Full-time · permanent"] },
          { cells: ["Reports to", "Khamla Sisouphanh (EMP-0098)"] },
          { cells: ["Cost center", "PRD-A-110"] },
          { cells: ["Documents", `Contract ✓ · ID ✓ · License <span class="badge warn">expiring</span>`] }
        ])}
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            ${card("Lifecycle", steps([{ t: "Onboard", s: p.since }, { t: "Active", s: "current" }, { t: "Transfer", s: "—" }, { t: "Offboard", s: "—" }], 1), { icon: "layers" })}
            ${card("Ledger trail", rowlist(DATA.requests.filter(r => r.who === p.name).slice(0, 3).map(r => rowitem({ icon: "inbox", title: `${r.id} · ${r.detail}`, sub: r.stage, side: badge(r.status) })) || []), { icon: "history" })}
          </div>
        </div>`
      };
    },

    time() {
      return {
        title: "Time & Attendance", sub: "Org-wide live board from the attendance ledger — multi-source capture, one truth.",
        actions: `<button class="btn ghost" data-act="toast:Exceptions report generated">${icon("download")} Exceptions</button>`,
        body: `
        <div class="grid cols-4">
          ${kpi("Present", "236", "95.1% of 248", { hero: 1 })}
          ${kpi("Late", "4", "auto-flagged")}
          ${kpi("Absent / no-show", "3", "2 on PV ladder")}
          ${kpi("Missing punches", "6", "corrections open")}
        </div>
        <div class="grid cols-3" style="margin-top:14px">
          <div class="span-2">${card("By division — present today", bars(DATA.company.divisions.map(d => ({ l: d.name, v: Math.round(d.staff * 0.95), vt: Math.round(d.staff * 0.95) + "", tone: undefined })), { values: 1 }), { icon: "chart" })}</div>
          ${card("Capture sources — today", rowlist([
          rowitem({ icon: "phone", title: "Mobile + GPS", sub: "geofenced punches", side: `<b class="num">61%</b>` }),
          rowitem({ icon: "grid", title: "Device · face / finger", sub: "2 scanners · Plant 1", side: `<b class="num">31%</b>` }),
          rowitem({ icon: "globe", title: "Web clock", sub: "office staff", side: `<b class="num">8%</b>` })
        ]), { icon: "plug" })}
        </div>
        ${card("Exceptions — today", table(
          [{ h: "Who" }, { h: "Exception" }, { h: "Source" }, { h: "Status" }, { h: "", r: 1 }],
          [
            { cells: ["Keo Sayavong", "No-show · 2nd this month", "Roster check", badge("flagged"), `<button class="btn xs soft" data-act="toast:Escalated on PV ladder — manager coached, HR recorded">Escalate</button>`] },
            { cells: ["Noy Keomany", "Late 09:12 (+42m)", "Device scan", badge("late"), `<button class="btn xs ghost" data-act="toast:Noted — monitoring">Note</button>`] },
            { cells: ["6 staff", "Missing punch", "Ledger scan", badge("pending"), `<button class="btn xs ghost" data-act="toast:Correction reminders sent (TC flow)">Remind</button>`] }
          ]), { icon: "alert" })}`
      };
    },

    leave() {
      return {
        title: "Leave & Absence", sub: "Configurable types and accrual — wired to the calendar and payroll.",
        actions: `<button class="btn soft" data-act="toast:Holiday calendar opens — localizable per country">${icon("calendar")} Holiday calendar</button>`,
        body: `
        <div class="grid cols-4">
          ${kpi("On leave today", "5", "2.0% of org", { hero: 1 })}
          ${kpi("Pending requests", "9", "across all teams")}
          ${kpi("Liability", "1,872 d", "accrued org-wide")}
          ${kpi("Carry-over expiring", "114 d", "by Dec 31")}
        </div>
        <div class="grid cols-2" style="margin-top:14px">
          ${card("Leave types & accrual", table(
          [{ h: "Type" }, { h: "Accrual" }, { h: "Carry-over" }, { h: "Approval" }],
          [
            { cells: ["Annual", "1.25 d / month", "max 5 d", "L1 → record"] },
            { cells: ["Sick", "15 d / year", "—", "L1 + certificate"] },
            { cells: ["Personal", "3 d / year", "—", "L1 → L2"] },
            { cells: ["Statutory (Lao)", "per labor law", "—", "auto"] }
          ]), { icon: "settings" })}
          ${card("July conflict heatmap — Production", UI.heatcal({ until: 0, levels: { 6: "l1", 7: "l2", 8: "l3", 9: "l2", 13: "l1", 20: "l1", 21: "l2" } }) + `<div class="legend" style="margin-top:10px"><span><i style="background:var(--acc-bg)"></i>1 away</span><span><i style="background:var(--acc-ln)"></i>2 away</span><span><i style="background:var(--acc)"></i>3+ away</span></div>`, { icon: "calendar" })}
        </div>`
      };
    },

    payroll() {
      return {
        title: "Payroll", sub: "Draft → validate → approve → disburse. Statutory PIT and social security are pluggable rule packs.",
        body: `
        <div class="grid cols-4">
          ${kpi("Current run", "PR-2026-06", "draft · cut-off Jun 25", { hero: 1 })}
          ${kpi("Gross (draft)", "₭ 1.42B", "248 staff")}
          ${kpi("May accuracy", "99.97%", "1 retro adjustment")}
          ${kpi("Bank file", "BCEL format", "export at disburse")}
        </div>
        ${card("Runs", table(
          [{ h: "Run" }, { h: "Period" }, { h: "Staff", r: 1 }, { h: "Gross", r: 1 }, { h: "Status" }, { h: "", r: 1 }],
          DATA.payrollRuns.map(r => ({
            go: `hr/web/payroll-run/${r.id}`,
            cells: [idtag(r.id), r.period, `<span class="num">${r.staff}</span>`, `<span class="num">${r.gross}</span>`, badge(r.state), icon("chevR")]
          }))), { icon: "banknote" })}
        ${card("Statutory packs — Lao PDR", rowlist([
          rowitem({ icon: "shield", title: "Personal income tax (PIT)", sub: "Progressive bands · 2026 tables", side: badge("active") }),
          rowitem({ icon: "heart", title: "Social security (SSO)", sub: "Employee 5.5% · employer 6.0%", side: badge("active") }),
          rowitem({ icon: "clock", title: "OT rules", sub: "150% weekday · 200% holiday · caps", side: badge("active") })
        ]) + `<p class="small muted" style="margin-top:10px">Swap per country — the payroll cell is sealed behind its contract (§04), so a bureau could replace it without the platform noticing.</p>`, { icon: "plug" })}`
      };
    },

    "payroll-run"(id) {
      const r = DATA.payrollRuns.find(x => x.id === id) || DATA.payrollRuns[0];
      const canAdvance = r.step < 4;
      const stepLabels = ["Draft", "Validate", "Approve", "Disburse"];
      return {
        title: "Pay run — " + r.period, sub: "Pulls time, OT, leave and claims from their cells; writes pay lines once.",
        crumbs: [{ label: "Payroll", go: "hr/web/payroll" }, { label: r.id }],
        actions: `${idtag(r.id)} ${badge(r.state)}`,
        body: `
        ${card("Progress", steps([
          { t: "Draft", s: "ledgers pulled" }, { t: "Validate", s: "codes · PIT · SSO" },
          { t: "Approve", s: "HR sign-off" }, { t: "Disburse", s: "bank file + payslips" }
        ], r.step - 1) + (canAdvance ? `<div style="display:flex;gap:9px;margin-top:14px;flex-wrap:wrap">
          <button class="btn" data-act="advance-run:${r.id}">${icon("chevR")} ${["", "Validate run", "Approve run", "Disburse & export", ""][r.step]}</button>
          <button class="btn ghost" data-act="toast:Variance report generated — 3 items over threshold">${icon("eye")} Variance check</button>
        </div>` : `<p class="small muted" style="margin-top:12px">Disbursed — payslips published to staff mobile, burn posted to the CEO board.</p>`), { icon: "banknote" })}
        <div class="grid cols-3">
          ${kpi("Staff in run", String(r.staff), "2 joiners prorated")}
          ${kpi("Gross", r.gross, "earnings + OT + allowances")}
          ${kpi("Net payout", "₭ 1.21B", "after PIT + SSO")}
        </div>
        ${card("Pay lines (sample)", table(
          [{ h: "Employee" }, { h: "Basic", r: 1 }, { h: "OT", r: 1 }, { h: "PIT", r: 1 }, { h: "SSO", r: 1 }, { h: "Net", r: 1 }],
          [
            { cells: ["Souksavanh P.", `<span class="num">${kip(4200000)}</span>`, `<span class="num">${kip(540000)}</span>`, `<span class="num" style="color:var(--bad)">− ${kip(468000)}</span>`, `<span class="num" style="color:var(--bad)">− ${kip(310200)}</span>`, `<b class="num">${kip(4862000)}</b>`] },
            { cells: ["Manysone V.", `<span class="num">${kip(3900000)}</span>`, `<span class="num">${kip(495000)}</span>`, `<span class="num" style="color:var(--bad)">− ${kip(402000)}</span>`, `<span class="num" style="color:var(--bad)">− ${kip(286000)}</span>`, `<b class="num">${kip(4307000)}</b>`] },
            { cells: ["Keo S.", `<span class="num">${kip(3600000)}</span>`, `<span class="num">${kip(648000)}</span>`, `<span class="num" style="color:var(--bad)">− ${kip(380000)}</span>`, `<span class="num" style="color:var(--bad)">− ${kip(264000)}</span>`, `<b class="num">${kip(3964000)}</b>`] }
          ]), { icon: "list" })}`
      };
    },

    docs() {
      return {
        title: "Documents", sub: "Vault + generation: issue any letter from System-Admin templates — serialized, e-signed, logged.",
        body: `
        <div class="grid cols-3">
          ${kpi("Expiring ≤ 30 d", "7", "3 contracts · 4 licenses", { hero: 1 })}
          ${kpi("Policy ack rate", "92%", "Code of conduct v4")}
          ${kpi("Generated MTD", "41", "self-serve 28 · HR 13")}
        </div>
        <div class="grid cols-2" style="margin-top:14px">
          ${card("Generate now", `<div class="choice-row" style="margin-bottom:12px">
            <button class="choice" data-act="toast:Employment letter — pick employee, serial auto-assigned">${icon("file")} Employment letter</button>
            <button class="choice" data-act="toast:Salary certificates — bulk for Finance div (22)">${icon("banknote")} Salary certificate</button>
            <button class="choice" data-act="toast:Contract renewals — 3 expiring contracts pre-filled">${icon("refresh")} Contract renewal</button>
          </div><p class="small muted">Each pulls merge fields from the people-ledger and routes via flow J (DOC-####).</p>`, { icon: "sparkle" })}
          ${card("Expiry watchlist", rowlist([
          rowitem({ icon: "alert", title: "3 contracts — Jul 2026", sub: "Davone P. +2 · renewal letters ready", side: badge("expiring") }),
          rowitem({ icon: "alert", title: "4 licenses — Q3", sub: "Forklift ×2 · electrician ×2", side: badge("expiring") }),
          rowitem({ icon: "check", title: "Visas / work permits", sub: "none expiring ≤ 90 d", side: badge("ok") })
        ]), { icon: "bell" })}
        </div>`
      };
    },

    reports() {
      const lib = [
        ["Attendance", "Daily / period · late & absence · OT · by site", "PDF · XLSX · CSV"],
        ["Leave", "Balances · liability · calendar · accrual", "PDF · XLSX"],
        ["Payroll", "Register · pay-code · tax & social security", "PDF · XLSX · bank"],
        ["People & headcount", "Roster · movement · tenure · cost", "PDF · XLSX"],
        ["Compliance", "Policy ack · audit · doc expiry · exceptions", "PDF · CSV"],
        ["Executive", "Board pack — cost · attrition · burn vs budget", "PDF · deck"]
      ];
      return {
        title: "Reports", sub: "Role-scoped, schedulable, export-ready — every cell registers its pack here (socket: outputs).",
        body: `<div class="grid cols-3">${lib.map(r => card(r[0], `
          <p class="small muted" style="margin-bottom:10px">${r[1]}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
            <span class="small mono muted">${r[2]}</span>
            <span style="display:flex;gap:7px"><button class="btn xs soft" data-act="toast:${r[0]} report — generated">Run</button>
            <button class="btn xs ghost" data-act="toast:${r[0]} — scheduled monthly">Schedule</button></span>
          </div>`, { icon: "chart" })).join("")}</div>`
      };
    }
  };

  /* ---------- MOBILE (light) ---------- */
  const mobile = {
    queue() {
      return {
        title: "Queue", body: `
        <div class="grid cols-2">${kpi("L2 items", String(DATA.pendingL2().length + 22), "waiting", { hero: 1 })}${kpi("Present", "95.1%", "236 of 248")}</div>
        ${card("Settle", l2queue("mobile", true), { icon: "inbox" })}
        ${card("Cross-module", rowlist([
          rowitem({ icon: "edit", title: "TC-0109 · ledger adjust", sub: "Latsamy V.", side: `<button class="btn xs soft" data-act="toast:Posted">Post</button>` }),
          rowitem({ icon: "file", title: "DOC-0290 · salary cert", sub: "Manysone V.", side: `<button class="btn xs soft" data-act="toast:Generated & e-signed">Go</button>` })
        ]), { icon: "layers" })}`
      };
    },
    alerts() {
      return {
        title: "Alerts", body: card("Today", rowlist([
          rowitem({ icon: "banknote", title: "Payroll cut-off in 15 d", sub: "PR-2026-06 still in draft", side: badge("draft") }),
          rowitem({ icon: "alert", title: "3 contracts expiring", sub: "Renewal letters ready", side: badge("expiring") }),
          rowitem({ icon: "x", title: "LINE channel down", sub: "SysAdmin notified 09:31", side: badge("failed") }),
          rowitem({ icon: "shield", title: "2 compliance flags", sub: "No-show ladder · Production", side: badge("flagged") })
        ]), { icon: "bell" })
      };
    },
    me() {
      const m = DATA.me.hr;
      return {
        title: "Me", body: `
        ${card("", `<div style="display:flex;align-items:center;gap:12px">${avatar(m.name, 1)}<div><div style="font-weight:800">${m.name}</div><div class="small muted">${m.role}</div></div></div>`)}
        ${card("Mobile is deliberately light", `<p class="small muted">Queue, alerts and profile only — the full HR console (payroll, people, comms) lives on web. That split is a v2.3 design decision, not a gap.</p>`, { icon: "sparkle" })}`
      };
    },
    approval(id) {
      const r = DATA.requests.find(x => x.id === id) || DATA.requests[0];
      return {
        title: r.id, back: "hr/mobile/queue", body: `
        ${card("", `<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">${idtag(r.id)}${badge(r.status)}</div>
        <h3 style="font-size:16px;margin:10px 0 2px">${r.who} · ${r.detail}</h3><div class="small muted">L1 ✓ · ${r.dates}</div>`)}
        ${r.status === "pending" ? `<div style="display:flex;gap:9px"><button class="btn ok" style="flex:1" data-act="approve:${r.id}">${icon("check")} Settle</button><button class="btn danger" style="flex:1" data-act="return:${r.id}">${icon("x")} Return</button></div>` : ""}`
      };
    }
  };

  PERSONAS.hr = {
    key: "hr", label: t("personas.hr"), icon: "pulse",
    appName: "Adeptio Ops", roleLine: "HR Operations Console",
    domain: "admin.adeptio.hr/pulse",
    nav: [
      { group: "Work", items: [
        { id: "pulse", icon: "pulse", label: t("hr.pulse") },
        { id: "approvals", icon: "inbox", label: t("hr.approvals"), count: () => DATA.pendingL2().length + 22 },
        { id: "comms", icon: "megaphone", label: t("hr.comms") }
      ]},
      { group: "Modules", items: [
        { id: "people", icon: "users", label: t("hr.people") },
        { id: "time", icon: "clock", label: t("hr.time") },
        { id: "leave", icon: "sun", label: t("hr.leave") },
        { id: "payroll", icon: "banknote", label: t("hr.payroll") },
        { id: "docs", icon: "folder", label: t("hr.docs") }
      ]},
      { group: "Insight", items: [{ id: "reports", icon: "chart", label: t("hr.reports") }] }
    ],
    parent: { approval: "approvals", person: "people", "payroll-run": "payroll" },
    tabs: [
      { id: "queue", icon: "inbox", label: "Queue" },
      { id: "alerts", icon: "bell", label: "Alerts" },
      { id: "me", icon: "user", label: "Me" }
    ],
    tabParent: { approval: "queue" },
    web, mobile
  };
})();
