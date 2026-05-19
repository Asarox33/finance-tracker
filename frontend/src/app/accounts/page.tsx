"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import InstitutionPicker from "@/features/accounts/components/InstitutionPicker";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { accountsApi } from "@/features/accounts/api/accountsApi";
import { useInstitutions } from "@/features/institutions/hooks/useInstitutions";
import { useTablePageSize } from "@/shared/hooks/useTablePageSize";
import ListPagination from "@/shared/components/ListPagination";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import { useI18n, type TranslationKey } from "@/shared/i18n";
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

const ACCOUNT_TYPE_CLASSES: Record<AccountType, string> = {
    CHECKING: styles.typeChecking,
    SAVINGS: styles.typeSavings,
    BROKERAGE: styles.typeBrokerage,
    CRYPTO: styles.typeCrypto,
    REAL_ESTATE: styles.typeRealEstate,
    RETIREMENT: styles.typeRetirement,
    OTHER: styles.typeOther,
};

function getInstitutionDisplay(
    account: Account,
    institutionNameById: Map<string, string>,
    institutionsLoading: boolean,
    institutionsPage: { items: { id: string; name: string }[] } | undefined,
    institutionsError: unknown,
    copy: { loadError: string; loading: string; unavailable: string }
): { text: string; pending: boolean } {
    if (institutionsError) {
        return { text: copy.loadError, pending: false };
    }
    if (institutionsLoading && !institutionsPage) {
        return { text: copy.loading, pending: true };
    }
    const name = institutionNameById.get(account.institutionId);
    if (name) return { text: name, pending: false };
    return { text: copy.unavailable, pending: false };
}

export default function AccountsPage() {
    const { t } = useI18n();
    const [page, setPage] = useState(0);
    const [showClosed, setShowClosed] = useState(false);
    const [typeFilter, setTypeFilter] = useState<AccountType | "">("");
    const { pageSize, setPageSize } = useTablePageSize();
    const { data, isLoading, error, mutate } = useAccounts(page, showClosed, typeFilter || undefined, pageSize);
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
    const [reactivatingAccountId, setReactivatingAccountId] = useState<string | null>(null);
    const [accountActionError, setAccountActionError] = useState<string | null>(null);
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
        setAccountActionError(null);
        try {
            await accountsApi.close(pendingCloseAccount.id);
            await mutate();
            dismissCloseModal();
        } catch {
            setCloseError(t("accounts.closeError"));
        } finally {
            setCloseSubmitting(false);
        }
    }, [pendingCloseAccount, mutate, dismissCloseModal, t]);

    const reactivateAccount = useCallback(
        async (account: Account) => {
            setReactivatingAccountId(account.id);
            setAccountActionError(null);
            try {
                await accountsApi.reactivate(account.id);
                await mutate();
            } catch {
                setAccountActionError(t("accounts.reactivateError"));
            } finally {
                setReactivatingAccountId(null);
            }
        },
        [mutate, t]
    );

    return (
        <div className={styles.page}>
            <ConfirmDialog
                open={pendingCloseAccount !== null}
                title={t("accounts.closeTitle")}
                description={
                    pendingCloseAccount ? (
                        <>
                            <p className={styles.closeModalLead}>
                                {pendingInstitutionName
                                    ? t("accounts.closeDescriptionWithInstitution", {
                                          accountName: pendingCloseAccount.name,
                                          institutionName: pendingInstitutionName,
                                      })
                                    : t("accounts.closeDescription", { accountName: pendingCloseAccount.name })}
                            </p>
                            <p className={styles.closeModalHint}>{t("accounts.closeHint")}</p>
                        </>
                    ) : null
                }
                cancelLabel={t("accounts.keepAccount")}
                confirmLabel={t("accounts.closeAccount")}
                confirmVariant="danger"
                loading={closeSubmitting}
                errorMessage={closeError}
                onConfirm={confirmCloseAccount}
                onCancel={dismissCloseModal}
            />
            <PageHeader
                title={t("accounts.title")}
                description={t("accounts.description")}
                action={
                    <Button onClick={() => setShowForm(true)} variant="primary">
                        {t("accounts.new")}
                    </Button>
                }
            />
            <div className={styles.body}>
                {showForm && (
                    <AddAccountForm
                        onSuccess={() => {
                            setShowForm(false);
                            setPage(0);
                            mutate();
                        }}
                        onCancel={() => setShowForm(false)}
                    />
                )}

                <div className={styles.toolbar}>
                    <div className={styles.filters}>
                        <div className={styles.filterField}>
                            <label htmlFor="account-type-filter">{t("accounts.type")}</label>
                            <select
                                id="account-type-filter"
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value as AccountType | "");
                                    setPage(0);
                                }}
                                aria-label={t("accounts.filterTypeAria")}
                            >
                                <option value="">{t("accounts.allTypes")}</option>
                                {ACCOUNT_TYPES.map((accountType) => (
                                    <option key={accountType} value={accountType}>
                                        {t(`accountType.${accountType}` as TranslationKey)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <label className={styles.switchControl}>
                        <input
                            type="checkbox"
                            checked={showClosed}
                            onChange={(e) => {
                                setShowClosed(e.target.checked);
                                setPage(0);
                            }}
                        />
                        <span className={styles.switchTrack} aria-hidden="true">
                            <span className={styles.switchThumb} />
                        </span>
                        <span>{t("accounts.showClosed")}</span>
                    </label>
                </div>

                {isLoading && (
                    <div className={styles.skels}>
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className={styles.cardSkel} />
                        ))}
                    </div>
                )}
                {error && <ErrorState />}
                {accountActionError && <ErrorState message={accountActionError} />}
                {!isLoading && data?.items.length === 0 && !showForm && (
                    <EmptyState
                        title={showClosed ? t("accounts.emptyAllTitle") : t("accounts.emptyTitle")}
                        description={showClosed ? t("accounts.emptyAllDescription") : t("accounts.emptyDescription")}
                    />
                )}
                <div className={styles.grid}>
                    {data?.items.map((account) => {
                        const institutionDisplay = getInstitutionDisplay(
                            account,
                            institutionNameById,
                            institutionsLoading,
                            institutionsPage,
                            institutionsError,
                            {
                                loadError: t("accounts.loadInstitutionError"),
                                loading: t("accounts.loadingInstitution"),
                                unavailable: t("accounts.institutionUnavailable"),
                            }
                        );
                        return (
                            <AccountCard
                                key={account.id}
                                account={account}
                                institutionLine={institutionDisplay.text}
                                institutionLinePending={institutionDisplay.pending}
                                reactivating={reactivatingAccountId === account.id}
                                onRequestClose={() => {
                                    setCloseError(null);
                                    setAccountActionError(null);
                                    setPendingCloseAccount(account);
                                }}
                                onRequestReactivate={() => reactivateAccount(account)}
                            />
                        );
                    })}
                </div>
                {data && data.totalItems > 0 && (
                    <ListPagination
                        page={page}
                        pageSize={pageSize}
                        totalItems={data.totalItems}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => {
                            void setPageSize(size);
                            setPage(0);
                        }}
                        ariaLabel={t("accounts.pagesAria")}
                    />
                )}
            </div>
        </div>
    );
}

function AddAccountForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
    const { t } = useI18n();

    const [name, setName] = useState("");
    const [type, setType] = useState<AccountType>("CHECKING");
    const [currency, setCurrency] = useState("EUR");
    const [institutionId, setInstitutionId] = useState("");
    const [institutionLabel, setInstitutionLabel] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!institutionId.trim()) {
            setError(t("accounts.selectInstitutionError"));
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
            setError((err as { message?: string }).message ?? t("accounts.createError"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className={styles.formCard}>
            <h2 className={styles.formTitle}>{t("accounts.formTitle")}</h2>
            <form onSubmit={handleSubmit} noValidate aria-label={t("accounts.formAria")}>
                {error && (
                    <div role="alert" className={styles.formError}>
                        {error}
                    </div>
                )}

                <div className={styles.formGrid}>
                    <div className={styles.field}>
                        <label htmlFor="acc-name">{t("accounts.name")}</label>
                        <input
                            id="acc-name"
                            type="text"
                            required
                            aria-required="true"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("accounts.namePlaceholder")}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="acc-type">{t("accounts.type")}</label>
                        <select
                            id="acc-type"
                            value={type}
                            onChange={(e) => setType(e.target.value as AccountType)}
                            disabled={loading}
                        >
                            {ACCOUNT_TYPES.map((accountType) => (
                                <option key={accountType} value={accountType}>
                                    {t(`accountType.${accountType}` as TranslationKey)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="acc-currency">{t("accounts.currency")}</label>
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
                        <label htmlFor="acc-institution">{t("accounts.institution")}</label>
                        <InstitutionPicker
                            value={institutionId}
                            selectedLabel={institutionLabel}
                            disabled={loading}
                            onChange={(id, inst) => {
                                setInstitutionId(id);
                                setInstitutionLabel(inst.name);
                            }}
                            onClear={() => {
                                setInstitutionId("");
                                setInstitutionLabel(null);
                            }}
                        />
                    </div>
                </div>

                <div className={styles.formActions}>
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                        {t("common.cancel")}
                    </Button>
                    <Button type="submit" variant="primary" loading={loading} disabled={!institutionId.trim()}>
                        {t("accounts.create")}
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
    reactivating,
    onRequestClose,
    onRequestReactivate,
}: {
    account: Account;
    institutionLine: string;
    institutionLinePending: boolean;
    reactivating: boolean;
    onRequestClose: () => void;
    onRequestReactivate: () => void;
}) {
    const { t } = useI18n();

    return (
        <Card className={styles.accountCard}>
            <div className={styles.accountHeader}>
                <div className={styles.accountTitleBlock}>
                    <div className={styles.accountNameRow}>
                        <p className={styles.accountName} title={account.name}>
                            {account.name}
                        </p>
                        <span className={styles.currency}>{account.currency}</span>
                    </div>
                    <span className={`${styles.typePill} ${ACCOUNT_TYPE_CLASSES[account.type]}`}>
                        {t(`accountType.${account.type}` as TranslationKey)}
                    </span>
                    <p
                        className={institutionLinePending ? styles.institutionPending : styles.institution}
                        aria-label={t("accounts.institution")}
                        title={institutionLine}
                    >
                        {institutionLine}
                    </p>
                </div>
                <Badge variant={account.status === "ACTIVE" ? "success" : "default"}>
                    {t(`accountStatus.${account.status}` as TranslationKey)}
                </Badge>
            </div>
            <div className={styles.accountFooter}>
                <div className={styles.accountActions}>
                    <Link
                        href={`/transactions?accountId=${encodeURIComponent(account.id)}`}
                        className={styles.accountActionLink}
                        aria-label={t(
                            account.status === "ACTIVE" ? "accounts.viewTransactionsAria" : "accounts.viewHistoryAria",
                            { accountName: account.name }
                        )}
                    >
                        {t(account.status === "ACTIVE" ? "accounts.viewTransactions" : "accounts.viewHistory")}
                    </Link>
                    {account.status === "ACTIVE" && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className={styles.closeAction}
                            onClick={onRequestClose}
                            aria-label={t("accounts.closeAccountAria", { accountName: account.name })}
                        >
                            {t("accounts.closeAccount")}
                        </Button>
                    )}
                    {account.status === "CLOSED" && (
                        <Button
                            variant="secondary"
                            size="sm"
                            loading={reactivating}
                            onClick={onRequestReactivate}
                            aria-label={t("accounts.reactivateAccountAria", { accountName: account.name })}
                        >
                            {t("accounts.reactivateAccount")}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
