"use client";

import { createContext, useContext, useMemo } from "react";

import type { DisplayLanguage } from "@/shared/types";
import { DEFAULT_LANGUAGE, LANGUAGE_LOCALES, TRANSLATIONS, type TranslationKey } from "./translations";

type Params = Record<string, string | number>;

type I18nContextValue = {
    language: DisplayLanguage;
    locale: string;
    t: (key: TranslationKey, params?: Params) => string;
};

function interpolate(template: string, params?: Params): string {
    if (!params) return template;
    return Object.entries(params).reduce(
        (value, [key, replacement]) => value.replaceAll(`{${key}}`, String(replacement)),
        template
    );
}

export function translate(language: DisplayLanguage, key: TranslationKey, params?: Params): string {
    return interpolate(TRANSLATIONS[language]?.[key] ?? TRANSLATIONS[DEFAULT_LANGUAGE][key] ?? key, params);
}

const defaultContext: I18nContextValue = {
    language: DEFAULT_LANGUAGE,
    locale: LANGUAGE_LOCALES[DEFAULT_LANGUAGE],
    t: (key, params) => translate(DEFAULT_LANGUAGE, key, params),
};

const I18nContext = createContext<I18nContextValue>(defaultContext);

export function I18nProvider({
    language,
    children,
}: {
    language: DisplayLanguage | undefined;
    children: React.ReactNode;
}) {
    const selectedLanguage = language ?? DEFAULT_LANGUAGE;
    const value = useMemo<I18nContextValue>(
        () => ({
            language: selectedLanguage,
            locale: LANGUAGE_LOCALES[selectedLanguage],
            t: (key, params) => translate(selectedLanguage, key, params),
        }),
        [selectedLanguage]
    );

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    return useContext(I18nContext);
}
