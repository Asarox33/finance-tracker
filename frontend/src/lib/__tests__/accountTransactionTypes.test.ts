import {
    allowedTransactionTypesForAccount,
    isTransactionTypeAllowed,
    pickDefaultTransactionType,
    transactionTypeRequiresAsset,
} from "@/lib/accountTransactionTypes";

describe("accountTransactionTypes", () => {
    it("disallows securities trades on checking accounts", () => {
        expect(isTransactionTypeAllowed("CHECKING", "BUY")).toBe(false);
        expect(isTransactionTypeAllowed("CHECKING", "SELL")).toBe(false);
        expect(isTransactionTypeAllowed("CHECKING", "DEPOSIT")).toBe(true);
    });

    it("allows dividend on savings but not buy", () => {
        expect(isTransactionTypeAllowed("SAVINGS", "DIVIDEND")).toBe(true);
        expect(isTransactionTypeAllowed("SAVINGS", "BUY")).toBe(false);
    });

    it("allows securities trades on brokerage accounts", () => {
        expect(allowedTransactionTypesForAccount("BROKERAGE")).toContain("BUY");
        expect(allowedTransactionTypesForAccount("BROKERAGE")).toContain("SELL");
    });

    it("allows all types on other accounts", () => {
        expect(allowedTransactionTypesForAccount("OTHER")).toHaveLength(9);
    });

    it("defaults to deposit when available", () => {
        expect(pickDefaultTransactionType("CHECKING")).toBe("DEPOSIT");
    });

    it("flags buy and sell as asset-required", () => {
        expect(transactionTypeRequiresAsset("BUY")).toBe(true);
        expect(transactionTypeRequiresAsset("DEPOSIT")).toBe(false);
    });
});
