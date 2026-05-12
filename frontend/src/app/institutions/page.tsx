"use client";

import { useState } from "react";
import { useInstitutions } from "@/features/institutions/hooks/useInstitutions";
import { INSTITUTION_TYPES, institutionsApi, type InstitutionType } from "@/features/institutions/api/institutionsApi";
import { Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import type { Institution } from "@/shared/types";
import { COUNTRIES } from "@/lib/countries";
import styles from "./page.module.css";
import "flag-icons/css/flag-icons.min.css";

export default function InstitutionsPage() {
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
                title="Institutions"
                description="Manage financial institutions"
                action={
                    <Button variant="primary" onClick={() => setShowForm(true)}>
                        + New institution
                    </Button>
                }
            />
            <div className={styles.body}>
                <div className={styles.toolbar} role="search" aria-label="Filter institutions">
                    <div className={styles.filterField}>
                        <label htmlFor="filter-name">Search by name</label>
                        <input
                            id="filter-name"
                            type="search"
                            value={nameFilter}
                            onChange={(e) => {
                                setNameFilter(e.target.value);
                                handleFilterChange();
                            }}
                            placeholder="e.g. BNP Paribas"
                            aria-label="Filter by institution name"
                        />
                    </div>
                    <div className={styles.filterField}>
                        <label htmlFor="filter-country">Country</label>
                        <select
                            id="filter-country"
                            value={countryFilter}
                            onChange={(e) => {
                                setCountryFilter(e.target.value);
                                handleFilterChange();
                            }}
                            aria-label="Filter by country"
                        >
                            <option value="">All countries</option>
                            {COUNTRIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.name}
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
                    <div className={styles.skels} aria-busy="true" aria-label="Loading institutions">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className={styles.cardSkel} />
                        ))}
                    </div>
                )}

                {error && <ErrorState message="Could not load institutions. Please try again." />}

                {!isLoading && !error && data?.items.length === 0 && !showForm && (
                    <EmptyState
                        title="No institutions found"
                        description="Add your first institution or adjust your filters"
                    />
                )}

                {!isLoading && !error && data && data.items.length > 0 && (
                    <div className={styles.grid} role="list" aria-label="Institution list">
                        {data.items.map((institution) => (
                            <div key={institution.id} role="listitem">
                                <InstitutionCard institution={institution} />
                            </div>
                        ))}
                    </div>
                )}

                {data && data.totalPages > 1 && (
                    <nav className={styles.pagination} aria-label="Institution pages">
                        <button
                            className={styles.pageBtn}
                            onClick={() => setPage((p) => p - 1)}
                            disabled={data.isFirst}
                            aria-label="Previous page"
                        >
                            ←
                        </button>
                        <span className={styles.pageInfo} aria-live="polite">
                            Page {page + 1} of {data.totalPages}
                        </span>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setPage((p) => p + 1)}
                            disabled={data.isLast}
                            aria-label="Next page"
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
            setError((err as { message?: string }).message ?? "Failed to create institution");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className={styles.formCard}>
            <h2 className={styles.formTitle}>New institution</h2>
            <form onSubmit={handleSubmit} noValidate aria-label="Add institution form">
                {error && (
                    <div role="alert" className={styles.formError}>
                        {error}
                    </div>
                )}
                <div className={styles.formGrid}>
                    <div className={styles.field}>
                        <label htmlFor="inst-name">Institution name</label>
                        <input
                            id="inst-name"
                            type="text"
                            required
                            aria-required="true"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. BNP Paribas"
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="inst-type">Type</label>
                        <select
                            id="inst-type"
                            required
                            aria-required="true"
                            value={type}
                            onChange={(e) => setType(e.target.value as InstitutionType)}
                            disabled={loading}
                        >
                            {INSTITUTION_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="inst-country">Country</label>
                        <select
                            id="inst-country"
                            required
                            aria-required="true"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">Select a country…</option>
                            {COUNTRIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="inst-bic">
                            BIC / SWIFT
                            <span
                                style={{
                                    fontWeight: 400,
                                    color: "var(--text-dim)",
                                    marginLeft: "0.5rem",
                                    textTransform: "none",
                                }}
                            >
                                (optional)
                            </span>
                        </label>
                        <input
                            id="inst-bic"
                            type="text"
                            value={bic}
                            onChange={(e) => setBic(e.target.value.toUpperCase())}
                            placeholder="e.g. BNPAFRPP"
                            disabled={loading}
                            aria-describedby="bic-hint"
                            maxLength={11}
                            style={{
                                fontFamily: "var(--font-mono)",
                                letterSpacing: "0.05em",
                            }}
                        />
                        <p id="bic-hint" className={styles.hint}>
                            8 or 11 uppercase characters (e.g. BNPAFRPP or BNPAFRPPXXX)
                        </p>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" loading={loading}>
                        Create institution
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function InstitutionCard({ institution }: { institution: Institution }) {
    return (
        <Card className={styles.institutionCard}>
            <div className={styles.cardHeader}>
                <p className={styles.cardName}>{institution.name}</p>
                <span className={`fi fi-${institution.country.toLowerCase()}`} title={institution.country} />
            </div>

            <div className={styles.cardMeta}>
                {institution.bic && <span className={styles.bic}>{institution.bic}</span>}
            </div>
        </Card>
    );
}
