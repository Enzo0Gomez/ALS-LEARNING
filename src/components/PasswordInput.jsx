import { useState } from "react";

function EyeIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            aria-hidden="true"
        >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            aria-hidden="true"
        >
            <path d="M17.94 17.94A10.9 10.9 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

// Text input with a show/hide toggle, styled to match the rest of the
// form inputs across Login, Signup, Forgot Password, and Admin screens.
function PasswordInput({
    id,
    name,
    value,
    onChange,
    placeholder,
    required,
    minLength,
    autoComplete,
    className,
}) {
    const [visible, setVisible] = useState(false);

    const baseClassName =
        className ||
        "w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft";

    return (
        <div className="relative">
            <input
                id={id}
                name={name}
                type={visible ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                minLength={minLength}
                autoComplete={autoComplete}
                className={`${baseClassName} pr-12`}
            />

            <button
                type="button"
                onClick={() => setVisible((prev) => !prev)}
                tabIndex={-1}
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                className="absolute inset-y-0 right-0 flex items-center px-4 transition text-ink-muted hover:text-ink"
            >
                {visible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
        </div>
    );
}

export default PasswordInput;
