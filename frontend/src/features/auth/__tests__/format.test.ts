import {formatBasisPoints, formatDate, formatMoney, monthsAgo, today} from "@/lib/format";

describe("formatMoney", () => {
    it("formats EUR with 2 decimal places", () => {
        expect(formatMoney(10050, "EUR")).toContain("100,50");
    });

    it("formats zero correctly", () => {
        expect(formatMoney(0, "EUR")).toContain("0,00");
    });

    it("includes currency symbol", () => {
        const result = formatMoney(10000, "EUR");
        expect(result).toMatch(/€|EUR/);
    });
});

describe("formatBasisPoints", () => {
    it("formats positive basis points with + sign", () => {
        expect(formatBasisPoints(1500)).toBe("+15.00%");
    });

    it("formats negative basis points without + sign", () => {
        expect(formatBasisPoints(-500)).toBe("-5.00%");
    });

    it("formats zero", () => {
        expect(formatBasisPoints(0)).toBe("+0.00%");
    });
});

describe("formatDate", () => {
    it("formats a date string into a readable format", () => {
        const result = formatDate("2024-01-15");
        expect(result).toMatch(/jan|janv/i);
        expect(result).toContain("2024");
    });
});

describe("today", () => {
    it("returns a date string in YYYY-MM-DD format", () => {
        expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

describe("monthsAgo", () => {
    it("returns a date string in YYYY-MM-DD format", () => {
        expect(monthsAgo(12)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("returns a date in the past", () => {
        expect(monthsAgo(1) < today()).toBe(true);
    });
});
