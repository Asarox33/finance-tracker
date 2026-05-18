"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePerformance, usePortfolioValue } from "@/features/analytics/hooks/useAnalytics";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useInstitutions } from "@/features/institutions/hooks/useInstitutions";
import { useReferenceCurrency } from "@/shared/hooks/useReferenceCurrency";
import { Card, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import { useFormatters, useI18n, type TranslationKey } from "@/shared/i18n";
import type { AccountType } from "@/shared/types";
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

export default function DashboardPage() {
    const { referenceCurrency, isLoading: currencyLoading } = useReferenceCurrency();
    const analyticsCurrency = currencyLoading ? undefined : referenceCurrency;

    const { data: portfolio, isLoading: pvLoading, error: pvError } = usePortfolioValue(analyticsCurrency);
    const { data: perf, isLoading: perfLoading, error: perfError } = usePerformance(analyticsCurrency, 12);
    const { data: accounts, isLoading: accLoading, error: accError } = useAccounts();
    const { data: institutions, isLoading: instLoading, error: instError } = useInstitutions();
    const { formatDate, formatMoney } = useFormatters();
    const { t } = useI18n();

    const accountById = useMemo(() => {
        return new Map(accounts?.items.map((a) => [a.id, a]) ?? []);
    }, [accounts]);

    const institutionById = useMemo(() => {
        return new Map(institutions?.items.map((i) => [i.id, i]) ?? []);
    }, [institutions]);

    const breakdownLoading = currencyLoading || pvLoading || accLoading || instLoading;
    const kpiLoading = currencyLoading || pvLoading;
    const perfKpiLoading = currencyLoading || perfLoading;

    const gainPositive = (perf?.gainLossBasisPoints ?? 0) >= 0;
    const breakdownError = pvError || accError || instError;
    const hasSnapshots = (portfolio?.snapshots.length ?? 0) > 0;
    const nonZeroSnapshotCount =
        portfolio?.snapshots.filter(
            (snapshot) => snapshot.valueInAccountCurrency !== 0 || snapshot.valueInReferenceCurrency !== 0
        ).length ?? 0;
    const hasPortfolioActivity = nonZeroSnapshotCount > 0;
    const hasInstitutions = (institutions?.items.length ?? 0) > 0;
    const activeAccountsCount = accounts?.items.filter((a) => a.status === "ACTIVE").length ?? 0;
    const showingGettingStarted =
        !breakdownLoading && !breakdownError && (!hasInstitutions || activeAccountsCount === 0 || !hasPortfolioActivity);
    const showAccountBreakdown = !breakdownLoading && !breakdownError && hasSnapshots;
    const showAccountBreakdownTitle = breakdownLoading || Boolean(breakdownError) || showAccountBreakdown;

    return (
        <div className={styles.page}>
            <PageHeader title={t("dashboard.title")} description={t("dashboard.asOfDate", { date: formatDate(today()) })} />

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
                        {accLoading ? (
                            <Skeleton className={styles.kpiSkel} />
                        ) : accError ? (
                            <ErrorState message={t("dashboard.loadBreakdownError")} />
                        ) : (
                            <p className={styles.kpiValue}>
                                {accounts?.items.filter((a) => a.status === "ACTIVE").length ?? 0}
                            </p>
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
                            <table aria-label={t("dashboard.accountValuesAria")}>
                                <thead>
                                    <tr>
                                        <th scope="col">{t("dashboard.account")}</th>
                                        <th scope="col">{t("dashboard.institution")}</th>
                                        <th scope="col" style={{ textAlign: "right" }}>
                                            {t("dashboard.value")}
                                        </th>
                                        <th scope="col" style={{ textAlign: "right" }}>
                                            {t("dashboard.inCurrency", { currency: referenceCurrency })}
                                        </th>
                                        <th scope="col">{t("dashboard.actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {portfolio?.snapshots.map((snap) => {
                                        const account = accountById.get(snap.accountId);
                                        const institution = account
                                            ? institutionById.get(account.institutionId)
                                            : undefined;
                                        return (
                                            <tr key={snap.accountId}>
                                                <td>
                                                    <div className={styles.entityCell}>
                                                        <span className={styles.entityName} title={account?.name ?? "—"}>
                                                            {account?.name ?? "—"}
                                                        </span>
                                                        {account && (
                                                            <span
                                                                className={`${styles.typePill} ${
                                                                    ACCOUNT_TYPE_CLASSES[account.type]
                                                                }`}
                                                            >
                                                                {t(`accountType.${account.type}` as TranslationKey)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.entityCell}>
                                                        <span
                                                            className={styles.entityName}
                                                            title={institution?.name ?? "—"}
                                                        >
                                                            {institution?.name ?? "—"}
                                                        </span>
                                                        {institution && (
                                                            <span
                                                                className={`${styles.typePill} ${
                                                                    INSTITUTION_TYPE_CLASSES[institution.type] ??
                                                                    styles.typeOther
                                                                }`}
                                                            >
                                                                {t(`institutionType.${institution.type}` as TranslationKey)}
                                                            </span>
                                                        )}
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
                                                    {account && (
                                                        <Link
                                                            href={`/transactions?accountId=${encodeURIComponent(
                                                                account.id
                                                            )}`}
                                                            className={styles.transactionLink}
                                                            aria-label={t("dashboard.viewTransactionsAria", {
                                                                accountName: account.name,
                                                            })}
                                                            title={t("dashboard.viewTransactionsAria", {
                                                                accountName: account.name,
                                                            })}
                                                        >
                                                            <span aria-hidden="true">⇄</span>
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </Card>
                    ) : null}
                </section>
            </div>
        </div>
    );
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
