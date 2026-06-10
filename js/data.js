/* ============================================================
   ADEPTIO · demo data + shared ledger store
   One write, many lenses: a request approved in the Manager
   lens updates Staff, HR and the audit ledger instantly —
   the §11 sync model, demonstrated in-memory.
   Replace this file with real APIs per cell (see README).
   ============================================================ */
window.DATA = (function () {

  const company = {
    name: "Phou Ngern Group",
    tier: "Professional · ≤250 seats",
    headcount: 248,
    presentPct: 95.1,
    divisions: [
      { name: "Production", staff: 142, cost: 38.2, attr: 6.1, ot: 412 },
      { name: "Sales",      staff: 38,  cost: 17.4, attr: 9.8, ot: 86 },
      { name: "Logistics",  staff: 31,  cost: 11.9, attr: 8.4, ot: 132 },
      { name: "Finance",    staff: 22,  cost: 9.6,  attr: 4.2, ot: 22 },
      { name: "Admin",      staff: 15,  cost: 6.1,  attr: 5.0, ot: 14 }
    ]
  };

  // Who you are, per persona lens
  const me = {
    staff:    { name: "Souksavanh Phommachanh", id: "EMP-0214", role: "Machine Operator · Production Line A", site: "Vientiane Plant 1" },
    manager:  { name: "Khamla Sisouphanh",      id: "EMP-0098", role: "Supervisor · Production Line A", team: "Production Line A" },
    hr:       { name: "Vilayvanh Chanthavong",  id: "EMP-0021", role: "HR Operations Lead" },
    ceo:      { name: "Phonesavanh Luangrath",  id: "EMP-0001", role: "Chief Executive · Shareholder" },
    sysadmin: { name: "Thip Norasing",          id: "ADM-0002", role: "Platform Administrator" }
  };

  const team = [
    { name: "Souksavanh Phommachanh", id: "EMP-0214", pos: "Machine Operator", state: "present", in: "08:30", attend: 98, ot: 6,  leaveBal: 12 },
    { name: "Manysone Vongphachanh",  id: "EMP-0231", pos: "Machine Operator", state: "present", in: "08:24", attend: 96, ot: 11, leaveBal: 8 },
    { name: "Noy Keomany",            id: "EMP-0188", pos: "QC Inspector",     state: "late",    in: "09:12", attend: 91, ot: 3,  leaveBal: 10 },
    { name: "Bounmy Latsavong",       id: "EMP-0205", pos: "Line Technician",  state: "present", in: "08:18", attend: 99, ot: 14, leaveBal: 14 },
    { name: "Somphone Inthavong",     id: "EMP-0172", pos: "Machine Operator", state: "onleave", in: "—",     attend: 94, ot: 2,  leaveBal: 4 },
    { name: "Phetsamone Douangta",    id: "EMP-0226", pos: "Packer",           state: "present", in: "08:29", attend: 97, ot: 8,  leaveBal: 11 },
    { name: "Chanthala Phimmasone",   id: "EMP-0240", pos: "Packer",           state: "present", in: "08:31", attend: 95, ot: 5,  leaveBal: 9 },
    { name: "Keo Sayavong",           id: "EMP-0193", pos: "Forklift Driver",  state: "absent",  in: "—",     attend: 88, ot: 9,  leaveBal: 6 }
  ];

  // Shared-ID request ledger (LV / OT / EX / TC) — §07 flows
  const requests = [
    { id: "LV-0481", type: "Leave",      who: "Souksavanh Phommachanh", detail: "Annual leave · 2 days", dates: "Jun 18 – 19", status: "pending",  stage: "L1 · Manager", sla: "14h left", note: "Family visit in Pakse.", submitted: "Jun 09 · 16:40" },
    { id: "OT-0322", type: "Overtime",   who: "Manysone Vongphachanh",  detail: "Overtime · 3 hours",    dates: "Jun 11 · 17:00–20:00", status: "pending", stage: "L1 · Manager", sla: "9h left", note: "Line B maintenance window.", submitted: "Jun 10 · 07:55" },
    { id: "EX-0210", type: "Claim",      who: "Souksavanh Phommachanh", detail: "Expense claim · ₭ 420,000", dates: "Receipt · Jun 06", status: "pending", stage: "L2 · HR / Finance", sla: "1d left", note: "Safety boots replacement.", submitted: "Jun 08 · 11:02" },
    { id: "TC-0107", type: "Correction", who: "Keo Sayavong",           detail: "Missing punch · Jun 05", dates: "Jun 05 · in 08:27", status: "returned", stage: "Returned to staff", sla: "—", note: "Please attach gate log photo.", submitted: "Jun 06 · 09:15" },
    { id: "LV-0476", type: "Leave",      who: "Phetsamone Douangta",    detail: "Sick leave · 1 day",    dates: "Jun 04", status: "approved", stage: "Recorded", sla: "—", note: "Medical certificate attached.", submitted: "Jun 04 · 08:05" },
    { id: "OT-0318", type: "Overtime",   who: "Bounmy Latsavong",       detail: "Overtime · 2 hours",    dates: "Jun 07 · 17:00–19:00", status: "approved", stage: "Recorded", sla: "—", note: "Order rush — approved by plan.", submitted: "Jun 07 · 12:20" }
  ];

  const payslips = [
    { id: "PS-2026-05", period: "May 2026", net: 4862000, gross: 5640000, paid: "May 31", status: "ready",
      lines: [["Basic salary", 4200000], ["OT (12.5 h)", 540000], ["Position allowance", 450000], ["Meal & transport", 450000]],
      deds:  [["Income tax (PIT)", -468000], ["Social security (5.5%)", -310200]] },
    { id: "PS-2026-04", period: "April 2026", net: 4715000, gross: 5430000, paid: "Apr 30", status: "ready",
      lines: [["Basic salary", 4200000], ["OT (7 h)", 330000], ["Position allowance", 450000], ["Meal & transport", 450000]],
      deds:  [["Income tax (PIT)", -428000], ["Social security (5.5%)", -287000]] }
  ];

  const payrollRuns = [
    { id: "PR-2026-06", period: "June 2026", state: "draft", step: 1, staff: 248, gross: "₭ 1.42B", cutoff: "Jun 25", notes: "3 OT batches pending L1." },
    { id: "PR-2026-05", period: "May 2026",  state: "disbursed", step: 4, staff: 246, gross: "₭ 1.39B", cutoff: "May 25", notes: "Bank file exported · May 30." },
    { id: "PR-2026-04", period: "April 2026", state: "disbursed", step: 4, staff: 243, gross: "₭ 1.36B", cutoff: "Apr 25", notes: "Bank file exported · Apr 29." }
  ];

  // 12-month payroll burn (actual vs budget, ₭B)
  const burn = {
    labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    actual: [1.21, 1.23, 1.22, 1.26, 1.31, 1.42, 1.28, 1.27, 1.33, 1.36, 1.39, 1.42],
    budget: [1.25, 1.25, 1.28, 1.28, 1.32, 1.40, 1.33, 1.33, 1.36, 1.38, 1.42, 1.45]
  };

  const attendanceTrend = [93.8, 94.6, 95.2, 94.1, 95.8, 96.0, 94.9, 95.5, 94.7, 95.1];

  const templates = [
    { id: "TPL-014", name: "Employment letter", kind: "Letter", lang: "EN · ລາວ", status: "published", v: "3.1", updated: "Jun 02" },
    { id: "TPL-019", name: "Town hall announcement", kind: "Email", lang: "EN · ລາວ", status: "published", v: "1.4", updated: "Jun 08" },
    { id: "TPL-021", name: "Payslip ready notification", kind: "Email · Push", lang: "EN · ລາວ", status: "published", v: "2.0", updated: "May 28" },
    { id: "TPL-023", name: "Shift reminder", kind: "SMS", lang: "EN", status: "review", v: "0.9", updated: "Jun 09" },
    { id: "TPL-025", name: "Salary certificate", kind: "Letter", lang: "EN · ລາວ", status: "published", v: "1.2", updated: "May 30" },
    { id: "TPL-026", name: "Document expiry notice", kind: "Email · SMS", lang: "EN · ລາວ", status: "draft", v: "0.3", updated: "Jun 10" }
  ];

  const channels = [
    { name: "Email · SMTP relay", id: "smtp.adeptio.la", status: "live", rate: "99.2%", today: 412 },
    { name: "SMS · LaoTel gateway", id: "laotel-bulk-01", status: "live", rate: "97.8%", today: 86 },
    { name: "Push · in-app", id: "fcm-adeptio-prod", status: "live", rate: "99.9%", today: 1240 },
    { name: "Webhook · LINE OA", id: "line-oa-bridge", status: "failed", rate: "—", today: 0 }
  ];

  const audit = [
    { ts: "10:42", who: "Vilayvanh C.", act: "payroll.run.draft_created", obj: "PR-2026-06", ip: "10.0.4.12" },
    { ts: "10:18", who: "Khamla S.", act: "leave.approved", obj: "LV-0476", ip: "10.0.7.31" },
    { ts: "09:56", who: "Thip N.", act: "template.published", obj: "TPL-019 v1.4", ip: "10.0.1.9" },
    { ts: "09:31", who: "system", act: "channel.failover", obj: "line-oa-bridge", ip: "—" },
    { ts: "09:02", who: "Thip N.", act: "role.permission_changed", obj: "manager → reports.team", ip: "10.0.1.9" },
    { ts: "08:47", who: "Souksavanh P.", act: "attendance.punch_in", obj: "EMP-0214 · GPS", ip: "mobile" }
  ];

  const docs = [
    { name: "Employment contract", kind: "Contract", expiry: "Dec 2027", status: "active" },
    { name: "National ID", kind: "Identity", expiry: "Mar 2029", status: "active" },
    { name: "Forklift license", kind: "License", expiry: "Jul 2026", status: "expiring" },
    { name: "Code of conduct v4", kind: "Policy", expiry: "Acknowledge by Jun 20", status: "pending" }
  ];

  /* ---------- live state (mutable) ---------- */
  const state = {
    clockedIn: true, clockIn: "08:30",
    lang: "en",
    sent: [] // comms log additions
  };

  /* ---------- tiny pub/sub ---------- */
  const subs = [];
  function notify() { subs.forEach(fn => fn()); }

  /* ---------- ledger mutations (the demo "API") ---------- */
  function approve(id) {
    const r = requests.find(x => x.id === id);
    if (!r) return;
    if (r.stage.startsWith("L1")) { // manager L1 → escalate claims, record others
      if (r.type === "Claim") { r.stage = "L2 · HR / Finance"; }
      else { r.status = "approved"; r.stage = "Recorded"; r.sla = "—"; }
    } else { r.status = "approved"; r.stage = "Recorded"; r.sla = "—"; }
    audit.unshift({ ts: now(), who: "Khamla S.", act: r.type.toLowerCase() + ".approved", obj: r.id, ip: "10.0.7.31" });
    notify();
  }
  function ret(id) {
    const r = requests.find(x => x.id === id);
    if (!r) return;
    r.status = "returned"; r.stage = "Returned to staff"; r.sla = "—";
    audit.unshift({ ts: now(), who: "Khamla S.", act: r.type.toLowerCase() + ".returned", obj: r.id, ip: "10.0.7.31" });
    notify();
  }
  function clock() {
    state.clockedIn = !state.clockedIn;
    if (state.clockedIn) state.clockIn = now();
    audit.unshift({ ts: now(), who: "Souksavanh P.", act: state.clockedIn ? "attendance.punch_in" : "attendance.punch_out", obj: "EMP-0214 · GPS", ip: "mobile" });
    notify();
  }
  function submitRequest(type, detail) {
    const prefix = { Leave: "LV", Overtime: "OT", Claim: "EX", Correction: "TC" }[type] || "RQ";
    const id = prefix + "-0" + (483 + requests.length);
    requests.unshift({ id, type, who: me.staff.name, detail, dates: "Jun 2026", status: "pending", stage: "L1 · Manager", sla: "48h", note: "Submitted from UI preview.", submitted: "Jun 10 · " + now() });
    audit.unshift({ ts: now(), who: "Souksavanh P.", act: type.toLowerCase() + ".submitted", obj: id, ip: "mobile" });
    notify();
    return id;
  }
  function advanceRun(id) {
    const r = payrollRuns.find(x => x.id === id);
    if (!r || r.step >= 4) return;
    r.step += 1;
    r.state = ["draft", "draft", "review", "approved", "disbursed"][r.step];
    audit.unshift({ ts: now(), who: "Vilayvanh C.", act: "payroll.run." + r.state, obj: r.id, ip: "10.0.4.12" });
    notify();
  }
  function sendComms(audience, channelsList, est) {
    state.sent.unshift({ id: "MSG-0" + (88 + state.sent.length), audience, ch: channelsList.join(" · "), est, ts: now() });
    audit.unshift({ ts: now(), who: "Vilayvanh C.", act: "comms.sent", obj: audience + " · " + est + " recipients", ip: "10.0.4.12" });
    notify();
  }
  function now() {
    const d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  const pendingL1 = () => requests.filter(r => r.status === "pending" && r.stage.startsWith("L1"));
  const pendingL2 = () => requests.filter(r => r.status === "pending" && r.stage.startsWith("L2"));
  const mine = () => requests.filter(r => r.who === me.staff.name);

  return {
    company, me, team, requests, payslips, payrollRuns, burn, attendanceTrend,
    templates, channels, audit, docs, state,
    approve, ret, clock, submitRequest, advanceRun, sendComms,
    pendingL1, pendingL2, mine,
    subscribe(fn) { subs.push(fn); }
  };
})();
