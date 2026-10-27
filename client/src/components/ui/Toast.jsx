import { CircleCheck, Info, X } from "lucide-react";

export default function Toast({ children, onDismiss, variant = "success" }) {
  const Icon = variant === "info" ? Info : CircleCheck;

  return (
    <div className={`toast toast-${variant}`} role={variant === "error" ? "alert" : "status"}>
      <Icon aria-hidden="true" />
      <span>{children}</span>
      {onDismiss && (
        <button aria-label="Dismiss message" className="toast-dismiss" onClick={onDismiss} type="button">
          <X aria-hidden="true" />
        </button>
      )}
    </div>
  );
}