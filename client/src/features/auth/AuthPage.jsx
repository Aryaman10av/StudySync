import { useState } from "react";
import { ArrowLeft, BookOpenCheck } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import FormField from "../../components/ui/FormField.jsx";
import Toast from "../../components/ui/Toast.jsx";
import { useAuth } from "../../app/AuthProvider.jsx";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (user) return <Navigate to="/app/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice("");
    setSubmitting(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (isRegister) await register({ name: values.name, email: values.email, password: values.password });
      else await login({ email: values.email, password: values.password });
      navigate(location.state?.from ?? "/app/dashboard", { replace: true });
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <header className="auth-topbar">
        <Link aria-label="StudySync home" className="brand" to="/">
          <span className="brand-mark"><BookOpenCheck aria-hidden="true" /></span>
          <span>studysync</span>
        </Link>
        <Link className="text-link" to="/"><ArrowLeft aria-hidden="true" size={15} /> Back to home</Link>
      </header>
      <div className="auth-main">
        <aside aria-label="StudySync encouragement" className="auth-story">
          <span className="auth-story-kicker">A little more room to think</span>
          <div>
            <blockquote>“You don’t have to do it all at once. Just begin with what’s next.”</blockquote>
            <cite>Your study space, ready when you are</cite>
          </div>
        </aside>
        <section aria-labelledby="auth-title" className="auth-form-panel">
          <span className="auth-kicker">{isRegister ? "Start with a clean slate" : "Welcome back"}</span>
          <h1 id="auth-title">{isRegister ? "Create your account" : "Sign in to StudySync"}</h1>
          <p className="auth-subtitle">
            {isRegister ? "A clearer week starts with one small step." : "Pick up your plan right where you left it."}
          </p>
          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <FormField autoComplete="name" id="name" label="Your name" name="name" placeholder="Alex Morgan" />
            )}
            <FormField autoComplete="email" id="email" label="Email address" name="email" placeholder="you@example.com" type="email" />
            <FormField
              autoComplete={isRegister ? "new-password" : "current-password"}
              id="password"
              label="Password"
              minLength={8}
              name="password"
              onTogglePassword={() => setPasswordVisible((visible) => !visible)}
              placeholder={isRegister ? "At least 8 characters" : "Enter your password"}
              type={passwordVisible ? "text" : "password"}
            />
            {notice && <Toast onDismiss={() => setNotice("")} variant="error">{notice}</Toast>}
            <button className="button button-primary auth-submit" disabled={submitting} type="submit">
              {submitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
            </button>
          </form>
          <p className="auth-switch">
            {isRegister ? "Already have an account? " : "New to StudySync? "}
            <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link>
          </p>
          <p className="auth-legal">Your account is protected with a secure, HTTP-only session.</p>
        </section>
      </div>
    </main>
  );
}