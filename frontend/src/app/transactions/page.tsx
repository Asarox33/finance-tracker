"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAccount, useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import { transactionsApi } from "@/features/transactions/api/transactionsApi";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import ListPagination from "@/shared/components/ListPagination";
import { useTablePageSize } from "@/shared/hooks/useTablePageSize";
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import { useFormatters, useI18n, type TranslationKey } from "@/shared/i18n";
import type { Account, Transaction, TransactionType } from "@/shared/types";
import styles from "./page.module.css";

const TRANSACTION_TYPES: TransactionType[] = [
    "DEPOSIT",
    "WITHDRAWAL",
    "TRANSFER",
    "BUY",
    "SELL",
    "DIVIDEND",
    "FEE",
    "TAX",
    "OTHER",
];

const TYPE_VARIANTS: Record<string, "success" | "danger" | "warning" | "default"> = {
    DEPOSIT: "success",
    DIVIDEND: "success",
    WITHDRAWAL: "danger",
    FEE: "danger",
    TAX: "danger",
    BUY: "warning",
    SELL: "warning",
    TRANSFER: "default",
    OTHER: "default",
};

const INFLOW_TYPES: TransactionType[] = ["DEPOSIT", "SELL", "DIVIDEND"];
const OUTFLOW_TYPES: TransactionType[] = ["WITHDRAWAL", "BUY", "FEE", "TAX"];
const EXPLICIT_SIGN_TYPES: TransactionType[] = ["TRANSFER", "OTHER"];
const ACCOUNT_PICKER_PAGE_SIZE = 200;

function signedTransactionAmount(tx: Pick<Transaction, "type" | "amount">): number {
    if (INFLOW_TYPES.includes(tx.type)) return Math.abs(tx.amount);
    if (OUTFLOW_TYPES.includes(tx.type)) return -Math.abs(tx.amount);
    return tx.amount;
}

function sanitizeAmountInput(value: string, type: TransactionType): string {
    const negativeAllowed = EXPLICIT_SIGN_TYPES.includes(type);
    const normalized = value.replace(",", ".");
    let result = "";
    let hasSeparator = false;

    for (const char of normalized) {
        if (char >= "0" && char <= "9") {
            result += char;
            continue;
        }
        if (char === "." && !hasSeparator) {
            result += char;
            hasSeparator = true;
            continue;
        }
        if (char === "-" && negativeAllowed && result.length === 0) {
            result += char;
        }
    }

    return result;
}

export default function TransactionsPage() {
    const { t } = useI18n();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const accountIdFromUrl = searchParams.get("accountId") ?? "";
    const lastSyncedAccountIdRef = useRef(accountIdFromUrl);
    const [selectedAccount, setSelectedAccount] = useState(accountIdFromUrl);
    const [includeClosedAccounts, setIncludeClosedAccounts] = useState(false);
    const { account: selectedAccountDetails } = useAccount(selectedAccount);
    const { data: accounts } = useAccounts(0, includeClosedAccounts, undefined, ACCOUNT_PICKER_PAGE_SIZE);
    const [page, setPage] = useState(0);
    const { pageSize, setPageSize } = useTablePageSize();
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);
    const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [pendingDeleteTransaction, setPendingDeleteTransaction] = useState<Transaction | null>(null);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const { data, isLoading, error, mutate } = useTransactions(
        selectedAccount,
        page,
        from || undefined,
        to || undefined,
        pageSize
    );
    const selectedAccountRecord = useMemo(() => {
        return accounts?.items.find((account) => account.id === selectedAccount) ?? selectedAccountDetails;
    }, [accounts, selectedAccount, selectedAccountDetails]);
    const selectedAccountIsClosed = selectedAccountRecord?.status === "CLOSED";
    const activeAccounts = useMemo(
        () => accounts?.items.filter((account) => account.status === "ACTIVE") ?? [],
        [accounts]
    );
    const closedAccounts = useMemo(
        () => accounts?.items.filter((account) => account.status === "CLOSED") ?? [],
        [accounts]
    );

    useEffect(() => {
        if (lastSyncedAccountIdRef.current === accountIdFromUrl) {
            return;
        }
        lastSyncedAccountIdRef.current = accountIdFromUrl;
        setSelectedAccount(accountIdFromUrl);
        setPage(0);
        setShowForm(false);
        setDetailTransaction(null);
        setPendingDeleteTransaction(null);
    }, [accountIdFromUrl]);

    useEffect(() => {
        if (selectedAccountDetails?.status === "CLOSED") {
            setIncludeClosedAccounts(true);
        }
    }, [selectedAccountDetails]);

    function updateSelectedAccount(accountId: string) {
        lastSyncedAccountIdRef.current = accountId;
        setSelectedAccount(accountId);
        setPage(0);
        setShowForm(false);
        setDetailTransaction(null);
        setPendingDeleteTransaction(null);

        const nextParams = new URLSearchParams(searchParams.toString());
        if (accountId) {
            nextParams.set("accountId", accountId);
        } else {
            nextParams.delete("accountId");
        }
        const query = nextParams.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }

    function updateIncludeClosedAccounts(includeClosed: boolean) {
        setIncludeClosedAccounts(includeClosed);
        if (!includeClosed && selectedAccountIsClosed) {
            updateSelectedAccount("");
        }
    }

    async function openTransactionDetail(tx: Transaction) {
        setDetailLoadingId(tx.id);
        setDetailError(null);
        try {
            setDetailTransaction(await transactionsApi.get(tx.id));
        } catch {
            setDetailError(t("transactions.detailError"));
        } finally {
            setDetailLoadingId(null);
        }
    }

    async function confirmDeleteTransaction() {
        if (!pendingDeleteTransaction) return;
        setDeleteSubmitting(true);
        setDeleteError(null);
        try {
            await transactionsApi.delete(pendingDeleteTransaction.id);
            await mutate();
            setPendingDeleteTransaction(null);
            if (detailTransaction?.id === pendingDeleteTransaction.id) setDetailTransaction(null);
        } catch {
            setDeleteError(t("transactions.deleteError"));
        } finally {
            setDeleteSubmitting(false);
        }
    }

    return (
        <div className={styles.page}>
            <ConfirmDialog
                open={pendingDeleteTransaction !== null}
                title={t("transactions.deleteTitle")}
                description={
                    pendingDeleteTransaction
                        ? t("transactions.deleteDescription", { transactionLabel: pendingDeleteTransaction.label })
                        : null
                }
                cancelLabel={t("common.cancel")}
                confirmLabel={t("transactions.deleteTransaction")}
                confirmVariant="danger"
                loading={deleteSubmitting}
                errorMessage={deleteError}
                onConfirm={confirmDeleteTransaction}
                onCancel={() => {
                    setPendingDeleteTransaction(null);
                    setDeleteError(null);
                }}
            />
            <PageHeader
                title={t("transactions.title")}
                description={t("transactions.description")}
                action={
                    selectedAccount && !selectedAccountIsClosed ? (
                        <Button onClick={() => setShowForm(true)} variant="primary">
                            {t("transactions.new")}
                        </Button>
                    ) : undefined
                }
            />
            <div className={styles.body}>
                <div className={styles.filters}>
                    <div className={styles.filterField}>
                        <label htmlFor="account-select">{t("transactions.account")}</label>
                        <select
                            id="account-select"
                            value={selectedAccount}
                            onChange={(e) => {
                                updateSelectedAccount(e.target.value);
                            }}
                            aria-label={t("transactions.selectAccountAria")}
                        >
                            <option value="">{t("transactions.selectAccountOption")}</option>
                            {activeAccounts.length > 0 && (
                                <optgroup label={t("transactions.activeAccounts")}>
                                    {activeAccounts.map((account) => (
                                        <AccountOption key={account.id} account={account} />
                                    ))}
                                </optgroup>
                            )}
                            {includeClosedAccounts && closedAccounts.length > 0 && (
                                <optgroup label={t("transactions.closedAccounts")}>
                                    {closedAccounts.map((account) => (
                                        <AccountOption key={account.id} account={account} closed />
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    </div>
                    <label className={styles.switchControl}>
                        <input
                            type="checkbox"
                            checked={includeClosedAccounts}
                            onChange={(e) => updateIncludeClosedAccounts(e.target.checked)}
                        />
                        <span className={styles.switchTrack} aria-hidden="true">
                            <span className={styles.switchThumb} />
                        </span>
                        <span>{t("transactions.includeClosedAccounts")}</span>
                    </label>
                    <div className={styles.filterField}>
                        <label htmlFor="tx-from">{t("transactions.fromDate")}</label>
                        <input
                            id="tx-from"
                            type="date"
                            value={from}
                            onChange={(e) => {
                                setFrom(e.target.value);
                                setPage(0);
                            }}
                        />
                    </div>
                    <div className={styles.filterField}>
                        <label htmlFor="tx-to">{t("transactions.toDate")}</label>
                        <input
                            id="tx-to"
                            type="date"
                            value={to}
                            onChange={(e) => {
                                setTo(e.target.value);
                                setPage(0);
                            }}
                        />
                    </div>
                    {(from || to) && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setFrom("");
                                setTo("");
                                setPage(0);
                            }}
                        >
                            {t("transactions.clearDateFilters")}
                        </Button>
                    )}
                </div>

                {selectedAccountIsClosed && (
                    <Card className={styles.historyNotice}>
                        <p className={styles.historyNoticeTitle}>{t("transactions.closedAccountHistoryTitle")}</p>
                        <p>{t("transactions.closedAccountHistoryDescription")}</p>
                    </Card>
                )}

                {showForm && selectedAccount && !selectedAccountIsClosed && (
                    <AddTransactionForm
                        accountId={selectedAccount}
                        currency={selectedAccountRecord?.currency ?? "EUR"}
                        onSuccess={() => {
                            setShowForm(false);
                            mutate();
                        }}
                        onCancel={() => setShowForm(false)}
                    />
                )}

                {!selectedAccount && (
                    <EmptyState
                        title={t("transactions.selectAccountTitle")}
                        description={t("transactions.selectAccountDescription")}
                    />
                )}

                {selectedAccount && isLoading && (
                    <div className={styles.skels}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className={styles.rowSkel} />
                        ))}
                    </div>
                )}

                {selectedAccount && error && <ErrorState />}
                {detailError && <ErrorState message={detailError} />}

                {detailTransaction && (
                    <TransactionDetail
                        tx={detailTransaction}
                        readOnly={selectedAccountIsClosed}
                        onClose={() => setDetailTransaction(null)}
                        onDelete={() => {
                            setDeleteError(null);
                            setPendingDeleteTransaction(detailTransaction);
                        }}
                    />
                )}

                {selectedAccount && !isLoading && data && (
                    <>
                        {data.items.length === 0 && !showForm ? (
                            <EmptyState
                                title={t("transactions.emptyTitle")}
                                description={t("transactions.emptyDescription")}
                            />
                        ) : (
                            <Card>
                                <table aria-label={t("transactions.tableAria")}>
                                    <thead>
                                        <tr>
                                            <th scope="col">{t("transactions.date")}</th>
                                            <th scope="col">{t("transactions.label")}</th>
                                            <th scope="col">{t("transactions.type")}</th>
                                            <th scope="col" style={{ textAlign: "right" }}>
                                                {t("transactions.amount")}
                                            </th>
                                            <th scope="col">{t("transactions.actions")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.items.map((tx) => (
                                            <TransactionRow
                                                key={tx.id}
                                                tx={tx}
                                                detailLoading={detailLoadingId === tx.id}
                                                readOnly={selectedAccountIsClosed}
                                                onViewDetails={() => openTransactionDetail(tx)}
                                                onDelete={() => {
                                                    setDeleteError(null);
                                                    setPendingDeleteTransaction(tx);
                                                }}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        )}

                        {data.totalItems > 0 && (
                            <ListPagination
                                page={page}
                                pageSize={pageSize}
                                totalItems={data.totalItems}
                                onPageChange={setPage}
                                onPageSizeChange={(size) => {
                                    void setPageSize(size);
                                    setPage(0);
                                }}
                                ariaLabel={t("transactions.pagesAria")}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function AccountOption({ account, closed = false }: { account: Account; closed?: boolean }) {
    const { t } = useI18n();

    return (
        <option value={account.id}>
            {closed
                ? t("transactions.accountClosedOption", { accountName: account.name, currency: account.currency })
                : t("transactions.accountOption", { accountName: account.name, currency: account.currency })}
        </option>
    );
}

function AddTransactionForm({
    accountId,
    currency,
    onSuccess,
    onCancel,
}: {
    accountId: string;
    currency: string;
    onSuccess: () => void;
    onCancel: () => void;
}) {
    const { t } = useI18n();
    const [type, setType] = useState<TransactionType>("DEPOSIT");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [label, setLabel] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const amountFloat = Number(amount);
        if (isNaN(amountFloat) || amountFloat === 0) {
            setError(t("transactions.amountValidationError"));
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
            setError((err as { message?: string }).message ?? t("transactions.createError"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className={styles.formCard}>
            <h2 className={styles.formTitle}>{t("transactions.formTitle")}</h2>
            <form onSubmit={handleSubmit} noValidate aria-label={t("transactions.formAria")}>
                {error && (
                    <div role="alert" className={styles.formError}>
                        {error}
                    </div>
                )}

                <div className={styles.formGrid}>
                    <div className={styles.field}>
                        <label htmlFor="tx-type">{t("transactions.type")}</label>
                        <select
                            id="tx-type"
                            value={type}
                            onChange={(e) => {
                                const nextType = e.target.value as TransactionType;
                                setType(nextType);
                                setAmount((current) => sanitizeAmountInput(current, nextType));
                            }}
                            disabled={loading}
                        >
                            {TRANSACTION_TYPES.map((transactionType) => (
                                <option key={transactionType} value={transactionType}>
                                    {t(`transactionType.${transactionType}` as TranslationKey)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="tx-amount">
                            {t("transactions.amountWithCurrency", { currency })}
                            <span
                                style={{
                                    fontWeight: 400,
                                    color: "var(--text-dim)",
                                    marginLeft: "0.5rem",
                                }}
                            >
                                {t("transactions.withdrawalHint")}
                            </span>
                        </label>
                        <input
                            id="tx-amount"
                            type="text"
                            inputMode="decimal"
                            required
                            aria-required="true"
                            value={amount}
                            onChange={(e) => setAmount(sanitizeAmountInput(e.target.value, type))}
                            placeholder={t("transactions.amountPlaceholder")}
                            disabled={loading}
                            style={{ fontFamily: "var(--font-mono)" }}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="tx-date">{t("transactions.date")}</label>
                        <input
                            id="tx-date"
                            type="date"
                            required
                            aria-required="true"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="tx-label">{t("transactions.label")}</label>
                        <input
                            id="tx-label"
                            type="text"
                            required
                            aria-required="true"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder={t("transactions.labelPlaceholder")}
                            disabled={loading}
                        />
                    </div>

                    <div className={`${styles.field} ${styles.fieldWide}`}>
                        <label htmlFor="tx-notes">
                            {t("transactions.notes")}{" "}
                            <span
                                style={{
                                    color: "var(--text-dim)",
                                    fontWeight: 400,
                                }}
                            >
                                {t("common.optional")}
                            </span>
                        </label>
                        <input
                            id="tx-notes"
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t("transactions.notesPlaceholder")}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className={styles.formActions}>
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                        {t("common.cancel")}
                    </Button>
                    <Button type="submit" variant="primary" loading={loading}>
                        {t("transactions.record")}
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function TransactionDetail({
    tx,
    readOnly,
    onClose,
    onDelete,
}: {
    tx: Transaction;
    readOnly: boolean;
    onClose: () => void;
    onDelete: () => void;
}) {
    const { formatDate, formatMoney } = useFormatters();
    const { t } = useI18n();

    return (
        <Card className={styles.detailCard}>
            <div className={styles.detailHeader}>
                <div>
                    <h2 className={styles.formTitle}>{t("transactions.detailTitle")}</h2>
                    <p className={styles.detailSubtitle}>{tx.label}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                    {t("transactions.closeDetails")}
                </Button>
            </div>
            <dl className={styles.detailGrid}>
                <div>
                    <dt>{t("transactions.date")}</dt>
                    <dd>{formatDate(tx.date)}</dd>
                </div>
                <div>
                    <dt>{t("transactions.type")}</dt>
                    <dd>{t(`transactionType.${tx.type}` as TranslationKey)}</dd>
                </div>
                <div>
                    <dt>{t("transactions.amount")}</dt>
                    <dd>{formatMoney(signedTransactionAmount(tx), tx.currency)}</dd>
                </div>
                <div>
                    <dt>{t("transactions.asset")}</dt>
                    <dd>{tx.assetId ?? t("common.optional")}</dd>
                </div>
                <div>
                    <dt>{t("transactions.notes")}</dt>
                    <dd>{tx.notes || t("common.optional")}</dd>
                </div>
                <div>
                    <dt>{t("transactions.fx")}</dt>
                    <dd>
                        {tx.appliedFxRate
                            ? t("transactions.fxDetail", {
                                  rate: tx.appliedFxRate,
                                  scale: tx.appliedFxRateScale ?? "",
                                  date: tx.appliedFxRateDate ?? "",
                                  sourceCurrency: tx.appliedFxSourceCurrency ?? "",
                                  targetCurrency: tx.appliedFxTargetCurrency ?? "",
                              })
                            : t("transactions.noFx")}
                    </dd>
                </div>
            </dl>
            {!readOnly && (
                <div className={styles.formActions}>
                    <Button type="button" variant="danger" onClick={onDelete}>
                        {t("transactions.deleteTransaction")}
                    </Button>
                </div>
            )}
        </Card>
    );
}

function TransactionRow({
    tx,
    detailLoading,
    readOnly,
    onViewDetails,
    onDelete,
}: {
    tx: Transaction;
    detailLoading: boolean;
    readOnly: boolean;
    onViewDetails: () => void;
    onDelete: () => void;
}) {
    const signedAmount = signedTransactionAmount(tx);
    const positive = signedAmount >= 0;
    const { formatDate, formatMoney } = useFormatters();
    const { t } = useI18n();

    return (
        <tr>
            <td
                style={{
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                    whiteSpace: "nowrap",
                }}
            >
                {formatDate(tx.date)}
            </td>
            <td>
                <p style={{ fontWeight: 500 }}>{tx.label}</p>
                {tx.notes && (
                    <p
                        style={{
                            fontSize: "0.8125rem",
                            color: "var(--text-muted)",
                        }}
                    >
                        {tx.notes}
                    </p>
                )}
            </td>
            <td>
                <Badge variant={TYPE_VARIANTS[tx.type] ?? "default"}>
                    {t(`transactionType.${tx.type}` as TranslationKey)}
                </Badge>
                {tx.appliedFxRate && (
                    <span
                        style={{
                            marginLeft: "0.5rem",
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                        }}
                    >
                        {t("transactions.fx")}
                    </span>
                )}
            </td>
            <td
                style={{
                    textAlign: "right",
                    fontFamily: "var(--font-mono)",
                    whiteSpace: "nowrap",
                }}
            >
                <span
                    style={{
                        color: positive ? "var(--success)" : "var(--danger)",
                    }}
                >
                    {positive ? "+" : ""}
                    {formatMoney(signedAmount, tx.currency)}
                </span>
            </td>
            <td>
                <div className={styles.rowActions}>
                    <Button type="button" variant="secondary" size="sm" loading={detailLoading} onClick={onViewDetails}>
                        {t("transactions.details")}
                    </Button>
                    {!readOnly && (
                        <Button type="button" variant="danger" size="sm" onClick={onDelete}>
                            {t("transactions.deleteTransaction")}
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
}
