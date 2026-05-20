import { lastNDates } from "@/lib/format";

export interface PortfolioChartPoint {
    date: string;
    totalValue: number;
}

export interface PortfolioChartSlot {
    date: string;
    totalValue: number | null;
}

/** Fixed 30-day timeline (oldest → today); map API points by date. */
export function buildPortfolioChartSlots(
    points: PortfolioChartPoint[],
    dayCount: number
): PortfolioChartSlot[] {
    const byDate = new Map(points.map((p) => [p.date, p.totalValue]));
    return lastNDates(dayCount).map((date) => ({
        date,
        totalValue: byDate.get(date) ?? null,
    }));
}

/**
 * Only draw the curve between the first and last day with a positive portfolio value.
 * Leading/trailing zeros (typical for new users) stay empty on the 30-day axis.
 */
export function applyPortfolioActivityWindow(slots: PortfolioChartSlot[]): PortfolioChartSlot[] {
    const activeIndices = slots
        .map((s, i) => (s.totalValue !== null && s.totalValue > 0 ? i : -1))
        .filter((i) => i >= 0);

    if (activeIndices.length === 0) {
        return slots.map((s) => ({ ...s, totalValue: null }));
    }

    const start = activeIndices[0];
    const end = activeIndices[activeIndices.length - 1];

    return slots.map((s, i) => (i >= start && i <= end ? s : { ...s, totalValue: null }));
}
