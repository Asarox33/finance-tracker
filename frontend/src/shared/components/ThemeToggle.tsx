"use client";

import clsx from "clsx";

import { useTheme } from "@/shared/hooks/useTheme";
import { useI18n } from "@/shared/i18n";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
    const { theme, toggle } = useTheme();
    const { t } = useI18n();
    const label = theme === "dark" ? t("theme.light") : t("theme.dark");
    return (
        <button
            type="button"
            onClick={toggle}
            className={clsx(styles.btn, styles.btnFloating)}
            aria-label={theme === "dark" ? t("theme.switchToLight") : t("theme.switchToDark")}
            title={label}
        >
            <span className={styles.icon} aria-hidden="true">
                {theme === "dark" ? "☀" : "☾"}
            </span>
            <span className={styles.label}>{label}</span>
        </button>
    );
}
