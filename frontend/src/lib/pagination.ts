export const TABLE_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type TablePageSize = (typeof TABLE_PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_TABLE_PAGE_SIZE: TablePageSize = 20;

export const SESSION_TIMEOUT_OPTIONS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const;

export const DEFAULT_SESSION_TIMEOUT_MINUTES = 10;

export function itemRange(
    page: number,
    pageSize: number,
    totalItems: number
): { from: number; to: number; total: number } | null {
    if (totalItems <= 0) {
        return null;
    }
    const from = page * pageSize + 1;
    const to = Math.min((page + 1) * pageSize, totalItems);
    return { from, to, total: totalItems };
}

export function totalPages(totalItems: number, pageSize: number): number {
    if (pageSize <= 0) {
        return 0;
    }
    return Math.max(1, Math.ceil(totalItems / pageSize));
}
