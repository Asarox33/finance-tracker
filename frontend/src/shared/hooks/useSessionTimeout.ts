"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useLogout } from "@/features/auth/hooks/useAuth";
import { getAccessTokenExpiryMs, getToken, refreshAccessToken, subscribeAccessTokenChange } from "@/lib/http";

const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const GRACE_COUNTDOWN_SEC = 15;
const IDLE_WARNING_BEFORE_MS = GRACE_COUNTDOWN_SEC * 1000;
const JWT_WARNING_BEFORE_MS = 15 * 1000;
const REFRESH_AHEAD_MS = 2 * 60 * 1000;
const ACTIVITY_THROTTLE_MS = 1000;
const PROACTIVE_REFRESH_THROTTLE_MS = 60 * 1000;
const EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
const WAKE_EVENTS = ["focus", "pageshow"];

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

function secondsUntil(deadlineAt: number): number {
    return Math.max(0, Math.ceil((deadlineAt - Date.now()) / 1000));
}

export function useSessionTimeout() {
    const { logout } = useLogout();
    const logoutRef = useRef(logout);
    logoutRef.current = logout;

    const warningOpenRef = useRef(false);
    const reasonRef = useRef<SessionTimeoutReason>("idle");
    const graceExpiredRef = useRef(false);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const jwtTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const idleDeadlineAtRef = useRef(0);
    const warningDeadlineAtRef = useRef(0);
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

    const logoutExpiredSession = useCallback(() => {
        clearCountdown();
        clearIdleTimer();
        clearJwtTimer();
        graceExpiredRef.current = true;
        warningOpenRef.current = false;
        setWarningOpen(false);
        void logoutRef.current();
    }, [clearCountdown, clearIdleTimer, clearJwtTimer]);

    const openWarning = useCallback(
        (r: SessionTimeoutReason, deadlineAt = Date.now() + GRACE_COUNTDOWN_SEC * 1000) => {
            if (warningOpenRef.current) return;
            graceExpiredRef.current = false;
            warningOpenRef.current = true;
            reasonRef.current = r;
            warningDeadlineAtRef.current = deadlineAt;
            setReason(r);
            setSecondsLeft(secondsUntil(deadlineAt));
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

    const checkIdleDeadline = useCallback(() => {
        clearIdleTimer();
        const now = Date.now();
        const idleDeadlineAt = idleDeadlineAtRef.current;
        if (!idleDeadlineAt) return;

        if (now >= idleDeadlineAt) {
            logoutExpiredSession();
            return;
        }

        const warningAt = idleDeadlineAt - IDLE_WARNING_BEFORE_MS;
        if (now >= warningAt) {
            openWarning("idle", idleDeadlineAt);
            return;
        }

        idleTimerRef.current = setTimeout(checkIdleDeadline, warningAt - now);
    }, [clearIdleTimer, logoutExpiredSession, openWarning]);

    const armIdleTimer = useCallback(
        (activityAt = Date.now()) => {
            clearIdleTimer();
            idleDeadlineAtRef.current = activityAt + IDLE_TIMEOUT_MS;
            idleTimerRef.current = setTimeout(checkIdleDeadline, IDLE_TIMEOUT_MS - IDLE_WARNING_BEFORE_MS);
        },
        [checkIdleDeadline, clearIdleTimer]
    );

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
        setSecondsLeft(secondsUntil(warningDeadlineAtRef.current));
        countdownRef.current = setInterval(() => {
            setSecondsLeft(secondsUntil(warningDeadlineAtRef.current));
        }, 1000);
        return () => clearCountdown();
    }, [warningOpen, clearCountdown]);

    useEffect(() => {
        if (!warningOpen || secondsLeft > 0 || graceExpiredRef.current) return;
        if (reasonRef.current === "idle") {
            logoutExpiredSession();
            return;
        }
        if (getToken() && hasComfortableTokenLifetime()) {
            closeWarningAndContinue();
            return;
        }
        logoutExpiredSession();
    }, [warningOpen, secondsLeft, closeWarningAndContinue, logoutExpiredSession]);

    const onActivity = useCallback(() => {
        const now = Date.now();
        if (now - lastActivityThrottleRef.current < ACTIVITY_THROTTLE_MS) return;
        lastActivityThrottleRef.current = now;

        if (warningOpenRef.current) {
            checkIdleDeadline();
            return;
        }

        armIdleTimer();
        void tryProactiveRefreshIfNeeded();
        scheduleJwtWarning();
    }, [armIdleTimer, checkIdleDeadline, scheduleJwtWarning, tryProactiveRefreshIfNeeded]);

    useEffect(() => {
        armIdleTimer();
        void tryProactiveRefreshIfNeeded();
        scheduleJwtWarning();

        const closeJwtWarningIfTokenIsFresh = () => {
            if (warningOpenRef.current && reasonRef.current === "jwt" && hasComfortableTokenLifetime()) {
                closeWarningAndContinue();
            } else {
                scheduleJwtWarning();
            }
        };

        const unsubscribe = subscribeAccessTokenChange(closeJwtWarningIfTokenIsFresh);

        const onStorage = (e: StorageEvent) => {
            if (e.key !== "auth_token") return;
            closeJwtWarningIfTokenIsFresh();
        };
        window.addEventListener("storage", onStorage);

        const onWake = () => {
            checkIdleDeadline();
            scheduleJwtWarning();
        };
        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") onWake();
        };

        EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
        WAKE_EVENTS.forEach((e) => window.addEventListener(e, onWake));
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => {
            clearIdleTimer();
            clearJwtTimer();
            clearCountdown();
            unsubscribe();
            window.removeEventListener("storage", onStorage);
            EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
            WAKE_EVENTS.forEach((e) => window.removeEventListener(e, onWake));
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [
        armIdleTimer,
        scheduleJwtWarning,
        tryProactiveRefreshIfNeeded,
        onActivity,
        checkIdleDeadline,
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
            logoutExpiredSession();
        }
    }, [closeWarningAndContinue, logoutExpiredSession]);

    const signOutNow = useCallback(() => {
        logoutExpiredSession();
    }, [logoutExpiredSession]);

    return {
        warningOpen,
        reason,
        secondsLeft,
        stayConnected,
        signOutNow,
    };
}
