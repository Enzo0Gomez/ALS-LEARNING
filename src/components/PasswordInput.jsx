import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

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
                <FontAwesomeIcon icon={visible ? faEyeSlash : faEye} fixedWidth aria-hidden="true" />
            </button>
        </div>
    );
}

export default PasswordInput;
