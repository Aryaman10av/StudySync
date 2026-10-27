import { useMemo, useState } from "react";
import { Clock3, Trash2 } from "lucide-react";
import { sessionsApi } from "../../api/data.api.js";
import { EmptyState, ErrorState, LoadingState } from "../../components/feedback/DataState.jsx";
import Toast from "../../components/ui/Toast.jsx";
import useResource from "../../hooks/useResource.js";

export default function SessionsPage() {
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState("30");
  const [notice, setNotice] = useState("");
  const from = useMemo(() => period === "all" ? undefined : new Date(Date.now() - Number(period) * 24 * 60 * 60 * 1000).toISOString(), [period]);
  const key = `${page}:${period}`;
  const { data: result, loading, error, refresh } = useResource(() => sessionsApi.list({ from, page, limit: 20 }), key, { data: [], meta: { total: 0 } });
  const sessions = result?.data ?? [];
  const pageMinutes = sessions.reduce((total, session) => total + session.durationMinutes, 0);

  async function deleteSession(session) {
    if (!window.confirm("Delete this study session? Its time will be removed from your totals.")) return;
    try { await sessionsApi.remove(session._id); setNotice("Session deleted."); refresh(); }
    catch (failure) { setNotice(failure.message); }
  }

  return (
    <div className="workspace-page">
      <div className="page-heading"><div><p className="page-eyebrow">YOUR FOCUSED WORK</p><h2>Study history</h2><p>Sessions you completed, in one place.</p></div><label className="period-control">Show<select onChange={(event) => { setPeriod(event.target.value); setPage(1); }} value={period}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="all">All time</option></select></label></div>
      {notice && <Toast onDismiss={() => setNotice("")} variant="info">{notice}</Toast>}
      {loading && <LoadingState label="Loading study history" />}
      {!loading && error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && <>
        <div className="session-total-strip"><div><span>Sessions on this page</span><strong>{sessions.length}</strong></div><div><span>Focus time on this page</span><strong>{Math.floor(pageMinutes / 60)}h {pageMinutes % 60}m</strong></div><div><span>Total recorded sessions</span><strong>{result.meta?.total ?? 0}</strong></div></div>
        {sessions.length ? <div className="history-list">{sessions.map((session) => <article className="history-row" key={session._id}><span className="history-icon"><Clock3 aria-hidden="true" /></span><div className="history-main"><strong>{session.subjectId?.name ?? "Independent study"}</strong><p>{new Date(session.startedAt).toLocaleString()} · {session.mode === "focus" ? "Focus session" : "Manual session"}</p>{session.taskId?.title && <small>{session.taskId.title}</small>}{session.note && <small>{session.note}</small>}</div><strong className="history-duration">{session.durationMinutes} min</strong><button aria-label="Delete session" className="icon-button danger-hover" onClick={() => deleteSession(session)} type="button"><Trash2 aria-hidden="true" /></button></article>)}</div> : <EmptyState description="Completed focus blocks will appear here." title="No study sessions yet" />}
        {result.meta?.total > 20 && <div className="pagination"><button className="button button-outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} type="button">Previous</button><span>Page {page} of {Math.ceil(result.meta.total / 20)}</span><button className="button button-outline" disabled={page >= Math.ceil(result.meta.total / 20)} onClick={() => setPage((value) => value + 1)} type="button">Next</button></div>}
      </>}
    </div>
  );
}