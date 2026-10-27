import { Eye, EyeOff } from "lucide-react";

export default function FormField({
  autoComplete,
  id,
  label,
  minLength,
  name,
  onTogglePassword,
  placeholder,
  required = true,
  type = "text",
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="field-input-wrap">
        <input
          autoComplete={autoComplete}
          className={onTogglePassword ? "has-toggle" : undefined}
          id={id}
          minLength={minLength}
          name={name}
          placeholder={placeholder}
          required={required}
          type={type}
        />
        {onTogglePassword && (
          <button
            aria-label={type === "password" ? "Show password" : "Hide password"}
            className="password-toggle"
            onClick={onTogglePassword}
            type="button"
          >
            {type === "password" ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  );
}