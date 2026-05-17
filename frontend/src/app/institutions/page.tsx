"use client";

import { useState } from "react";
import { useInstitutions } from "@/features/institutions/hooks/useInstitutions";
import { INSTITUTION_TYPES, institutionsApi, type InstitutionType } from "@/features/institutions/api/institutionsApi";
import { Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import { useI18n, type TranslationKey } from "@/shared/i18n";
import type { Institution } from "@/shared/types";
import { COUNTRIES } from "@/lib/countries";
import styles from "./page.module.css";
import "flag-icons/css/flag-icons.min.css";

export default function InstitutionsPage() {
    const { t, locale } = useI18n();
    const [page, setPage] = useState(0);
    const [nameFilter, setNameFilter] = useState("");
    const [countryFilter, setCountryFilter] = useState("");
    const [showForm, setShowForm] = useState(false);

    const { data, isLoading, error, mutate } = useInstitutions(
        page,
        nameFilter || undefined,
        countryFilter || undefined
    );

    function handleFilterChange() {
        setPage(0);
    }

    return (
        <div className={styles.page}>
            <PageHeader
                title={t("institutions.title")}
                description={t("institutions.description")}
                action={
                    <Button variant="primary" onClick={() => setShowForm(true)}>
                        {t("institutions.new")}
                    </Button>
                }
            />
            <div className={styles.body}>
                <div className={styles.toolbar} role="search" aria-label={t("institutions.filterAria")}>
                    <div className={styles.filterField}>
                        <label htmlFor="filter-name">{t("institutions.searchByName")}</label>
                        <input
                            id="filter-name"
                            type="search"
                            value={nameFilter}
                            onChange={(e) => {
                                setNameFilter(e.target.value);
                                handleFilterChange();
                            }}
                            placeholder={t("institutions.searchPlaceholder")}
                            aria-label={t("institutions.filterNameAria")}
                        />
                    </div>
                    <div className={styles.filterField}>
                        <label htmlFor="filter-country">{t("institutions.country")}</label>
                        <select
                            id="filter-country"
                            value={countryFilter}
                            onChange={(e) => {
                                setCountryFilter(e.target.value);
                                handleFilterChange();
                            }}
                            aria-label={t("institutions.filterCountryAria")}
                        >
                            <option value="">{t("institutions.allCountries")}</option>
                            {COUNTRIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {formatCountryName(c.code, locale, c.name)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {showForm && (
                    <AddInstitutionForm
                        onSuccess={() => {
                            setShowForm(false);
                            mutate();
                        }}
                        onCancel={() => setShowForm(false)}
                    />
                )}

                {isLoading && (
                    <div className={styles.skels} aria-busy="true" aria-label={t("institutions.loadingAria")}>
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className={styles.cardSkel} />
                        ))}
                    </div>
                )}

                {error && <ErrorState message={t("institutions.loadError")} />}

                {!isLoading && !error && data?.items.length === 0 && !showForm && (
                    <EmptyState
                        title={t("institutions.emptyTitle")}
                        description={t("institutions.emptyDescription")}
                    />
                )}

                {!isLoading && !error && data && data.items.length > 0 && (
                    <div className={styles.grid} role="list" aria-label={t("institutions.listAria")}>
                        {data.items.map((institution) => (
                            <div key={institution.id} role="listitem">
                                <InstitutionCard institution={institution} />
                            </div>
                        ))}
                    </div>
                )}

                {data && data.totalPages > 1 && (
                    <nav className={styles.pagination} aria-label={t("institutions.pagesAria")}>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setPage((p) => p - 1)}
                            disabled={data.isFirst}
                            aria-label={t("common.previousPage")}
                        >
                            ←
                        </button>
                        <span className={styles.pageInfo} aria-live="polite">
                            {t("common.pageOfTotal", { page: page + 1, total: data.totalPages })}
                        </span>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setPage((p) => p + 1)}
                            disabled={data.isLast}
                            aria-label={t("common.nextPage")}
                        >
                            →
                        </button>
                    </nav>
                )}
            </div>
        </div>
    );
}

function AddInstitutionForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
    const { t, locale } = useI18n();
    const [name, setName] = useState("");
    const [country, setCountry] = useState("");
    const [type, setType] = useState<InstitutionType>("BANK");
    const [bic, setBic] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await institutionsApi.create({
                name,
                country,
                type,
                ...(bic ? { bic: bic.toUpperCase() } : {}),
            });
            onSuccess();
        } catch (err) {
            setError((err as { message?: string }).message ?? t("institutions.createError"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className={styles.formCard}>
            <h2 className={styles.formTitle}>{t("institutions.formTitle")}</h2>
            <form onSubmit={handleSubmit} noValidate aria-label={t("institutions.formAria")}>
                {error && (
                    <div role="alert" className={styles.formError}>
                        {error}
                    </div>
                )}
                <div className={styles.formGrid}>
                    <div className={styles.field}>
                        <label htmlFor="inst-name">{t("institutions.name")}</label>
                        <input
                            id="inst-name"
                            type="text"
                            required
                            aria-required="true"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("institutions.searchPlaceholder")}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="inst-type">{t("institutions.type")}</label>
                        <select
                            id="inst-type"
                            required
                            aria-required="true"
                            value={type}
                            onChange={(e) => setType(e.target.value as InstitutionType)}
                            disabled={loading}
                        >
                            {INSTITUTION_TYPES.map((institutionType) => (
                                <option key={institutionType.value} value={institutionType.value}>
                                    {t(`institutionType.${institutionType.value}` as TranslationKey)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="inst-country">{t("institutions.country")}</label>
                        <select
                            id="inst-country"
                            required
                            aria-required="true"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">{t("institutions.selectCountry")}</option>
                            {COUNTRIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {formatCountryName(c.code, locale, c.name)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="inst-bic">
                            {t("institutions.bic")}
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
                            id="inst-bic"
                            type="text"
                            value={bic}
                            onChange={(e) => setBic(e.target.value.toUpperCase())}
                            placeholder={t("institutions.bicPlaceholder")}
                            disabled={loading}
                            aria-describedby="bic-hint"
                            maxLength={11}
                            style={{
                                fontFamily: "var(--font-mono)",
                                letterSpacing: "0.05em",
                            }}
                        />
                        <p id="bic-hint" className={styles.hint}>
                            {t("institutions.bicHint")}
                        </p>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                        {t("common.cancel")}
                    </Button>
                    <Button type="submit" variant="primary" loading={loading}>
                        {t("institutions.create")}
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function InstitutionCard({ institution }: { institution: Institution }) {
    const { locale } = useI18n();

    return (
        <Card className={styles.institutionCard}>
            <div className={styles.cardHeader}>
                <p className={styles.cardName}>{institution.name}</p>
                <span
                    className={`fi fi-${institution.country.toLowerCase()}`}
                    title={formatCountryName(institution.country, locale, institution.country)}
                />
            </div>

            <div className={styles.cardMeta}>
                {institution.bic && <span className={styles.bic}>{institution.bic}</span>}
            </div>
        </Card>
    );
}

function formatCountryName(code: string, locale: string, fallback: string): string {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? fallback;
}
