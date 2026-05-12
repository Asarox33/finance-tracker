"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLogout } from "@/features/auth/hooks/useAuth";

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];

export function useSessionTimeout() {
    const { logout } = useLogout();
    const timer = useRef<NodeJS.Timeout | null>(null);

    const reset = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);

        timer.current = setTimeout(() => {
            logout();
        }, TIMEOUT_MS);
    }, [logout]);

    useEffect(() => {
        reset();

        EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));

        return () => {
            if (timer.current) clearTimeout(timer.current);

            EVENTS.forEach((e) => window.removeEventListener(e, reset));
        };
    }, [reset]);
}
