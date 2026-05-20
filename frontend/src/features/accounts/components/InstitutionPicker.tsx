"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { useInstitutionSearch } from "@/features/institutions/hooks/useInstitutionSearch";
import { isPickerCommitted } from "@/shared/components/searchPickerState";
import { useI18n } from "@/shared/i18n";
import type { Institution } from "@/shared/types";
import styles from "@/shared/components/picker.module.css";

export interface InstitutionPickerProps {
    value: string;
    selectedLabel: string | null;
    onChange: (institutionId: string, institution: Institution) => void;
    onClear: () => void;
    disabled?: boolean;
}

export default function InstitutionPicker({
    value,
    selectedLabel,
    onChange,
    onClear,
    disabled = false,
}: InstitutionPickerProps) {
    const { t, locale } = useI18n();
    const listId = useId();
    const [query, setQuery] = useState(selectedLabel ?? "");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const committed = isPickerCommitted(value, selectedLabel, query, open);
    const searchQuery = committed ? "" : query;
    const { institutions, totalItems, isLoading, error, canSearch } = useInstitutionSearch(searchQuery);

    useEffect(() => {
        if (selectedLabel && !open) {
            setQuery(selectedLabel);
        }
    }, [selectedLabel, open]);

    const showList = open && canSearch && !disabled && !committed;
    const options = useMemo(() => institutions, [institutions]);

    useEffect(() => {
        setActiveIndex(0);
    }, [options]);

    function selectInstitution(inst: Institution) {
        onChange(inst.id, inst);
        setQuery(inst.name);
        setOpen(false);
    }

    function handleClearSelection() {
        onClear();
        setQuery("");
        setOpen(true);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!showList || options.length === 0) {
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const inst = options[activeIndex];
            if (inst) {
                selectInstitution(inst);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    }

    if (committed && selectedLabel) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.selectedCard} role="status" aria-live="polite">
                    <span className={styles.selectedName} title={selectedLabel}>
                        {selectedLabel}
                    </span>
                    <button
                        type="button"
                        className={styles.clearBtn}
                        onClick={handleClearSelection}
                        disabled={disabled}
                    >
                        {t("accounts.clearInstitution")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <input
                id="acc-institution"
                type="search"
                className={styles.input}
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    if (!e.target.value.trim()) {
                        onClear();
                    }
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => window.setTimeout(() => setOpen(false), 150)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                role="combobox"
                aria-expanded={showList}
                aria-controls={listId}
                aria-autocomplete="list"
                placeholder={t("accounts.selectInstitution")}
                autoComplete="off"
            />
            {!canSearch && !value && <p className={styles.hint}>{t("accounts.institutionSearchHint")}</p>}
            {canSearch && isLoading && <p className={styles.hint}>{t("accounts.institutionSearchLoading")}</p>}
            {canSearch && error && (
                <p className={styles.hint} role="alert">
                    {t("accounts.loadInstitutionsError")}
                </p>
            )}
            {canSearch && !isLoading && !error && options.length === 0 && (
                <p className={styles.empty}>
                    {t("accounts.institutionSearchNoResults")}{" "}
                    <Link href="/institutions">{t("accounts.goToInstitutions")}</Link>
                </p>
            )}
            {canSearch && totalItems > options.length && options.length > 0 && (
                <p className={styles.hint}>{t("accounts.institutionSearchRefine")}</p>
            )}
            {showList && options.length > 0 && (
                <ul id={listId} className={styles.listbox} role="listbox">
                    {options.map((inst, index) => (
                        <li key={inst.id} role="presentation">
                            <button
                                type="button"
                                role="option"
                                aria-selected={index === activeIndex}
                                className={`${styles.option} ${index === activeIndex ? styles.optionActive : ""}`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selectInstitution(inst)}
                            >
                                {inst.name} ({formatCountry(inst.country, locale)})
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function formatCountry(code: string, locale: string): string {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
}
