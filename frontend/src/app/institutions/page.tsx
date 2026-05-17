"use client";

import { useEffect, useMemo, useState } from "react";
import { useInstitutions } from "@/features/institutions/hooks/useInstitutions";
import { INSTITUTION_TYPES, institutionsApi, type InstitutionType } from "@/features/institutions/api/institutionsApi";
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import { useI18n, type TranslationKey } from "@/shared/i18n";
import type { Institution } from "@/shared/types";
import { COUNTRIES } from "@/lib/countries";
import styles from "./page.module.css";
import "flag-icons/css/flag-icons.min.css";

const BIC_PATTERN = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

export default function InstitutionsPage() {
    const { t, locale } = useI18n();
    const [page, setPage] = useState(0);
    const [nameSearch, setNameSearch] = useState("");
    const [countryFilter, setCountryFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const debouncedNameFilter = useDebouncedValue(nameSearch.trim(), 250);
    const hasActiveFilters = debouncedNameFilter.length > 0 || countryFilter.length > 0;
    const countries = useLocalizedCountries(locale);

    const { data, isLoading, error, mutate } = useInstitutions(
        page,
        debouncedNameFilter || undefined,
        countryFilter || undefined
    );

    useEffect(() => {
        setPage(0);
    }, [debouncedNameFilter, countryFilter]);

    function clearFilters() {
        setNameSearch("");
        setCountryFilter("");
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
                            value={nameSearch}
                            onChange={(e) => setNameSearch(e.target.value)}
                            placeholder={t("institutions.searchPlaceholder")}
                            aria-label={t("institutions.filterNameAria")}
                        />
                    </div>
                    <div className={styles.filterField}>
                        <label htmlFor="filter-country">{t("institutions.country")}</label>
                        <select
                            id="filter-country"
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                            aria-label={t("institutions.filterCountryAria")}
                        >
                            <option value="">{t("institutions.allCountries")}</option>
                            {countries.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {hasActiveFilters && (
                        <Button type="button" variant="ghost" onClick={clearFilters}>
                            {t("institutions.clearFilters")}
                        </Button>
                    )}
                </div>

                {showForm && (
                    <AddInstitutionForm
                        countries={countries}
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
                        title={hasActiveFilters ? t("institutions.emptyFilteredTitle") : t("institutions.emptyTitle")}
                        description={
                            hasActiveFilters
                                ? t("institutions.emptyFilteredDescription")
                                : t("institutions.emptyDescription")
                        }
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

function AddInstitutionForm({
    countries,
    onSuccess,
    onCancel,
}: {
    countries: { code: string; name: string }[];
    onSuccess: () => void;
    onCancel: () => void;
}) {
    const { t } = useI18n();
    const [name, setName] = useState("");
    const [country, setCountry] = useState("");
    const [type, setType] = useState<InstitutionType>("BANK");
    const [bic, setBic] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        const trimmedName = name.trim();
        const trimmedBic = bic.trim().toUpperCase();
        if (!trimmedName) {
            setError(t("institutions.nameRequired"));
            return;
        }
        if (!country) {
            setError(t("institutions.countryRequired"));
            return;
        }
        if (trimmedBic && !BIC_PATTERN.test(trimmedBic)) {
            setError(t("institutions.bicInvalid"));
            return;
        }
        setLoading(true);
        try {
            await institutionsApi.create({
                name: trimmedName,
                country,
                type,
                ...(trimmedBic ? { bic: trimmedBic } : {}),
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
                            {countries.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.name}
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
    const { t, locale } = useI18n();
    const countryName = formatCountryName(institution.country, locale, institution.country);

    return (
        <Card className={styles.institutionCard}>
            <div className={styles.cardHeader}>
                <div>
                    <p className={styles.cardName}>{institution.name}</p>
                    <p className={styles.countryLine}>
                        <span className={`fi fi-${institution.country.toLowerCase()}`} title={countryName} />{" "}
                        {countryName}
                    </p>
                </div>
                <Badge>{t(`institutionType.${institution.type}` as TranslationKey)}</Badge>
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

function useLocalizedCountries(locale: string): { code: string; name: string }[] {
    return useMemo(() => {
        return COUNTRIES.map((country) => ({
            code: country.code,
            name: formatCountryName(country.code, locale, country.name),
        })).sort((a, b) => a.name.localeCompare(b.name, locale, { sensitivity: "base" }));
    }, [locale]);
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delayMs);
        return () => window.clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}
