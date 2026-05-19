"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { SUPPORTED_LANGUAGES, useI18n } from "@/shared/i18n";
import type { DisplayLanguage } from "@/shared/types";
import styles from "./LanguageToggle.module.css";

const LANGUAGE_LABEL_KEYS: Record<DisplayLanguage, "language.ENG" | "language.FRA" | "language.ESP" | "language.ITA"> =
    {
        ENG: "language.ENG",
        FRA: "language.FRA",
        ESP: "language.ESP",
        ITA: "language.ITA",
    };

const LANGUAGE_FLAG_CODES: Record<DisplayLanguage, string> = {
    ENG: "gb",
    FRA: "fr",
    ESP: "es",
    ITA: "it",
};

export default function LanguageToggle() {
    const pathname = usePathname();
    const { language, setLanguage, t } = useI18n();

    if (!pathname.startsWith("/login")) return null;

    return (
        <div className={styles.group} role="group" aria-label={t("language.selectorAria")}>
            {SUPPORTED_LANGUAGES.map((displayLanguage) => (
                <button
                    key={displayLanguage}
                    type="button"
                    className={clsx(styles.btn, displayLanguage === language && styles.active)}
                    onClick={() => setLanguage(displayLanguage)}
                    aria-label={`${t("language.selectorAria")}: ${t(LANGUAGE_LABEL_KEYS[displayLanguage])}`}
                    aria-pressed={displayLanguage === language}
                    title={t(LANGUAGE_LABEL_KEYS[displayLanguage])}
                >
                    <span
                        className={clsx("fi", `fi-${LANGUAGE_FLAG_CODES[displayLanguage]}`, styles.flag)}
                        aria-hidden="true"
                    />
                </button>
            ))}
        </div>
    );
}
