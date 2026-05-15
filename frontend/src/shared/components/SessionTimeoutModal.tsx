"use client";

import { createPortal } from "react-dom";

import { Button } from "@/shared/components/ui";

import type { SessionTimeoutReason } from "@/shared/hooks/useSessionTimeout";
import styles from "./SessionTimeoutModal.module.css";

type Props = {
    open: boolean;
    reason: SessionTimeoutReason;
    secondsLeft: number;
    onStayConnected: () => void;
    onSignOut: () => void;
};

function copyFor(reason: SessionTimeoutReason): { title: string; body: string } {
    if (reason === "jwt") {
        return {
            title: "Session ending soon",
            body: "Your access token is about to expire. You can stay signed in or sign out now. If you do nothing, you will be signed out automatically.",
        };
    }
    return {
        title: "You have been inactive",
        body: "For your security, you will be signed out after a period of inactivity. You can stay signed in or sign out now. If you do nothing, you will be signed out automatically.",
    };
}

export default function SessionTimeoutModal({ open, reason, secondsLeft, onStayConnected, onSignOut }: Props) {
    const { title, body } = copyFor(reason);

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
                    Signing out in {secondsLeft} second{secondsLeft === 1 ? "" : "s"}…
                </p>
                <div className={styles.actions}>
                    <Button type="button" variant="secondary" size="md" onClick={onSignOut}>
                        Sign out
                    </Button>
                    <Button type="button" variant="primary" size="md" onClick={onStayConnected}>
                        Stay signed in
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
