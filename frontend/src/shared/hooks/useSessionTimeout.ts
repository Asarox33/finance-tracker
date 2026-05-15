"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useLogout } from "@/features/auth/hooks/useAuth";
import {
    getAccessTokenExpiryMs,
    getToken,
    refreshAccessToken,
    subscribeAccessTokenChange,
} from "@/lib/http";

const IDLE_WARNING_MS = 5 * 60 * 1000;
const GRACE_COUNTDOWN_SEC = 15;
const JWT_WARNING_BEFORE_MS = 15 * 1000;
const REFRESH_AHEAD_MS = 2 * 60 * 1000;
const ACTIVITY_THROTTLE_MS = 1000;
const PROACTIVE_REFRESH_THROTTLE_MS = 60 * 1000;
const EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];

export type SessionTimeoutReason = "idle" | "jwt";

function remainingMs(): number | null {
    const exp = getAccessTokenExpiryMs();
    if (exp == null) return null;
    return exp - Date.now();
}

function hasComfortableTokenLifetime(): boolean {
    const remaining = remainingMs();
    return remaining != null && remaining > JWT_WARNING_BEFORE_MS;
}

export function useSessionTimeout() {
    const { logout } = useLogout();
    const logoutRef = useRef(logout);
    logoutRef.current = logout;

    const warningOpenRef = useRef(false);
    const graceExpiredRef = useRef(false);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const jwtTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastActivityThrottleRef = useRef(0);
    const lastProactiveRefreshRef = useRef(0);

    const [warningOpen, setWarningOpen] = useState(false);
    const [reason, setReason] = useState<SessionTimeoutReason>("idle");
    const [secondsLeft, setSecondsLeft] = useState(GRACE_COUNTDOWN_SEC);

    const clearCountdown = useCallback(() => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    }, []);

    const clearIdleTimer = useCallback(() => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
    }, []);

    const clearJwtTimer = useCallback(() => {
        if (jwtTimerRef.current) {
            clearTimeout(jwtTimerRef.current);
            jwtTimerRef.current = null;
        }
    }, []);

    const openWarning = useCallback(
        (r: SessionTimeoutReason) => {
            if (warningOpenRef.current) return;
            graceExpiredRef.current = false;
            warningOpenRef.current = true;
            setReason(r);
            setSecondsLeft(GRACE_COUNTDOWN_SEC);
            setWarningOpen(true);
            if (r === "idle") clearJwtTimer();
            else clearIdleTimer();
        },
        [clearIdleTimer, clearJwtTimer]
    );

    const scheduleJwtWarning = useCallback(() => {
        clearJwtTimer();
        const exp = getAccessTokenExpiryMs();
        if (exp == null) return;

        const fireImminent = () => {
            void (async () => {
                if (warningOpenRef.current) return;
                const ok = await refreshAccessToken();
                if (ok) {
                    scheduleJwtWarning();
                } else {
                    openWarning("jwt");
                }
            })();
        };

        const delay = exp - JWT_WARNING_BEFORE_MS - Date.now();
        if (delay <= 0) {
            fireImminent();
            return;
        }
        jwtTimerRef.current = setTimeout(fireImminent, delay);
    }, [clearJwtTimer, openWarning]);

    const tryProactiveRefreshIfNeeded = useCallback(async () => {
        if (warningOpenRef.current) return;
        const remaining = remainingMs();
        if (remaining == null || remaining > REFRESH_AHEAD_MS) return;

        const now = Date.now();
        if (now - lastProactiveRefreshRef.current < PROACTIVE_REFRESH_THROTTLE_MS) return;
        lastProactiveRefreshRef.current = now;

        const ok = await refreshAccessToken();
        if (ok) {
            scheduleJwtWarning();
        } else if (remaining <= JWT_WARNING_BEFORE_MS) {
            openWarning("jwt");
        }
    }, [openWarning, scheduleJwtWarning]);

    const armIdleTimer = useCallback(() => {
        clearIdleTimer();
        idleTimerRef.current = setTimeout(() => {
            openWarning("idle");
        }, IDLE_WARNING_MS);
    }, [clearIdleTimer, openWarning]);

    const closeWarningAndContinue = useCallback(() => {
        clearCountdown();
        graceExpiredRef.current = false;
        warningOpenRef.current = false;
        setWarningOpen(false);
        armIdleTimer();
        scheduleJwtWarning();
    }, [armIdleTimer, clearCountdown, scheduleJwtWarning]);

    useEffect(() => {
        if (!warningOpen) return;
        clearCountdown();
        setSecondsLeft(GRACE_COUNTDOWN_SEC);
        countdownRef.current = setInterval(() => {
            setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
        }, 1000);
        return () => clearCountdown();
    }, [warningOpen, clearCountdown]);

    useEffect(() => {
        if (!warningOpen || secondsLeft > 0 || graceExpiredRef.current) return;
        if (getToken() && hasComfortableTokenLifetime()) {
            closeWarningAndContinue();
            return;
        }
        graceExpiredRef.current = true;
        warningOpenRef.current = false;
        setWarningOpen(false);
        void logoutRef.current();
    }, [warningOpen, secondsLeft, closeWarningAndContinue]);

    const onActivity = useCallback(() => {
        const now = Date.now();
        if (now - lastActivityThrottleRef.current < ACTIVITY_THROTTLE_MS) return;
        lastActivityThrottleRef.current = now;

        if (warningOpenRef.current) {
            return;
        }

        armIdleTimer();
        void tryProactiveRefreshIfNeeded();
        scheduleJwtWarning();
    }, [armIdleTimer, scheduleJwtWarning, tryProactiveRefreshIfNeeded]);

    useEffect(() => {
        armIdleTimer();
        void tryProactiveRefreshIfNeeded();
        scheduleJwtWarning();

        const unsubscribe = subscribeAccessTokenChange(() => {
            if (warningOpenRef.current && hasComfortableTokenLifetime()) {
                closeWarningAndContinue();
            } else {
                scheduleJwtWarning();
            }
        });

        const onStorage = (e: StorageEvent) => {
            if (e.key !== "auth_token") return;
            if (warningOpenRef.current && hasComfortableTokenLifetime()) {
                closeWarningAndContinue();
            } else {
                scheduleJwtWarning();
            }
        };
        window.addEventListener("storage", onStorage);

        EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
        return () => {
            clearIdleTimer();
            clearJwtTimer();
            clearCountdown();
            unsubscribe();
            window.removeEventListener("storage", onStorage);
            EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
        };
    }, [
        armIdleTimer,
        scheduleJwtWarning,
        tryProactiveRefreshIfNeeded,
        onActivity,
        clearIdleTimer,
        clearJwtTimer,
        clearCountdown,
        closeWarningAndContinue,
    ]);

    const stayConnected = useCallback(async () => {
        const ok = await refreshAccessToken();
        if (ok) {
            closeWarningAndContinue();
        } else {
            clearCountdown();
            graceExpiredRef.current = true;
            warningOpenRef.current = false;
            setWarningOpen(false);
            void logoutRef.current();
        }
    }, [closeWarningAndContinue, clearCountdown]);

    const signOutNow = useCallback(() => {
        clearCountdown();
        graceExpiredRef.current = true;
        warningOpenRef.current = false;
        setWarningOpen(false);
        void logoutRef.current();
    }, [clearCountdown]);

    return {
        warningOpen,
        reason,
        secondsLeft,
        stayConnected,
        signOutNow,
    };
}
