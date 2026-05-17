import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, TRANSLATIONS, translate } from "@/shared/i18n";
import type { DisplayLanguage } from "@/shared/types";

describe("i18n translations", () => {
    it("keeps every dictionary complete", () => {
        const englishKeys = Object.keys(TRANSLATIONS.ENG).sort();

        for (const language of SUPPORTED_LANGUAGES) {
            expect(Object.keys(TRANSLATIONS[language]).sort()).toEqual(englishKeys);
        }
    });

    it("interpolates placeholders", () => {
        expect(translate("ENG", "common.pageOfTotal", { page: 2, total: 5 })).toBe("Page 2 of 5");
        expect(translate("FRA", "dashboard.inCurrency", { currency: "EUR" })).toBe("En EUR");
    });

    it("falls back to the default language for unknown keys", () => {
        expect(translate(DEFAULT_LANGUAGE, "missing.key" as keyof typeof TRANSLATIONS.ENG)).toBe("missing.key");
    });

    it("defines the requested display languages", () => {
        expect(SUPPORTED_LANGUAGES).toEqual<DisplayLanguage[]>(["ENG", "FRA", "ESP", "ITA"]);
    });
});
