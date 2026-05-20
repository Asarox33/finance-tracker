import { feeAmountMajorFromRate, formatMajorForInput } from "@/lib/feeAmountFromRate";

describe("feeAmountMajorFromRate", () => {
    it("computes annual fee from percent of base", () => {
        expect(feeAmountMajorFromRate(100_000, 0.2, "annual")).toBe(200);
    });

    it("computes quarterly slice of annual rate", () => {
        expect(feeAmountMajorFromRate(100_000, 0.2, "quarterly")).toBe(50);
    });

    it("computes monthly slice of annual rate", () => {
        expect(feeAmountMajorFromRate(100_000, 0.2, "monthly")).toBeCloseTo(200 / 12, 5);
    });

    it("returns null for invalid inputs", () => {
        expect(feeAmountMajorFromRate(0, 0.2, "annual")).toBeNull();
        expect(feeAmountMajorFromRate(1000, -1, "annual")).toBeNull();
    });
});

describe("formatMajorForInput", () => {
    it("formats integers without decimals", () => {
        expect(formatMajorForInput(50)).toBe("50");
    });

    it("formats fractional amounts", () => {
        expect(formatMajorForInput(16.666666)).toBe("16.67");
    });
});
