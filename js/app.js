/* ============================================================
   ADEPTIO · app shell — router, launcher, shells, actions
   Route shape:  #/{persona}/{device}/{screen}[/{param}]
   e.g. #/hr/web/payroll-run/PR-2026-06 · #/staff/mobile/home
   ============================================================ */
(function () {
  const { icon, badge, avatar } = UI;
  const app = () => document.getElementById("app");

  const PERSONA_META = {
    staff:    { vars: ["--staff", "--staff-d", "--staff-bg", "--staff-ln"], who: "STAFF · ESS", h: "The Employee", tag: "Self-service — does the day-to-day", pts: ["Clock in / out — app, GPS, web", "Request leave · OT · claims", "Payslips & tax / SSO breakdown", "Profile & documents"] },
    manager:  { vars: ["--mgr", "--mgr-d", "--mgr-bg", "--mgr-ln"], who: "MANAGER · MSS", h: "The Team Lead", tag: "Oversees a team — first approver", pts: ["Approve / return requests (L1)", "Team roster, shifts & calendar", "Live attendance board", "Coaching on policy exceptions"] },
    hr:       { vars: ["--hr", "--hr-d", "--hr-bg", "--hr-ln"], who: "HR · PEOPLE OPS", h: "The HR Operator", tag: "Runs people, pay & communications", pts: ["Master data & org structure", "Payroll runs · tax · SSO", "Compose & send communications", "Final approvals (L2) & reports"] },
    ceo:      { vars: ["--ceo", "--ceo-d", "--ceo-bg", "--ceo-ln"], who: "CEO · SHAREHOLDER", h: "The Executive", tag: "Strategic oversight — read-only", pts: ["Headcount & labor cost", "Payroll burn vs budget", "Attrition & division compare", "Compliance / risk posture"] },
    sysadmin: { vars: ["--sys", "--sys-d", "--sys-bg", "--sys-ln"], who: "SYSTEM ADMIN", h: "The Platform Owner", tag: "Owns content, channels & security", pts: ["Content templates — CMS", "Channels & gateways", "Roles, permissions & SSO", "Audit log & residency"] }
  };
  const ORDER = ["staff", "manager", "hr", "ceo", "sysadmin"];

  /* ---------- routing ---------- */
  function route() {
    const h = location.hash.replace(/^#\/?/, "");
    if (!h || h === "launcher") return { view: "launcher" };
    const [persona, device, screen, ...rest] = h.split("/");
    if (!PERSONAS[persona]) return { view: "launcher" };
    const P = PERSONAS[persona];
    const dev = device === "mobile" ? "mobile" : "web";
    const scr = (P[dev][screen] ? screen : (dev === "web" ? P.nav[0].items[0].id : P.tabs[0].id));
    return { view: "app", persona, device: dev, screen: scr, param: rest.length ? decodeURIComponent(rest.join("/")) : undefined };
  }
  function go(path) { location.hash = "#/" + path; }
  window.go = go;

  /* ---------- toast ---------- */
  let toastWrap;
  window.toast = function (msg, tone) {
    if (!toastWrap) { toastWrap = document.createElement("div"); toastWrap.className = "toast-wrap"; document.body.appendChild(toastWrap); }
    const el = document.createElement("div");
    el.className = "toast" + (tone ? " " + tone : "");
    el.innerHTML = `${icon(tone === "warn" ? "alert" : "check")}<span>${msg}</span>`;
    toastWrap.appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 350); }, 3400);
  };

  /* ---------- topbar ---------- */
  function topbar(r) {
    const onApp = r.view === "app";
    const cur = onApp ? r.persona : null;
    const chips = ORDER.map(k => {
      const m = PERSONA_META[k];
      return `<button class="pchip" style="--pc:var(${m.vars[0]});--pd:var(${m.vars[1]});--pl:var(${m.vars[3]})"
        aria-pressed="${cur === k}" data-go="${k}/${onApp ? r.device : "web"}/${k === cur && onApp ? r.screen : defaultScreen(k, onApp ? r.device : "web")}" title="${PERSONAS[k].roleLine}">
        <span class="dot"></span><span class="pl">${PERSONAS[k].label}</span></button>`;
    }).join("");
    const me = onApp ? DATA.me[r.persona] : null;
    return `<header class="topbar">
      <button class="logo" data-go="launcher" aria-label="Adeptio home">
        <span class="logo-mark">A</span>
        <span><span class="logo-word">Adeptio</span><br><span class="logo-sub">${t("app.suite")}</span></span>
      </button>
      <span class="ver">UI preview · v2.3</span>
      <nav class="persona-switch" aria-label="Persona">${chips}</nav>
      <span class="spacer"></span>
      ${onApp ? `<div class="seg" role="group" aria-label="Device">
        <button aria-pressed="${r.device === "web"}" data-go="${r.persona}/web/${webEquiv(r)}">${icon("globe")} ${t("nav.web")}</button>
        <button aria-pressed="${r.device === "mobile"}" data-go="${r.persona}/mobile/${mobileEquiv(r)}">${icon("phone")} ${t("nav.mobile")}</button>
      </div>` : ""}
      <div class="seg lang" role="group" aria-label="Language">
        <button aria-pressed="true">EN</button>
        <button aria-pressed="false" data-act="lang-lo">ລາວ</button>
      </div>
      ${me ? `<button class="avatar-btn" title="${me.name} · ${me.role}">${avatar(me.name)}</button>` : ""}
    </header>`;
  }
  function defaultScreen(p, dev) { return dev === "mobile" ? PERSONAS[p].tabs[0].id : PERSONAS[p].nav[0].items[0].id; }
  // map current screen across devices, falling back to tab/nav parents then default
  function mobileEquiv(r) {
    const P = PERSONAS[r.persona];
    if (P.mobile[r.screen]) return r.screen + (r.param ? "/" + r.param : "");
    const tp = P.tabParent && P.tabParent[r.screen];
    if (tp && P.mobile[tp]) return tp;
    return P.tabs[0].id;
  }
  function webEquiv(r) {
    const P = PERSONAS[r.persona];
    if (P.web[r.screen]) return r.screen + (r.param ? "/" + r.param : "");
    const wp = { home: P.nav[0].items[0].id, queue: "approvals", alerts: P.nav[0].items[0].id, me: P.web.me ? "me" : P.nav[0].items[0].id, board: "board" }[r.screen];
    return (wp && P.web[wp]) ? wp : P.nav[0].items[0].id;
  }

  /* ---------- launcher ---------- */
  function launcher() {
    const cards = ORDER.map(k => {
      const m = PERSONA_META[k], P = PERSONAS[k];
      return `<article class="hub-card" style="--pc:var(${m.vars[0]});--pd:var(${m.vars[1]});--pb:var(${m.vars[2]});--pl:var(${m.vars[3]})">
        <span class="swatch">${icon(P.icon)}</span>
        <span class="who">${m.who}</span>
        <h3>${m.h}</h3>
        <p class="tag">${m.tag}</p>
        <ul>${m.pts.map(p => `<li>${p}</li>`).join("")}</ul>
        <div class="enter">
          <button data-go="${k}/web/${defaultScreen(k, "web")}">${icon("globe")} Web</button>
          <button class="ghosted" data-go="${k}/mobile/${defaultScreen(k, "mobile")}" aria-label="${P.label} mobile">${icon("phone")}</button>
        </div>
      </article>`;
    }).join("");
    return `${topbar({ view: "launcher" })}
    <main class="launcher screen-fade">
      <div class="hero">
        <span class="eyebrow">Adeptio Adaptive HR · structure blueprint v2.3 → platform UI</span>
        <h1>One platform.<br><em>Five personas.</em></h1>
        <p class="lede">A lean core that flexes — <strong>7 core modules, 3 engagement extras and a platform layer</strong>, each a sealed cell over split data stores, serving five personas from one source of truth. Pick a persona, switch web ⟷ mobile, and walk the flows. <strong>Approvals really move</strong> — approve in Manager, watch Staff and the audit trail update.</p>
      </div>
      <div class="hub-grid">${cards}</div>
      <div class="launch-meta">
        <span><b>5</b> personas</span><span><b>7+3+2</b> modules</span><span><b>10</b> data stores</span>
        <span><b>E1–E7</b> extension slots</span><span><b>50 · 100 · 250 · 600</b> seat tiers</span>
        <span><b>EN · ລາວ</b> bilingual-ready</span><span class="mono">demo data · Jun 10, 2026</span>
      </div>
    </main>
    <footer class="footer-note">${icon("lock")} UI/UX preview for the dev team — structure &amp; flows per Blueprint v2.3 · no real data, no backend · © 2026 Adeptio.</footer>`;
  }

  /* ---------- web shell ---------- */
  function webShell(r) {
    const P = PERSONAS[r.persona];
    const def = P.web[r.screen](r.param);
    const activeNav = (P.parent && P.parent[r.screen]) || r.screen;
    const navHtml = P.nav.map(g => `
      <div class="group eyebrow">${g.group}</div>
      ${g.items.map(it => {
      const cnt = typeof it.count === "function" ? it.count() : it.count;
      return `<button class="nav-item" aria-current="${activeNav === it.id}" data-go="${r.persona}/web/${it.id}">
          ${icon(it.icon)}<span class="lbl">${it.label}</span>${cnt ? `<span class="count">${cnt}</span>` : ""}</button>`;
    }).join("")}`).join("");

    const crumbs = def.crumbs
      ? `<nav class="crumbs" aria-label="Breadcrumb">
          <a data-go="${r.persona}/web/${defaultScreen(r.persona, "web")}">${P.label}</a>
          ${def.crumbs.map(c => `${icon("chevR")}${c.go ? `<a data-go="${c.go}">${c.label}</a>` : `<span class="here">${c.label}</span>`}`).join("")}
        </nav>`
      : `<nav class="crumbs" aria-label="Breadcrumb"><span class="mono" style="font-size:10.5px">${P.domain}</span></nav>`;

    return `${topbar(r)}
    <div class="shell">
      <aside class="rail" aria-label="${P.label} navigation">
        <div class="rail-head"><span class="pin">${icon(P.icon)}</span><div><div class="t">${P.appName}</div><div class="s">${P.roleLine}</div></div></div>
        ${navHtml}
        <div class="rail-foot">
          <div class="tier-chip"><span class="led"></span><span>${DATA.company.tier}</span></div>
          <div class="note">${DATA.company.name} · ${DATA.company.headcount} staff<br>Sealed cells · split stores · §04–05</div>
        </div>
      </aside>
      <main class="workspace" id="ws">
        <div class="workspace-inner screen-fade">
          ${crumbs}
          <div class="screen-head">
            <div><h1>${def.title}</h1>${def.sub ? `<p class="sub">${def.sub}</p>` : ""}</div>
            ${def.actions ? `<div class="actions">${def.actions}</div>` : ""}
          </div>
          ${def.body}
        </div>
      </main>
    </div>`;
  }

  /* ---------- mobile shell ---------- */
  function mobileShell(r) {
    const P = PERSONAS[r.persona];
    const def = P.mobile[r.screen](r.param);
    const activeTab = (P.tabParent && P.tabParent[r.screen]) || r.screen;
    const tabs = P.tabs.map(tb => `
      <button class="tab" aria-current="${activeTab === tb.id}" data-go="${r.persona}/mobile/${tb.id}">
        ${icon(tb.icon)}<span>${tb.label}</span><span class="tdot"></span></button>`).join("");
    const me = DATA.me[r.persona];
    return `${topbar(r)}
    <div class="mobile-stage">
      <div class="phone" role="region" aria-label="${P.label} mobile app">
        <div class="phone-screen">
          <span class="island"></span>
          <div class="statusbar"><span>9:41</span><span class="icons">${icon("signal")}${icon("wifi")}${icon("battery")}</span></div>
          <div class="app-head">
            ${def.back ? `<button class="back" data-go="${def.back}" aria-label="${t("common.back")}">${icon("chevL")}</button>` : ""}
            <div style="min-width:0"><div class="ah-t">${def.title}</div><div class="ah-s">${P.appName} · ${me.name.split(" ")[0]}</div></div>
            <span style="flex:1"></span>
            <button class="bell" aria-label="Notifications">${icon("bell")}<span class="ping"></span></button>
          </div>
          <div class="app-body screen-fade" id="ab">${def.body}</div>
          <nav class="tabbar" aria-label="Tabs">${tabs}</nav>
          <div class="homebar"><i></i></div>
        </div>
      </div>
      <aside class="stage-aside">
        <div class="card"><h4>${P.label} · mobile frame</h4><p>${({
        staff: "Mobile-first ESS — one-tap clock-in hero, then requests and payslips. Tabs: Home · Time · Requests · Me.",
        manager: "Approvals-first. The queue is the home screen reflex — approve or return in two taps.",
        hr: "Deliberately light: queue, alerts, profile. The full console stays on web — a v2.3 design decision.",
        ceo: "Four-metric snapshot, read-only. No edit controls exist anywhere in this app.",
        sysadmin: "Health & alerts only. Authoring stays on web; never shows employee records or pay."
      })[r.persona]}</p></div>
        <div class="card"><h4>Try the ledger</h4><p>${({
        staff: "Submit a request here, then switch to Manager → it appears in the L1 queue instantly.",
        manager: "Approve LV-0481, then open Staff → its status flips to Approved. One write, many lenses.",
        hr: "Settle EX-0210 at L2 — it lands as a reimbursement line on pay run PR-2026-06.",
        ceo: "Numbers here are aggregates over the same rows the other lenses write — never copies.",
        sysadmin: "Any action you take lands on the audit tail — check Audit after approving anything."
      })[r.persona]}</p></div>
        <div class="card"><h4>Hand-off note</h4><p>Bottom tabs, back stack and safe-areas follow this frame 1:1 — see README → “Mobile contract”.</p></div>
      </aside>
    </div>`;
  }

  /* ---------- render ---------- */
  let lastRoute = "";
  function render() {
    const r = route();
    document.body.dataset.persona = r.view === "app" ? r.persona : "";
    const ws = document.getElementById("ws") || document.getElementById("ab");
    const keep = lastRoute === location.hash ? (ws ? ws.scrollTop : window.scrollY) : 0;
    app().innerHTML = r.view === "launcher" ? launcher() : (r.device === "mobile" ? mobileShell(r) : webShell(r));
    document.title = r.view === "launcher" ? "Adeptio Adaptive HR — Platform UI v2.3"
      : `${PERSONAS[r.persona].label} · ${r.screen} — Adeptio`;
    if (keep) { const el = document.getElementById("ws") || document.getElementById("ab"); if (el) el.scrollTop = keep; else window.scrollTo(0, keep); }
    else window.scrollTo(0, 0);
    lastRoute = location.hash;
  }

  /* ---------- actions ---------- */
  function handleAct(act) {
    const [cmd, arg] = act.split(/:(.+)/);
    switch (cmd) {
      case "clock": {
        DATA.clock();
        toast(DATA.state.clockedIn ? "Clocked in · GPS verified inside geofence" : "Clocked out — see you tomorrow");
        break;
      }
      case "approve": {
        DATA.approve(arg);
        const r = DATA.requests.find(x => x.id === arg);
        toast(`${arg} ${r && r.stage.startsWith("L2") ? "approved → escalated to HR / Finance (L2)" : "approved — ledger, staff view & audit updated"}`);
        break;
      }
      case "return": { DATA.ret(arg); toast(arg + " returned to staff with a note", "warn"); break; }
      case "submit-request": {
        const id = DATA.submitRequest(arg, arg === "Claim" ? "Expense claim · ₭ 420,000" : arg === "Overtime" ? "Overtime · 2 hours" : arg === "Correction" ? "Punch correction · Jun 05" : "Annual leave · 2 days");
        toast(`${id} submitted — now in your manager's L1 queue`);
        const r = route();
        go(`${r.persona}/${r.device}/${r.device === "web" ? "request-detail" : "request-detail"}/${id}`);
        break;
      }
      case "advance-run": { DATA.advanceRun(arg); const run = DATA.payrollRuns.find(x => x.id === arg); toast(`${arg} → ${run.state}${run.state === "disbursed" ? " · bank file exported, payslips published" : ""}`); break; }
      case "send-comms": { DATA.sendComms("Division · Production", ["Email", "Push"], 142); toast("Sent to ≈142 recipients on 2 channels — delivery tracking live"); break; }
      case "lang-lo": { toast("ລາວ pack is staged — UI strings are externalized (js/i18n.js), translations land in the build phase", "warn"); break; }
      case "pick": { return "pick"; } // handled inline by caller
      case "toast": default: toast(arg || "Done"); break;
    }
  }

  document.addEventListener("click", (e) => {
    const actEl = e.target.closest("[data-act]");
    if (actEl) {
      const act = actEl.getAttribute("data-act");
      if (act.startsWith("pick:")) { // composer chips: ch = multi, others = single
        const row = actEl.parentElement;
        if (act === "pick:ch") {
          actEl.setAttribute("aria-pressed", actEl.getAttribute("aria-pressed") !== "true");
        } else {
          row.querySelectorAll(".choice").forEach(c => c.setAttribute("aria-pressed", "false"));
          actEl.setAttribute("aria-pressed", "true");
        }
        return;
      }
      handleAct(act);
      return;
    }
    const goEl = e.target.closest("[data-go]");
    if (goEl) go(goEl.getAttribute("data-go"));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const el = e.target.closest("[data-go]");
    if (el && !el.matches("button,a")) go(el.getAttribute("data-go"));
  });

  DATA.subscribe(render);
  window.addEventListener("hashchange", render);
  window.addEventListener("DOMContentLoaded", () => { if (!location.hash) location.hash = "#/launcher"; render(); });
})();
