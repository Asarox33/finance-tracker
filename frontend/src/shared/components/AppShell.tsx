"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import clsx from "clsx";

import { useLogout } from "@/features/auth/hooks/useAuth";
import { useAuthGuard } from "@/shared/hooks/useAuthGuard";
import { useUserProfile } from "@/features/user-profile/hooks/useUserProfile";
import { useSessionTimeout } from "@/shared/hooks/useSessionTimeout";
import SessionTimeoutModal from "@/shared/components/SessionTimeoutModal";
import { DEFAULT_LANGUAGE, I18nProvider, translate, useI18n, type TranslationKey } from "@/shared/i18n";

import styles from "./AppShell.module.css";

const NAV = [
    { href: "/dashboard", labelKey: "nav.dashboard", icon: "⬡" },
    { href: "/institutions", labelKey: "nav.institutions", icon: "⊞" },
    { href: "/accounts", labelKey: "nav.accounts", icon: "◫" },
    { href: "/transactions", labelKey: "nav.transactions", icon: "⇌" },
    { href: "/analytics", labelKey: "nav.analytics", icon: "◈" },
] satisfies { href: string; labelKey: TranslationKey; icon: string }[];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const { logout } = useLogout();
    const { profile } = useUserProfile();

    const { isAuthenticated, isLoading } = useAuthGuard();

    const sessionTimeout = useSessionTimeout();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className={styles.loadingShell}>
                <div className={styles.loadingCard}>
                    <div className={styles.spinner} aria-hidden="true" />
                    <p className={styles.loadingText}>{translate(DEFAULT_LANGUAGE, "app.loadingWorkspace")}</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <I18nProvider language={profile?.preferredLanguage}>
            <AppShellFrame
                pathname={pathname}
                profileDisplayName={profile?.displayName}
                sessionTimeout={sessionTimeout}
                onLogout={() => void logout()}
            >
                {children}
            </AppShellFrame>
        </I18nProvider>
    );
}

function AppShellFrame({
    children,
    pathname,
    profileDisplayName,
    sessionTimeout,
    onLogout,
}: {
    children: React.ReactNode;
    pathname: string;
    profileDisplayName?: string;
    sessionTimeout: ReturnType<typeof useSessionTimeout>;
    onLogout: () => void;
}) {
    const { t } = useI18n();

    return (
        <div className={styles.shell}>
            <SessionTimeoutModal
                open={sessionTimeout.warningOpen}
                reason={sessionTimeout.reason}
                secondsLeft={sessionTimeout.secondsLeft}
                onStayConnected={() => void sessionTimeout.stayConnected()}
                onSignOut={() => void sessionTimeout.signOutNow()}
            />
            <nav className={styles.sidebar} aria-label={t("app.mainNavigation")}>
                <div className={styles.brand} aria-label={t("app.brand")}>
                    <span className={styles.brandIcon} aria-hidden="true">
                        ◈
                    </span>
                    <span className={styles.brandName}>{t("app.brandShort")}</span>
                </div>

                <ul className={styles.nav} role="list">
                    {NAV.map(({ href, labelKey, icon }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                className={clsx(styles.navLink, pathname.startsWith(href) && styles.active)}
                                aria-current={pathname.startsWith(href) ? "page" : undefined}
                            >
                                <span className={styles.navIcon} aria-hidden="true">
                                    {" "}
                                    {icon}{" "}
                                </span>
                                <span>{t(labelKey)}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className={styles.bottomSection}>
                    <hr className={styles.separator} aria-hidden="true" />

                    {profileDisplayName && (
                        <p className={styles.displayName} aria-label={t("app.loggedInAs")}>
                            {profileDisplayName}
                        </p>
                    )}

                    <Link
                        href="/profile"
                        className={clsx(styles.navLink, pathname.startsWith("/profile") && styles.active)}
                        aria-current={pathname.startsWith("/profile") ? "page" : undefined}
                    >
                        <span className={styles.navIcon} aria-hidden="true">
                            ◉
                        </span>

                        <span>{t("nav.profile")}</span>
                    </Link>

                    <button type="button" onClick={onLogout} className={styles.logout} aria-label={t("nav.signOut")}>
                        <span className={styles.navIcon} aria-hidden="true">
                            ⊗
                        </span>
                        <span>{t("nav.signOut")}</span>
                    </button>
                </div>
            </nav>

            <div className={styles.content}>
                <main id="main-content" tabIndex={-1}>
                    {children}
                </main>
            </div>
        </div>
    );
}
