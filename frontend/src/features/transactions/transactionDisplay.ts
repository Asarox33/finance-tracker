import type { Transaction, TransactionType } from "@/shared/types";

const INFLOW_TYPES: TransactionType[] = ["DEPOSIT", "SELL", "DIVIDEND"];
const OUTFLOW_TYPES: TransactionType[] = ["WITHDRAWAL", "BUY", "FEE", "TAX"];

export function signedTransactionAmount(tx: Pick<Transaction, "type" | "amount">): number {
    if (INFLOW_TYPES.includes(tx.type)) return Math.abs(tx.amount);
    if (OUTFLOW_TYPES.includes(tx.type)) return -Math.abs(tx.amount);
    return tx.amount;
}

export type TransactionLabelFormatter = {
    formatDate: (date: string) => string;
    formatMoney: (amount: number, currency: string) => string;
    typeLabel: (type: TransactionType) => string;
};

export function formatTransactionOptionLabel(tx: Transaction, fmt: TransactionLabelFormatter): string {
    const signed = signedTransactionAmount(tx);
    const amountStr = fmt.formatMoney(Math.abs(signed), tx.currency);
    const sign = signed < 0 ? "−" : "+";
    return `${fmt.formatDate(tx.date)} · ${tx.label} · ${fmt.typeLabel(tx.type)} · ${sign}${amountStr}`;
}

/** Newest first for pickers and dropdowns. */
export function sortTransactionsNewestFirst(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort((a, b) => {
        const byDate = b.date.localeCompare(a.date);
        if (byDate !== 0) return byDate;
        return b.id.localeCompare(a.id);
    });
}
