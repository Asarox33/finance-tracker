"use client";

import { useMemo } from "react";

import { formatDate, formatMoney } from "@/lib/format";
import { useI18n } from "./I18nProvider";

export function useFormatters() {
    const { locale } = useI18n();

    return useMemo(
        () => ({
            formatMoney: (amount: number, currency: string, fractionDigits = 2) =>
                formatMoney(amount, currency, fractionDigits, locale),
            formatDate: (date: string) => formatDate(date, locale),
        }),
        [locale]
    );
}
