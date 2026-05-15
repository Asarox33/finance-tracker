"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureSession, isAuthenticated } from "@/lib/http";

export function useAuthGuard() {
    const router = useRouter();

    const [authenticated, setAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function check() {
            await ensureSession();
            if (cancelled) return;
            const auth = isAuthenticated();
            setAuthenticated(auth);

            if (!auth) {
                router.replace("/login");
            }
        }

        void check();

        const interval = setInterval(() => {
            void check();
        }, 10_000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [router]);

    return {
        isAuthenticated: authenticated === true,
        isLoading: authenticated === null,
    };
}
