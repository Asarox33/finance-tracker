"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useLogin } from "@/features/auth/hooks/useAuth";
import styles from "./page.module.css";

function LoginForm() {
  const { login, loading, error } = useLogin();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await login(email, password);
  }

  return (
      <main className={styles.main}>
        <div className={styles.bg} aria-hidden="true" />
        <div className={styles.card}>
          <header className={styles.header}>
            <span className={styles.logo} aria-hidden="true">◈</span>
            <h1 className={styles.title}>Finance Tracker</h1>
            <p className={styles.subtitle}>Sign in to your account</p>
          </header>

          <form onSubmit={handleSubmit} noValidate aria-label="Login form">
            {registered && (
                <div role="status" className={styles.success}>
                  Account created — you can now sign in.
                </div>
            )}
            {error && (
                <div role="alert" aria-live="assertive"
                     className={error.locked ? styles.errorLocked : styles.error}>
                  {error.locked && <span className={styles.lockIcon} aria-hidden="true">⊘</span>}
                  <span>{error.message}</span>
                </div>
            )}

            <div className={styles.field}>
              <label htmlFor="email">Email address</label>
              <input
                  id="email" type="email" autoComplete="email"
                  required aria-required="true"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading || !!error?.locked}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input
                  id="password" type="password" autoComplete="current-password"
                  required aria-required="true"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={loading || !!error?.locked}
              />
            </div>

            <button type="submit" className={styles.submit}
                    disabled={loading || !!error?.locked} aria-busy={loading}>
              {loading && <span className={styles.spinner} aria-hidden="true" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <footer className={styles.footer}>
            <Link href="/login/reset">Forgot password?</Link>
            <span style={{ color: "var(--text-dim)" }}>·</span>
            <Link href="/login/register">Create account</Link>
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