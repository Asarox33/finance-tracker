"use client";

import { useState } from "react";
import { ASSET_TYPES, assetsApi } from "@/features/assets/api/assetsApi";
import { useAssets } from "@/features/assets/hooks/useAssets";
import { useTablePageSize } from "@/shared/hooks/useTablePageSize";
import ListPagination from "@/shared/components/ListPagination";
import { Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import { useI18n, type TranslationKey } from "@/shared/i18n";
import type { Asset, AssetType } from "@/shared/types";
import { CURRENCIES } from "@/lib/currencies";
import styles from "./page.module.css";

const ISIN_PATTERN = /^[A-Z0-9]{12}$/;

const ASSET_TYPE_CLASSES: Record<AssetType, string> = {
    CASH: styles.typeCash,
    STOCK: styles.typeStock,
    BOND: styles.typeBond,
    ETF: styles.typeEtf,
    MUTUAL_FUND: styles.typeMutualFund,
    REAL_ESTATE: styles.typeRealEstate,
    CRYPTO: styles.typeCrypto,
    COMMODITY: styles.typeCommodity,
    OTHER: styles.typeOther,
};

export default function AssetsPage() {
    const { t } = useI18n();
    const [page, setPage] = useState(0);
    const [showForm, setShowForm] = useState(false);

    const { pageSize, setPageSize } = useTablePageSize();
    const { data, isLoading, error, mutate } = useAssets(page, pageSize);

    return (
        <div className={styles.page}>
            <PageHeader
                title={t("assets.title")}
                description={t("assets.description")}
                action={
                    <Button variant="primary" onClick={() => setShowForm(true)}>
                        {t("assets.new")}
                    </Button>
                }
            />
            <div className={styles.body}>
                {showForm && (
                    <AddAssetForm
                        onSuccess={() => {
                            setShowForm(false);
                            mutate();
                        }}
                        onCancel={() => setShowForm(false)}
                    />
                )}

                {isLoading && (
                    <div className={styles.skels} aria-busy="true" aria-label={t("assets.loadingAria")}>
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className={styles.cardSkel} />
                        ))}
                    </div>
                )}

                {error && <ErrorState message={t("assets.loadError")} />}

                {!isLoading && !error && data?.items.length === 0 && !showForm && (
                    <EmptyState title={t("assets.emptyTitle")} description={t("assets.emptyDescription")} />
                )}

                {!isLoading && !error && data && data.items.length > 0 && (
                    <div className={styles.grid} role="list" aria-label={t("assets.listAria")}>
                        {data.items.map((asset) => (
                            <div key={asset.id} role="listitem">
                                <AssetCard asset={asset} />
                            </div>
                        ))}
                    </div>
                )}

                {data && data.totalItems > 0 && (
                    <ListPagination
                        page={page}
                        pageSize={pageSize}
                        totalItems={data.totalItems}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => {
                            void setPageSize(size);
                            setPage(0);
                        }}
                        ariaLabel={t("assets.pagesAria")}
                        pageSizeLabelKey="assets.perPage"
                    />
                )}
            </div>
        </div>
    );
}

function AddAssetForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
    const { t } = useI18n();
    const [name, setName] = useState("");
    const [type, setType] = useState<AssetType>("STOCK");
    const [currency, setCurrency] = useState("EUR");
    const [isin, setIsin] = useState("");
    const [ticker, setTicker] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        const trimmedName = name.trim();
        const trimmedIsin = isin.trim().toUpperCase();
        const trimmedTicker = ticker.trim().toUpperCase();
        if (!trimmedName) {
            setError(t("assets.nameRequired"));
            return;
        }
        if (trimmedIsin && !ISIN_PATTERN.test(trimmedIsin)) {
            setError(t("assets.isinInvalid"));
            return;
        }
        setLoading(true);
        try {
            await assetsApi.create({
                name: trimmedName,
                type,
                currency,
                ...(trimmedIsin ? { isin: trimmedIsin } : {}),
                ...(trimmedTicker ? { ticker: trimmedTicker } : {}),
            });
            onSuccess();
        } catch (err) {
            setError((err as { message?: string }).message ?? t("assets.createError"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className={styles.formCard}>
            <h2 className={styles.formTitle}>{t("assets.formTitle")}</h2>
            <form onSubmit={handleSubmit} noValidate aria-label={t("assets.formAria")}>
                {error && (
                    <div role="alert" className={styles.formError}>
                        {error}
                    </div>
                )}
                <div className={styles.formGrid}>
                    <div className={styles.field}>
                        <label htmlFor="asset-name">{t("assets.name")}</label>
                        <input
                            id="asset-name"
                            type="text"
                            required
                            aria-required="true"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("assets.namePlaceholder")}
                            disabled={loading}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="asset-type">{t("assets.type")}</label>
                        <select
                            id="asset-type"
                            required
                            aria-required="true"
                            value={type}
                            onChange={(e) => setType(e.target.value as AssetType)}
                            disabled={loading}
                        >
                            {ASSET_TYPES.map((assetType) => (
                                <option key={assetType} value={assetType}>
                                    {t(`assetType.${assetType}` as TranslationKey)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="asset-currency">{t("assets.currency")}</label>
                        <select
                            id="asset-currency"
                            required
                            aria-required="true"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            disabled={loading}
                        >
                            {CURRENCIES.map((code) => (
                                <option key={code} value={code}>
                                    {code}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="asset-isin">
                            {t("assets.isin")}
                            <span
                                style={{
                                    fontWeight: 400,
                                    color: "var(--text-dim)",
                                    marginLeft: "0.5rem",
                                    textTransform: "none",
                                }}
                            >
                                {t("common.optional")}
                            </span>
                        </label>
                        <input
                            id="asset-isin"
                            type="text"
                            value={isin}
                            onChange={(e) => setIsin(e.target.value.toUpperCase())}
                            placeholder={t("assets.isinPlaceholder")}
                            disabled={loading}
                            aria-describedby="isin-hint"
                            maxLength={12}
                            style={{
                                fontFamily: "var(--font-mono)",
                                letterSpacing: "0.05em",
                            }}
                        />
                        <p id="isin-hint" className={styles.hint}>
                            {t("assets.isinHint")}
                        </p>
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="asset-ticker">
                            {t("assets.ticker")}
                            <span
                                style={{
                                    fontWeight: 400,
                                    color: "var(--text-dim)",
                                    marginLeft: "0.5rem",
                                    textTransform: "none",
                                }}
                            >
                                {t("common.optional")}
                            </span>
                        </label>
                        <input
                            id="asset-ticker"
                            type="text"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                            placeholder={t("assets.tickerPlaceholder")}
                            disabled={loading}
                            maxLength={20}
                            style={{
                                fontFamily: "var(--font-mono)",
                                letterSpacing: "0.05em",
                            }}
                        />
                    </div>
                </div>
                <div className={styles.formActions}>
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                        {t("common.cancel")}
                    </Button>
                    <Button type="submit" variant="primary" loading={loading}>
                        {t("assets.create")}
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function AssetCard({ asset }: { asset: Asset }) {
    const { t } = useI18n();
    const identifier = asset.ticker ?? asset.isin;

    return (
        <Card className={styles.assetCard}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitleBlock}>
                    <p className={styles.cardName} title={asset.name}>
                        {asset.name}
                    </p>
                    <p className={styles.currencyLine}>{asset.currency}</p>
                </div>
                <span className={`${styles.typePill} ${ASSET_TYPE_CLASSES[asset.type] ?? styles.typeOther}`}>
                    {t(`assetType.${asset.type}` as TranslationKey)}
                </span>
            </div>
            <div className={styles.cardMeta}>
                {identifier ? (
                    <span className={styles.identifier} title={identifier}>
                        {identifier}
                    </span>
                ) : (
                    <span className={styles.identifierPlaceholder} aria-hidden="true" />
                )}
            </div>
        </Card>
    );
}
