"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRegister } from "@/features/auth/hooks/useAuth";
import { useI18n } from "@/shared/i18n";
import styles from "../page.module.css";

export default function RegisterPage() {
    const { register, loading, error } = useRegister();
    const { language, t } = useI18n();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [clientError, setClientError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setClientError(null);
        if (password !== confirm) {
            setClientError(t("auth.passwordMismatch"));
            return;
        }
        await register(email, password, language);
    }

    const displayError = clientError ?? error;

    return (
        <main className={styles.main}>
            <div className={styles.bg} aria-hidden="true" />
            <div className={styles.card}>
                <header className={styles.header}>
                    <span className={styles.logo} aria-hidden="true">
                        ◈
                    </span>
                    <h1 className={styles.title}>{t("auth.registerTitle")}</h1>
                    <p className={styles.subtitle}>{t("auth.registerSubtitle")}</p>
                </header>

                <form onSubmit={handleSubmit} noValidate aria-label={t("auth.registerFormAria")}>
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

                    <div className={styles.field}>
                        <label htmlFor="password">
                            {t("auth.password")}
                            <span
                                style={{
                                    fontWeight: 400,
                                    color: "var(--text-dim)",
                                    marginLeft: "0.5rem",
                                    textTransform: "none",
                                }}
                            >
                                {t("auth.passwordPolicy")}
                            </span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            aria-required="true"
                            minLength={12}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t("auth.passwordPlaceholder")}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="confirm">{t("auth.confirmPassword")}</label>
                        <input
                            id="confirm"
                            type="password"
                            autoComplete="new-password"
                            required
                            aria-required="true"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder={t("auth.passwordPlaceholder")}
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className={styles.submit} disabled={loading} aria-busy={loading}>
                        {loading && <span className={styles.spinner} aria-hidden="true" />}
                        {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
                    </button>
                </form>

                <footer className={styles.footer}>
                    {t("auth.alreadyHaveAccount")} <Link href="/login">{t("auth.signIn")}</Link>
                </footer>
            </div>
        </main>
    );
}
