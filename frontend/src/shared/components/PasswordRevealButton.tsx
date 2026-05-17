"use client";

import { useI18n } from "@/shared/i18n";

export default function PasswordRevealButton({
    revealed,
    setRevealed,
    disabled,
    className,
}: {
    revealed: boolean;
    setRevealed: (revealed: boolean) => void;
    disabled?: boolean;
    className?: string;
}) {
    const { t } = useI18n();

    function reveal() {
        if (!disabled) setRevealed(true);
    }

    function hide() {
        setRevealed(false);
    }

    return (
        <button
            type="button"
            className={className}
            disabled={disabled}
            aria-label={revealed ? t("auth.hidePassword") : t("auth.showPassword")}
            aria-pressed={revealed}
            onPointerDown={reveal}
            onPointerUp={hide}
            onPointerCancel={hide}
            onPointerLeave={hide}
            onBlur={hide}
            onKeyDown={(event) => {
                if (event.key === " " || event.key === "Enter") {
                    event.preventDefault();
                    reveal();
                }
            }}
            onKeyUp={(event) => {
                if (event.key === " " || event.key === "Enter") {
                    event.preventDefault();
                    hide();
                }
            }}
        >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                    d="M12 5.5c-4.2 0-7.4 2.5-9.3 6.5 1.9 4 5.1 6.5 9.3 6.5s7.4-2.5 9.3-6.5c-1.9-4-5.1-6.5-9.3-6.5Zm0 10.2A3.7 3.7 0 1 1 12 8.3a3.7 3.7 0 0 1 0 7.4Zm0-1.8a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8Z"
                    fill="currentColor"
                />
            </svg>
        </button>
    );
}
