"use client";

import { createPortal } from "react-dom";

import { Button } from "@/shared/components/ui";
import { useI18n } from "@/shared/i18n";

import type { SessionTimeoutReason } from "@/shared/hooks/useSessionTimeout";
import styles from "./SessionTimeoutModal.module.css";

type Props = {
    open: boolean;
    reason: SessionTimeoutReason;
    secondsLeft: number;
    onStayConnected: () => void;
    onSignOut: () => void;
};

export default function SessionTimeoutModal({ open, reason, secondsLeft, onStayConnected, onSignOut }: Props) {
    const { t } = useI18n();
    const title = reason === "jwt" ? t("session.jwtTitle") : t("session.idleTitle");
    const body = reason === "jwt" ? t("session.jwtBody") : t("session.idleBody");
    const countdownKey = secondsLeft === 1 ? "session.countdownOne" : "session.countdownMany";

    if (!open || typeof document === "undefined") return null;

    return createPortal(
        <div className={styles.backdrop} role="presentation" aria-hidden="true">
            <div
                className={styles.dialog}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="session-timeout-title"
                aria-describedby="session-timeout-desc"
            >
                <h2 id="session-timeout-title" className={styles.title}>
                    {title}
                </h2>
                <p id="session-timeout-desc" className={styles.body}>
                    {body}
                </p>
                <p className={styles.countdown} aria-live="polite">
                    {t(countdownKey, { seconds: secondsLeft })}
                </p>
                <div className={styles.actions}>
                    <Button type="button" variant="secondary" size="md" onClick={onSignOut}>
                        {t("session.signOut")}
                    </Button>
                    <Button type="button" variant="primary" size="md" onClick={onStayConnected}>
                        {t("session.staySignedIn")}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
