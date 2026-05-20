import {
    applyPortfolioActivityWindow,
    buildPortfolioChartSlots,
} from "@/lib/portfolioChartSlots";

jest.mock("@/lib/format", () => ({
    lastNDates: (days: number) =>
        Array.from({ length: days }, (_, i) => `2026-04-${String(i + 1).padStart(2, "0")}`),
}));

describe("buildPortfolioChartSlots", () => {
    it("always returns dayCount slots", () => {
        const slots = buildPortfolioChartSlots(
            [{ date: "2026-04-25", totalValue: 1000 }],
            30
        );
        expect(slots).toHaveLength(30);
        expect(slots.find((s) => s.date === "2026-04-25")?.totalValue).toBe(1000);
        expect(slots.find((s) => s.date === "2026-04-01")?.totalValue).toBeNull();
    });
});

describe("applyPortfolioActivityWindow", () => {
    const slots = Array.from({ length: 30 }, (_, i) => ({
        date: `d${i}`,
        totalValue: i >= 20 && i <= 29 ? 100_00 : 0,
    }));

    it("clears leading and trailing zeros but keeps 30 slots", () => {
        const result = applyPortfolioActivityWindow(slots);
        expect(result).toHaveLength(30);
        expect(result.slice(0, 20).every((s) => s.totalValue === null)).toBe(true);
        expect(result.slice(20, 30).every((s) => s.totalValue === 100_00)).toBe(true);
    });

    it("clears all when no positive value", () => {
        const zeros = slots.map((s) => ({ ...s, totalValue: 0 }));
        expect(applyPortfolioActivityWindow(zeros).every((s) => s.totalValue === null)).toBe(true);
    });
});
