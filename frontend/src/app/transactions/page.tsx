"use client";

import { useState } from "react";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import { transactionsApi } from "@/features/transactions/api/transactionsApi";
import {
    Card, Badge, Button, PageHeader, EmptyState, ErrorState, Skeleton
} from "@/shared/components/ui";
import { formatMoney, formatDate } from "@/lib/format";
import type { Transaction, TransactionType } from "@/shared/types";
import styles from "./page.module.css";

const TRANSACTION_TYPES: TransactionType[] = [
    "DEPOSIT", "WITHDRAWAL", "TRANSFER", "BUY", "SELL", "DIVIDEND", "FEE", "TAX", "OTHER"
];

const TYPE_VARIANTS: Record<string, "success" | "danger" | "warning" | "default"> = {
    DEPOSIT: "success", DIVIDEND: "success",
    WITHDRAWAL: "danger", FEE: "danger", TAX: "danger",
    BUY: "warning", SELL: "warning",
    TRANSFER: "default", OTHER: "default",
};

export default function TransactionsPage() {
    const { data: accounts } = useAccounts();
    const [selectedAccount, setSelectedAccount] = useState<string>("");
    const [page, setPage] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const { data, isLoading, error, mutate } = useTransactions(selectedAccount, page);

    return (
        <div className={styles.page}>
            <PageHeader
                title="Transactions"
                description="View and manage your transaction history"
                action={
                    selectedAccount ? (
                        <Button onClick={() => setShowForm(true)} variant="primary">
                            + New transaction
                        </Button>
                    ) : undefined
                }
            />
            <div className={styles.body}>
                <div className={styles.filters}>
                    <div className={styles.filterField}>
                        <label htmlFor="account-select">Account</label>
                        <select
                            id="account-select"
                            value={selectedAccount}
                            onChange={e => { setSelectedAccount(e.target.value); setPage(0); setShowForm(false); }}
                            aria-label="Select account to view transactions"
                        >
                            <option value="">Select an account…</option>
                            {accounts?.items.filter(a => a.status === "ACTIVE").map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {showForm && selectedAccount && (
                    <AddTransactionForm
                        accountId={selectedAccount}
                        currency={accounts?.items.find(a => a.id === selectedAccount)?.currency ?? "EUR"}
                        onSuccess={() => { setShowForm(false); mutate(); }}
                        onCancel={() => setShowForm(false)}
                    />
                )}

                {!selectedAccount && (
                    <EmptyState title="Select an account" description="Choose an account above to view its transactions" />
                )}

                {selectedAccount && isLoading && (
                    <div className={styles.skels}>
                        {[1,2,3,4,5].map(i => <Skeleton key={i} className={styles.rowSkel} />)}
                    </div>
                )}

                {selectedAccount && error && <ErrorState />}

                {selectedAccount && !isLoading && data && (
                    <>
                        {data.items.length === 0 && !showForm ? (
                            <EmptyState title="No transactions" description="Record your first transaction for this account" />
                        ) : (
                            <Card>
                                <table aria-label="Transaction list">
                                    <thead>
                                    <tr>
                                        <th scope="col">Date</th>
                                        <th scope="col">Label</th>
                                        <th scope="col">Type</th>
                                        <th scope="col" style={{ textAlign: "right" }}>Amount</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {data.items.map(tx => <TransactionRow key={tx.id} tx={tx} />)}
                                    </tbody>
                                </table>
                            </Card>
                        )}

                        {data.totalPages > 1 && (
                            <nav className={styles.pagination} aria-label="Transaction pages">
                                <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)} disabled={data.isFirst} aria-label="Previous page">←</button>
                                <span className={styles.pageInfo} aria-live="polite">Page {page + 1} of {data.totalPages}</span>
                                <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)} disabled={data.isLast} aria-label="Next page">→</button>
                            </nav>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function AddTransactionForm({
                                accountId, currency, onSuccess, onCancel,
                            }: {
    accountId: string;
    currency: string;
    onSuccess: () => void;
    onCancel: () => void;
}) {
    const [type, setType] = useState<TransactionType>("DEPOSIT");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [label, setLabel] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat) || amountFloat === 0) {
            setError("Amount must be a non-zero number");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const fractionDigits = 2;
            const amountMinor = Math.round(amountFloat * Math.pow(10, fractionDigits));
            await transactionsApi.create({
                accountId,
                type,
                amount: amountMinor,
                currency,
                date,
                label,
                notes: notes || undefined,
            });
            onSuccess();
        } catch (err) {
            setError((err as { message?: string }).message ?? "Failed to record transaction");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className={styles.formCard}>
            <h2 className={styles.formTitle}>New transaction</h2>
            <form onSubmit={handleSubmit} noValidate aria-label="Add transaction form">
                {error && <div role="alert" className={styles.formError}>{error}</div>}

                <div className={styles.formGrid}>
                    <div className={styles.field}>
                        <label htmlFor="tx-type">Type</label>
                        <select
                            id="tx-type" value={type}
                            onChange={e => setType(e.target.value as TransactionType)}
                            disabled={loading}
                        >
                            {TRANSACTION_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="tx-amount">
                            Amount ({currency})
                            <span style={{ fontWeight: 400, color: "var(--text-dim)", marginLeft: "0.5rem" }}>
                use − for withdrawals
              </span>
                        </label>
                        <input
                            id="tx-amount" type="number" step="0.01" required aria-required="true"
                            value={amount} onChange={e => setAmount(e.target.value)}
                            placeholder="100.00" disabled={loading}
                            style={{ fontFamily: "var(--font-mono)" }}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="tx-date">Date</label>
                        <input
                            id="tx-date" type="date" required aria-required="true"
                            value={date} onChange={e => setDate(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="tx-label">Label</label>
                        <input
                            id="tx-label" type="text" required aria-required="true"
                            value={label} onChange={e => setLabel(e.target.value)}
                            placeholder="e.g. Monthly salary" disabled={loading}
                        />
                    </div>

                    <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                        <label htmlFor="tx-notes">Notes <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(optional)</span></label>
                        <input
                            id="tx-notes" type="text"
                            value={notes} onChange={e => setNotes(e.target.value)}
                            placeholder="Additional details…" disabled={loading}
                        />
                    </div>
                </div>

                <div className={styles.formActions}>
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" loading={loading}>
                        Record transaction
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function TransactionRow({ tx }: { tx: Transaction }) {
    const positive = ["DEPOSIT", "DIVIDEND", "SELL"].includes(tx.type);
    return (
        <tr>
            <td style={{ color: "var(--text-muted)", fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                {formatDate(tx.date)}
            </td>
            <td>
                <p style={{ fontWeight: 500 }}>{tx.label}</p>
                {tx.notes && <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{tx.notes}</p>}
            </td>
            <td>
                <Badge variant={TYPE_VARIANTS[tx.type] ?? "default"}>{tx.type}</Badge>
                {tx.appliedFxRate && (
                    <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>FX</span>
                )}
            </td>
            <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
        <span style={{ color: positive ? "var(--success)" : "var(--danger)" }}>
          {positive ? "+" : ""}{formatMoney(tx.amount, tx.currency)}
        </span>
            </td>
        </tr>
    );
}