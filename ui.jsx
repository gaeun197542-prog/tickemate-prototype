/* ===========================================================
   TickeMate AI — shared UI components
   =========================================================== */
const { useState, useEffect, useRef, useCallback } = React;

/* ---- tiny icon set (simple shapes only) ---- */
function Icon({ name, size = 18, stroke = 2.2, style }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round", style };
  const paths = {
    check: <polyline points="4 12 10 18 20 6" />,
    arrow: <g><line x1="4" y1="12" x2="20" y2="12" /><polyline points="14 6 20 12 14 18" /></g>,
    back: <g><line x1="20" y1="12" x2="4" y2="12" /><polyline points="10 6 4 12 10 18" /></g>,
    spark: <g><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5z" fill="currentColor" stroke="none" /></g>,
    lock: <g><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></g>,
    shield: <g><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><polyline points="9 12 11 14 15 10" /></g>,
    user: <g><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></g>,
    mail: <g><rect x="3" y="5" width="18" height="14" rx="2" /><polyline points="3 7 12 13 21 7" /></g>,
    phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
    clock: <g><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></g>,
    ticket: <g><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4z" /><line x1="14" y1="6" x2="14" y2="18" strokeDasharray="2 2" /></g>,
    star: <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.4l6-.9z" />,
    crown: <path d="M4 18h16M4 18l-1-9 5 4 4-7 4 7 5-4-1 9" />,
    calendar: <g><rect x="4" y="5" width="16" height="16" rx="2" /><line x1="4" y1="9" x2="20" y2="9" /><line x1="9" y1="3" x2="9" y2="6" /><line x1="15" y1="3" x2="15" y2="6" /></g>,
    pin: <g><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></g>,
    refresh: <g><path d="M4 12a8 8 0 0 1 14-5l2 2" /><path d="M20 12a8 8 0 0 1-14 5l-2-2" /><polyline points="18 4 20 9 15 9" /><polyline points="6 20 4 15 9 15" /></g>,
    qr: <g><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h2v2M20 14v6M16 18h4M18 14v2" /></g>,
    bolt: <path d="M13 3L5 13h6l-1 8 8-10h-6z" fill="currentColor" stroke="none" />,
    globe: <g><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.4 2.5 15.6 0 18M12 3c-2.5 2.4-2.5 15.6 0 18" /></g>,
    card: <g><rect x="3" y="5" width="18" height="14" rx="2.5" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="7" y1="15" x2="11" y2="15" /></g>,
    book: <g><rect x="5" y="3" width="14" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /><circle cx="14.5" cy="9" r="1.6" /><path d="M12.5 14.5h4" /></g>,
    bell: <g><path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 20a2 2 0 0 0 4 0" /></g>,
    alert: <g><path d="M12 4l9 16H3z" /><line x1="12" y1="10" x2="12" y2="14" /><circle cx="12" cy="17.4" r="0.6" fill="currentColor" /></g>,
    external: <g><path d="M14 5h5v5" /><line x1="19" y1="5" x2="11" y2="13" /><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" /></g>,
    info: <g><circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16" /><circle cx="12" cy="8" r="0.6" fill="currentColor" /></g>,
    x: <g><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></g>,
    swap: <g><path d="M7 4 3 8l4 4" /><path d="M3 8h13a4 4 0 0 1 4 4" /><path d="M17 20l4-4-4-4" /><path d="M21 16H8a4 4 0 0 1-4-4" /></g>,
    chevron: <polyline points="6 9 12 15 18 9" />,
  };
  return <svg {...p}>{paths[name] || null}</svg>;
}

/* ---- AI typewriter bubble ---- */
function AiMessage({ text, speed = 16, onDone, fresh = true }) {
  const [shown, setShown] = useState(fresh ? "" : text);
  const [typing, setTyping] = useState(fresh);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!fresh) { setShown(text); setTyping(false); return; }
    setShown(""); setTyping(true);
    let i = 0;
    const tick = () => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        setTyping(false);
        doneRef.current && doneRef.current();
        return;
      }
      // small natural pause on punctuation
      const ch = text[i - 1];
      const delay = /[.!?。！？]/.test(ch) ? speed * 9 : /[,，、—]/.test(ch) ? speed * 4 : speed;
      timer = setTimeout(tick, delay);
    };
    let timer = setTimeout(tick, 280);
    return () => clearTimeout(timer);
  }, [text, fresh]);

  // render with **bold** support
  const html = shown.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return (
    <div className="ai-bubble">
      <span dangerouslySetInnerHTML={{ __html: html }} />
      {typing && <span className="cursor" />}
    </div>
  );
}

/* ---- AI co-pilot rail ---- */
function Copilot({ t, message, tip, msgKey }) {
  return (
    <aside className="copilot">
      <div className="copilot-inner">
        <div className="ai-head">
          <div className="ai-avatar">
            <span className="pulse" />
            <span className="orb" />
          </div>
          <div className="ai-meta">
            <div className="ai-name">{t.aiName}</div>
            <div className="ai-status">{t.aiStatus}</div>
          </div>
        </div>
        <div className="ai-thread">
          <AiMessage key={msgKey} text={message} />
        </div>
        {tip && (
          <div className="ai-tip">
            <span style={{ color: "var(--accent)", flexShrink: 0 }}><Icon name="bolt" size={16} /></span>
            <span dangerouslySetInnerHTML={{ __html: tip.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>") }} />
          </div>
        )}
      </div>
    </aside>
  );
}

/* ---- Step progress (topbar) ---- */
function StepProgress({ steps, current }) {
  return (
    <div className="progress">
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "active" : "";
        return (
          <React.Fragment key={i}>
            <div className={"progress-step " + state}>
              <div className="progress-dot">
                {i < current ? <Icon name="check" size={15} stroke={3} /> : i + 1}
              </div>
              <span className="progress-label">{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="progress-line"><i /></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ---- Language switcher (dropdown) ---- */
function LanguageSwitcher({ lang, setLang }) {
  const langs = window.TM.LANGS;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = langs.find((l) => l.code === lang) || langs[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div className="lang-dd" ref={ref}>
      <button className={"lang-dd-trigger" + (open ? " open" : "")} onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox" aria-expanded={open}>
        <Icon name="globe" size={17} />
        <span className="lang-dd-label">{current.label}</span>
        <Icon name="chevron" size={15} style={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="lang-dd-menu scrollbar" role="listbox">
          {langs.map((l) => (
            <button key={l.code} role="option" aria-selected={l.code === lang}
              className={"lang-dd-item" + (l.code === lang ? " active" : "")}
              onClick={() => { setLang(l.code); setOpen(false); }}>
              <span className="lang-dd-short">{l.short}</span>
              <span className="lang-dd-name">{l.label}</span>
              {l.code === lang && <span className="lang-dd-check"><Icon name="check" size={15} stroke={3} /></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Icon, AiMessage, Copilot, StepProgress, LanguageSwitcher });
