import {
    formatTransactionOptionLabel,
    signedTransactionAmount,
    sortTransactionsNewestFirst,
} from "@/features/transactions/transactionDisplay";
import type { Transaction } from "@/shared/types";

const fmt = {
    formatDate: (d: string) => d,
    formatMoney: (amount: number, currency: string) => `${amount} ${currency}`,
    typeLabel: (type: string) => type,
};

function tx(partial: Partial<Transaction> & Pick<Transaction, "id">): Transaction {
    return {
        id: partial.id,
        accountId: "acc-1",
        assetId: null,
        type: "BUY",
        amount: 1000,
        currency: "EUR",
        date: "2024-06-01",
        label: "Purchase",
        notes: null,
        appliedFxRate: null,
        appliedFxRateScale: null,
        appliedFxRateDate: null,
        appliedFxSourceCurrency: null,
        appliedFxTargetCurrency: null,
        assetQuantityMinor: null,
        assetQuantityScale: null,
        ...partial,
    };
}

describe("signedTransactionAmount", () => {
    it("negates outflow types", () => {
        expect(signedTransactionAmount(tx({ id: "1", type: "FEE", amount: 500 }))).toBe(-500);
    });

    it("keeps inflow types positive", () => {
        expect(signedTransactionAmount(tx({ id: "2", type: "DEPOSIT", amount: 500 }))).toBe(500);
    });
});

describe("formatTransactionOptionLabel", () => {
    it("includes date, label, type, and signed amount", () => {
        const label = formatTransactionOptionLabel(
            tx({ id: "1", type: "FEE", amount: 199, label: "Broker", date: "2024-01-15" }),
            fmt
        );
        expect(label).toContain("2024-01-15");
        expect(label).toContain("Broker");
        expect(label).toContain("FEE");
        expect(label).toContain("−199 EUR");
    });
});

describe("sortTransactionsNewestFirst", () => {
    it("orders by date descending", () => {
        const sorted = sortTransactionsNewestFirst([
            tx({ id: "a", date: "2024-01-01" }),
            tx({ id: "b", date: "2024-06-01" }),
        ]);
        expect(sorted[0].id).toBe("b");
    });
});
