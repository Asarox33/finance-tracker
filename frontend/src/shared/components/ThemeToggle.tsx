"use client";

import {useTheme} from "@/shared/hooks/useTheme";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
    const {theme, toggle} = useTheme();
    return (
        <button
            onClick={toggle}
            className={styles.btn}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
        </button>
    );
}