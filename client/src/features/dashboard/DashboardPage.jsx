import { ArrowRight, BookOpenCheck, CalendarClock, Clock3, Plus, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardApi } from "../../api/data.api.js";
import { EmptyState, ErrorState, LoadingState } from "../../components/feedback/DataState.jsx";
import useResource from "../../hooks/useResource.js";

async function loadDashboard() {
  const [summary, studyTime] = await Promise.all([dashboardApi.summary(), dashboardApi.studyTime()]);
  return { summary, days: studyTime.days };
}

function formatDue(value) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date(value));
}

export default function DashboardPage() {
  const { data, loading, error, refresh } = useResource(loadDashboard, "dashboard");
  const summary = data?.summary;

  return (
    <div className="workspace-page">
      <div className="page-heading dashboard-heading">
        <div><p className="page-eyebrow">YOUR WEEK AT A GLANCE</p><h2>{summary?.user?.name ? `Good to see you, ${summary.user.name.split(" ")[0]}.` : "Your study overview"}</h2><p>Keep the next step clear, then let the rest follow.</p></div>
        <div className="page-actions"><Link className="button button-outline" to="/app/subjects"><BookOpenCheck aria-hidden="true" /> Add subject</Link><Link className="button button-primary" to="/app/tasks?new=1"><Plus aria-hidden="true" /> Add task</Link></div>
      </div>
      {loading && <LoadingState label="Loading dashboard" />}
      {!loading && error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && summary && (
        <>
          <section aria-label="Study summary" className="metric-grid">
            <article className="metric-card"><span className="metric-icon icon-coral"><CalendarClock aria-hidden="true" /></span><span className="metric-label">Due this week</span><strong>{summary.dueSoon}</strong><small>Upcoming tasks and exams</small></article>
            <article className="metric-card"><span className="metric-icon icon-blue"><BookOpenCheck aria-hidden="true" /></span><span className="metric-label">Completed tasks</span><strong>{summary.completedTasks}</strong><small>All-time completed work</small></article>
            <article className="metric-card"><span className="metric-icon icon-green"><Clock3 aria-hidden="true" /></span><span className="metric-label">Focus this week</span><strong>{summary.focusMinutesThisWeek}<small> min</small></strong><small>Minutes spent in sessions</small></article>
            <article className="metric-card"><span className="metric-icon icon-lime"><Target aria-hidden="true" /></span><span className="metric-label">Weekly goal</span><strong>{summary.weeklyGoalMinutes ? Math.min(100, Math.round(summary.focusMinutesThisWeek / summary.weeklyGoalMinutes * 100)) : 0}<small>%</small></strong><div className="goal-track"><span style={{ width: `${summary.weeklyGoalMinutes ? Math.min(100, summary.focusMinutesThisWeek / summary.weeklyGoalMinutes * 100) : 0}%` }} /></div></article>
          </section>
          <div className="dashboard-grid">
            <section className="panel chart-panel">
              <div className="panel-heading"><div><h3>Study rhythm</h3><p>Focus minutes, Monday to Sunday (UTC)</p></div><Link aria-label="View study history" className="icon-link" to="/app/sessions"><ArrowRight aria-hidden="true" /></Link></div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.days} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#e7ebe7" strokeDasharray="3 4" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(`${value}T00:00:00Z`).toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" })} axisLine={false} tickLine={false} tick={{ fill: "#718087", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#718087", fontSize: 10 }} />
                    <Tooltip formatter={(value) => [`${value} min`, "Focus"]} labelFormatter={(value) => formatDue(`${value}T00:00:00Z`)} />
                    <Bar dataKey="minutes" fill="#345bdb" radius={[4, 4, 0, 0]} maxBarSize={38} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section className="panel upcoming-panel">
              <div className="panel-heading"><div><h3>Coming up</h3><p>Next seven days</p></div><Link className="panel-link" to="/app/tasks">All tasks <ArrowRight aria-hidden="true" /></Link></div>
              {summary.upcomingTasks.length ? <ul className="upcoming-list">{summary.upcomingTasks.map((task) => (
                <li key={task._id}><span className={`priority-mark priority-${task.priority}`} /><div className="upcoming-main"><strong>{task.title}</strong><small>{task.subjectId?.name ?? "No subject"} · {formatDue(task.dueAt)}</small></div><span className="type-label">{task.type}</span></li>
              ))}</ul> : <EmptyState action={<Link className="text-action" to="/app/tasks?new=1">Add a task <ArrowRight aria-hidden="true" /></Link>} description="Add a deadline and it will appear here." title="Nothing due soon" />}
            </section>
            <section className="panel recent-panel">
              <div className="panel-heading"><div><h3>Recent study sessions</h3><p>Your latest focused work</p></div><Link className="panel-link" to="/app/sessions">History <ArrowRight aria-hidden="true" /></Link></div>
              {summary.recentSessions.length ? <ul className="session-list">{summary.recentSessions.map((session) => (
                <li key={session._id}><span className="session-dot"><Clock3 aria-hidden="true" /></span><div className="upcoming-main"><strong>{session.subjectId?.name ?? "Independent study"}</strong><small>{formatDue(session.startedAt)}{session.taskId?.title ? ` · ${session.taskId.title}` : ""}</small></div><span className="session-duration">{session.durationMinutes} min</span></li>
              ))}</ul> : <EmptyState action={<Link className="text-action" to="/app/focus">Start a focus session <ArrowRight aria-hidden="true" /></Link>} description="Finished sessions will show up here." title="No sessions yet" />}
            </section>
            <section className="focus-prompt"><div><span className="prompt-icon"><Clock3 aria-hidden="true" /></span><h3>Ready for a focused block?</h3><p>Choose one task and give it your full attention.</p></div><Link className="button button-light" to="/app/focus">Start focus <ArrowRight aria-hidden="true" /></Link></section>
          </div>
        </>
      )}
    </div>
  );
}