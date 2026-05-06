"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { useSessionTimeout } from "@/shared/hooks/useSessionTimeout";
import styles from "./layout.module.css";
import clsx from "clsx";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "⬡" },
  { href: "/accounts", label: "Accounts", icon: "◫" },
  { href: "/transactions", label: "Transactions", icon: "⇌" },
  { href: "/analytics", label: "Analytics", icon: "◈" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useLogout();
  useSessionTimeout();

  return (
      <div className={styles.shell}>
        <nav className={styles.sidebar} aria-label="Main navigation">
          <div className={styles.brand} aria-label="Finance Tracker">
            <span className={styles.brandIcon} aria-hidden="true">◈</span>
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
                    <span className={styles.navIcon} aria-hidden="true">{icon}</span>
                    <span>{label}</span>
                  </Link>
                </li>
            ))}
          </ul>

          <button onClick={logout} className={styles.logout} aria-label="Sign out">
            <span aria-hidden="true">⊗</span>
            Sign out
          </button>
        </nav>

        <div className={styles.content}>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
  );
}