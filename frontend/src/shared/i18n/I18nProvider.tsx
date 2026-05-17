"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { DisplayLanguage } from "@/shared/types";
import {
    DEFAULT_LANGUAGE,
    LANGUAGE_LOCALES,
    SUPPORTED_LANGUAGES,
    TRANSLATIONS,
    type TranslationKey,
} from "./translations";

type Params = Record<string, string | number>;
const LANGUAGE_COOKIE = "preferred_language";

type I18nContextValue = {
    language: DisplayLanguage;
    locale: string;
    t: (key: TranslationKey, params?: Params) => string;
    setLanguage: (language: DisplayLanguage) => void;
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
    setLanguage: () => undefined,
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
            setLanguage: () => undefined,
        }),
        [selectedLanguage]
    );

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function readLanguageCookie(): DisplayLanguage | null {
    if (typeof document === "undefined") return null;
    const value = document.cookie
        .split("; ")
        .find((part) => part.startsWith(`${LANGUAGE_COOKIE}=`))
        ?.split("=")[1];
    if (!value) return null;
    const decoded = decodeURIComponent(value);
    return SUPPORTED_LANGUAGES.includes(decoded as DisplayLanguage) ? (decoded as DisplayLanguage) : null;
}

function writeLanguageCookie(language: DisplayLanguage) {
    if (typeof document === "undefined") return;
    document.cookie = `${LANGUAGE_COOKIE}=${encodeURIComponent(language)}; path=/; max-age=31536000; samesite=lax`;
}

export function RootI18nProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<DisplayLanguage>(DEFAULT_LANGUAGE);

    useEffect(() => {
        const stored = readLanguageCookie();
        if (stored) setLanguageState(stored);
    }, []);

    const setLanguage = useCallback((nextLanguage: DisplayLanguage) => {
        setLanguageState(nextLanguage);
        writeLanguageCookie(nextLanguage);
    }, []);

    const value = useMemo<I18nContextValue>(
        () => ({
            language,
            locale: LANGUAGE_LOCALES[language],
            t: (key, params) => translate(language, key, params),
            setLanguage,
        }),
        [language, setLanguage]
    );

    useEffect(() => {
        document.documentElement.lang = LANGUAGE_LOCALES[language].split("-")[0];
    }, [language]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    return useContext(I18nContext);
}
