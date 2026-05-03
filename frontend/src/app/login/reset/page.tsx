"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePasswordReset } from "@/features/auth/hooks/useAuth";
import styles from "../page.module.css";

export default function ResetPage() {
  const { step, loading, error, requestReset, confirmReset, backToRequest } = usePasswordReset();
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  async function handleRequest(e: FormEvent) {
    e.preventDefault();
    await requestReset(email);
  }

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    setClientError(null);
    if (newPassword !== confirmPassword) {
      setClientError("Passwords do not match");
      return;
    }
    await confirmReset(userId, otp, newPassword);
  }

  const displayError = clientError ?? error;

  if (step === "done") {
    return (
        <main className={styles.main}>
          <div className={styles.bg} aria-hidden="true" />
          <div className={styles.card}>
            <header className={styles.header}>
              <span className={styles.logo} aria-hidden="true">◈</span>
              <h1 className={styles.title}>Password updated</h1>
              <p className={styles.subtitle}>Your password has been reset successfully.</p>
            </header>
            <footer className={styles.footer}>
              <Link href="/login">Sign in with your new password</Link>
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
              <span className={styles.logo} aria-hidden="true">◈</span>
              <h1 className={styles.title}>Enter reset code</h1>
              <p className={styles.subtitle}>
                Check your email at <strong>{email}</strong> for the 6-digit code and your user ID.
              </p>
            </header>

            <form onSubmit={handleConfirm} noValidate aria-label="Password reset confirmation form">
              {displayError && <div role="alert" className={styles.error}>{displayError}</div>}

              <div className={styles.field}>
                <label htmlFor="userId">User ID <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(from email)</span></label>
                <input
                    id="userId" type="text" required aria-required="true"
                    value={userId} onChange={e => setUserId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    disabled={loading} autoComplete="off"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem" }}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="otp">6-digit code</label>
                <input
                    id="otp" type="text" inputMode="numeric"
                    pattern="[0-9]{6}" maxLength={6}
                    required aria-required="true"
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456" disabled={loading}
                    autoComplete="one-time-code"
                    style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.3em", fontSize: "1.25rem" }}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="newPassword">
                  New password
                  <span style={{ fontWeight: 400, color: "var(--text-dim)", marginLeft: "0.5rem", textTransform: "none" }}>min 12 chars</span>
                </label>
                <input
                    id="newPassword" type="password" autoComplete="new-password"
                    required aria-required="true" minLength={12}
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••••••" disabled={loading}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="confirmPassword">Confirm new password</label>
                <input
                    id="confirmPassword" type="password" autoComplete="new-password"
                    required aria-required="true"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••" disabled={loading}
                />
              </div>

              <button type="submit" className={styles.submit} disabled={loading} aria-busy={loading}>
                {loading && <span className={styles.spinner} aria-hidden="true" />}
                {loading ? "Resetting…" : "Reset password"}
              </button>
            </form>

            <footer className={styles.footer}>
              <button type="button" onClick={backToRequest}
                      style={{ color: "var(--accent)", background: "none", fontSize: "0.875rem" }}>
                Resend code
              </button>
              <span style={{ color: "var(--text-dim)" }}>·</span>
              <Link href="/login">Back to sign in</Link>
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
            <span className={styles.logo} aria-hidden="true">◈</span>
            <h1 className={styles.title}>Reset password</h1>
            <p className={styles.subtitle}>Enter your email to receive a reset code</p>
          </header>

          <form onSubmit={handleRequest} noValidate aria-label="Password reset request form">
            {displayError && <div role="alert" className={styles.error}>{displayError}</div>}
            <div className={styles.field}>
              <label htmlFor="email">Email address</label>
              <input
                  id="email" type="email" autoComplete="email"
                  required aria-required="true"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" disabled={loading}
              />
            </div>
            <button type="submit" className={styles.submit} disabled={loading} aria-busy={loading}>
              {loading && <span className={styles.spinner} aria-hidden="true" />}
              {loading ? "Sending…" : "Send reset code"}
            </button>
          </form>

          <footer className={styles.footer}>
            <Link href="/login">Back to sign in</Link>
          </footer>
        </div>
      </main>
  );
}