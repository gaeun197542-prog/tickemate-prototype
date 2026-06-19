/* ===========================================================
   TickeMate AI — App orchestrator
   =========================================================== */
const { T } = window.TM;

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem("tm_lang") || "ko");
  const [phase, setPhase] = useState("intro"); // intro | flow | done
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const startRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

  const t = T[lang];
  useEffect(() => { localStorage.setItem("tm_lang", lang); document.documentElement.lang = lang; }, [lang]);

  const stepLabels = [t.s1, t.s2, t.s3, t.s4, t.s5, t.s6];
  const aiMsgs = [t.s1Ai, t.s2Ai, t.s3Ai, t.s4Ai, t.s5Ai, t.s6Ai];

  const update = useCallback((patch) => setData((d) => ({ ...d, ...patch })), []);

  function startFlow() { startRef.current = Date.now(); setPhase("flow"); setStep(0); }
  function next() {
    if (step < 5) setStep((s) => s + 1);
    else { setElapsed(Math.min(599, Math.floor((Date.now() - (startRef.current || Date.now())) / 1000))); setPhase("done"); }
  }
  function back() { if (step > 0) setStep((s) => s - 1); }
  function restart() { setData({}); setStep(0); setPhase("intro"); }

  const StepComp = [Step1Concert, Step2Account, Step3FanClub, Step4Queue, Step5Seats, Step6Payment][step];
  const stepProps = { t, lang, data, update, onNext: next, onBack: back };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">T</div>
          <div>
            <div className="brand-name">Ticke<span>Mate</span></div>
          </div>
        </div>

        {phase === "flow" && step > 0 && (
          <button className="topbar-back" onClick={back} title={t.back}><Icon name="back" size={18} /></button>
        )}

        {phase === "intro"
          ? <div className="topbar-tag">{t.appTag}</div>
          : <StepProgress steps={stepLabels} current={phase === "done" ? 6 : step} />}

        <div className="topbar-spacer" />
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </header>

      {phase === "intro" && (
        <main className="intro-main">
          <Intro t={t} onStart={startFlow} />
        </main>
      )}

      {phase === "flow" && (
        <main className="main">
          <Copilot t={t} message={aiMsgs[step]} msgKey={lang + "-" + step} />
          <section className="stage">
            <StepComp key={step} {...stepProps} />
          </section>
        </main>
      )}

      {phase === "done" && (
        <main className="done-main">
          <CompletionScreen t={t} lang={lang} data={data} onRestart={restart} elapsed={elapsed} />
        </main>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
