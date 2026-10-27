import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, Circle, Edit2, Plus, Search, Trash2, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { subjectsApi, tasksApi } from "../../api/data.api.js";
import { EmptyState, ErrorState, LoadingState } from "../../components/feedback/DataState.jsx";
import Dialog from "../../components/ui/Dialog.jsx";
import Toast from "../../components/ui/Toast.jsx";
import useResource from "../../hooks/useResource.js";

function localDateTime(value) {
  if (!value) return "";
  const date = new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000);
  return date.toISOString().slice(0, 16);
}

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("dueAt");
  const [order, setOrder] = useState("asc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const taskFilters = useMemo(() => ({ status, priority, q: search.trim(), sort, order, page, limit: 20 }), [status, priority, search, sort, order, page]);
  const resourceKey = JSON.stringify(taskFilters);
  const { data: result, loading, error, refresh } = useResource(() => tasksApi.list(taskFilters), resourceKey, { data: [], meta: { total: 0 } });
  const { data: subjects = [] } = useResource(() => subjectsApi.list(), "active-subjects", []);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      setDialogOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  function openCreate() { setEditing(null); setDialogOpen(true); }
  function openEdit(task) { setEditing(task); setDialogOpen(true); }

  async function saveTask(event) {
    event.preventDefault();
    setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const payload = {
      ...values,
      subjectId: values.subjectId || null,
      dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : null,
      estimatedMinutes: values.estimatedMinutes ? Number(values.estimatedMinutes) : null,
    };
    try {
      if (editing) await tasksApi.update(editing._id, payload);
      else await tasksApi.create(payload);
      setDialogOpen(false);
      setNotice(editing ? "Task updated." : "Task created.");
      refresh();
    } catch (failure) { setNotice(failure.message); }
    finally { setBusy(false); }
  }

  async function changeStatus(task) {
    const next = task.status === "completed" ? "todo" : task.status === "todo" ? "in_progress" : "completed";
    try { await tasksApi.update(task._id, { status: next }); refresh(); }
    catch (failure) { setNotice(failure.message); }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    try { await tasksApi.remove(task._id); setNotice("Task deleted."); refresh(); }
    catch (failure) { setNotice(failure.message); }
  }

  const tasks = result?.data ?? [];

  return (
    <div className="workspace-page">
      <div className="page-heading"><div><p className="page-eyebrow">YOUR WORKLOAD</p><h2>Tasks</h2><p>Prioritize the next thing and keep deadlines visible.</p></div><button className="button button-primary" onClick={openCreate} type="button"><Plus aria-hidden="true" /> Add task</button></div>
      {notice && <Toast onDismiss={() => setNotice("")} variant="info">{notice}</Toast>}
      <section aria-label="Task filters" className="filter-bar">
        <label className="search-box"><Search aria-hidden="true" /><input aria-label="Search tasks" onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search tasks" value={search} /></label>
        <select aria-label="Filter by status" onChange={(event) => { setStatus(event.target.value); setPage(1); }} value={status}><option value="">All statuses</option><option value="todo">To do</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select>
        <select aria-label="Filter by priority" onChange={(event) => { setPriority(event.target.value); setPage(1); }} value={priority}><option value="">All priorities</option><option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option></select>
        <select aria-label="Sort tasks" onChange={(event) => { setSort(event.target.value); setPage(1); }} value={sort}><option value="dueAt">Due date</option><option value="createdAt">Date added</option><option value="priority">Priority</option></select>
        <button aria-label={`Sort ${order === "asc" ? "descending" : "ascending"}`} className="sort-button" onClick={() => setOrder((value) => value === "asc" ? "desc" : "asc")} type="button">{order === "asc" ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />}</button>
        {(status || priority || search) && <button className="clear-filters" onClick={() => { setStatus(""); setPriority(""); setSearch(""); setPage(1); }} type="button">Clear filters</button>}
      </section>
      {loading && <LoadingState label="Loading tasks" />}
      {!loading && error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && tasks.length === 0 && <EmptyState action={<button className="button button-primary" onClick={openCreate} type="button"><Plus aria-hidden="true" /> Add task</button>} description={search || status || priority ? "Try adjusting your filters." : "Capture a deadline, reading block, or exam plan."} title={search || status || priority ? "No matching tasks" : "No tasks yet"} />}
      {!loading && !error && tasks.length > 0 && <>
        <div className="task-list-header"><span>{result.meta?.total ?? tasks.length} tasks</span></div>
        <div className="task-list">{tasks.map((task) => (
          <article className={`task-row${task.status === "completed" ? " is-complete" : ""}`} key={task._id}>
            <button aria-label={task.status === "completed" ? `Reopen ${task.title}` : `Update status for ${task.title}`} className={`task-check task-${task.status}`} onClick={() => changeStatus(task)} type="button">{task.status === "completed" ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}</button>
            <div className="task-copy"><h3>{task.title}</h3><p>{task.subject?.name ?? "No subject"}{task.dueAt ? ` · Due ${new Date(task.dueAt).toLocaleString()}` : " · No due date"}</p>{task.description && <small>{task.description}</small>}</div>
            <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span><span className="task-type">{task.type.replace("_", " ")}</span>
            <div className="task-actions"><button aria-label={`Edit ${task.title}`} onClick={() => openEdit(task)} type="button"><Edit2 aria-hidden="true" /></button><button aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task)} type="button"><Trash2 aria-hidden="true" /></button></div>
          </article>
        ))}</div>
        {result.meta?.total > 20 && <div className="pagination"><button className="button button-outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} type="button">Previous</button><span>Page {page} of {Math.ceil(result.meta.total / 20)}</span><button className="button button-outline" disabled={page >= Math.ceil(result.meta.total / 20)} onClick={() => setPage((value) => value + 1)} type="button">Next</button></div>}
      </>}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "Edit task" : "Add a task"}>
        <form className="editor-form task-editor" key={editing?._id ?? "new-task"} onSubmit={saveTask}>
          <label>Title<input autoFocus maxLength={120} name="title" defaultValue={editing?.title ?? ""} placeholder="e.g. Biology reading response" required /></label>
          <label>Subject<select name="subjectId" defaultValue={editing?.subject?._id ?? editing?.subjectId ?? ""}><option value="">No subject</option>{subjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.name}</option>)}</select></label>
          <div className="form-two-col"><label>Type<select name="type" defaultValue={editing?.type ?? "assignment"}><option value="assignment">Assignment</option><option value="exam">Exam</option><option value="revision">Revision</option><option value="other">Other</option></select></label><label>Priority<select name="priority" defaultValue={editing?.priority ?? "medium"}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label></div>
          <div className="form-two-col"><label>Due date<input name="dueAt" type="datetime-local" defaultValue={localDateTime(editing?.dueAt)} /></label><label>Estimate (minutes)<input max="10080" min="1" name="estimatedMinutes" type="number" defaultValue={editing?.estimatedMinutes ?? ""} /></label></div>
          <label>Description <span className="optional-label">Optional</span><textarea maxLength={2000} name="description" rows={3} defaultValue={editing?.description ?? ""} placeholder="Add details or notes" /></label>
          <div className="dialog-actions"><button className="button button-outline" onClick={() => setDialogOpen(false)} type="button"><X aria-hidden="true" /> Cancel</button><button className="button button-primary" disabled={busy} type="submit">{busy ? "Saving..." : editing ? "Save changes" : "Create task"}</button></div>
        </form>
      </Dialog>
    </div>
  );
}