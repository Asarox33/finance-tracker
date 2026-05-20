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
import type { AccountSnapshot, AccountType, HoldingLine } from "@/shared/types";
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

type BreakdownSortKey = "account" | "institution" | "cash" | "holdings" | "accountValue" | "referenceValue";
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
    const { formatDate, formatMoney, formatScaledMinor } = useFormatters();
    const { t } = useI18n();

    const breakdownLoading = currencyLoading || pvLoading;
    const kpiLoading = currencyLoading || pvLoading;
    const perfKpiLoading = currencyLoading || perfLoading;

    const gainPositive = (perf?.gainLossBasisPoints ?? 0) >= 0;
    const breakdownError = pvError;
    const hasSnapshots = (portfolio?.snapshots.length ?? 0) > 0;
    const nonZeroSnapshotCount =
        portfolio?.snapshots.filter((snapshot) => {
            const cash = snapshot.cashBalanceInAccountCurrency ?? 0;
            const holdings = snapshot.holdingsValueInAccountCurrency ?? 0;
            return (
                snapshot.valueInAccountCurrency !== 0 ||
                snapshot.valueInReferenceCurrency !== 0 ||
                cash !== 0 ||
                holdings !== 0
            );
        }).length ?? 0;
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
                        <Card className={styles.breakdownCard}>
                            <div className={styles.breakdownTableWrap}>
                                <table className={styles.breakdownTable} aria-label={t("dashboard.accountValuesAria")}>
                                    <colgroup>
                                        <col className={styles.colAccount} />
                                        <col className={styles.colInstitution} />
                                        <col className={styles.colCash} />
                                        <col className={styles.colHoldings} />
                                        <col className={styles.colValue} />
                                        <col className={styles.colValue} />
                                        <col className={styles.colActions} />
                                    </colgroup>
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
                                                sortKey="cash"
                                                currentSort={breakdownSort}
                                                onSort={handleBreakdownSort}
                                                label={t("dashboard.sortByCash")}
                                                align="right"
                                            >
                                                {t("dashboard.cash")}
                                            </SortHeader>
                                            <SortHeader
                                                sortKey="holdings"
                                                currentSort={breakdownSort}
                                                onSort={handleBreakdownSort}
                                                label={t("dashboard.sortByHoldings")}
                                                align="right"
                                            >
                                                {t("dashboard.holdingsMtm")}
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
                                                label={t("dashboard.sortByReferenceValue", {
                                                    currency: referenceCurrency,
                                                })}
                                                align="right"
                                            >
                                                {t("dashboard.referenceCurrencyValue", { currency: referenceCurrency })}
                                            </SortHeader>
                                            <th
                                                scope="col"
                                                className={`${styles.fixedHeaderCell} ${styles.actionsCell}`}
                                            >
                                                {t("dashboard.actions")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedSnapshots.map((snap) => {
                                            const accountType = snap.accountType as AccountType;
                                            return (
                                                <tr key={snap.accountId} className={styles.breakdownRow}>
                                                    <td data-label={t("dashboard.account")}>
                                                        <div className={styles.entityCell}>
                                                            <span
                                                                className={styles.entityName}
                                                                title={snap.accountName}
                                                            >
                                                                {snap.accountName}
                                                            </span>
                                                            <span
                                                                className={`${styles.typePill} ${
                                                                    ACCOUNT_TYPE_CLASSES[accountType] ??
                                                                    styles.typeOther
                                                                }`}
                                                            >
                                                                {t(`accountType.${accountType}` as TranslationKey)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td data-label={t("dashboard.institution")}>
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
                                                    <td className={styles.numericCell} data-label={t("dashboard.cash")}>
                                                        {formatMoney(
                                                            snap.cashBalanceInAccountCurrency ?? 0,
                                                            snap.currency
                                                        )}
                                                    </td>
                                                    <td
                                                        className={`${styles.numericCell} ${styles.holdingsCell}`}
                                                        data-label={t("dashboard.holdingsMtm")}
                                                    >
                                                        <DashboardHoldingsCell
                                                            holdings={snap.holdings ?? []}
                                                            accountValueInAccountCurrency={snap.valueInAccountCurrency}
                                                            accountValueInReferenceCurrency={
                                                                snap.valueInReferenceCurrency
                                                            }
                                                            referenceCurrency={snap.referenceCurrency}
                                                            formatMoney={formatMoney}
                                                            formatScaledMinor={formatScaledMinor}
                                                        />
                                                    </td>
                                                    <td
                                                        className={styles.numericCell}
                                                        data-label={t("dashboard.value")}
                                                    >
                                                        {formatMoney(snap.valueInAccountCurrency, snap.currency)}
                                                    </td>
                                                    <td
                                                        className={styles.numericCell}
                                                        data-label={t("dashboard.referenceCurrencyValue", {
                                                            currency: referenceCurrency,
                                                        })}
                                                    >
                                                        {formatMoney(
                                                            snap.valueInReferenceCurrency,
                                                            snap.referenceCurrency
                                                        )}
                                                    </td>
                                                    <td
                                                        className={styles.actionsCell}
                                                        data-label={t("dashboard.actions")}
                                                    >
                                                        <div className={styles.actionsCellInner}>
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
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
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

function holdingValueInReferenceCurrency(
    holding: HoldingLine,
    accountValueInAccountCurrency: number,
    accountValueInReferenceCurrency: number
): number {
    if (accountValueInAccountCurrency === 0) {
        return 0;
    }
    return Math.round(
        (holding.valueInAccountCurrency * accountValueInReferenceCurrency) / accountValueInAccountCurrency
    );
}

function holdingDisplayLabel(h: HoldingLine): string {
    const name = h.assetName?.trim();
    const ticker = h.assetTicker?.trim();
    if (name && ticker) {
        return `${name} (${ticker})`;
    }
    if (name) {
        return name;
    }
    if (ticker) {
        return ticker;
    }
    return h.assetId.length > 10 ? `${h.assetId.slice(0, 8)}…` : h.assetId;
}

function DashboardHoldingsCell({
    holdings,
    accountValueInAccountCurrency,
    accountValueInReferenceCurrency,
    referenceCurrency,
    formatMoney,
    formatScaledMinor,
}: {
    holdings: HoldingLine[];
    accountValueInAccountCurrency: number;
    accountValueInReferenceCurrency: number;
    referenceCurrency: string;
    formatMoney: (amount: number, currency: string) => string;
    formatScaledMinor: (minor: number, scale: number) => string;
}) {
    if (holdings.length === 0) {
        return <span className={styles.holdingsEmpty}>—</span>;
    }
    return (
        <ul className={styles.holdingsList}>
            {holdings.map((h) => {
                const valueInRef = holdingValueInReferenceCurrency(
                    h,
                    accountValueInAccountCurrency,
                    accountValueInReferenceCurrency
                );
                const valueTitle = formatMoney(valueInRef, referenceCurrency);
                return (
                    <li key={h.assetId}>
                        <div className={styles.holdingsLine} title={valueTitle}>
                            <span className={styles.holdingsLabel}>{holdingDisplayLabel(h)}</span>
                            <span className={styles.holdingsQty}>
                                {formatScaledMinor(h.quantityMinor, h.quantityScale)}
                            </span>
                        </div>
                    </li>
                );
            })}
        </ul>
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
    if (key === "accountValue" || key === "referenceValue" || key === "cash" || key === "holdings") {
        return "desc";
    }
    return "asc";
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
        case "cash":
            result = (a.cashBalanceInAccountCurrency ?? 0) - (b.cashBalanceInAccountCurrency ?? 0);
            break;
        case "holdings":
            result = (a.holdingsValueInAccountCurrency ?? 0) - (b.holdingsValueInAccountCurrency ?? 0);
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
