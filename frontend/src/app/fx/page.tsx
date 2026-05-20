"use client";

import { useState } from "react";
import { fxApi } from "@/features/fx/api/fxApi";
import { Button, Card, PageHeader } from "@/shared/components/ui";
import { useI18n } from "@/shared/i18n";
import styles from "../prices/page.module.css";

export default function FxPage() {
    const { t } = useI18n();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleImport() {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await fxApi.importRates();
            setResult(t("fx.importSuccess", { count: String(res.importedCount), date: res.date }));
        } catch {
            setError(t("fx.importError"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.page}>
            <PageHeader title={t("fx.title")} description={t("fx.description")} />
            <div className={styles.body}>
                <Card>
                    <p className={styles.description}>{t("fx.importHint")}</p>
                    <Button type="button" variant="primary" loading={loading} onClick={handleImport}>
                        {t("fx.importButton")}
                    </Button>
                    {result && (
                        <p className={styles.alertSuccess} role="status">
                            {result}
                        </p>
                    )}
                    {error && (
                        <p className={styles.alertError} role="alert">
                            {error}
                        </p>
                    )}
                </Card>
            </div>
        </div>
    );
}
