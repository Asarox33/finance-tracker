"use client";

import { useId, useMemo } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    applyPortfolioActivityWindow,
    buildPortfolioChartSlots,
} from "@/lib/portfolioChartSlots";
import { useI18n } from "@/shared/i18n";
import styles from "./PortfolioHistoryChart.module.css";

export interface PortfolioHistoryPoint {
    date: string;
    totalValue: number;
    currency: string;
}

const DEFAULT_DAY_COUNT = 30;
const CHART_HEIGHT = 180;

interface ChartRow {
    date: string;
    value: number | null;
}

interface ChartTooltipProps {
    active?: boolean;
    payload?: { value?: number | null }[];
    label?: string;
    formatDate: (isoDate: string) => string;
    formatMoney: (amount: number, currency: string) => string;
    currency: string;
}

function ChartTooltip({
    active,
    payload,
    label,
    formatDate,
    formatMoney,
    currency,
}: ChartTooltipProps) {
    if (!active || !label || !payload?.length) return null;
    const raw = payload[0]?.value;
    if (raw == null) return null;
    return (
        <div className={styles.tooltip}>
            <span className={styles.tooltipDate}>{formatDate(label)}</span>
            <span className={styles.tooltipValue}>{formatMoney(raw, currency)}</span>
        </div>
    );
}

export default function PortfolioHistoryChart({
    points,
    currency,
    dayCount = DEFAULT_DAY_COUNT,
    formatMoney,
    formatDate,
    formatChartAxisDate,
    formatMoneyAxis,
}: {
    points: PortfolioHistoryPoint[];
    currency: string;
    dayCount?: number;
    formatMoney: (amount: number, currency: string) => string;
    formatDate: (isoDate: string) => string;
    formatChartAxisDate: (isoDate: string) => string;
    formatMoneyAxis: (minor: number, currency: string) => string;
}) {
    const { t } = useI18n();
    const gradientId = `chart-area-${useId().replace(/:/g, "")}`;

    const chartData = useMemo((): ChartRow[] => {
        const slots = applyPortfolioActivityWindow(buildPortfolioChartSlots(points, dayCount));
        return slots.map((s) => ({
            date: s.date,
            value: s.totalValue,
        }));
    }, [points, dayCount]);

    const hasCurve = chartData.some((row) => row.value !== null);
    const firstKnown = chartData.find((r) => r.value !== null);
    const lastKnown = [...chartData].reverse().find((r) => r.value !== null);

    const ariaLabel = t("dashboard.sparklineAria", {
        from: chartData[0]?.date ?? "",
        to: chartData[chartData.length - 1]?.date ?? "",
        value: lastKnown?.value != null ? formatMoney(lastKnown.value, currency) : "—",
    });

    return (
        <div className={styles.wrap}>
            <p className={styles.legend}>
                <span className={styles.legendSwatch} aria-hidden="true" />
                {t("dashboard.chartLegend")}
            </p>

            <div className={styles.chartBody} role="img" aria-label={ariaLabel}>
                <div className={styles.plotFrame}>
                    {!hasCurve ? (
                        <p className={styles.emptyOverlay}>{t("dashboard.chartNoData")}</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                            <AreaChart
                                data={chartData}
                                margin={{ top: 12, right: 20, left: 4, bottom: 4 }}
                            >
                                <defs>
                                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="0%"
                                            stopColor="var(--accent)"
                                            stopOpacity={0.28}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="var(--accent)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="4 4"
                                    stroke="var(--border)"
                                    strokeOpacity={0.55}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatChartAxisDate}
                                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    minTickGap={28}
                                    interval="preserveStartEnd"
                                    dy={6}
                                />
                                <YAxis
                                    tickFormatter={(v: number) => formatMoneyAxis(v, currency)}
                                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={76}
                                    tickCount={3}
                                />
                                <Tooltip
                                    content={
                                        <ChartTooltip
                                            formatDate={formatDate}
                                            formatMoney={formatMoney}
                                            currency={currency}
                                        />
                                    }
                                    cursor={{
                                        stroke: "var(--text-dim)",
                                        strokeWidth: 1,
                                        strokeDasharray: "3 3",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="var(--accent)"
                                    strokeWidth={2.5}
                                    fill={`url(#${gradientId})`}
                                    connectNulls={false}
                                    dot={{
                                        r: 3,
                                        fill: "var(--accent)",
                                        stroke: "var(--surface)",
                                        strokeWidth: 1.5,
                                    }}
                                    activeDot={{
                                        r: 5,
                                        fill: "var(--accent)",
                                        stroke: "var(--surface)",
                                        strokeWidth: 2,
                                    }}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {firstKnown?.value != null && lastKnown?.value != null && (
                <p className={styles.caption}>
                    {formatMoney(firstKnown.value, currency)} →{" "}
                    {formatMoney(lastKnown.value, currency)}
                </p>
            )}
        </div>
    );
}

export function PortfolioHistoryChartLoading() {
    const { t } = useI18n();
    return (
        <div
            className={styles.loadingWrap}
            aria-busy="true"
            aria-live="polite"
            aria-label={t("dashboard.chartLoading")}
        >
            <div className={styles.loadingLegend} aria-hidden="true" />
            <div className={styles.loadingPlot}>
                <div className={styles.loadingSpinner} aria-hidden="true" />
                <p className={styles.loadingText}>{t("dashboard.chartLoading")}</p>
            </div>
        </div>
    );
}
