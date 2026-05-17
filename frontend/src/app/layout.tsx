import type { Metadata } from "next";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";
import ThemeToggle from "@/shared/components/ThemeToggle";
import LanguageToggle from "@/shared/components/LanguageToggle";
import { RootI18nProvider } from "@/shared/i18n";
import styles from "./layout.module.css";

export const metadata: Metadata = {
    title: { default: "Finance Tracker", template: "%s | Finance Tracker" },
    description: "Personal finance tracking — portfolio, performance, and analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" data-scroll-behavior="smooth">
            <body>
                <RootI18nProvider>
                    <div className={styles.floatingControls}>
                        <LanguageToggle />
                        <ThemeToggle />
                    </div>
                    {children}
                </RootI18nProvider>
            </body>
        </html>
    );
}
