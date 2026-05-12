"use client";

import { useState } from "react";
import {
    usePerformance,
    usePerformanceAfterFees,
    usePerformanceAfterInflation,
    usePortfolioValue,
} from "@/features/analytics/hooks/useAnalytics";
import { Badge, Card, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import { formatBasisPoints, formatDate, formatMoney } from "@/lib/format";
import type { PortfolioPerformance } from "@/shared/types";
import styles from "./page.module.css";

const PERIODS = [
    { label: "3M", months: 3 },
    { label: "6M", months: 6 },
    { label: "1Y", months: 12 },
    { label: "3Y", months: 36 },
];

export default function AnalyticsPage() {
    const [months, setMonths] = useState(12);
    const [currency] = useState("EUR");

    const { data: portfolio, isLoading: pvLoading } = usePortfolioValue(currency);
    const { data: perf, isLoading: perfLoading, error: perfError } = usePerformance(currency, months);
    const { data: perfFees, isLoading: feesLoading } = usePerformanceAfterFees(currency, months);
    const { data: perfInflation, isLoading: inflLoading } = usePerformanceAfterInflation(currency, months);

    return (
        <div className={styles.page}>
            <PageHeader title="Analytics" description="Performance analysis and portfolio insights" />
            <div className={styles.body}>
                <div className={styles.controls}>
                    <div role="group" aria-label="Time period" className={styles.periods}>
                        {PERIODS.map(({ label, months: m }) => (
                            <button
                                key={label}
                                className={`${styles.periodBtn} ${months === m ? styles.active : ""}`}
                                onClick={() => setMonths(m)}
                                aria-pressed={months === m}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <Badge>{currency}</Badge>
                </div>

                <section aria-label="Portfolio value" className={styles.section}>
                    <h2 className={styles.sectionTitle}>Current Value</h2>
                    <Card className={styles.valueCard}>
                        {pvLoading ? (
                            <Skeleton style={{ height: "3rem", width: "200px" }} />
                        ) : (
                            <>
                                <p className={styles.bigValue}>
                                    {formatMoney(portfolio?.totalValue ?? 0, portfolio?.currency ?? currency)}
                                </p>
                                <p className={styles.valueDate}>as of {formatDate(portfolio?.asOf ?? "")}</p>
                            </>
                        )}
                    </Card>
                </section>

                <section aria-label="Performance comparison" className={styles.section}>
                    <h2 className={styles.sectionTitle}>Performance</h2>
                    <div className={styles.perfGrid}>
                        <PerfCard label="Gross Performance" data={perf} loading={perfLoading} error={!!perfError} />
                        <PerfCard
                            label="After Fees"
                            data={perfFees}
                            loading={feesLoading}
                            description="Deducting all recorded fees"
                        />
                        <PerfCard
                            label="After Inflation"
                            data={perfInflation}
                            loading={inflLoading}
                            description="Real purchasing power gain"
                        />
                    </div>
                </section>

                {perf && (
                    <section aria-label="Period details" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Period Details</h2>
                        <Card>
                            <table aria-label="Performance breakdown">
                                <thead>
                                    <tr>
                                        <th scope="col">Metric</th>
                                        <th scope="col" style={{ textAlign: "right" }}>
                                            Gross
                                        </th>
                                        <th scope="col" style={{ textAlign: "right" }}>
                                            After Fees
                                        </th>
                                        <th scope="col" style={{ textAlign: "right" }}>
                                            After Inflation
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Start Value</td>
                                        <td
                                            style={{
                                                textAlign: "right",
                                                fontFamily: "var(--font-mono)",
                                            }}
                                        >
                                            {formatMoney(perf.startValue, currency)}
                                        </td>
                                        <td
                                            style={{
                                                textAlign: "right",
                                                fontFamily: "var(--font-mono)",
                                            }}
                                        >
                                            {perfFees ? formatMoney(perfFees.startValue, currency) : "—"}
                                        </td>
                                        <td
                                            style={{
                                                textAlign: "right",
                                                fontFamily: "var(--font-mono)",
                                            }}
                                        >
                                            {perfInflation ? formatMoney(perfInflation.startValue, currency) : "—"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>End Value</td>
                                        <td
                                            style={{
                                                textAlign: "right",
                                                fontFamily: "var(--font-mono)",
                                            }}
                                        >
                                            {formatMoney(perf.endValue, currency)}
                                        </td>
                                        <td
                                            style={{
                                                textAlign: "right",
                                                fontFamily: "var(--font-mono)",
                                            }}
                                        >
                                            {perfFees ? formatMoney(perfFees.endValue, currency) : "—"}
                                        </td>
                                        <td
                                            style={{
                                                textAlign: "right",
                                                fontFamily: "var(--font-mono)",
                                            }}
                                        >
                                            {perfInflation ? formatMoney(perfInflation.endValue, currency) : "—"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Gain / Loss</td>
                                        <td
                                            style={{
                                                textAlign: "right",
                                                fontFamily: "var(--font-mono)",
                                                color: perf.gainLoss >= 0 ? "var(--success)" : "var(--danger)",
                                            }}
                                        >
                                            {formatMoney(perf.gainLoss, currency)}
                                        </td>
                                        <td
                                            style={{
                                                textAlign: "right",
                                                fontFamily: "var(--font-mono)",
                                                color:
                                                    (perfFees?.gainLoss ?? 0) >= 0 ? "var(--success)" : "var(--danger)",
                                            }}
                                        >
                                            {perfFees ? formatMoney(perfFees.gainLoss, currency) : "—"}
                                        </td>
                                        <td
                                            style={{
                                                textAlign: "right",
                                                fontFamily: "var(--font-mono)",
                                                color:
                                                    (perfInflation?.gainLoss ?? 0) >= 0
                                                        ? "var(--success)"
                                                        : "var(--danger)",
                                            }}
                                        >
                                            {perfInflation ? formatMoney(perfInflation.gainLoss, currency) : "—"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Return</td>
                                        <td
                                            style={{
                                                textAlign: "right",
                                                fontFamily: "var(--font-mono)",
                                                color:
                                                    perf.gainLossBasisPoints >= 0 ? "var(--success)" : "var(--danger)",
                                            }}
                                        >
                                            {formatBasisPoints(perf.gainLossBasisPoints)}
                                        </td>
                                        <td
                                            style={{
                                                textAlign: "right",
                                                fontFamily: "var(--font-mono)",
                                                color:
                                                    (perfFees?.gainLossBasisPoints ?? 0) >= 0
                                                        ? "var(--success)"
                                                        : "var(--danger)",
                                            }}
                                        >
                                            {perfFees ? formatBasisPoints(perfFees.gainLossBasisPoints) : "—"}
                                        </td>
                                        <td
                                            style={{
                                                textAlign: "right",
                                                fontFamily: "var(--font-mono)",
                                                color:
                                                    (perfInflation?.gainLossBasisPoints ?? 0) >= 0
                                                        ? "var(--success)"
                                                        : "var(--danger)",
                                            }}
                                        >
                                            {perfInflation ? formatBasisPoints(perfInflation.gainLossBasisPoints) : "—"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card>
                    </section>
                )}
            </div>
        </div>
    );
}

function PerfCard({
    label,
    data,
    loading,
    error,
    description,
}: {
    label: string;
    data?: PortfolioPerformance;
    loading: boolean;
    error?: boolean;
    description?: string;
}) {
    const positive = (data?.gainLossBasisPoints ?? 0) >= 0;

    return (
        <Card className={styles.perfCard}>
            <p className={styles.perfLabel}>{label}</p>
            {description && <p className={styles.perfDesc}>{description}</p>}
            {loading ? (
                <>
                    <Skeleton style={{ height: "2rem", marginTop: "0.75rem" }} />
                    <Skeleton
                        style={{
                            height: "1rem",
                            width: "60%",
                            marginTop: "0.5rem",
                        }}
                    />
                </>
            ) : error ? (
                <ErrorState message="No data available" />
            ) : (
                <>
                    <p className={`${styles.perfValue} ${positive ? styles.positive : styles.negative}`}>
                        {formatBasisPoints(data?.gainLossBasisPoints ?? 0)}
                    </p>
                    <p className={styles.perfGain}>{formatMoney(data?.gainLoss ?? 0, data?.currency ?? "EUR")}</p>
                </>
            )}
        </Card>
    );
}
