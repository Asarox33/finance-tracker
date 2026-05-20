export function formatMoney(amount: number, currency: string, fractionDigits = 2, locale = "fr-FR"): string {
    const value = amount / Math.pow(10, fractionDigits);
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        currencyDisplay: "code",
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(value);
}

export function formatDate(date: string, locale = "fr-FR"): string {
    return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

/** Y-axis labels: minor units → major currency, no decimal places. */
export function formatMoneyAxis(minor: number, currency: string, locale = "fr-FR"): string {
    const value = minor / 100;
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        currencyDisplay: "code",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/** Local calendar dates for the last N days (oldest first), YYYY-MM-DD. */
export function lastNDates(days: number): string[] {
    const result: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        result.push(`${y}-${m}-${day}`);
    }
    return result;
}

/** Compact day + month for chart axes (avoids clipping long year labels). */
export function formatChartAxisDate(date: string, locale = "fr-FR"): string {
    return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
    }).format(new Date(date));
}

export function formatBasisPoints(bp: number): string {
    const pct = bp / 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(2)}%`;
}

export function formatScaledMinor(minor: number, scale: number, locale = "fr-FR"): string {
    const maxDigits = Math.min(Math.max(scale, 0), 18);
    const value = minor / Math.pow(10, scale);
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDigits,
    }).format(value);
}

export function today(): string {
    return new Date().toISOString().split("T")[0];
}

export function yesterday(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
}

export function yearToDateStart(): string {
    const d = new Date();
    return `${d.getFullYear()}-01-01`;
}

export function monthsAgo(months: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString().split("T")[0];
}
