"use client";

import { useState } from "react";
import clsx from "clsx";
import {
    usePerformanceAfterFeesRange,
    usePerformanceAfterInflationRange,
    usePerformanceRange,
    usePortfolioValue,
} from "@/features/analytics/hooks/useAnalytics";
import { useReferenceCurrency } from "@/shared/hooks/useReferenceCurrency";
import { Badge, Card, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import { useFormatters, useI18n, type TranslationKey } from "@/shared/i18n";
import { formatBasisPoints, monthsAgo, today, yearToDateStart } from "@/lib/format";
import type { PortfolioPerformance } from "@/shared/types";
import styles from "./page.module.css";

const PERIODS = [
    { id: "3m", labelKey: "analytics.period3M", months: 3 },
    { id: "6m", labelKey: "analytics.period6M", months: 6 },
    { id: "1y", labelKey: "analytics.period1Y", months: 12 },
    { id: "3y", labelKey: "analytics.period3Y", months: 36 },
    { id: "ytd", labelKey: "analytics.periodYtd", ytd: true },
] satisfies { id: string; labelKey: TranslationKey; months?: number; ytd?: boolean }[];

export default function AnalyticsPage() {
    const { t } = useI18n();
    const [periodId, setPeriodId] = useState("1y");
    const period = PERIODS.find((p) => p.id === periodId) ?? PERIODS[2];
    const from = period.ytd ? yearToDateStart() : monthsAgo(period.months ?? 12);
    const to = today();
    const { referenceCurrency, isLoading: currencyLoading } = useReferenceCurrency();
    const analyticsCurrency = currencyLoading ? undefined : referenceCurrency;

    const { data: portfolio, isLoading: pvLoading } = usePortfolioValue(analyticsCurrency);
    const { data: perf, isLoading: perfLoading, error: perfError } = usePerformanceRange(
        analyticsCurrency,
        from,
        to
    );
    const { data: perfFees, isLoading: feesLoading } = usePerformanceAfterFeesRange(
        analyticsCurrency,
        from,
        to
    );
    const { data: perfInflation, isLoading: inflLoading } = usePerformanceAfterInflationRange(
        analyticsCurrency,
        from,
        to
    );
    const { formatDate, formatMoney } = useFormatters();

    const valueLoading = currencyLoading || pvLoading;
    const perfSectionLoading = currencyLoading || perfLoading;

    const grossLabel = t("analytics.gross");
    const feesLabel = t("analytics.afterFees");
    const inflationLabel = t("analytics.afterInflation");

    return (
        <div className={styles.page}>
            <PageHeader title={t("analytics.title")} description={t("analytics.description")} />
            <div className={styles.body}>
                <div className={styles.controls}>
                    <div role="group" aria-label={t("analytics.timePeriodAria")} className={styles.periods}>
                        {PERIODS.map((p) => (
                            <button
                                key={p.id}
                                className={`${styles.periodBtn} ${periodId === p.id ? styles.active : ""}`}
                                onClick={() => setPeriodId(p.id)}
                                aria-pressed={periodId === p.id}
                            >
                                {t(p.labelKey)}
                            </button>
                        ))}
                    </div>
                    <Badge>{referenceCurrency}</Badge>
                </div>

                <section aria-label={t("analytics.portfolioValueAria")} className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("analytics.currentValue")}</h2>
                    <Card className={styles.valueCard}>
                        {valueLoading ? (
                            <Skeleton style={{ height: "3rem", width: "200px" }} />
                        ) : (
                            <>
                                <p className={styles.bigValue}>
                                    {formatMoney(portfolio?.totalValue ?? 0, portfolio?.currency ?? referenceCurrency)}
                                </p>
                                <p className={styles.valueDate}>
                                    {t("analytics.asOfDate", { date: formatDate(portfolio?.asOf ?? "") })}
                                </p>
                            </>
                        )}
                    </Card>
                </section>

                <section aria-label={t("analytics.performanceComparisonAria")} className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("analytics.performance")}</h2>
                    <div className={styles.perfGrid}>
                        <PerfCard
                            label={t("analytics.grossPerformance")}
                            data={perf}
                            loading={perfSectionLoading}
                            error={!!perfError}
                            referenceCurrency={referenceCurrency}
                            formatMoney={formatMoney}
                        />
                        <PerfCard
                            label={t("analytics.afterFees")}
                            data={perfFees}
                            loading={currencyLoading || feesLoading}
                            description={t("analytics.afterFeesDescription")}
                            referenceCurrency={referenceCurrency}
                            formatMoney={formatMoney}
                        />
                        <PerfCard
                            label={t("analytics.afterInflation")}
                            data={perfInflation}
                            loading={currencyLoading || inflLoading}
                            description={t("analytics.afterInflationDescription")}
                            referenceCurrency={referenceCurrency}
                            formatMoney={formatMoney}
                        />
                    </div>
                </section>

                {perf && (
                    <section aria-label={t("analytics.periodDetailsAria")} className={styles.section}>
                        <h2 className={styles.sectionTitle}>{t("analytics.periodDetails")}</h2>
                        <Card className={styles.detailsCard}>
                            <div className={styles.detailsTableWrap}>
                                <table
                                    className={styles.detailsTable}
                                    aria-label={t("analytics.performanceBreakdownAria")}
                                >
                                    <thead>
                                        <tr>
                                            <th scope="col">{t("analytics.metric")}</th>
                                            <th scope="col" className={styles.numericHeader}>
                                                {grossLabel}
                                            </th>
                                            <th scope="col" className={styles.numericHeader}>
                                                {feesLabel}
                                            </th>
                                            <th scope="col" className={styles.numericHeader}>
                                                {inflationLabel}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className={styles.detailsRow}>
                                            <td className={styles.detailsMetric}>{t("analytics.startValue")}</td>
                                            <td className={styles.numericCell} data-label={grossLabel}>
                                                {formatMoney(perf.startValue, referenceCurrency)}
                                            </td>
                                            <td className={styles.numericCell} data-label={feesLabel}>
                                                {perfFees ? formatMoney(perfFees.startValue, referenceCurrency) : "—"}
                                            </td>
                                            <td className={styles.numericCell} data-label={inflationLabel}>
                                                {perfInflation
                                                    ? formatMoney(perfInflation.startValue, referenceCurrency)
                                                    : "—"}
                                            </td>
                                        </tr>
                                        <tr className={styles.detailsRow}>
                                            <td className={styles.detailsMetric}>{t("analytics.endValue")}</td>
                                            <td className={styles.numericCell} data-label={grossLabel}>
                                                {formatMoney(perf.endValue, referenceCurrency)}
                                            </td>
                                            <td className={styles.numericCell} data-label={feesLabel}>
                                                {perfFees ? formatMoney(perfFees.endValue, referenceCurrency) : "—"}
                                            </td>
                                            <td className={styles.numericCell} data-label={inflationLabel}>
                                                {perfInflation
                                                    ? formatMoney(perfInflation.endValue, referenceCurrency)
                                                    : "—"}
                                            </td>
                                        </tr>
                                        <tr className={styles.detailsRow}>
                                            <td className={styles.detailsMetric}>{t("analytics.gainLoss")}</td>
                                            <td
                                                className={clsx(
                                                    styles.numericCell,
                                                    perf.gainLoss >= 0 ? styles.positive : styles.negative
                                                )}
                                                data-label={grossLabel}
                                            >
                                                {formatMoney(perf.gainLoss, referenceCurrency)}
                                            </td>
                                            <td
                                                className={clsx(
                                                    styles.numericCell,
                                                    (perfFees?.gainLoss ?? 0) >= 0 ? styles.positive : styles.negative
                                                )}
                                                data-label={feesLabel}
                                            >
                                                {perfFees ? formatMoney(perfFees.gainLoss, referenceCurrency) : "—"}
                                            </td>
                                            <td
                                                className={clsx(
                                                    styles.numericCell,
                                                    (perfInflation?.gainLoss ?? 0) >= 0
                                                        ? styles.positive
                                                        : styles.negative
                                                )}
                                                data-label={inflationLabel}
                                            >
                                                {perfInflation
                                                    ? formatMoney(perfInflation.gainLoss, referenceCurrency)
                                                    : "—"}
                                            </td>
                                        </tr>
                                        <tr className={styles.detailsRow}>
                                            <td className={styles.detailsMetric}>{t("analytics.return")}</td>
                                            <td
                                                className={clsx(
                                                    styles.numericCell,
                                                    perf.gainLossBasisPoints >= 0 ? styles.positive : styles.negative
                                                )}
                                                data-label={grossLabel}
                                            >
                                                {formatBasisPoints(perf.gainLossBasisPoints)}
                                            </td>
                                            <td
                                                className={clsx(
                                                    styles.numericCell,
                                                    (perfFees?.gainLossBasisPoints ?? 0) >= 0
                                                        ? styles.positive
                                                        : styles.negative
                                                )}
                                                data-label={feesLabel}
                                            >
                                                {perfFees ? formatBasisPoints(perfFees.gainLossBasisPoints) : "—"}
                                            </td>
                                            <td
                                                className={clsx(
                                                    styles.numericCell,
                                                    (perfInflation?.gainLossBasisPoints ?? 0) >= 0
                                                        ? styles.positive
                                                        : styles.negative
                                                )}
                                                data-label={inflationLabel}
                                            >
                                                {perfInflation
                                                    ? formatBasisPoints(perfInflation.gainLossBasisPoints)
                                                    : "—"}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
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
    referenceCurrency,
    formatMoney,
}: {
    label: string;
    data?: PortfolioPerformance;
    loading: boolean;
    error?: boolean;
    description?: string;
    referenceCurrency: string;
    formatMoney: (amount: number, currency: string) => string;
}) {
    const positive = (data?.gainLossBasisPoints ?? 0) >= 0;
    const { t } = useI18n();

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
                <ErrorState message={t("analytics.noData")} />
            ) : (
                <>
                    <p className={`${styles.perfValue} ${positive ? styles.positive : styles.negative}`}>
                        {formatBasisPoints(data?.gainLossBasisPoints ?? 0)}
                    </p>
                    <p className={styles.perfGain}>
                        {formatMoney(data?.gainLoss ?? 0, data?.currency ?? referenceCurrency)}
                    </p>
                </>
            )}
        </Card>
    );
}
