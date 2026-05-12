"use client";

import {type FormEvent, useState} from "react";
import Link from "next/link";
import {useRegister} from "@/features/auth/hooks/useAuth";
import styles from "../page.module.css";

export default function RegisterPage() {
    const {register, loading, error} = useRegister();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [clientError, setClientError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setClientError(null);
        if (password !== confirm) {
            setClientError("Passwords do not match");
            return;
        }
        await register(email, password);
    }

    const displayError = clientError ?? error;

    return (
        <main className={styles.main}>
            <div className={styles.bg} aria-hidden="true"/>
            <div className={styles.card}>
                <header className={styles.header}>
                    <span className={styles.logo} aria-hidden="true">◈</span>
                    <h1 className={styles.title}>Create account</h1>
                    <p className={styles.subtitle}>Start tracking your finances</p>
                </header>

                <form onSubmit={handleSubmit} noValidate aria-label="Registration form">
                    {displayError && (
                        <div role="alert" className={styles.error}>{displayError}</div>
                    )}

                    <div className={styles.field}>
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email" type="email" autoComplete="email"
                            required aria-required="true"
                            value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com" disabled={loading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">
                            Password
                            <span style={{
                                fontWeight: 400,
                                color: "var(--text-dim)",
                                marginLeft: "0.5rem",
                                textTransform: "none"
                            }}>
                min 12 chars · upper · lower · digit · special
              </span>
                        </label>
                        <input
                            id="password" type="password" autoComplete="new-password"
                            required aria-required="true" minLength={12}
                            value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••••••" disabled={loading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="confirm">Confirm password</label>
                        <input
                            id="confirm" type="password" autoComplete="new-password"
                            required aria-required="true"
                            value={confirm} onChange={e => setConfirm(e.target.value)}
                            placeholder="••••••••••••" disabled={loading}
                        />
                    </div>

                    <button type="submit" className={styles.submit} disabled={loading} aria-busy={loading}>
                        {loading && <span className={styles.spinner} aria-hidden="true"/>}
                        {loading ? "Creating account…" : "Create account"}
                    </button>
                </form>

                <footer className={styles.footer}>
                    Already have an account? <Link href="/login">Sign in</Link>
                </footer>
            </div>
        </main>
    );
}