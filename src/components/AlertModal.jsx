import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleExclamation, faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";

const ALERT_STYLES = {
    success: { icon: faCircleCheck, iconClass: "text-secondary", title: "Success" },
    error: { icon: faCircleExclamation, iconClass: "text-accent", title: "Something went wrong" },
    warning: { icon: faTriangleExclamation, iconClass: "text-[#B7791F]", title: "Please review" },
};

function AlertModal({ type = "error", title, message, onClose, onConfirm, actionLabel = "Close", confirmLabel = "Confirm" }) {
    if (!message) return null;
    const style = ALERT_STYLES[type] || ALERT_STYLES.error;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-70 bg-black/50" role="presentation" onClick={onClose}>
            <div className="w-full max-w-md p-6 shadow-xl rounded-2xl bg-surface" role="alertdialog" aria-modal="true" aria-labelledby="alert-modal-title" aria-describedby="alert-modal-message" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-start gap-4">
                    <FontAwesomeIcon icon={style.icon} className={`mt-0.5 text-2xl ${style.iconClass}`} aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                        <h2 id="alert-modal-title" className="text-lg font-bold text-ink">{title || style.title}</h2>
                        <p id="alert-modal-message" className="mt-2 text-sm leading-6 wrap-break-word text-ink-soft">{message}</p>
                    </div>
                    <button type="button" onClick={onClose} className="flex items-center justify-center rounded-lg h-9 w-9 shrink-0 text-ink-muted hover:bg-bg-alt hover:text-ink" aria-label="Close alert">
                        <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
                    </button>
                </div>
                {onConfirm ? (
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-sm font-semibold border rounded-xl border-border text-ink hover:bg-bg-alt">Cancel</button>
                        <button type="button" onClick={onConfirm} className="flex-1 px-4 py-3 text-sm font-semibold text-white rounded-xl bg-accent hover:bg-accent-hover">{confirmLabel}</button>
                    </div>
                ) : <button type="button" onClick={onClose} className="w-full px-4 py-3 mt-6 text-sm font-semibold text-white rounded-xl bg-primary hover:bg-primary-hover">{actionLabel}</button>}
            </div>
        </div>
    );
}

export default AlertModal;
