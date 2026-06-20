/* ===========================================================
   TickeMate AI — Intro + Step 1/2/3
   =========================================================== */
const { useState, useEffect, useRef, useCallback } = React;
const { CONCERTS, SEAT_TIERS } = window.TM;
const fmt = window.TM.formatPrice;
const { Icon, AiMessage } = window;

/* ---------------- INTRO ---------------- */
function Intro({ t, onStart }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const x = setTimeout(() => setReady(true), 60); return () => clearTimeout(x); }, []);
  const bullets = [
    { icon: "clock", text: t.introBullet1 },
    { icon: "shield", text: t.introBullet2 },
    { icon: "star", text: t.introBullet3 },
  ];
  return (
    <div className={"intro" + (ready ? " in" : "")}>
      <div className="intro-orb">
        <span className="pulse" /><span className="pulse p2" />
        <span className="orb-core" />
      </div>
      <div className="intro-eyebrow">{t.introEyebrow}</div>
      <h1 className="intro-title">{t.introTitle}</h1>
      <p className="intro-sub">{t.introSub}</p>
      <div className="intro-bullets">
        {bullets.map((b, i) => (
          <div className="intro-bullet" key={i} style={{ animationDelay: 0.3 + i * 0.12 + "s" }}>
            <span className="ib-icon"><Icon name={b.icon} size={18} /></span>
            {b.text}
          </div>
        ))}
      </div>
      <button className="btn btn-primary btn-lg intro-cta" onClick={onStart}>
        {t.introCta} <Icon name="arrow" size={18} />
      </button>
      <div className="intro-note">{t.introNote}</div>
    </div>
  );
}

/* ---------------- STEP 1 · CONCERT ---------------- */
function Step1Concert({ t, lang, data, update, onNext }) {
  const sel = data.concert;
  return (
    <div className="fade-in">
      <div className="stage-head">
        <div className="stage-eyebrow">{t.s1Eyebrow}</div>
        <h2 className="stage-title">{t.s1Title}</h2>
        <p className="stage-sub">{t.s1Sub}</p>
      </div>
      <div className="concert-grid">
        {CONCERTS.map((c) => {
          const active = sel && sel.id === c.id;
          return (
            <button key={c.id} className={"concert-card" + (active ? " active" : "")} onClick={() => update({ concert: c })}>
              <div className="cc-poster" style={{ background: c.gradient }}>
                {c.hot && <span className="cc-hot">{t.hot}</span>}
                <span className="cc-artist">{c.artist}</span>
                <span className="cc-check"><Icon name="check" size={16} stroke={3} /></span>
              </div>
              <div className="cc-body">
                <div className="cc-tour">{c.tour}</div>
                <div className="cc-meta"><Icon name="pin" size={14} /> {c.venue[lang]}</div>
                <div className="cc-meta"><Icon name="calendar" size={14} /> {c.date} ({c.day[lang]}) {c.time}</div>
                <div className="cc-foot">
                  <span className="cc-price"><em>{t.from}</em> {fmt(c.priceFrom, lang)}</span>
                  <span className="cc-pill">{active ? t.selected : t.select}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="stage-actions">
        <button className="btn btn-primary" disabled={!sel} onClick={onNext}>{t.next} <Icon name="arrow" size={18} /></button>
      </div>
    </div>
  );
}

/* ---------------- STEP 2 · ACCOUNT ----------------
   Moved to step2.jsx (redesigned readiness checklist) */

/* ---------------- STEP 3 · FAN CLUB ---------------- */
function Step3FanClub({ t, lang, data, update, onNext }) {
  const joined = data.fanclub;
  const [animating, setAnimating] = useState(false);
  const benefits = [t.s3Benefit1, t.s3Benefit2, t.s3Benefit3, t.s3Benefit4];
  const memberNo = data.memberNo || "FC-2026-0" + Math.floor(100000 + Math.random() * 800000);

  function join() {
    setAnimating(true);
    setTimeout(() => { update({ fanclub: true, memberNo }); setAnimating(false); }, 900);
  }
  const concert = data.concert || CONCERTS[0];

  return (
    <div className="fade-in">
      <div className="stage-head">
        <div className="stage-eyebrow">{t.s3Eyebrow}</div>
        <h2 className="stage-title">{t.s3Title}</h2>
        <p className="stage-sub">{t.s3Sub}</p>
      </div>

      <div className="fc-layout">
        <div className={"fc-card" + (joined ? " active" : "") + (animating ? " flip" : "")} style={{ background: concert.gradient }}>
          <div className="fc-card-top">
            <span className="fc-crown"><Icon name="crown" size={18} /></span>
            <span className="fc-tier">{t.membership}</span>
          </div>
          <div className="fc-artist">{concert.artist}</div>
          <div className="fc-club">OFFICIAL FAN CLUB</div>
          <div className="fc-card-foot">
            {joined ? (
              <><span className="fc-memno">{t.memberNo}</span><b>{memberNo}</b></>
            ) : (
              <><span className="fc-price">{fmt(39000, lang)}</span><span className="fc-per">{t.perYear}</span></>
            )}
          </div>
          {joined && <div className="fc-active-stamp"><Icon name="check" size={14} stroke={3} /> {t.joined}</div>}
        </div>

        <div className="fc-benefits">
          {benefits.map((b, i) => (
            <div className="fc-benefit" key={i} style={{ animationDelay: i * 0.08 + "s" }}>
              <span className="fcb-ico"><Icon name="check" size={14} stroke={3} /></span>{b}
            </div>
          ))}
          {!joined ? (
            <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 8 }} onClick={join} disabled={animating}>
              <Icon name="crown" size={18} /> {animating ? "…" : t.joinNow}
            </button>
          ) : (
            <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 8 }} onClick={onNext}>
              {t.next} <Icon name="arrow" size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Intro, Step1Concert, Step3FanClub });
