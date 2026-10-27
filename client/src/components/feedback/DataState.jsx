import { AlertCircle, RefreshCw } from "lucide-react";

export function LoadingState({ label = "Loading" }) {
  return <div aria-label={label} className="data-loading" role="status"><span /><span /><span /></div>;
}

export function EmptyState({ action, description, title }) {
  return <div className="empty-state"><span className="empty-mark">+</span><h2>{title}</h2><p>{description}</p>{action}</div>;
}

export function ErrorState({ message, onRetry }) {
  return <div className="error-state" role="alert"><AlertCircle aria-hidden="true" /><span>{message}</span>{onRetry && <button aria-label="Retry" onClick={onRetry} type="button"><RefreshCw aria-hidden="true" /></button>}</div>;
}