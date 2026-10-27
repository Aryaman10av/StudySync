import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Dialog({ children, onClose, open, title }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog aria-labelledby="dialog-title" className="dialog" onClose={onClose} ref={dialogRef}>
      <div className="dialog-heading">
        <h2 id="dialog-title">{title}</h2>
        <button aria-label="Close dialog" className="dialog-close" onClick={onClose} type="button"><X aria-hidden="true" /></button>
      </div>
      <div className="dialog-body">{children}</div>
    </dialog>
  );
}