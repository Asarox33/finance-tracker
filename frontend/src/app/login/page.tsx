"use client";

import { type FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLogin } from "@/features/auth/hooks/useAuth";
import { useI18n } from "@/shared/i18n";
import PasswordRevealButton from "@/shared/components/PasswordRevealButton";
import styles from "./page.module.css";

function LoginForm() {
    const { t } = useI18n();
    const { login, loading, error } = useLogin();
    const searchParams = useSearchParams();
    const registered = searchParams.get("registered") === "1";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [clientError, setClientError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setClientError(null);
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setClientError(t("auth.emailRequired"));
            return;
        }
        if (!password) {
            setClientError(t("auth.passwordRequired"));
            return;
        }
        await login(trimmedEmail, password);
    }

    const displayError = clientError ?? error?.message;

    return (
        <main className={styles.main}>
            <div className={styles.bg} aria-hidden="true" />
            <div className={styles.card}>
                <header className={styles.header}>
                    <span className={styles.logo} aria-hidden="true">
                        ◈
                    </span>
                    <h1 className={styles.title}>{t("auth.loginTitle")}</h1>
                    <p className={styles.subtitle}>{t("auth.loginSubtitle")}</p>
                </header>

                <form onSubmit={handleSubmit} noValidate aria-label={t("auth.loginFormAria")}>
                    {registered && (
                        <div role="status" className={styles.success}>
                            {t("auth.registeredSuccess")}
                        </div>
                    )}
                    {displayError && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            className={error?.locked ? styles.errorLocked : styles.error}
                        >
                            {error?.locked && (
                                <span className={styles.lockIcon} aria-hidden="true">
                                    ⊘
                                </span>
                            )}
                            <span>{displayError}</span>
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
                            disabled={loading || !!error?.locked}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">{t("auth.password")}</label>
                        <div className={styles.passwordField}>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                aria-required="true"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t("auth.passwordPlaceholder")}
                                disabled={loading || !!error?.locked}
                            />
                            <PasswordRevealButton
                                revealed={showPassword}
                                setRevealed={setShowPassword}
                                disabled={loading || !!error?.locked}
                                className={styles.passwordToggle}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submit}
                        disabled={loading || !!error?.locked}
                        aria-busy={loading}
                    >
                        {loading && <span className={styles.spinner} aria-hidden="true" />}
                        {loading ? t("auth.signingIn") : t("auth.signIn")}
                    </button>
                </form>

                <footer className={styles.footer}>
                    <Link href="/login/reset">{t("auth.forgotPassword")}</Link>
                    <span style={{ color: "var(--text-dim)" }}>·</span>
                    <Link href="/login/register">{t("auth.createAccount")}</Link>
                </footer>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
