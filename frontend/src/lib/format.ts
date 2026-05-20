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

export function monthsAgo(months: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString().split("T")[0];
}
