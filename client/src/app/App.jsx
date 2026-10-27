import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../components/layout/AppShell.jsx";
import AuthPage from "../features/auth/AuthPage.jsx";
import CalendarPage from "../features/calendar/CalendarPage.jsx";
import DashboardPage from "../features/dashboard/DashboardPage.jsx";
import FocusPage from "../features/focus/FocusPage.jsx";
import LandingPage from "../features/landing/LandingPage.jsx";
import SessionsPage from "../features/sessions/SessionsPage.jsx";
import SettingsPage from "../features/settings/SettingsPage.jsx";
import SubjectsPage from "../features/subjects/SubjectsPage.jsx";
import TasksPage from "../features/tasks/TasksPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />} path="/app">
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route element={<DashboardPage />} path="dashboard" />
          <Route element={<SubjectsPage />} path="subjects" />
          <Route element={<TasksPage />} path="tasks" />
          <Route element={<CalendarPage />} path="calendar" />
          <Route element={<FocusPage />} path="focus" />
          <Route element={<SessionsPage />} path="sessions" />
          <Route element={<SettingsPage />} path="settings" />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}