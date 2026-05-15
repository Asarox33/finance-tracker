"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useLogout } from "@/features/auth/hooks/useAuth";
import { getAccessTokenExpiryMs, refreshAccessToken } from "@/lib/http";

const IDLE_WARNING_MS = 5 * 60 * 1000;
const GRACE_COUNTDOWN_SEC = 15;
const JWT_WARNING_BEFORE_MS = 15 * 1000;
const ACTIVITY_THROTTLE_MS = 1000;
const EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];

export type SessionTimeoutReason = "idle" | "jwt";

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
        const warnAt = exp - JWT_WARNING_BEFORE_MS;
        const delay = warnAt - Date.now();
        if (delay <= 0) {
            openWarning("jwt");
            return;
        }
        jwtTimerRef.current = setTimeout(() => {
            openWarning("jwt");
        }, delay);
    }, [clearJwtTimer, openWarning]);

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
        graceExpiredRef.current = true;
        warningOpenRef.current = false;
        setWarningOpen(false);
        void logoutRef.current();
    }, [warningOpen, secondsLeft]);

    const onActivity = useCallback(() => {
        const now = Date.now();
        if (now - lastActivityThrottleRef.current < ACTIVITY_THROTTLE_MS) return;
        lastActivityThrottleRef.current = now;

        if (warningOpenRef.current) {
            return;
        }

        armIdleTimer();
        scheduleJwtWarning();
    }, [armIdleTimer, scheduleJwtWarning]);

    useEffect(() => {
        armIdleTimer();
        scheduleJwtWarning();
        EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
        return () => {
            clearIdleTimer();
            clearJwtTimer();
            clearCountdown();
            EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
        };
    }, [armIdleTimer, scheduleJwtWarning, onActivity, clearIdleTimer, clearJwtTimer, clearCountdown]);

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
