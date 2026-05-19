"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { usePerformance, usePortfolioValue } from "@/features/analytics/hooks/useAnalytics";
import { useInstitutions } from "@/features/institutions/hooks/useInstitutions";
import { useReferenceCurrency } from "@/shared/hooks/useReferenceCurrency";
import { useTablePageSize } from "@/shared/hooks/useTablePageSize";
import ListPagination from "@/shared/components/ListPagination";
import { Card, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import { useFormatters, useI18n, type TranslationKey } from "@/shared/i18n";
import type { AccountSnapshot, AccountType } from "@/shared/types";
import { formatBasisPoints, today } from "@/lib/format";
import styles from "./page.module.css";

const ACCOUNT_TYPE_CLASSES: Record<AccountType, string> = {
    CHECKING: styles.typeChecking,
    SAVINGS: styles.typeSavings,
    BROKERAGE: styles.typeBrokerage,
    CRYPTO: styles.typeCrypto,
    REAL_ESTATE: styles.typeRealEstate,
    RETIREMENT: styles.typeRetirement,
    OTHER: styles.typeOther,
};

const INSTITUTION_TYPE_CLASSES: Record<string, string> = {
    BANK: styles.typeBank,
    BROKER: styles.typeBroker,
    INSURANCE: styles.typeInsurance,
    CRYPTO_EXCHANGE: styles.typeCryptoExchange,
    OTHER: styles.typeOther,
};

type BreakdownSortKey = "account" | "institution" | "accountValue" | "referenceValue";
type SortDirection = "asc" | "desc";

interface BreakdownSort {
    key: BreakdownSortKey;
    direction: SortDirection;
}

export default function DashboardPage() {
    const { referenceCurrency, isLoading: currencyLoading } = useReferenceCurrency();
    const analyticsCurrency = currencyLoading ? undefined : referenceCurrency;
    const [breakdownSort, setBreakdownSort] = useState<BreakdownSort>({
        key: "referenceValue",
        direction: "desc",
    });
    const [breakdownPage, setBreakdownPage] = useState(0);
    const { pageSize, setPageSize } = useTablePageSize();

    const { data: portfolio, isLoading: pvLoading, error: pvError } = usePortfolioValue(analyticsCurrency);
    const { data: perf, isLoading: perfLoading, error: perfError } = usePerformance(analyticsCurrency, 12);
    const { data: institutionsCheck } = useInstitutions(0, undefined, undefined, 1);
    const { formatDate, formatMoney } = useFormatters();
    const { t } = useI18n();

    const breakdownLoading = currencyLoading || pvLoading;
    const kpiLoading = currencyLoading || pvLoading;
    const perfKpiLoading = currencyLoading || perfLoading;

    const gainPositive = (perf?.gainLossBasisPoints ?? 0) >= 0;
    const breakdownError = pvError;
    const hasSnapshots = (portfolio?.snapshots.length ?? 0) > 0;
    const nonZeroSnapshotCount =
        portfolio?.snapshots.filter(
            (snapshot) => snapshot.valueInAccountCurrency !== 0 || snapshot.valueInReferenceCurrency !== 0
        ).length ?? 0;
    const hasPortfolioActivity = nonZeroSnapshotCount > 0;
    const hasInstitutions = (institutionsCheck?.totalItems ?? 0) > 0;
    const activeAccountsCount = portfolio?.snapshots.length ?? 0;
    const showingGettingStarted =
        !breakdownLoading &&
        !breakdownError &&
        (!hasInstitutions || activeAccountsCount === 0 || !hasPortfolioActivity);
    const showAccountBreakdown = !breakdownLoading && !breakdownError && hasSnapshots;
    const showAccountBreakdownTitle = breakdownLoading || Boolean(breakdownError) || showAccountBreakdown;
    const sortedSnapshots = useMemo(() => {
        return [...(portfolio?.snapshots ?? [])].sort((a, b) => compareSnapshots(a, b, breakdownSort));
    }, [breakdownSort, portfolio?.snapshots]);

    const pagedSnapshots = useMemo(() => {
        const start = breakdownPage * pageSize;
        return sortedSnapshots.slice(start, start + pageSize);
    }, [breakdownPage, pageSize, sortedSnapshots]);

    useEffect(() => {
        setBreakdownPage(0);
    }, [breakdownSort, pageSize, portfolio?.snapshots.length]);

    const handleBreakdownSort = (key: BreakdownSortKey) => {
        setBreakdownSort((current) => {
            if (current.key === key) {
                return { key, direction: current.direction === "asc" ? "desc" : "asc" };
            }

            return { key, direction: defaultSortDirection(key) };
        });
    };

    return (
        <div className={styles.page}>
            <PageHeader
                title={t("dashboard.title")}
                description={t("dashboard.asOfDate", { date: formatDate(today()) })}
            />

            <div className={styles.body}>
                <section aria-label={t("dashboard.portfolioOverviewAria")} className={styles.kpis}>
                    <Card className={styles.kpi}>
                        <p className={styles.kpiLabel}>{t("dashboard.portfolioValue")}</p>
                        {kpiLoading ? (
                            <Skeleton className={styles.kpiSkel} />
                        ) : pvError ? (
                            <ErrorState message={t("dashboard.loadPortfolioError")} />
                        ) : (
                            <p className={styles.kpiValue}>
                                {formatMoney(portfolio?.totalValue ?? 0, portfolio?.currency ?? referenceCurrency)}
                            </p>
                        )}
                        <p className={styles.kpiSub}>
                            {portfolio?.currency ?? referenceCurrency} · {t("dashboard.referenceCurrency")}
                        </p>
                    </Card>

                    <Card className={styles.kpi}>
                        <p className={styles.kpiLabel}>{t("dashboard.performance12Month")}</p>
                        {perfKpiLoading ? (
                            <Skeleton className={styles.kpiSkel} />
                        ) : perfError ? (
                            <ErrorState message={t("dashboard.loadPerformanceError")} />
                        ) : (
                            <>
                                <p className={`${styles.kpiValue} ${gainPositive ? styles.positive : styles.negative}`}>
                                    {formatBasisPoints(perf?.gainLossBasisPoints ?? 0)}
                                </p>
                                <p className={styles.kpiSub}>
                                    {formatMoney(perf?.gainLoss ?? 0, perf?.currency ?? referenceCurrency)}{" "}
                                    {t("dashboard.gainLoss")}
                                </p>
                            </>
                        )}
                    </Card>

                    <Card className={styles.kpi}>
                        <p className={styles.kpiLabel}>{t("dashboard.activeAccounts")}</p>
                        {breakdownLoading ? (
                            <Skeleton className={styles.kpiSkel} />
                        ) : pvError ? (
                            <ErrorState message={t("dashboard.loadBreakdownError")} />
                        ) : (
                            <p className={styles.kpiValue}>{activeAccountsCount}</p>
                        )}
                        <p className={styles.kpiSub}>{t("dashboard.acrossInstitutions")}</p>
                    </Card>
                </section>

                {showingGettingStarted && (
                    <GettingStartedCard
                        hasInstitutions={hasInstitutions}
                        hasAccounts={activeAccountsCount > 0}
                        hasSnapshots={hasPortfolioActivity}
                    />
                )}

                <section aria-label={t("dashboard.accountBreakdownAria")} className={styles.section}>
                    {showAccountBreakdownTitle && (
                        <h2 className={styles.sectionTitle}>{t("dashboard.accountBreakdown")}</h2>
                    )}
                    {breakdownLoading ? (
                        <div className={styles.skels}>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className={styles.rowSkel} />
                            ))}
                        </div>
                    ) : breakdownError ? (
                        <ErrorState message={t("dashboard.loadBreakdownError")} />
                    ) : showAccountBreakdown ? (
                        <Card>
                            <table className={styles.breakdownTable} aria-label={t("dashboard.accountValuesAria")}>
                                <thead>
                                    <tr>
                                        <SortHeader
                                            sortKey="account"
                                            currentSort={breakdownSort}
                                            onSort={handleBreakdownSort}
                                            label={t("dashboard.sortByAccount")}
                                        >
                                            {t("dashboard.account")}
                                        </SortHeader>
                                        <SortHeader
                                            sortKey="institution"
                                            currentSort={breakdownSort}
                                            onSort={handleBreakdownSort}
                                            label={t("dashboard.sortByInstitution")}
                                        >
                                            {t("dashboard.institution")}
                                        </SortHeader>
                                        <SortHeader
                                            sortKey="accountValue"
                                            currentSort={breakdownSort}
                                            onSort={handleBreakdownSort}
                                            label={t("dashboard.sortByAccountValue")}
                                            align="right"
                                        >
                                            {t("dashboard.value")}
                                        </SortHeader>
                                        <SortHeader
                                            sortKey="referenceValue"
                                            currentSort={breakdownSort}
                                            onSort={handleBreakdownSort}
                                            label={t("dashboard.sortByReferenceValue", { currency: referenceCurrency })}
                                            align="right"
                                        >
                                            {t("dashboard.referenceCurrencyValue", { currency: referenceCurrency })}
                                        </SortHeader>
                                        <th scope="col" className={styles.fixedHeaderCell}>
                                            {t("dashboard.actions")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedSnapshots.map((snap) => {
                                        const accountType = snap.accountType as AccountType;
                                        return (
                                            <tr key={snap.accountId}>
                                                <td>
                                                    <div className={styles.entityCell}>
                                                        <span className={styles.entityName} title={snap.accountName}>
                                                            {snap.accountName}
                                                        </span>
                                                        <span
                                                            className={`${styles.typePill} ${
                                                                ACCOUNT_TYPE_CLASSES[accountType] ?? styles.typeOther
                                                            }`}
                                                        >
                                                            {t(`accountType.${accountType}` as TranslationKey)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.entityCell}>
                                                        <span
                                                            className={styles.entityName}
                                                            title={snap.institutionName}
                                                        >
                                                            {snap.institutionName}
                                                        </span>
                                                        <span
                                                            className={`${styles.typePill} ${
                                                                INSTITUTION_TYPE_CLASSES[snap.institutionType] ??
                                                                styles.typeOther
                                                            }`}
                                                        >
                                                            {t(
                                                                `institutionType.${snap.institutionType}` as TranslationKey
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td
                                                    style={{
                                                        textAlign: "right",
                                                        fontFamily: "var(--font-mono)",
                                                    }}
                                                >
                                                    {formatMoney(snap.valueInAccountCurrency, snap.currency)}
                                                </td>
                                                <td
                                                    style={{
                                                        textAlign: "right",
                                                        fontFamily: "var(--font-mono)",
                                                    }}
                                                >
                                                    {formatMoney(snap.valueInReferenceCurrency, snap.referenceCurrency)}
                                                </td>
                                                <td>
                                                    <Link
                                                        href={`/transactions?accountId=${encodeURIComponent(snap.accountId)}`}
                                                        className={styles.transactionLink}
                                                        aria-label={t("dashboard.viewTransactionsAria", {
                                                            accountName: snap.accountName,
                                                        })}
                                                        title={t("dashboard.viewTransactionsAria", {
                                                            accountName: snap.accountName,
                                                        })}
                                                    >
                                                        <span aria-hidden="true">⇄</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <ListPagination
                                page={breakdownPage}
                                pageSize={pageSize}
                                totalItems={sortedSnapshots.length}
                                onPageChange={setBreakdownPage}
                                onPageSizeChange={(size) => {
                                    void setPageSize(size);
                                }}
                                ariaLabel={t("dashboard.accountBreakdownAria")}
                            />
                        </Card>
                    ) : null}
                </section>
            </div>
        </div>
    );
}

function SortHeader({
    sortKey,
    currentSort,
    onSort,
    label,
    align = "left",
    children,
}: {
    sortKey: BreakdownSortKey;
    currentSort: BreakdownSort;
    onSort: (key: BreakdownSortKey) => void;
    label: string;
    align?: "left" | "right";
    children: ReactNode;
}) {
    const active = currentSort.key === sortKey;
    const directionIndicator = currentSort.direction === "asc" ? "↑" : "↓";

    return (
        <th
            scope="col"
            className={styles.sortableHeaderCell}
            aria-sort={active ? (currentSort.direction === "asc" ? "ascending" : "descending") : "none"}
            style={{ textAlign: align }}
        >
            <button
                type="button"
                className={`${styles.sortHeader} ${align === "right" ? styles.sortHeaderRight : ""} ${
                    active ? styles.sortHeaderActive : ""
                }`}
                onClick={() => onSort(sortKey)}
                aria-label={label}
            >
                <span>{children}</span>
                {active && (
                    <span aria-hidden="true" className={styles.sortIndicator}>
                        {directionIndicator}
                    </span>
                )}
            </button>
        </th>
    );
}

function defaultSortDirection(key: BreakdownSortKey): SortDirection {
    return key === "accountValue" || key === "referenceValue" ? "desc" : "asc";
}

function compareSnapshots(a: AccountSnapshot, b: AccountSnapshot, sort: BreakdownSort): number {
    const direction = sort.direction === "asc" ? 1 : -1;
    let result = 0;

    switch (sort.key) {
        case "account":
            result = compareText(a.accountName, b.accountName);
            break;
        case "institution":
            result = compareText(a.institutionName, b.institutionName);
            break;
        case "accountValue":
            result = a.valueInAccountCurrency - b.valueInAccountCurrency;
            break;
        case "referenceValue":
            result = a.valueInReferenceCurrency - b.valueInReferenceCurrency;
            break;
    }

    if (result !== 0) {
        return result * direction;
    }

    return compareText(a.accountName, b.accountName) || a.accountId.localeCompare(b.accountId);
}

function compareText(a?: string, b?: string): number {
    return (a ?? "").localeCompare(b ?? "", undefined, { sensitivity: "base" });
}

function GettingStartedCard({
    hasInstitutions,
    hasAccounts,
    hasSnapshots,
}: {
    hasInstitutions: boolean;
    hasAccounts: boolean;
    hasSnapshots: boolean;
}) {
    const { t } = useI18n();
    const steps = [
        {
            href: "/institutions",
            complete: hasInstitutions,
            label: t("dashboard.onboardingInstitution"),
        },
        {
            href: "/accounts",
            complete: hasAccounts,
            label: t("dashboard.onboardingAccount"),
        },
        {
            href: "/transactions",
            complete: hasSnapshots,
            label: t("dashboard.onboardingTransaction"),
        },
    ];

    return (
        <Card className={styles.onboardingCard}>
            <div className={styles.onboardingIntro}>
                <h3 className={styles.onboardingTitle}>{t("dashboard.onboardingTitle")}</h3>
                <p className={styles.onboardingDescription}>{t("dashboard.onboardingDescription")}</p>
            </div>
            <ol className={styles.onboardingList}>
                {steps.map((step, index) => (
                    <li key={step.href} className={styles.onboardingItem}>
                        <span
                            className={step.complete ? styles.onboardingDone : styles.onboardingNumber}
                            aria-hidden="true"
                        >
                            {step.complete ? "✓" : index + 1}
                        </span>
                        <Link href={step.href} className={styles.onboardingLink}>
                            {step.label}
                        </Link>
                    </li>
                ))}
            </ol>
        </Card>
    );
}
