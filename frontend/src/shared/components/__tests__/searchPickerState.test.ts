import { isPickerCommitted } from "@/shared/components/searchPickerState";

describe("isPickerCommitted", () => {
    it("is true when value is set, query matches label, and list is closed", () => {
        expect(isPickerCommitted("id-1", "Bitcoin (BTC)", "Bitcoin (BTC)", false)).toBe(true);
    });

    it("is false while the list is open", () => {
        expect(isPickerCommitted("id-1", "Bitcoin (BTC)", "Bitcoin (BTC)", true)).toBe(false);
    });

    it("is false while the user is editing the query", () => {
        expect(isPickerCommitted("id-1", "Bitcoin (BTC)", "bit", false)).toBe(false);
    });
});
