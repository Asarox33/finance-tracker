import { itemRange, totalPages } from "@/lib/pagination";

describe("itemRange", () => {
    it("returns null when totalItems is zero", () => {
        expect(itemRange(0, 20, 0)).toBeNull();
    });

    it("returns first page range", () => {
        expect(itemRange(0, 20, 137)).toEqual({ from: 1, to: 20, total: 137 });
    });

    it("returns last partial page range", () => {
        expect(itemRange(6, 20, 137)).toEqual({ from: 121, to: 137, total: 137 });
    });

    it("returns full middle page range", () => {
        expect(itemRange(2, 10, 50)).toEqual({ from: 21, to: 30, total: 50 });
    });
});

describe("totalPages", () => {
    it("returns 0 when pageSize is zero", () => {
        expect(totalPages(100, 0)).toBe(0);
    });

    it("returns at least 1 for non-empty totals", () => {
        expect(totalPages(1, 20)).toBe(1);
        expect(totalPages(20, 20)).toBe(1);
        expect(totalPages(21, 20)).toBe(2);
        expect(totalPages(137, 20)).toBe(7);
    });
});
