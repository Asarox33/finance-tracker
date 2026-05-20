"use client";

import { useReferenceCurrency } from "@/shared/hooks/useReferenceCurrency";
import useSWR from "swr";
import { inflationApi } from "@/features/inflation/api/inflationApi";
import { Card, EmptyState, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import { useI18n } from "@/shared/i18n";
import styles from "../fees/page.module.css";

export default function InflationPage() {
    const { t } = useI18n();
    const { referenceCurrency, isLoading: currencyLoading } = useReferenceCurrency();
    const currency = currencyLoading ? undefined : referenceCurrency;
    const { data, error, isLoading } = useSWR(
        currency ? ["inflation-indices", currency] : null,
        () => inflationApi.list(currency!, 0, 24)
    );

    return (
        <div className={styles.page}>
            <PageHeader title={t("inflation.title")} description={t("inflation.description")} />
            <div className={styles.body}>
                <Card>
                    {isLoading || currencyLoading ? (
                        <Skeleton className={styles.formGrid} />
                    ) : error ? (
                        <ErrorState message={t("inflation.loadError")} />
                    ) : data?.isEmpty ? (
                        <EmptyState
                            title={t("inflation.emptyTitle")}
                            description={t("inflation.emptyDescription")}
                        />
                    ) : (
                        <table className={styles.feeTable}>
                            <thead>
                                <tr>
                                    <th scope="col">{t("inflation.colMonth")}</th>
                                    <th scope="col">{t("inflation.colIndex")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.items.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.yearMonth}</td>
                                        <td>
                                            {(row.indexValue / Math.pow(10, row.indexScale)).toFixed(
                                                row.indexScale
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>
            </div>
        </div>
    );
}
