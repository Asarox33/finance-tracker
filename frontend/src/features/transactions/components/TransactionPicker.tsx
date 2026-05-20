"use client";

import { useMemo } from "react";
import { useAccountTransactions } from "@/features/transactions/hooks/useTransactions";
import {
    formatTransactionOptionLabel,
    sortTransactionsNewestFirst,
    type TransactionLabelFormatter,
} from "@/features/transactions/transactionDisplay";
import { useFormatters, useI18n, type TranslationKey } from "@/shared/i18n";
import type { TransactionType } from "@/shared/types";
import styles from "./TransactionPicker.module.css";

export interface TransactionPickerProps {
    accountId: string;
    value: string;
    onChange: (transactionId: string) => void;
    disabled?: boolean;
    id?: string;
    /** When set, prefer transactions on or before this date (fee accrual date). */
    accrualDate?: string;
}

function transactionTypeKey(type: TransactionType): TranslationKey {
    return `transactionType.${type}` as TranslationKey;
}

export default function TransactionPicker({
    accountId,
    value,
    onChange,
    disabled = false,
    id = "fees-transaction",
    accrualDate,
}: TransactionPickerProps) {
    const { t } = useI18n();
    const { formatDate, formatMoney } = useFormatters();
    const { transactions, isLoading, error } = useAccountTransactions(accountId);

    const labelFormatter: TransactionLabelFormatter = useMemo(
        () => ({
            formatDate,
            formatMoney,
            typeLabel: (type) => t(transactionTypeKey(type)),
        }),
        [formatDate, formatMoney, t]
    );

    const options = useMemo(() => {
        const sorted = sortTransactionsNewestFirst(transactions);
        if (!accrualDate) return sorted;
        return sorted.filter((tx) => tx.date <= accrualDate);
    }, [transactions, accrualDate]);

    return (
        <div className={styles.wrapper}>
            <select
                id={id}
                className={styles.select}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled || !accountId || isLoading}
            >
                <option value="">{t("fees.transactionNone")}</option>
                {options.map((tx) => (
                    <option key={tx.id} value={tx.id}>
                        {formatTransactionOptionLabel(tx, labelFormatter)}
                    </option>
                ))}
            </select>
            {!accountId && <p className={styles.hint}>{t("fees.transactionPickerNeedAccount")}</p>}
            {accountId && isLoading && <p className={styles.hint}>{t("common.loading")}</p>}
            {accountId && error && <p className={styles.hint}>{t("fees.transactionPickerLoadError")}</p>}
            {accountId && !isLoading && !error && options.length === 0 && (
                <p className={styles.hint}>{t("fees.transactionPickerEmpty")}</p>
            )}
        </div>
    );
}
