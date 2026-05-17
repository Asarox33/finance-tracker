"use client";

import { createPortal } from "react-dom";
import { useEffect, type ReactNode } from "react";

import { Button } from "@/shared/components/ui";
import { useI18n } from "@/shared/i18n";

import styles from "./ConfirmDialog.module.css";

export type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmVariant?: "primary" | "danger";
    loading?: boolean;
    errorMessage?: string | null;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    confirmVariant = "primary",
    loading,
    errorMessage,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const { t } = useI18n();

    useEffect(() => {
        if (!open) return;
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onCancel();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onCancel]);

    if (!open || typeof document === "undefined") return null;

    return createPortal(
        <div className={styles.backdrop} role="presentation" aria-hidden="true" onClick={onCancel}>
            <div
                className={styles.dialog}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-desc"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="confirm-dialog-title" className={styles.title}>
                    {title}
                </h2>
                <div id="confirm-dialog-desc" className={styles.body}>
                    {description}
                </div>
                {errorMessage && (
                    <p className={styles.error} role="alert">
                        {errorMessage}
                    </p>
                )}
                <div className={styles.actions}>
                    <Button type="button" variant="ghost" size="md" onClick={onCancel} disabled={loading}>
                        {cancelLabel ?? t("dialog.cancel")}
                    </Button>
                    <Button type="button" variant={confirmVariant} size="md" loading={loading} onClick={onConfirm}>
                        {confirmLabel ?? t("dialog.confirm")}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
