/* ===========================================================
   TickeMate AI — Step 4/5/6 + Completion
   =========================================================== */
const { useState, useEffect, useRef, useCallback } = React;

/* ---------------- STEP 4 · QUEUE ---------------- */
function Step4Queue({ t, lang, data, update, onNext }) {
  const START = 24318;
  const [pos, setPos] = useState(data.queueDone ? 0 : START);
  const [done, setDone] = useState(!!data.queueDone);
  const startRef = useRef(null);

  useEffect(() => {
    if (done) return;
    let raf;
    const dur = 7200;
    const tick = (ts) => {
      if (startRef.current == null) startRef.current = ts;
      const p = Math.min(1, (ts - startRef.current) / dur);
      // ease-in so it accelerates toward your turn
      const eased = p * p * (3 - 2 * p);
      const remaining = Math.round(START * (1 - eased));
      setPos(remaining);
      if (p >= 1) { setDone(true); update({ queueDone: true }); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pct = Math.max(0, Math.min(100, (1 - pos / START) * 100));
  const waitMin = Math.floor(pos / 1800);
  const waitSec = Math.floor((pos % 1800) / 30);

  if (done) {
    return (
      <div className="fade-in queue-wrap">
        <div className="queue-turn">
          <div className="turn-burst" />
          <div className="turn-emoji">🎉</div>
          <h2 className="turn-title">{t.yourTurn}</h2>
          <p className="turn-sub">{t.yourTurnSub}</p>
          <button className="btn btn-primary btn-lg" onClick={onNext}>
            <Icon name="bolt" size={18} /> {t.enterSeats}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in queue-wrap">
      <div className="stage-head" style={{ textAlign: "center" }}>
        <div className="stage-eyebrow">{t.s4Eyebrow}</div>
        <h2 className="stage-title">{t.s4Title}</h2>
        <p className="stage-sub" style={{ margin: "9px auto 0" }}>{t.s4Sub}</p>
      </div>

      <div className="panel queue-panel">
        <div className="queue-ring">
          <svg viewBox="0 0 120 120" className="qr-svg">
            <circle cx="60" cy="60" r="52" className="qr-bg" />
            <circle cx="60" cy="60" r="52" className="qr-fg" style={{ strokeDashoffset: 327 - (327 * pct) / 100 }} />
          </svg>
          <div className="queue-num-wrap">
            <div className="queue-num">{pos.toLocaleString()}</div>
            <div className="queue-num-label">{t.peopleAhead}</div>
          </div>
        </div>

        <div className="queue-stats">
          <div className="qstat">
            <span className="qstat-label">{t.estWait}</span>
            <span className="qstat-val">{waitMin}{t.min} {String(waitSec).padStart(2, "0")}{t.sec}</span>
          </div>
          <div className="qstat">
            <span className="qstat-label">{t.queuePosition}</span>
            <span className="qstat-val accent">#{(pos + 1).toLocaleString()}</span>
          </div>
        </div>

        <div className="queue-bar"><i style={{ width: pct + "%" }} /></div>
        <div className="queue-holding">
          <span className="dot-spin" /> {t.queueTip}
        </div>
      </div>
    </div>
  );
}

/* ---------------- STEP 5 · SEATS ---------------- */
const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLS = 16;
function seatTier(r) { return r < 2 ? SEAT_TIERS[0] : r < 5 ? SEAT_TIERS[1] : SEAT_TIERS[2]; }
function isTaken(r, c) { return ((r * 7 + c * 13 + (c % 3) * 5) % 10) < 4; }
const RECO = ["C-7", "C-8"]; // Mate's pick

function Step5Seats({ t, lang, data, update, onNext }) {
  const [picked, setPicked] = useState(data.seats || []);
  const MAX = 2;

  function toggle(id, tier) {
    setPicked((cur) => {
      const exists = cur.find((s) => s.id === id);
      let next;
      if (exists) next = cur.filter((s) => s.id !== id);
      else if (cur.length >= MAX) next = [...cur.slice(1), { id, tier }];
      else next = [...cur, { id, tier }];
      update({ seats: next });
      return next;
    });
  }
  const subtotal = picked.reduce((a, s) => a + s.tier.price, 0);

  return (
    <div className="fade-in">
      <div className="stage-head">
        <div className="stage-eyebrow">{t.s5Eyebrow}</div>
        <h2 className="stage-title">{t.s5Title}</h2>
        <p className="stage-sub">{t.s5Sub}</p>
      </div>

      <div className="seat-layout">
        <div className="panel seatmap">
          <div className="stage-bar">{t.stage}</div>
          <div className="seat-rows scrollbar">
            {ROWS.map((row, r) => (
              <div className="seat-row" key={row}>
                <span className="row-label">{row}</span>
                <div className="seat-cells">
                  {Array.from({ length: COLS }).map((_, c) => {
                    const id = row + "-" + (c + 1);
                    const gap = c === 7;
                    const tier = seatTier(r);
                    const taken = isTaken(r, c);
                    const pick = picked.find((s) => s.id === id);
                    const reco = RECO.includes(id) && !taken;
                    return (
                      <React.Fragment key={c}>
                        {gap && <span className="seat-aisle" />}
                        <button
                          className={"seat" + (taken ? " taken" : "") + (pick ? " picked" : "") + (reco ? " reco" : "")}
                          style={!taken && !pick ? { "--tc": tier.color } : undefined}
                          disabled={taken}
                          onClick={() => toggle(id, tier)}
                          title={id}
                        />
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="seat-legend">
            {SEAT_TIERS.map((tt) => (
              <span className="leg" key={tt.id}><i style={{ background: tt.color }} />{t[tt.labelKey] || tt.id.toUpperCase()} · {fmt(tt.price, lang)}</span>
            ))}
            <span className="leg"><i className="leg-taken" />{t.taken}</span>
            <span className="leg"><i className="leg-reco" />{t.recommend}</span>
          </div>
        </div>

        <div className="panel seat-summary">
          <div className="ss-title">{t.seatSummary}</div>
          <div className="ss-hint">{t.selectSeatsHint}</div>
          <div className="ss-list">
            {picked.length === 0 && <div className="ss-empty">—</div>}
            {picked.map((s) => (
              <div className="ss-item" key={s.id}>
                <span className="ss-dot" style={{ background: s.tier.color }} />
                <b>{(t[s.tier.labelKey] || "").charAt(0).toUpperCase() || s.tier.id.toUpperCase()} · {s.id}</b>
                <span className="ss-price">{fmt(s.tier.price, lang)}</span>
              </div>
            ))}
          </div>
          <div className="ss-foot">
            <span>{t.subtotal}</span>
            <b>{fmt(subtotal, lang)}</b>
          </div>
          <button className="btn btn-primary btn-block btn-lg" disabled={picked.length === 0} onClick={onNext}>
            {t.toPayment} <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- STEP 6 · PAYMENT ---------------- */
function Step6Payment({ t, lang, data, update, onNext }) {
  const [secs, setSecs] = useState(420);
  const [method, setMethod] = useState("card");
  const [agree, setAgree] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const x = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(x);
  }, []);
  const mm = Math.floor(secs / 60), ssec = String(secs % 60).padStart(2, "0");

  const seats = data.seats || [];
  const subtotal = seats.reduce((a, s) => a + s.tier.price, 0);
  const fee = seats.length * 2000;
  const total = subtotal + fee;
  const concert = data.concert || CONCERTS[0];

  function pay() {
    setProcessing(true);
    setTimeout(() => { update({ bookingNo: "TM" + Date.now().toString().slice(-9) }); onNext(); }, 2200);
  }

  const methods = [["card", t.card, "💳"], ["kakao", t.kakao, "🟡"], ["naver", t.naver, "🟢"]];

  return (
    <div className="fade-in">
      <div className="stage-head">
        <div className="stage-eyebrow">{t.s6Eyebrow}</div>
        <h2 className="stage-title">{t.s6Title}</h2>
        <p className="stage-sub">{t.s6Sub}</p>
      </div>

      <div className="pay-held">
        <span className="ph-left"><Icon name="lock" size={15} /> {t.held}</span>
        <span className={"ph-timer" + (secs < 120 ? " low" : "")}><Icon name="clock" size={15} /> {mm}:{ssec}</span>
      </div>

      <div className="pay-layout">
        <div className="panel pay-form">
          <div className="pay-section-title">{t.payMethod}</div>
          <div className="pay-methods">
            {methods.map(([k, label, emo]) => (
              <button key={k} className={"pay-method" + (method === k ? " active" : "")} onClick={() => setMethod(k)}>
                <span className="pm-emo">{emo}</span>{label}
              </button>
            ))}
          </div>

          {method === "card" ? (
            <div className="card-fields fade-in">
              <div className="field">
                <label>{t.cardNo}</label>
                <div className="input-with-chip">
                  <input className="input" defaultValue="4321 8870 1129 6654" placeholder={t.cardPh} />
                  <span className="auto-chip sm"><Icon name="spark" size={11} /></span>
                </div>
              </div>
              <div className="row">
                <div className="field" style={{ flex: 1 }}><label>{t.expiry}</label><input className="input" defaultValue="08/29" placeholder={t.expPh} /></div>
                <div className="field" style={{ width: 110 }}><label>{t.cvc}</label><input className="input" type="password" defaultValue="123" placeholder={t.cvcPh} /></div>
              </div>
            </div>
          ) : (
            <div className="pay-redirect fade-in">
              <span className="pm-emo-lg">{method === "kakao" ? "🟡" : "🟢"}</span>
              {method === "kakao" ? t.kakao : t.naver}
            </div>
          )}

          <label className="agree-row">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span className="agree-box">{agree && <Icon name="check" size={13} stroke={3} />}</span>
            {t.agree}
          </label>
        </div>

        <div className="panel pay-summary">
          <div className="ps-poster" style={{ background: concert.gradient }}>
            <span>{concert.artist}</span>
          </div>
          <div className="ps-name">{concert.tour}</div>
          <div className="ps-meta">{concert.date} ({concert.day[lang]}) · {concert.venue[lang]}</div>
          <div className="ps-divider" />
          <div className="ps-line"><span>{t.seatLabel}</span><b>{seats.map((s) => s.id).join(", ") || "—"}</b></div>
          <div className="ps-line"><span>{t.subtotal}</span><b>{fmt(subtotal, lang)}</b></div>
          <div className="ps-line"><span>{t.bookingFee}</span><b>{fmt(fee, lang)}</b></div>
          <div className="ps-total"><span>{t.total}</span><b>{fmt(total, lang)}</b></div>
          <button className="btn btn-primary btn-block btn-lg" disabled={!agree || processing} onClick={pay}>
            {processing ? <><span className="dot-spin" /> {t.processing}</> : <><Icon name="lock" size={17} /> {t.payNow} {fmt(total, lang)}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPLETION ---------------- */
function CompletionScreen({ t, lang, data, onRestart, elapsed }) {
  const concert = data.concert || CONCERTS[0];
  const seats = data.seats || [];
  const total = seats.reduce((a, s) => a + s.tier.price, 0) + seats.length * 2000;
  const confetti = Array.from({ length: 40 });
  const mins = Math.floor(elapsed / 60), secs = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="done-wrap">
      <div className="confetti-layer">
        {confetti.map((_, i) => {
          const colors = ["#6ea8ff", "#ff6f9c", "#4fd6c0", "#ffce6e", "#b56cff"];
          const st = {
            left: (i * 2.5) % 100 + "%",
            background: colors[i % colors.length],
            animationDelay: (i % 10) * 0.18 + "s",
            animationDuration: 2.6 + (i % 5) * 0.4 + "s",
            width: 6 + (i % 3) * 3 + "px",
            height: 10 + (i % 4) * 3 + "px",
          };
          return <span className="confetti" style={st} key={i} />;
        })}
      </div>

      <div className="done-inner">
        <div className="done-eyebrow"><span className="de-dot" />{t.doneEyebrow}</div>
        <h1 className="done-title">{t.doneTitle}</h1>
        <p className="done-sub">{t.doneSub}</p>

        <div className="eticket">
          <div className="et-stub" style={{ background: concert.gradient }}>
            <div className="et-admit">{t.admitOne}</div>
            <div className="et-artist">{concert.artist}</div>
            <div className="et-qr"><Icon name="qr" size={52} /></div>
          </div>
          <div className="et-body">
            <div className="et-tag">{t.eTicket}</div>
            <div className="et-tour">{concert.tour}</div>
            <div className="et-grid">
              <div><span>{t.s1}</span><b>{concert.venue[lang]}</b></div>
              <div><span>DATE</span><b>{concert.date} {concert.time}</b></div>
              <div><span>{t.seatLabel}</span><b>{seats.map((s) => s.id).join(", ") || "—"}</b></div>
              <div><span>{t.bookingNo}</span><b>{data.bookingNo || "TM000000000"}</b></div>
            </div>
            <div className="et-foot">
              <span className="et-total">{t.total} <b>{fmt(total, lang)}</b></span>
              <span className="et-time"><Icon name="clock" size={13} /> {t.timeTaken}: {mins}:{secs}</span>
            </div>
          </div>
        </div>

        <div className="done-actions">
          <button className="btn btn-ghost"><Icon name="calendar" size={17} /> {t.addCalendar}</button>
          <button className="btn btn-ghost"><Icon name="ticket" size={17} /> {t.viewTickets}</button>
          <button className="btn btn-primary" onClick={onRestart}><Icon name="refresh" size={17} /> {t.bookAnother}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Step4Queue, Step5Seats, Step6Payment, CompletionScreen });
