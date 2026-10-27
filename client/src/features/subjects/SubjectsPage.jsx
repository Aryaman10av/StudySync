import { useState } from "react";
import { Archive, ArchiveRestore, BookOpenCheck, Edit2, Plus, X } from "lucide-react";
import { subjectsApi } from "../../api/data.api.js";
import { EmptyState, ErrorState, LoadingState } from "../../components/feedback/DataState.jsx";
import Dialog from "../../components/ui/Dialog.jsx";
import Toast from "../../components/ui/Toast.jsx";
import useResource from "../../hooks/useResource.js";

export default function SubjectsPage() {
  const { data: subjects = [], loading, error, refresh } = useResource(() => subjectsApi.list({ includeArchived: true }), "subjects", []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  function openCreate() { setEditing(null); setDialogOpen(true); }
  function openEdit(subject) { setEditing(subject); setDialogOpen(true); }

  async function saveSubject(event) {
    event.preventDefault();
    setBusy(true);
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (editing) await subjectsApi.update(editing._id, form);
      else await subjectsApi.create(form);
      setDialogOpen(false);
      setNotice(editing ? "Subject updated." : "Subject created.");
      refresh();
    } catch (failure) {
      setNotice(failure.message);
    } finally { setBusy(false); }
  }

  async function toggleArchive(subject) {
    try {
      await subjectsApi.update(subject._id, { archived: !subject.archived });
      setNotice(subject.archived ? "Subject restored." : "Subject archived.");
      refresh();
    } catch (failure) { setNotice(failure.message); }
  }

  return (
    <div className="workspace-page">
      <div className="page-heading"><div><p className="page-eyebrow">YOUR COURSE LIST</p><h2>Subjects</h2><p>Keep classes and coursework grouped in one place.</p></div><button className="button button-primary" onClick={openCreate} type="button"><Plus aria-hidden="true" /> Add subject</button></div>
      {notice && <Toast onDismiss={() => setNotice("")} variant="info">{notice}</Toast>}
      {loading && <LoadingState label="Loading subjects" />}
      {!loading && error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && subjects.length === 0 && <EmptyState action={<button className="button button-primary" onClick={openCreate} type="button"><Plus aria-hidden="true" /> Add your first subject</button>} description="Subjects make it easier to organize tasks and see your workload." title="No subjects yet" />}
      {!loading && !error && subjects.length > 0 && <div className="subject-grid">
        {subjects.map((subject) => (
          <article className={`subject-card${subject.archived ? " is-archived" : ""}`} key={subject._id}>
            <div className="subject-card-top"><span className="subject-color" style={{ backgroundColor: subject.color }} /><span className="subject-kicker">{subject.archived ? "ARCHIVED" : "SUBJECT"}</span><div className="subject-actions"><button aria-label={`Edit ${subject.name}`} onClick={() => openEdit(subject)} type="button"><Edit2 aria-hidden="true" /></button><button aria-label={subject.archived ? `Restore ${subject.name}` : `Archive ${subject.name}`} onClick={() => toggleArchive(subject)} type="button">{subject.archived ? <ArchiveRestore aria-hidden="true" /> : <Archive aria-hidden="true" />}</button></div></div>
            <h3>{subject.name}</h3>
            <p>{subject.description || "No description added."}</p>
            <span className="subject-date">Added {new Date(subject.createdAt).toLocaleDateString()}</span>
          </article>
        ))}
      </div>}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "Edit subject" : "Add a subject"}>
        <form className="editor-form" key={editing?._id ?? "new-subject"} onSubmit={saveSubject}>
          <label>Subject name<input autoFocus maxLength={50} name="name" defaultValue={editing?.name ?? ""} placeholder="e.g. Biology" required /></label>
          <label>Color<span className="color-input-wrap"><input aria-label="Subject color" name="color" type="color" defaultValue={editing?.color ?? "#345bdb"} /></span></label>
          <label>Description <span className="optional-label">Optional</span><textarea maxLength={300} name="description" defaultValue={editing?.description ?? ""} rows={3} placeholder="A short note about this class" /></label>
          <div className="dialog-actions"><button className="button button-outline" onClick={() => setDialogOpen(false)} type="button"><X aria-hidden="true" /> Cancel</button><button className="button button-primary" disabled={busy} type="submit">{busy ? "Saving..." : editing ? "Save changes" : "Create subject"}</button></div>
        </form>
      </Dialog>
    </div>
  );
}