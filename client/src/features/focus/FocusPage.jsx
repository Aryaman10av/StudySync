import { useEffect, useRef, useState } from "react";
import { Check, Pause, Play, RotateCcw, Square } from "lucide-react";
import { sessionsApi, subjectsApi, tasksApi } from "../../api/data.api.js";
import { ErrorState, LoadingState } from "../../components/feedback/DataState.jsx";
import Toast from "../../components/ui/Toast.jsx";
import useResource from "../../hooks/useResource.js";

const STORAGE_KEY = "studysync.focus.v1";
const DEFAULT_SECONDS = 25 * 60;

function readTimer() {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null"); }
  catch { return null; }
}

function displayTime(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function FocusPage() {
  const [timer, setTimer] = useState(readTimer);
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [remaining, setRemaining] = useState(DEFAULT_SECONDS * 1000);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const finishLock = useRef(false);
  const { data: choices, loading, error, refresh } = useResource(async () => {
    const [subjects, tasks] = await Promise.all([subjectsApi.list(), tasksApi.list({ status: "todo", limit: 100 })]);
    return { subjects, tasks: tasks.data };
  }, "focus-choices", { subjects: [], tasks: [] });
  const subjects = choices?.subjects ?? [];
  const tasks = choices?.tasks ?? [];

  useEffect(() => {
    if (timer) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(timer));
    else sessionStorage.removeItem(STORAGE_KEY);
  }, [timer]);

  useEffect(() => {
    if (!timer) { setRemaining(durationMinutes * 60 * 1000); return undefined; }
    const update = () => {
      const current = timer.status === "running" ? timer.deadlineMs - Date.now() : timer.remainingMs;
      setRemaining(Math.max(0, current));
    };
    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [timer, durationMinutes]);

  useEffect(() => {
    if (timer?.status === "running" && remaining <= 0) {
      const completedAt = Date.now();
      setTimer((current) => current && current.status === "running" ? {
        ...current,
        status: "finished",
        remainingMs: 0,
        activeElapsedMs: current.activeElapsedMs + Math.max(0, completedAt - current.resumedAt),
      } : current);
      setNotice("Focus time complete. Save your session when you’re ready.");
    }
  }, [remaining, timer]);

  function startTimer() {
    const now = Date.now();
    const total = durationMinutes * 60 * 1000;
    setTimer({ status: "running", durationMs: total, startedAt: new Date(now).toISOString(), deadlineMs: now + total, remainingMs: total, activeElapsedMs: 0, resumedAt: now, subjectId: selectedSubject || null, taskId: selectedTask || null });
  }

  function pauseTimer() {
    if (!timer || timer.status !== "running") return;
    const now = Date.now();
    setTimer({ ...timer, status: "paused", remainingMs: Math.max(0, timer.deadlineMs - now), activeElapsedMs: timer.activeElapsedMs + (now - timer.resumedAt) });
  }

  function resumeTimer() {
    if (!timer || timer.status !== "paused") return;
    const now = Date.now();
    setTimer({ ...timer, status: "running", deadlineMs: now + timer.remainingMs, resumedAt: now });
  }

  function resetTimer() {
    if (timer && !window.confirm("Discard this focus session? It will not be saved.")) return;
    setTimer(null);
    setNotice("");
  }

  async function finishSession() {
    if (!timer || finishLock.current) return;
    finishLock.current = true;
    setBusy(true);
    const now = Date.now();
    const activeElapsed = timer.activeElapsedMs + (timer.status === "running" ? Math.max(0, now - timer.resumedAt) : 0);
    const activeMinutes = Math.floor(activeElapsed / 60_000);
    if (activeMinutes < 1) {
      setNotice("Study for at least one focused minute before saving a session.");
      finishLock.current = false;
      setBusy(false);
      return;
    }
    try {
      await sessionsApi.create({ subjectId: timer.subjectId, taskId: timer.taskId, startedAt: timer.startedAt, endedAt: new Date(now).toISOString(), durationMinutes: activeMinutes, mode: "focus" });
      setTimer(null);
      setNotice(`Session saved: ${activeMinutes} focused minutes.`);
    } catch (failure) { setNotice(failure.message); }
    finally { finishLock.current = false; setBusy(false); }
  }

  const progress = timer ? Math.max(0, Math.min(1, remaining / timer.durationMs)) : 1;

  return (
    <div className="workspace-page">
      <div className="page-heading"><div><p className="page-eyebrow">A MOMENT FOR YOURSELF</p><h2>Focus</h2><p>Choose one task. Start when you’re ready.</p></div></div>
      {notice && <Toast onDismiss={() => setNotice("")} variant={notice.startsWith("Session saved") ? "success" : "error"}>{notice}</Toast>}
      {loading && <LoadingState label="Loading focus options" />}
      {!loading && error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && <div className="focus-layout">
        <section aria-label="Focus timer" className={`focus-timer-panel${timer?.status === "paused" ? " is-paused" : ""}`}>
          <div className="focus-orbit" style={{ "--timer-progress": `${progress * 100}%` }}><div className="focus-clock"><span className="timer-state">{timer ? timer.status === "paused" ? "PAUSED" : timer.status === "finished" ? "COMPLETE" : "IN FOCUS" : "READY WHEN YOU ARE"}</span><strong aria-live="off">{displayTime(timer ? remaining : durationMinutes * 60 * 1000)}</strong><span>minutes remaining</span></div></div>
          {!timer && <label className="duration-control">Session length<select onChange={(event) => setDurationMinutes(Number(event.target.value))} value={durationMinutes}>{[5, 10, 15, 25, 30, 45, 60, 90].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}</select></label>}
          <div className="timer-actions">
            {!timer && <button className="button button-primary" onClick={startTimer} type="button"><Play aria-hidden="true" /> Start focus</button>}
            {timer?.status === "running" && <button className="button button-primary" onClick={pauseTimer} type="button"><Pause aria-hidden="true" /> Pause</button>}
            {timer?.status === "paused" && <button className="button button-primary" onClick={resumeTimer} type="button"><Play aria-hidden="true" /> Resume</button>}
            {timer && <button className="button button-outline" disabled={busy} onClick={finishSession} type="button"><Check aria-hidden="true" /> {timer.status === "finished" ? "Save session" : "Finish & save"}</button>}
            {timer && <button aria-label="Reset focus timer" className="timer-reset" onClick={resetTimer} type="button"><RotateCcw aria-hidden="true" /></button>}
          </div>
          {timer && <p className="timer-refresh-note">Your active timer is saved in this browser tab and resumes after refresh.</p>}
        </section>
        <aside className="panel focus-details"><p className="page-eyebrow">MAKE IT YOURS</p><h3>What are you working on?</h3><p>Link your session to a subject or task to make your study history more useful.</p><label>Subject<select disabled={Boolean(timer)} onChange={(event) => setSelectedSubject(event.target.value)} value={selectedSubject}><option value="">Independent study</option>{subjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.name}</option>)}</select></label><label>Task<select disabled={Boolean(timer)} onChange={(event) => setSelectedTask(event.target.value)} value={selectedTask}><option value="">No task selected</option>{tasks.map((task) => <option key={task._id} value={task._id}>{task.title}</option>)}</select></label><div className="focus-tip"><Square aria-hidden="true" /><span>When you finish, your focus time is saved to your study history.</span></div></aside>
      </div>}
    </div>
  );
}