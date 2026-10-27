import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useAuth } from "../../app/AuthProvider.jsx";
import Toast from "../../components/ui/Toast.jsx";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [timezone, setTimezone] = useState(user?.timezone ?? "UTC");
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(user?.preferences?.weeklyGoalMinutes ?? 600);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setTimezone(user?.timezone ?? "UTC");
    setWeeklyGoalMinutes(user?.preferences?.weeklyGoalMinutes ?? 600);
  }, [user]);

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      await updateUser({ name, timezone, preferences: { weeklyGoalMinutes: Number(weeklyGoalMinutes) } });
      setNotice("Your preferences are saved.");
    } catch (failure) { setNotice(failure.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="workspace-page">
      <div className="page-heading"><div><p className="page-eyebrow">YOUR ACCOUNT</p><h2>Settings</h2><p>Set a weekly goal and tune your profile details.</p></div></div>
      <section className="panel settings-panel"><form className="editor-form settings-form" onSubmit={save}>
        <div className="settings-section-heading"><h3>Profile</h3><p>Your account email is used for sign-in.</p></div>
        <label>Full name<input autoComplete="name" maxLength={60} minLength={2} onChange={(event) => setName(event.target.value)} required value={name} /></label>
        <label>Email address<input disabled type="email" value={user?.email ?? ""} /></label>
        <label>Timezone<input maxLength={100} onChange={(event) => setTimezone(event.target.value)} required value={timezone} /></label>
        <div className="settings-divider" />
        <div className="settings-section-heading"><h3>Study preferences</h3><p>Weekly goal is measured in focused study minutes.</p></div>
        <label>Weekly study goal<div className="number-suffix"><input max={10080} min={0} onChange={(event) => setWeeklyGoalMinutes(event.target.value)} type="number" value={weeklyGoalMinutes} /><span>minutes</span></div></label>
        {notice && <Toast onDismiss={() => setNotice("")} variant={notice.includes("saved") ? "success" : "error"}>{notice}</Toast>}
        <div className="settings-save"><button className="button button-primary" disabled={busy} type="submit"><Save aria-hidden="true" />{busy ? "Saving..." : "Save preferences"}</button></div>
      </form></section>
    </div>
  );
}