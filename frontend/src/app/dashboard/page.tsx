"use client";

import { useMemo } from "react";
import { usePerformance, usePortfolioValue } from "@/features/analytics/hooks/useAnalytics";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useInstitutions } from "@/features/institutions/hooks/useInstitutions";
import { Badge, Card, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import { formatBasisPoints, formatDate, formatMoney, today } from "@/lib/format";
import styles from "./page.module.css";

export default function DashboardPage() {
    const { data: portfolio, isLoading: pvLoading, error: pvError } = usePortfolioValue("EUR");
    const { data: perf, isLoading: perfLoading } = usePerformance("EUR", 12);
    const { data: accounts, isLoading: accLoading } = useAccounts();
    const { data: institutions, isLoading: instLoading } = useInstitutions();

    const accountById = useMemo(() => {
        return new Map(accounts?.items.map((a) => [a.id, a]) ?? []);
    }, [accounts]);

    const institutionById = useMemo(() => {
        return new Map(institutions?.items.map((i) => [i.id, i]) ?? []);
    }, [institutions]);

    const breakdownLoading = pvLoading || accLoading || instLoading;

    const gainPositive = (perf?.gainLossBasisPoints ?? 0) >= 0;

    return (
        <div className={styles.page}>
            <PageHeader title="Dashboard" description={`As of ${formatDate(today())}`} />

            <div className={styles.body}>
                <section aria-label="Portfolio overview" className={styles.kpis}>
                    <Card className={styles.kpi}>
                        <p className={styles.kpiLabel}>Portfolio Value</p>
                        {pvLoading ? (
                            <Skeleton className={styles.kpiSkel} />
                        ) : pvError ? (
                            <ErrorState message="Could not load portfolio value" />
                        ) : (
                            <p className={styles.kpiValue}>
                                {formatMoney(portfolio?.totalValue ?? 0, portfolio?.currency ?? "EUR")}
                            </p>
                        )}
                        <p className={styles.kpiSub}>{portfolio?.currency ?? "EUR"} · reference currency</p>
                    </Card>

                    <Card className={styles.kpi}>
                        <p className={styles.kpiLabel}>12-Month Performance</p>
                        {perfLoading ? (
                            <Skeleton className={styles.kpiSkel} />
                        ) : (
                            <>
                                <p className={`${styles.kpiValue} ${gainPositive ? styles.positive : styles.negative}`}>
                                    {formatBasisPoints(perf?.gainLossBasisPoints ?? 0)}
                                </p>
                                <p className={styles.kpiSub}>
                                    {formatMoney(perf?.gainLoss ?? 0, perf?.currency ?? "EUR")} gain/loss
                                </p>
                            </>
                        )}
                    </Card>

                    <Card className={styles.kpi}>
                        <p className={styles.kpiLabel}>Active Accounts</p>
                        {accLoading ? (
                            <Skeleton className={styles.kpiSkel} />
                        ) : (
                            <p className={styles.kpiValue}>
                                {accounts?.items.filter((a) => a.status === "ACTIVE").length ?? 0}
                            </p>
                        )}
                        <p className={styles.kpiSub}>across all institutions</p>
                    </Card>
                </section>

                <section aria-label="Account breakdown" className={styles.section}>
                    <h2 className={styles.sectionTitle}>Account Breakdown</h2>
                    {breakdownLoading ? (
                        <div className={styles.skels}>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className={styles.rowSkel} />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <table aria-label="Account values">
                                <thead>
                                    <tr>
                                        <th scope="col">Account</th>
                                        <th scope="col">Institution</th>
                                        <th scope="col">Currency</th>
                                        <th scope="col" style={{ textAlign: "right" }}>
                                            Value
                                        </th>
                                        <th scope="col" style={{ textAlign: "right" }}>
                                            In EUR
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
                                                No accounts yet
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
