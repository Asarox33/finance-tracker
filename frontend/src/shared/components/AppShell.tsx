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

import styles from "./AppShell.module.css";

const NAV = [
    { href: "/dashboard", label: "Dashboard", icon: "⬡" },
    { href: "/institutions", label: "Institutions", icon: "⊞" },
    { href: "/accounts", label: "Accounts", icon: "◫" },
    { href: "/transactions", label: "Transactions", icon: "⇌" },
    { href: "/analytics", label: "Analytics", icon: "◈" },
];

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
                    <p className={styles.loadingText}>Loading your workspace...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className={styles.shell}>
            <SessionTimeoutModal
                open={sessionTimeout.warningOpen}
                reason={sessionTimeout.reason}
                secondsLeft={sessionTimeout.secondsLeft}
                onStayConnected={() => void sessionTimeout.stayConnected()}
                onSignOut={() => void sessionTimeout.signOutNow()}
            />
            <nav className={styles.sidebar} aria-label="Main navigation">
                <div className={styles.brand} aria-label="Finance Tracker">
                    <span className={styles.brandIcon} aria-hidden="true">
                        ◈
                    </span>
                    <span className={styles.brandName}>Finance</span>
                </div>

                <ul className={styles.nav} role="list">
                    {NAV.map(({ href, label, icon }) => (
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
                                <span>{label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className={styles.bottomSection}>
                    <hr className={styles.separator} aria-hidden="true" />

                    {profile && (
                        <p className={styles.displayName} aria-label="Logged in as">
                            {profile.displayName}
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

                        <span>Profile</span>
                    </Link>

                    <button type="button" onClick={() => void logout()} className={styles.logout} aria-label="Sign out">
                        <span className={styles.navIcon} aria-hidden="true">
                            ⊗
                        </span>
                        <span>Sign out</span>
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
