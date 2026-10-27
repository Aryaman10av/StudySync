import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { tasksApi } from "../../api/data.api.js";
import { EmptyState, ErrorState, LoadingState } from "../../components/feedback/DataState.jsx";
import useResource from "../../hooks/useResource.js";

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const range = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    const end = new Date(start);
    end.setDate(start.getDate() + 41);
    end.setHours(23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString(), start };
  }, [month]);
  const { data: result, loading, error, refresh } = useResource(() => tasksApi.list({ from: range.from, to: range.to, limit: 100, sort: "dueAt" }), `${range.from}:${range.to}`, { data: [] });
  const tasks = result?.data ?? [];
  const gridDays = useMemo(() => Array.from({ length: 42 }, (_, index) => {
    const date = new Date(range.start);
    date.setDate(range.start.getDate() + index);
    return date;
  }), [range.start]);
  const selectedTasks = tasks.filter((task) => task.dueAt && dateKey(new Date(task.dueAt)) === selectedDate);
  const selectedLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  function changeMonth(offset) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <div className="workspace-page">
      <div className="page-heading"><div><p className="page-eyebrow">DEADLINES IN CONTEXT</p><h2>Calendar</h2><p>Choose a day to see its tasks and exams.</p></div><div className="calendar-legend"><span><i className="legend-dot dot-blue" /> Task</span><span><i className="legend-dot dot-coral" /> Exam</span></div></div>
      {loading && <LoadingState label="Loading calendar" />}
      {!loading && error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && <div className="calendar-layout">
        <section className="panel calendar-panel" aria-label="Monthly calendar">
          <div className="calendar-toolbar"><button aria-label="Previous month" onClick={() => changeMonth(-1)} type="button"><ChevronLeft aria-hidden="true" /></button><h3>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h3><button aria-label="Next month" onClick={() => changeMonth(1)} type="button"><ChevronRight aria-hidden="true" /></button></div>
          <div className="calendar-grid calendar-weekdays" aria-hidden="true">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid">{gridDays.map((date) => {
            const key = dateKey(date);
            const dayTasks = tasks.filter((task) => task.dueAt && dateKey(new Date(task.dueAt)) === key);
            return <button aria-label={`${date.toLocaleDateString()}, ${dayTasks.length} tasks`} aria-pressed={selectedDate === key} className={`calendar-day${date.getMonth() !== month.getMonth() ? " is-outside" : ""}${selectedDate === key ? " is-selected" : ""}${key === dateKey(new Date()) ? " is-today" : ""}`} key={key} onClick={() => setSelectedDate(key)} type="button"><span>{date.getDate()}</span>{dayTasks.length > 0 && <span className="calendar-dots">{dayTasks.slice(0, 3).map((task) => <i className={task.type === "exam" ? "dot-coral" : "dot-blue"} key={task._id} />)}</span>}</button>;
          })}</div>
        </section>
        <aside className="panel agenda-panel"><p className="page-eyebrow">DAY AGENDA</p><h3>{selectedLabel}</h3>{selectedTasks.length ? <ul className="agenda-list">{selectedTasks.map((task) => <li key={task._id}><span className={`priority-mark priority-${task.priority}`} /><div><strong>{task.title}</strong><small>{task.subject?.name ?? "No subject"} · {task.type}</small></div></li>)}</ul> : <EmptyState description="No tasks or exams are scheduled for this day." title="Clear day" />}</aside>
      </div>}
    </div>
  );
}