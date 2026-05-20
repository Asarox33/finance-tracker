"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { useAssetSearch } from "@/features/assets/hooks/useAssetSearch";
import { isPickerCommitted } from "@/shared/components/searchPickerState";
import { useI18n, type TranslationKey } from "@/shared/i18n";
import type { Asset } from "@/shared/types";
import styles from "@/shared/components/picker.module.css";

export interface AssetPickerProps {
    value: string;
    selectedLabel: string | null;
    onChange: (assetId: string, asset: Asset) => void;
    onClear: () => void;
    disabled?: boolean;
    inputId?: string;
}

export function formatAssetOptionLabel(asset: Asset): string {
    const identifier = asset.ticker ?? asset.isin;
    return identifier ? `${asset.name} (${identifier})` : asset.name;
}

export default function AssetPicker({
    value,
    selectedLabel,
    onChange,
    onClear,
    disabled = false,
    inputId = "tx-asset",
}: AssetPickerProps) {
    const { t } = useI18n();
    const listId = useId();
    const [query, setQuery] = useState(selectedLabel ?? "");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const committed = isPickerCommitted(value, selectedLabel, query, open);
    const searchQuery = committed ? "" : query;
    const { assets, totalItems, isLoading, error, canSearch } = useAssetSearch(searchQuery);

    useEffect(() => {
        if (selectedLabel && !open) {
            setQuery(selectedLabel);
        }
    }, [selectedLabel, open]);

    const showList = open && canSearch && !disabled && !committed;
    const options = useMemo(() => assets, [assets]);

    useEffect(() => {
        setActiveIndex(0);
    }, [options]);

    function selectAsset(asset: Asset) {
        onChange(asset.id, asset);
        setQuery(formatAssetOptionLabel(asset));
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
            const asset = options[activeIndex];
            if (asset) {
                selectAsset(asset);
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
                        {t("transactions.clearAsset")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <input
                id={inputId}
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
                placeholder={t("transactions.selectAsset")}
                autoComplete="off"
            />
            {!canSearch && !value && <p className={styles.hint}>{t("transactions.assetSearchHint")}</p>}
            {canSearch && isLoading && <p className={styles.hint}>{t("transactions.assetSearchLoading")}</p>}
            {canSearch && error && (
                <p className={styles.hint} role="alert">
                    {t("transactions.loadAssetsError")}
                </p>
            )}
            {canSearch && !isLoading && !error && options.length === 0 && (
                <p className={styles.empty}>
                    {t("transactions.assetSearchNoResults")} <Link href="/assets">{t("transactions.goToAssets")}</Link>
                </p>
            )}
            {canSearch && totalItems > options.length && options.length > 0 && (
                <p className={styles.hint}>{t("transactions.assetSearchRefine")}</p>
            )}
            {showList && options.length > 0 && (
                <ul id={listId} className={styles.listbox} role="listbox">
                    {options.map((asset, index) => (
                        <li key={asset.id} role="presentation">
                            <button
                                type="button"
                                role="option"
                                aria-selected={index === activeIndex}
                                className={`${styles.option} ${index === activeIndex ? styles.optionActive : ""}`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selectAsset(asset)}
                            >
                                {formatAssetOptionLabel(asset)}{" "}
                                <span style={{ color: "var(--text-muted)" }}>
                                    · {t(`assetType.${asset.type}` as TranslationKey)}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
