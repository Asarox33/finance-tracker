"use client";

import { useMemo, useState } from "react";
import AssetPicker, { formatAssetOptionLabel } from "@/features/assets/components/AssetPicker";
import type { Asset } from "@/shared/types";
import { pricesApi } from "@/features/price/api/priceApi";
import { Button, Card, PageHeader } from "@/shared/components/ui";
import { useI18n } from "@/shared/i18n";
import styles from "./page.module.css";

const QUOTE_CURRENCIES = ["EUR", "USD", "GBP", "CHF"] as const;

export default function PricesPage() {
    const { t } = useI18n();
    const [assetId, setAssetId] = useState("");
    const [assetLabel, setAssetLabel] = useState<string | null>(null);
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [currency, setCurrency] = useState<string>("EUR");
    const [priceInput, setPriceInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const priceMinor = useMemo(() => {
        const n = Number(priceInput);
        if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
        return n;
    }, [priceInput]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        if (!assetId.trim()) {
            setError(t("transactions.assetRequired"));
            return;
        }
        if (priceMinor == null) {
            setError(t("prices.validation"));
            return;
        }
        setLoading(true);
        try {
            await pricesApi.record({
                assetId,
                price: priceMinor,
                currency,
                date,
            });
            setSuccess(true);
        } catch {
            setError(t("prices.error"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.page}>
            <PageHeader title={t("prices.title")} />
            <div className={styles.body}>
                <p className={styles.description}>{t("prices.description")}</p>
                <Card>
                    <form onSubmit={handleSubmit} className={styles.formGrid} aria-label={t("prices.formAria")}>
                        <div className={styles.field}>
                            <label htmlFor="price-asset">{t("prices.asset")}</label>
                            <AssetPicker
                                value={assetId}
                                selectedLabel={assetLabel}
                                onChange={(id: string, asset: Asset) => {
                                    setAssetId(id);
                                    setAssetLabel(formatAssetOptionLabel(asset));
                                }}
                                onClear={() => {
                                    setAssetId("");
                                    setAssetLabel(null);
                                }}
                                disabled={loading}
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="price-date">{t("prices.date")}</label>
                            <input
                                id="price-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="price-currency">{t("prices.currency")}</label>
                            <select
                                id="price-currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                disabled={loading}
                            >
                                {QUOTE_CURRENCIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="price-amount">{t("prices.amount")}</label>
                            <input
                                id="price-amount"
                                type="text"
                                inputMode="numeric"
                                value={priceInput}
                                onChange={(e) => setPriceInput(e.target.value.replace(/\D/g, ""))}
                                placeholder="4000000"
                                required
                                disabled={loading}
                                style={{ fontFamily: "var(--font-mono)" }}
                            />
                            <p className={styles.hint}>{t("prices.amountHint")}</p>
                        </div>
                        {error && (
                            <div role="alert" className={`${styles.alert} ${styles.alertError}`}>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div role="status" className={`${styles.alert} ${styles.alertSuccess}`}>
                                {t("prices.success")}
                            </div>
                        )}
                        <div className={styles.actions}>
                            <Button type="submit" variant="primary" loading={loading}>
                                {t("prices.submit")}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={loading}
                                onClick={async () => {
                                    setError(null);
                                    setSuccess(false);
                                    setLoading(true);
                                    try {
                                        await pricesApi.importEndOfDay();
                                        setSuccess(true);
                                    } catch {
                                        setError(t("prices.importError"));
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            >
                                {t("prices.importButton")}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
