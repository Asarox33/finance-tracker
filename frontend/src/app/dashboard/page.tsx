"use client";

import { useMemo } from "react";
import { usePerformance, usePortfolioValue } from "@/features/analytics/hooks/useAnalytics";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useInstitutions } from "@/features/institutions/hooks/useInstitutions";
import { useReferenceCurrency } from "@/shared/hooks/useReferenceCurrency";
import { Badge, Card, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import { useFormatters, useI18n } from "@/shared/i18n";
import { formatBasisPoints, today } from "@/lib/format";
import styles from "./page.module.css";

export default function DashboardPage() {
    const { referenceCurrency, isLoading: currencyLoading } = useReferenceCurrency();
    const analyticsCurrency = currencyLoading ? undefined : referenceCurrency;

    const { data: portfolio, isLoading: pvLoading, error: pvError } = usePortfolioValue(analyticsCurrency);
    const { data: perf, isLoading: perfLoading } = usePerformance(analyticsCurrency, 12);
    const { data: accounts, isLoading: accLoading } = useAccounts();
    const { data: institutions, isLoading: instLoading } = useInstitutions();
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
                        ) : (
                            <p className={styles.kpiValue}>
                                {accounts?.items.filter((a) => a.status === "ACTIVE").length ?? 0}
                            </p>
                        )}
                        <p className={styles.kpiSub}>{t("dashboard.acrossInstitutions")}</p>
                    </Card>
                </section>

                <section aria-label={t("dashboard.accountBreakdownAria")} className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("dashboard.accountBreakdown")}</h2>
                    {breakdownLoading ? (
                        <div className={styles.skels}>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className={styles.rowSkel} />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <table aria-label={t("dashboard.accountValuesAria")}>
                                <thead>
                                    <tr>
                                        <th scope="col">{t("dashboard.account")}</th>
                                        <th scope="col">{t("dashboard.institution")}</th>
                                        <th scope="col">{t("dashboard.currency")}</th>
                                        <th scope="col" style={{ textAlign: "right" }}>
                                            {t("dashboard.value")}
                                        </th>
                                        <th scope="col" style={{ textAlign: "right" }}>
                                            {t("dashboard.inCurrency", { currency: referenceCurrency })}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {portfolio?.snapshots.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                style={{
                                                    textAlign: "center",
                                                    color: "var(--text-muted)",
                                                    padding: "2rem",
                                                }}
                                            >
                                                {t("dashboard.noAccounts")}
                                            </td>
                                        </tr>
                                    )}
                                    {portfolio?.snapshots.map((snap) => {
                                        const account = accountById.get(snap.accountId);
                                        const institution = account
                                            ? institutionById.get(account.institutionId)
                                            : undefined;
                                        return (
                                            <tr key={snap.accountId}>
                                                <td>{account?.name ?? "—"}</td>
                                                <td>{institution?.name ?? "—"}</td>
                                                <td>
                                                    <Badge>{snap.currency}</Badge>
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
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </Card>
                    )}
                </section>
            </div>
        </div>
    );
}
