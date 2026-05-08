"use client";

import { useState } from "react";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { accountsApi } from "@/features/accounts/api/accountsApi";
import {
  Card, Button, Badge, PageHeader,
  EmptyState, ErrorState, Skeleton
} from "@/shared/components/ui";
import type { Account, AccountType } from "@/shared/types";
import styles from "./page.module.css";
import { CURRENCIES } from "@/lib/currencies";

const ACCOUNT_TYPES: AccountType[] = [
  "CHECKING", "SAVINGS", "BROKERAGE", "CRYPTO", "REAL_ESTATE", "RETIREMENT", "OTHER"
];

export default function AccountsPage() {
  const { data, isLoading, error, mutate } = useAccounts();
  const [closing, setClosing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function handleClose(id: string) {
    if (!confirm("Close this account? This action cannot be undone.")) return;
    setClosing(id);
    try {
      await accountsApi.close(id);
      mutate();
    } catch {
      alert("Failed to close account");
    } finally {
      setClosing(null);
    }
  }

  return (
      <div className={styles.page}>
        <PageHeader
            title="Accounts"
            description="Manage your financial accounts"
            action={
              <Button onClick={() => setShowForm(true)} variant="primary">
                + New account
              </Button>
            }
        />
        <div className={styles.body}>
          {showForm && (
              <AddAccountForm
                  onSuccess={() => { setShowForm(false); mutate(); }}
                  onCancel={() => setShowForm(false)}
              />
          )}

          {isLoading && (
              <div className={styles.skels}>
                {[1,2,3].map(i => <Skeleton key={i} className={styles.cardSkel} />)}
              </div>
          )}
          {error && <ErrorState />}
          {!isLoading && data?.items.length === 0 && !showForm && (
              <EmptyState
                  title="No accounts yet"
                  description="Add your first account to start tracking"
              />
          )}
          <div className={styles.grid}>
            {data?.items.map(account => (
                <AccountCard
                    key={account.id}
                    account={account}
                    onClose={handleClose}
                    closing={closing === account.id}
                />
            ))}
          </div>
        </div>
      </div>
  );
}

function AddAccountForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("CHECKING");
  const [currency, setCurrency] = useState("EUR");
  const [institutionId, setInstitutionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await accountsApi.create({ institutionId, name, type, currency: currency.toUpperCase() });
      onSuccess();
    } catch (err) {
      setError((err as { message?: string }).message ?? "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
      <Card className={styles.formCard}>
        <h2 className={styles.formTitle}>New account</h2>
        <form onSubmit={handleSubmit} noValidate aria-label="Add account form">
          {error && <div role="alert" className={styles.formError}>{error}</div>}

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="acc-name">Account name</label>
              <input
                  id="acc-name" type="text" required aria-required="true"
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Main Checking" disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="acc-type">Type</label>
              <select
                  id="acc-type" value={type}
                  onChange={e => setType(e.target.value as AccountType)}
                  disabled={loading}
              >
                {ACCOUNT_TYPES.map(t => (
                    <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="acc-currency">Currency</label>
              <select
                  id="acc-currency"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  disabled={loading}
              >
                {CURRENCIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="acc-institution">Institution ID</label>
              <input
                  id="acc-institution" type="text" required aria-required="true"
                  value={institutionId} onChange={e => setInstitutionId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  disabled={loading}
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem" }}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Create account
            </Button>
          </div>
        </form>
      </Card>
  );
}

function AccountCard({
                       account, onClose, closing,
                     }: {
  account: Account;
  onClose: (id: string) => void;
  closing: boolean;
}) {
  return (
      <Card className={styles.accountCard}>
        <div className={styles.accountHeader}>
          <div>
            <p className={styles.accountName}>{account.name}</p>
            <p className={styles.accountType}>{account.type.replace("_", " ")}</p>
          </div>
          <Badge variant={account.status === "ACTIVE" ? "success" : "default"}>
            {account.status}
          </Badge>
        </div>
        <div className={styles.accountMeta}>
          <span className={styles.currency}>{account.currency}</span>
          <span className={styles.id}>{account.id.slice(0, 8)}…</span>
        </div>
        {account.status === "ACTIVE" && (
            <div className={styles.accountActions}>
              <Button
                  variant="danger" size="sm" loading={closing}
                  onClick={() => onClose(account.id)}
                  aria-label={`Close account ${account.name}`}
              >
                Close account
              </Button>
            </div>
        )}
      </Card>
  );
}