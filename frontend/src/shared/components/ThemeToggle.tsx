"use client";

import clsx from "clsx";

import { useTheme } from "@/shared/hooks/useTheme";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
    const { theme, toggle } = useTheme();
    const label = theme === "dark" ? "Light theme" : "Dark theme";
    return (
        <button
            type="button"
            onClick={toggle}
            className={clsx(styles.btn, styles.btnFloating)}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={label}
        >
            <span className={styles.icon} aria-hidden="true">
                {theme === "dark" ? "☀" : "☾"}
            </span>
            <span className={styles.label}>{label}</span>
        </button>
    );
}
