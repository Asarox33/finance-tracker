import { renderHook } from "@testing-library/react";
import { I18nProvider, useFormatters } from "@/shared/i18n";
import type { DisplayLanguage } from "@/shared/types";

function wrapper(language: DisplayLanguage) {
    return function TestWrapper({ children }: { children: React.ReactNode }) {
        return <I18nProvider language={language}>{children}</I18nProvider>;
    };
}

describe("useFormatters", () => {
    it("formats money with the selected English locale", () => {
        const { result } = renderHook(() => useFormatters(), { wrapper: wrapper("ENG") });
        expect(result.current.formatMoney(123456, "EUR")).toContain("EUR");
        expect(result.current.formatMoney(123456, "EUR")).toContain("1,234.56");
    });

    it("formats dates with the selected French locale", () => {
        const { result } = renderHook(() => useFormatters(), { wrapper: wrapper("FRA") });
        expect(result.current.formatDate("2024-01-15")).toContain("janv");
    });
});
