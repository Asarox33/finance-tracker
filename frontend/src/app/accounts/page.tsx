"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { accountsApi } from "@/features/accounts/api/accountsApi";
import { useInstitutions } from "@/features/institutions/hooks/useInstitutions";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import type { Account, AccountType } from "@/shared/types";
import styles from "./page.module.css";
import { CURRENCIES } from "@/lib/currencies";

/** Page size for institution picker (dropdown); list API is paginated. */
const INSTITUTION_PICKER_PAGE_SIZE = 200;

const ACCOUNT_TYPES: AccountType[] = [
    "CHECKING",
    "SAVINGS",
    "BROKERAGE",
    "CRYPTO",
    "REAL_ESTATE",
    "RETIREMENT",
    "OTHER",
];

function getInstitutionDisplay(
    account: Account,
    institutionNameById: Map<string, string>,
    institutionsLoading: boolean,
    institutionsPage: { items: { id: string; name: string }[] } | undefined,
    institutionsError: unknown
): { text: string; pending: boolean } {
    if (institutionsError) {
        return { text: "Could not load institution", pending: false };
    }
    if (institutionsLoading && !institutionsPage) {
        return { text: "Loading institution…", pending: true };
    }
    const name = institutionNameById.get(account.institutionId);
    if (name) return { text: name, pending: false };
    return { text: "Institution unavailable", pending: false };
}

export default function AccountsPage() {
    const { data, isLoading, error, mutate } = useAccounts();
    const {
        data: institutionsPage,
        isLoading: institutionsLoading,
        error: institutionsError,
    } = useInstitutions(0, undefined, undefined, INSTITUTION_PICKER_PAGE_SIZE);

    const institutionNameById = useMemo(() => {
        const map = new Map<string, string>();
        for (const inst of institutionsPage?.items ?? []) {
            map.set(inst.id, inst.name);
        }
        return map;
    }, [institutionsPage]);

    const [pendingCloseAccount, setPendingCloseAccount] = useState<Account | null>(null);
    const [closeSubmitting, setCloseSubmitting] = useState(false);
    const [closeError, setCloseError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const pendingInstitutionName = useMemo(() => {
        if (!pendingCloseAccount) return null;
        return institutionNameById.get(pendingCloseAccount.institutionId) ?? null;
    }, [pendingCloseAccount, institutionNameById]);

    const dismissCloseModal = useCallback(() => {
        setPendingCloseAccount(null);
        setCloseError(null);
    }, []);

    const confirmCloseAccount = useCallback(async () => {
        if (!pendingCloseAccount) return;
        setCloseSubmitting(true);
        setCloseError(null);
        try {
            await accountsApi.close(pendingCloseAccount.id);
            await mutate();
            dismissCloseModal();
        } catch {
            setCloseError("Failed to close account. Please try again.");
        } finally {
            setCloseSubmitting(false);
        }
    }, [pendingCloseAccount, mutate, dismissCloseModal]);

    return (
        <div className={styles.page}>
            <ConfirmDialog
                open={pendingCloseAccount !== null}
                title="Close this account?"
                description={
                    pendingCloseAccount ? (
                        <>
                            <p className={styles.closeModalLead}>
                                You are about to close{" "}
                                <strong>{pendingCloseAccount.name}</strong>
                                {pendingInstitutionName ? (
                                    <>
                                        {" "}
                                        at <strong>{pendingInstitutionName}</strong>
                                    </>
                                ) : null}
                                . This cannot be undone.
                            </p>
                            <p className={styles.closeModalHint}>
                                Make sure you have exported any history you need before continuing.
                            </p>
                        </>
                    ) : null
                }
                cancelLabel="Keep account"
                confirmLabel="Close account"
                confirmVariant="danger"
                loading={closeSubmitting}
                errorMessage={closeError}
                onConfirm={confirmCloseAccount}
                onCancel={dismissCloseModal}
            />
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
                        onSuccess={() => {
                            setShowForm(false);
                            mutate();
                        }}
                        onCancel={() => setShowForm(false)}
                    />
                )}

                {isLoading && (
                    <div className={styles.skels}>
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className={styles.cardSkel} />
                        ))}
                    </div>
                )}
                {error && <ErrorState />}
                {!isLoading && data?.items.length === 0 && !showForm && (
                    <EmptyState title="No accounts yet" description="Add your first account to start tracking" />
                )}
                <div className={styles.grid}>
                    {data?.items.map((account) => {
                        const institutionDisplay = getInstitutionDisplay(
                            account,
                            institutionNameById,
                            institutionsLoading,
                            institutionsPage,
                            institutionsError
                        );
                        return (
                            <AccountCard
                                key={account.id}
                                account={account}
                                institutionLine={institutionDisplay.text}
                                institutionLinePending={institutionDisplay.pending}
                                onRequestClose={() => {
                                    setCloseError(null);
                                    setPendingCloseAccount(account);
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function AddAccountForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
    const {
        data: institutionsPage,
        isLoading: institutionsLoading,
        error: institutionsError,
    } = useInstitutions(0, undefined, undefined, INSTITUTION_PICKER_PAGE_SIZE);

    const institutionsSorted = useMemo(() => {
        const items = institutionsPage?.items ?? [];
        return [...items].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    }, [institutionsPage]);

    const [name, setName] = useState("");
    const [type, setType] = useState<AccountType>("CHECKING");
    const [currency, setCurrency] = useState("EUR");
    const [institutionId, setInstitutionId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!institutionId.trim()) {
            setError("Please select an institution.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await accountsApi.create({
                institutionId,
                name,
                type,
                currency: currency.toUpperCase(),
            });
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
                {error && (
                    <div role="alert" className={styles.formError}>
                        {error}
                    </div>
                )}

                <div className={styles.formGrid}>
                    <div className={styles.field}>
                        <label htmlFor="acc-name">Account name</label>
                        <input
                            id="acc-name"
                            type="text"
                            required
                            aria-required="true"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Main Checking"
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="acc-type">Type</label>
                        <select
                            id="acc-type"
                            value={type}
                            onChange={(e) => setType(e.target.value as AccountType)}
                            disabled={loading}
                        >
                            {ACCOUNT_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t.replace("_", " ")}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="acc-currency">Currency</label>
                        <select
                            id="acc-currency"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            disabled={loading}
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="acc-institution">Institution</label>
                        <select
                            id="acc-institution"
                            required
                            aria-required="true"
                            value={institutionId}
                            onChange={(e) => setInstitutionId(e.target.value)}
                            disabled={
                                loading || institutionsLoading || institutionsSorted.length === 0 || !!institutionsError
                            }
                        >
                            {institutionsLoading ? (
                                <option value="">Loading institutions…</option>
                            ) : institutionsError ? (
                                <option value="">Could not load institutions</option>
                            ) : institutionsSorted.length === 0 ? (
                                <option value="">No institutions yet</option>
                            ) : (
                                <>
                                    <option value="">Select institution</option>
                                    {institutionsSorted.map((inst) => (
                                        <option key={inst.id} value={inst.id}>
                                            {inst.name} ({inst.country})
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                        {institutionsError && (
                            <p className={styles.fieldError} role="alert">
                                Failed to load institutions. Refresh the page or try again later.
                            </p>
                        )}
                        {!institutionsLoading && !institutionsError && institutionsSorted.length === 0 && (
                            <p className={styles.fieldHint}>
                                Create an institution first, then return here.{" "}
                                <Link href="/institutions">Go to Institutions</Link>
                            </p>
                        )}
                    </div>
                </div>

                <div className={styles.formActions}>
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        disabled={
                            institutionsLoading ||
                            !institutionId.trim() ||
                            institutionsSorted.length === 0 ||
                            !!institutionsError
                        }
                    >
                        Create account
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function AccountCard({
    account,
    institutionLine,
    institutionLinePending,
    onRequestClose,
}: {
    account: Account;
    institutionLine: string;
    institutionLinePending: boolean;
    onRequestClose: () => void;
}) {
    return (
        <Card className={styles.accountCard}>
            <div className={styles.accountHeader}>
                <div>
                    <p className={styles.accountName}>{account.name}</p>
                    <p className={styles.accountType}>{account.type.replace("_", " ")}</p>
                    <p
                        className={institutionLinePending ? styles.institutionPending : styles.institution}
                        aria-label="Institution"
                    >
                        {institutionLine}
                    </p>
                </div>
                <Badge variant={account.status === "ACTIVE" ? "success" : "default"}>{account.status}</Badge>
            </div>
            <div className={styles.accountMeta}>
                <span className={styles.currency}>{account.currency}</span>
            </div>
            {account.status === "ACTIVE" && (
                <div className={styles.accountActions}>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={onRequestClose}
                        aria-label={`Close account ${account.name}`}
                    >
                        Close account
                    </Button>
                </div>
            )}
        </Card>
    );
}
