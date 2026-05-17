"use client";

import clsx from "clsx";
import { useI18n } from "@/shared/i18n";
import styles from "./ui.module.css";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={clsx(styles.card, className)}>{children}</div>;
}

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return <div className={clsx(styles.skeleton, className)} style={style} aria-hidden="true" />;
}

export function Badge({
    children,
    variant = "default",
}: {
    children: React.ReactNode;
    variant?: "default" | "success" | "danger" | "warning";
}) {
    return <span className={clsx(styles.badge, styles[variant])}>{children}</span>;
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    loading,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md";
    loading?: boolean;
}) {
    return (
        <button
            {...props}
            disabled={props.disabled ?? loading}
            aria-busy={loading}
            className={clsx(styles.btn, styles[variant], styles[`size_${size}`], props.className)}
        >
            {loading && <span className={styles.btnSpinner} aria-hidden="true" />}
            {children}
        </button>
    );
}

export function PageHeader({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <header className={styles.pageHeader}>
            <div>
                <h1 className={styles.pageTitle}>{title}</h1>
                {description && <p className={styles.pageDesc}>{description}</p>}
            </div>
            {action && <div>{action}</div>}
        </header>
    );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
    return (
        <div className={styles.empty} role="status">
            <span className={styles.emptyIcon} aria-hidden="true">
                ◌
            </span>
            <p className={styles.emptyTitle}>{title}</p>
            {description && <p className={styles.emptyDesc}>{description}</p>}
        </div>
    );
}

export function ErrorState({ message }: { message?: string }) {
    const { t } = useI18n();

    return (
        <div className={styles.errorState} role="alert">
            <span aria-hidden="true">⚠</span>
            {message ?? t("errors.generic")}
        </div>
    );
}
