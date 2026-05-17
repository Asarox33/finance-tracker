"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { usePasswordReset } from "@/features/auth/hooks/useAuth";
import { useI18n } from "@/shared/i18n";
import PasswordRevealButton from "@/shared/components/PasswordRevealButton";
import styles from "../page.module.css";

export default function ResetPage() {
    const { step, loading, error, requestReset, confirmReset, backToRequest } = usePasswordReset();
    const { t } = useI18n();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [clientError, setClientError] = useState<string | null>(null);
    const [showPasswords, setShowPasswords] = useState(false);

    async function handleRequest(e: FormEvent) {
        e.preventDefault();
        setClientError(null);
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setClientError(t("auth.emailRequired"));
            return;
        }
        await requestReset(trimmedEmail);
    }

    async function handleConfirm(e: FormEvent) {
        e.preventDefault();
        setClientError(null);
        if (otp.length !== 6) {
            setClientError(t("auth.otpInvalid"));
            return;
        }
        if (!newPassword) {
            setClientError(t("auth.passwordRequired"));
            return;
        }
        if (newPassword.length < 12) {
            setClientError(t("auth.passwordTooShort"));
            return;
        }
        if (newPassword !== confirmPassword) {
            setClientError(t("auth.passwordMismatch"));
            return;
        }
        await confirmReset(email.trim(), otp, newPassword);
    }

    const displayError = clientError ?? error;

    if (step === "done") {
        return (
            <main className={styles.main}>
                <div className={styles.bg} aria-hidden="true" />
                <div className={styles.card}>
                    <header className={styles.header}>
                        <span className={styles.logo} aria-hidden="true">
                            ◈
                        </span>
                        <h1 className={styles.title}>{t("auth.passwordUpdatedTitle")}</h1>
                        <p className={styles.subtitle}>{t("auth.passwordUpdatedSubtitle")}</p>
                    </header>
                    <footer className={styles.footer}>
                        <Link href="/login">{t("auth.signInWithNewPassword")}</Link>
                    </footer>
                </div>
            </main>
        );
    }

    if (step === "confirm") {
        return (
            <main className={styles.main}>
                <div className={styles.bg} aria-hidden="true" />
                <div className={styles.card}>
                    <header className={styles.header}>
                        <span className={styles.logo} aria-hidden="true">
                            ◈
                        </span>
                        <h1 className={styles.title}>{t("auth.resetConfirmTitle")}</h1>
                        <p className={styles.subtitle}>
                            {t("auth.resetCodeSent", { email })}
                        </p>
                    </header>

                    <form onSubmit={handleConfirm} noValidate aria-label={t("auth.resetConfirmFormAria")}>
                        {displayError && (
                            <div role="alert" className={styles.error}>
                                {displayError}
                            </div>
                        )}

                        <div className={styles.field}>
                            <label htmlFor="otp">{t("auth.otpCode")}</label>
                            <input
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                required
                                aria-required="true"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                placeholder="123456"
                                disabled={loading}
                                autoComplete="one-time-code"
                                style={{
                                    fontFamily: "var(--font-mono), monospace",
                                    letterSpacing: "0.3em",
                                    fontSize: "1.25rem",
                                }}
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="newPassword">
                                {t("auth.newPassword")}
                                <span
                                    style={{
                                        fontWeight: 400,
                                        color: "var(--text-dim)",
                                        marginLeft: "0.5rem",
                                        textTransform: "none",
                                    }}
                                >
                                    {t("auth.passwordMinHint")}
                                </span>
                            </label>
                            <div className={styles.passwordField}>
                                <input
                                    id="newPassword"
                                    type={showPasswords ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    aria-required="true"
                                    minLength={12}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder={t("auth.passwordPlaceholder")}
                                    disabled={loading}
                                />
                                <PasswordRevealButton
                                    revealed={showPasswords}
                                    setRevealed={setShowPasswords}
                                    disabled={loading}
                                    className={styles.passwordToggle}
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="confirmPassword">{t("auth.confirmNewPassword")}</label>
                            <input
                                id="confirmPassword"
                                type={showPasswords ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                aria-required="true"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={t("auth.passwordPlaceholder")}
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className={styles.submit} disabled={loading} aria-busy={loading}>
                            {loading && <span className={styles.spinner} aria-hidden="true" />}
                            {loading ? t("auth.resetting") : t("auth.resetPassword")}
                        </button>
                    </form>

                    <footer className={styles.footer}>
                        <button
                            type="button"
                            onClick={backToRequest}
                            style={{
                                color: "var(--accent)",
                                background: "none",
                                fontSize: "0.875rem",
                            }}
                        >
                            {t("auth.resendCode")}
                        </button>
                        <span style={{ color: "var(--text-dim)" }}>·</span>
                        <Link href="/login">{t("auth.backToSignIn")}</Link>
                    </footer>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.bg} aria-hidden="true" />
            <div className={styles.card}>
                <header className={styles.header}>
                    <span className={styles.logo} aria-hidden="true">
                        ◈
                    </span>
                    <h1 className={styles.title}>{t("auth.resetRequestTitle")}</h1>
                    <p className={styles.subtitle}>{t("auth.resetRequestSubtitle")}</p>
                </header>

                <form onSubmit={handleRequest} noValidate aria-label={t("auth.resetRequestFormAria")}>
                    {displayError && (
                        <div role="alert" className={styles.error}>
                            {displayError}
                        </div>
                    )}
                    <div className={styles.field}>
                        <label htmlFor="email">{t("auth.email")}</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            aria-required="true"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t("auth.emailPlaceholder")}
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className={styles.submit} disabled={loading} aria-busy={loading}>
                        {loading && <span className={styles.spinner} aria-hidden="true" />}
                        {loading ? t("auth.sending") : t("auth.sendResetCode")}
                    </button>
                </form>

                <footer className={styles.footer}>
                    <Link href="/login">{t("auth.backToSignIn")}</Link>
                </footer>
            </div>
        </main>
    );
}
