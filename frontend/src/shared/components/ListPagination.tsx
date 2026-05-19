"use client";

import { Button } from "@/shared/components/ui";
import { useI18n, type TranslationKey } from "@/shared/i18n";
import { itemRange, TABLE_PAGE_SIZE_OPTIONS, type TablePageSize } from "@/lib/pagination";
import styles from "./ListPagination.module.css";

export interface ListPaginationProps {
    page: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: TablePageSize) => void;
    ariaLabel: string;
    pageSizeLabelKey?: TranslationKey;
    showPageSizeSelector?: boolean;
}

export default function ListPagination({
    page,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    ariaLabel,
    pageSizeLabelKey = "common.rowsPerPage",
    showPageSizeSelector = true,
}: ListPaginationProps) {
    const { t } = useI18n();
    const pageSizeLabel = t(pageSizeLabelKey);
    const range = itemRange(page, pageSize, totalItems);
    const lastPage = Math.max(0, Math.ceil(totalItems / pageSize) - 1);

    if (!range) {
        return null;
    }

    return (
        <nav className={styles.pagination} aria-label={ariaLabel}>
            <p className={styles.range}>
                {t("common.itemsRange", { from: range.from, to: range.to, total: range.total })}
            </p>
            <div className={styles.controls}>
                {showPageSizeSelector && onPageSizeChange && (
                    <label className={styles.pageSizeField}>
                        <span>{pageSizeLabel}</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value) as TablePageSize)}
                            aria-label={pageSizeLabel}
                        >
                            {TABLE_PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                {lastPage > 0 && (
                    <div className={styles.navButtons}>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 0}
                        >
                            {t("common.previousPage")}
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= lastPage}
                        >
                            {t("common.nextPage")}
                        </Button>
                    </div>
                )}
            </div>
        </nav>
    );
}
