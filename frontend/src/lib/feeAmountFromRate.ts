export type FeeAccrualPeriod = "annual" | "quarterly" | "monthly";

/**
 * Converts a percentage rate on a base (major units) into a fee amount in major units
 * for the chosen accrual period (e.g. 0.2% annual on €100,000 → €200/year).
 */
export function feeAmountMajorFromRate(
    baseMajor: number,
    ratePercent: number,
    period: FeeAccrualPeriod
): number | null {
    if (!Number.isFinite(baseMajor) || baseMajor <= 0) return null;
    if (!Number.isFinite(ratePercent) || ratePercent <= 0) return null;

    const annualMajor = (baseMajor * ratePercent) / 100;
    switch (period) {
        case "annual":
            return annualMajor;
        case "quarterly":
            return annualMajor / 4;
        case "monthly":
            return annualMajor / 12;
        default:
            return null;
    }
}

export function formatMajorForInput(major: number): string {
    const rounded = Math.round(major * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}
