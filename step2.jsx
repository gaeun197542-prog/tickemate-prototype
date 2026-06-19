/* ===========================================================
   TickeMate AI — STEP 2 · Account readiness checklist
   1) Cross-platform name health check
   2) Passport validity tracker
   3) Payment method pre-check
   4) Concert info + timezone-aware alerts
   =========================================================== */
const { PLATFORMS, TZ_LIST, TZ_LABEL, CARD_COUNTRIES, CARD_ISSUERS } = window.TM;
const S2_LOCALE = { en: "en-US", ja: "ja-JP", zh: "zh-CN", ko: "ko-KR" };

/* ---------- name-matching logic ---------- */
function s2NormSpace(s) { return (s || "").replace(/\u3000/g, " ").replace(/\s+/g, " ").trim(); }
function s2SpaceIssue(s) { s = s || ""; return /\u3000/.test(s) || /\s{2,}/.test(s) || s !== s.trim(); }
function s2SortedKey(s) { return s2NormSpace(s).toLowerCase().split(" ").filter(Boolean).sort().join(" "); }

function analyzeNames(names) {
  const filled = PLATFORMS.filter((p) => (names[p.key] || "").trim());
  if (filled.length < 2) return null;
  const groups = {};
  filled.forEach((p) => { const k = s2SortedKey(names[p.key]); (groups[k] = groups[k] || []).push(p.key); });
  let majKey = null, majCount = -1;
  Object.entries(groups).forEach(([k, arr]) => { if (arr.length > majCount) { majCount = arr.length; majKey = k; } });
  const refPlat = filled.find((p) => s2SortedKey(names[p.key]) === majKey);
  const refNorm = s2NormSpace(names[refPlat.key]);
  const rows = PLATFORMS.map((p) => {
    const raw = names[p.key] || "";
    if (!raw.trim()) return { key: p.key, status: "empty" };
    const nrm = s2NormSpace(raw);
    const isRef = p.key === refPlat.key;
    if (s2SortedKey(raw) !== majKey) return { key: p.key, status: "name", raw };
    if (nrm === refNorm) return { key: p.key, status: s2SpaceIssue(raw) ? "space" : "ok", raw, ref: isRef };
    if (nrm.toLowerCase() === refNorm.toLowerCase()) return { key: p.key, status: "case", raw };
    return { key: p.key, status: "order", raw };
  });
  const issues = rows.filter((r) => !["ok", "empty"].includes(r.status)).length;
  return { rows, issues, refKey: refPlat.key, refNorm };
}

/* ---------- passport / payment / time helpers ---------- */
function s2ShowDate(c) { if (!c) return null; const [y, m, d] = c.date.split(".").map(Number); return new Date(y, m - 1, d); }
function analyzePassport(expStr, showDate) {
  if (!expStr || !showDate) return null;
  const exp = new Date(expStr + "T00:00:00");
  const months = (exp - showDate) / (1000 * 60 * 60 * 24 * 30.44);
  const status = months <= 0 ? "bad" : months < 6 ? "warn" : "ok";
  return { months: Math.max(0, Math.round(months)), status };
}
function analyzePay(country, issuer) {
  const foreign = country !== "KR";
  let support, note;
  if (issuer === "Amex") { support = "limited"; note = "issAmex"; }
  else if (issuer === "JCB") { support = "partial"; note = "issJCB"; }
  else if (issuer === "UnionPay") { support = "partial"; note = "issUP"; }
  else { support = foreign ? "partial" : "ok"; note = "issVisa"; }
  return { foreign, need3ds: foreign, support, note };
}
function s2Kst(str) { return new Date((str || "") + ":00+09:00"); }
function s2DdayAM(str) { const d = (str || "").split("T")[0]; return new Date(d + "T09:00:00+09:00"); }
function s2FmtTz(date, tz, lang) {
  try { return new Intl.DateTimeFormat(S2_LOCALE[lang] || "en-US", { timeZone: tz, month: "short", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" }).format(date); }
  catch (e) { return ""; }
}

/* ---------- small styled controls ---------- */
function S2Select({ value, onChange, children }) {
  return (
    <div className="s2-select">
      <select value={value} onChange={onChange}>{children}</select>
      <span className="s2-select-caret"><Icon name="arrow" size={14} style={{ transform: "rotate(90deg)" }} /></span>
    </div>
  );
}
function S2Toggle({ on, onClick, label, time }) {
  return (
    <button className={"s2-toggle-row" + (on ? " on" : "")} onClick={onClick} type="button">
      <span className="s2-tg-label">{label}</span>
      {time && <span className="s2-tg-time">{time}</span>}
      <span className="s2-switch"><i /></span>
    </button>
  );
}

/* ---------- default state ---------- */
function s2Default(data) {
  return {
    tab: "health",
    done: { health: false, passport: false, pay: false, alert: false },
    names: { weverse: "LEE GAEUN", nol: "Lee Gaeun", yes24: "GAEUN LEE", melon: "LEE\u3000GAEUN" },
    nameResult: null,
    ppNo: "M12345678", ppExp: "2026-11-30", ppResult: null,
    payCountry: "US", payIssuer: "Visa", payResult: null,
    alShow: data.concert ? data.concert.artist + " · " + data.concert.tour : "",
    alOpen: "2026-07-15T20:00", alPlatform: "weverse", alTz: "America/New_York",
    alOn: { d1: true, dd: true, m30: true, m10: true }, alSaved: false,
  };
}

/* ============================================================ */
function Step2Account({ t, lang, data, update, onNext }) {
  const m = t.s2x;
  const [s2, setS2] = useState(() => data.s2 || s2Default(data));
  const showDate = s2ShowDate(data.concert || window.TM.CONCERTS[0]);
  const allDone = s2.done.health && s2.done.passport && s2.done.pay && s2.done.alert;
  const doneCount = Object.values(s2.done).filter(Boolean).length;

  useEffect(() => {
    const refName = s2.nameResult ? s2.nameResult.refNorm : s2NormSpace(s2.names.weverse);
    update({ s2, accountReady: allDone, name: refName || data.name });
  }, [s2]);

  const patch = (p) => setS2((v) => ({ ...v, ...p }));
  const setTab = (tab) => patch({ tab });
  const markDone = (k) => setS2((v) => ({ ...v, done: { ...v.done, [k]: true } }));

  const tabs = [
    { key: "health", icon: "user", label: m.tabHealth, done: s2.done.health },
    { key: "passport", icon: "book", label: m.tabPassport, done: s2.done.passport },
    { key: "pay", icon: "card", label: m.tabPay, done: s2.done.pay },
    { key: "alert", icon: "bell", label: m.tabAlert, done: s2.done.alert },
  ];

  return (
    <div className="fade-in">
      <div className="stage-head">
        <div className="stage-eyebrow">{t.s2Eyebrow}</div>
        <h2 className="stage-title">{t.s2Title}</h2>
        <p className="stage-sub">{t.s2Sub}</p>
      </div>

      {/* tab rail */}
      <div className="s2-tabs">
        {tabs.map((tb) => (
          <button key={tb.key} className={"s2-tab" + (s2.tab === tb.key ? " active" : "") + (tb.done ? " done" : "")} onClick={() => setTab(tb.key)}>
            <span className="s2-tab-ico">{tb.done ? <Icon name="check" size={15} stroke={3} /> : <Icon name={tb.icon} size={16} />}</span>
            <span className="s2-tab-label">{tb.label}</span>
          </button>
        ))}
      </div>

      <div className="panel s2-panel" key={s2.tab}>
        {s2.tab === "health" && <HealthModule t={t} m={m} s2={s2} patch={patch} markDone={markDone} />}
        {s2.tab === "passport" && <PassportModule t={t} m={m} s2={s2} patch={patch} markDone={markDone} showDate={showDate} concert={data.concert} lang={lang} />}
        {s2.tab === "pay" && <PayModule t={t} m={m} s2={s2} patch={patch} markDone={markDone} />}
        {s2.tab === "alert" && <AlertModule t={t} m={m} s2={s2} patch={patch} markDone={markDone} lang={lang} />}
      </div>

      {/* footer: checklist + next */}
      <div className="s2-foot">
        <div className="s2-checklist">
          <span className="s2-cl-label">{m.checklist}</span>
          <div className="s2-cl-items">
            {tabs.map((tb) => (
              <span key={tb.key} className={"s2-cl-chip" + (tb.done ? " done" : "")}>
                <Icon name={tb.done ? "check" : "x"} size={11} stroke={3} /> {tb.label}
              </span>
            ))}
          </div>
          <span className="s2-cl-count">{doneCount}/4 {m.doneOf}</span>
        </div>
        <button className="btn btn-primary" disabled={!allDone} onClick={onNext}>{t.next} <Icon name="arrow" size={18} /></button>
      </div>
    </div>
  );
}

/* ============ 1) HEALTH ============ */
function HealthModule({ t, m, s2, patch, markDone }) {
  const r = s2.nameResult;
  const platByKey = Object.fromEntries(PLATFORMS.map((p) => [p.key, p]));
  function run() { patch({ nameResult: analyzeNames(s2.names) }); markDone("health"); }
  const fixMap = { case: m.fixCase, order: m.fixOrder, space: m.fixSpace, name: m.fixName };
  const stMap = { ok: m.stOk, case: m.stCase, order: m.stOrder, space: m.stSpace, name: m.stName, empty: m.stEmpty };
  const tone = (st) => (st === "ok" ? "ok" : st === "empty" ? "muted" : st === "case" || st === "space" ? "warn" : "bad");

  return (
    <div className="s2-mod">
      <ModHead m={m} icon="user" title={m.hTitle} sub={m.hSub} />
      <div className="s2-name-grid">
        {PLATFORMS.map((p) => (
          <div className="s2-name-row" key={p.key}>
            <label className="s2-name-label">{p.name}</label>
            <input className="input" value={s2.names[p.key]} placeholder={m.hHint}
              onChange={(e) => patch({ names: { ...s2.names, [p.key]: e.target.value } })} />
          </div>
        ))}
      </div>
      <div className="s2-field-hint"><Icon name="info" size={13} /> {m.hHint} · 예) LEE GAEUN</div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={run}>
        <Icon name="shield" size={17} /> {r ? m.hRecheck : m.hCheck}
      </button>

      {r && (
        <div className="s2-result fade-in">
          <div className={"s2-result-head " + (r.issues ? "warn" : "ok")}>
            <Icon name={r.issues ? "alert" : "check"} size={18} stroke={2.4} />
            <b>{r.issues ? r.issues + " " + m.hIssues : m.hMatchAll}</b>
          </div>
          <div className="s2-issue-list">
            {r.rows.map((row) => {
              const p = platByKey[row.key];
              const tn = tone(row.status);
              return (
                <div className={"s2-issue tone-" + tn} key={row.key}>
                  <span className="s2-issue-dot" />
                  <div className="s2-issue-main">
                    <div className="s2-issue-top">
                      <b>{p.name}</b>
                      <span className="s2-issue-val">{row.raw || "—"}</span>
                      <span className={"s2-status-pill tone-" + tn}>{stMap[row.status]}{row.ref ? " · " + m.reference : ""}</span>
                    </div>
                    {fixMap[row.status] && <div className="s2-issue-fix">{fixMap[row.status]}</div>}
                  </div>
                  {row.status !== "ok" && row.status !== "empty" && (
                    <a className="s2-link" href={p.url} target="_blank" rel="noopener noreferrer">
                      {m.openSettings} <Icon name="external" size={13} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
          <div className="s2-note warn"><Icon name="alert" size={15} /><span>{m.hWhy}</span></div>
        </div>
      )}
    </div>
  );
}

/* ============ 2) PASSPORT ============ */
function PassportModule({ t, m, s2, patch, markDone, showDate, concert, lang }) {
  const r = s2.ppResult;
  function run() { patch({ ppResult: analyzePassport(s2.ppExp, showDate) }); markDone("passport"); }
  const showStr = (concert || window.TM.CONCERTS[0]).date;
  const tone = r ? (r.status === "ok" ? "ok" : r.status === "warn" ? "warn" : "bad") : "";
  const statusText = r ? (r.status === "ok" ? m.pOk : r.status === "warn" ? m.pWarn : m.pBad) : "";

  return (
    <div className="s2-mod">
      <ModHead m={m} icon="book" title={m.pTitle} sub={m.pSub} />
      <div className="s2-grid2">
        <div className="field"><label>{m.pNo}</label>
          <input className="input" value={s2.ppNo} placeholder={m.pNoPh} onChange={(e) => patch({ ppNo: e.target.value })} /></div>
        <div className="field"><label>{m.pExp}</label>
          <input className="input" type="date" value={s2.ppExp} onChange={(e) => patch({ ppExp: e.target.value })} /></div>
      </div>
      <div className="s2-readonly"><span>{m.pConcert}</span><b>{showStr}</b></div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={run}>
        <Icon name="shield" size={17} /> {m.pCheck}
      </button>

      {r && (
        <div className="s2-result fade-in">
          <div className={"s2-pp-status tone-" + tone}>
            <span className="s2-pp-ico"><Icon name={r.status === "ok" ? "check" : "alert"} size={22} stroke={2.6} /></span>
            <div>
              <b>{statusText}</b>
              <span className="s2-pp-months">{m.pMonths} <em>{r.months}</em> {m.pMonthsUnit}</span>
            </div>
          </div>
          <div className="s2-note"><Icon name="info" size={15} /><span>{m.p6mo}</span></div>
          <div className="s2-guide">
            <div className="s2-guide-card">
              <div className="s2-guide-t"><Icon name="alert" size={15} /> {m.pPickupT}</div>
              <p>{m.pPickupB}</p>
            </div>
            <div className="s2-guide-card">
              <div className="s2-guide-t"><Icon name="swap" size={15} /> {m.pRenewT}</div>
              <p>{m.pRenewB}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ 3) PAYMENT ============ */
function PayModule({ t, m, s2, patch, markDone }) {
  const r = s2.payResult;
  function run() { patch({ payResult: analyzePay(s2.payCountry, s2.payIssuer) }); markDone("pay"); }
  const supText = r ? (r.support === "ok" ? m.paySupOk : r.support === "partial" ? m.paySupPartial : m.paySupLimited) : "";
  const supTone = r ? (r.support === "ok" ? "ok" : r.support === "partial" ? "warn" : "bad") : "";
  const alts = [m.payAlt1, m.payAlt2, m.payAlt3, m.payAlt4];

  return (
    <div className="s2-mod">
      <ModHead m={m} icon="card" title={m.payTitle} sub={m.paySub} />
      <div className="s2-grid2">
        <div className="field"><label>{m.payCountry}</label>
          <S2Select value={s2.payCountry} onChange={(e) => patch({ payCountry: e.target.value })}>
            {CARD_COUNTRIES.map((c) => <option key={c} value={c}>{c}{c === "KR" ? " · 🇰🇷" : ""}</option>)}
          </S2Select></div>
        <div className="field"><label>{m.payIssuer}</label>
          <S2Select value={s2.payIssuer} onChange={(e) => patch({ payIssuer: e.target.value })}>
            {CARD_ISSUERS.map((c) => <option key={c} value={c}>{c}</option>)}
          </S2Select></div>
      </div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={run}>
        <Icon name="card" size={17} /> {m.payCheck}
      </button>

      {r && (
        <div className="s2-result fade-in">
          <div className="s2-pay-flags">
            {r.need3ds && (
              <div className="s2-flag warn">
                <span className="s2-flag-ico"><Icon name="shield" size={16} /></span>
                <div><b>{m.pay3dsT}</b><p>{m.pay3dsB}</p></div>
              </div>
            )}
            <div className={"s2-flag " + supTone}>
              <span className="s2-flag-ico"><Icon name={r.support === "ok" ? "check" : "alert"} size={16} /></span>
              <div><b>{supText}</b><p>{m[r.note]}</p></div>
            </div>
          </div>
          <div className="s2-alt">
            <div className="s2-alt-t"><Icon name="spark" size={14} /> {m.payAltT}</div>
            <div className="s2-alt-list">
              {alts.map((a, i) => (
                <div className="s2-alt-item" key={i}><span className="s2-alt-num">{i + 1}</span>{a}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ 4) ALERTS ============ */
function AlertModule({ t, m, s2, patch, markDone, lang }) {
  const openDate = s2Kst(s2.alOpen);
  const valid = !isNaN(openDate);
  const times = {
    d1: new Date(openDate.getTime() - 24 * 3600 * 1000),
    dd: s2DdayAM(s2.alOpen),
    m30: new Date(openDate.getTime() - 30 * 60 * 1000),
    m10: new Date(openDate.getTime() - 10 * 60 * 1000),
  };
  const rows = [
    { key: "d1", label: m.a1 }, { key: "dd", label: m.aD },
    { key: "m30", label: m.a30 }, { key: "m10", label: m.a10 },
  ];
  const toggle = (k) => patch({ alOn: { ...s2.alOn, [k]: !s2.alOn[k] } });
  function save() { patch({ alSaved: true }); markDone("alert"); }
  const enabledCount = Object.values(s2.alOn).filter(Boolean).length;

  return (
    <div className="s2-mod">
      <ModHead m={m} icon="bell" title={m.aTitle} sub={m.aSub} />
      <div className="field" style={{ marginBottom: 14 }}><label>{m.aShow}</label>
        <input className="input" value={s2.alShow} onChange={(e) => patch({ alShow: e.target.value })} /></div>
      <div className="s2-grid2">
        <div className="field"><label>{m.aOpen}</label>
          <input className="input" type="datetime-local" value={s2.alOpen} onChange={(e) => patch({ alOpen: e.target.value, alSaved: false })} /></div>
        <div className="field"><label>{m.aPlatform}</label>
          <S2Select value={s2.alPlatform} onChange={(e) => patch({ alPlatform: e.target.value })}>
            {PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
          </S2Select></div>
      </div>
      <div className="field" style={{ marginTop: 14 }}><label>{m.aTz}</label>
        <S2Select value={s2.alTz} onChange={(e) => patch({ alTz: e.target.value, alSaved: false })}>
          {TZ_LIST.map((z) => <option key={z} value={z}>{TZ_LABEL[z]}</option>)}
        </S2Select></div>

      {valid && (
        <div className="s2-openlocal">
          <span><Icon name="globe" size={14} /> {m.aOpenLocal}</span>
          <b>{s2FmtTz(openDate, s2.alTz, lang)}</b>
        </div>
      )}

      <div className="s2-when-label">{m.aWhen}</div>
      <div className="s2-toggles">
        {rows.map((row) => (
          <S2Toggle key={row.key} on={s2.alOn[row.key]} onClick={() => toggle(row.key)}
            label={row.label} time={valid && s2.alOn[row.key] ? s2FmtTz(times[row.key], s2.alTz, lang) : null} />
        ))}
      </div>
      <div className="s2-field-hint"><Icon name="globe" size={13} /> {m.aLocal}</div>

      <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={!valid || enabledCount === 0} onClick={save}>
        <Icon name="bell" size={17} /> {s2.alSaved ? m.aResave : m.aSave}
      </button>
      {s2.alSaved && (
        <div className="s2-note ok fade-in"><Icon name="check" size={15} stroke={2.6} /><span>{enabledCount} {m.aSaved}</span></div>
      )}
    </div>
  );
}

function ModHead({ m, icon, title, sub }) {
  return (
    <div className="s2-mod-head">
      <span className="s2-mod-ico"><Icon name={icon} size={20} /></span>
      <div><div className="s2-mod-title">{title}</div><div className="s2-mod-sub">{sub}</div></div>
    </div>
  );
}

Object.assign(window, { Step2Account });
