"use client";

import { useState } from "react";
import { authApi } from "../api/authApi";
import * as httpModule from "@/lib/http";
import { setToken, setUserId } from "@/lib/http";
import { useI18n } from "@/shared/i18n";
import type { ApiError, DisplayLanguage } from "@/shared/types";
import { useRouter } from "next/navigation";

export interface LoginError {
    message: string;
    locked: boolean;
}

function extractUserId(token: string): string | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        return JSON.parse(atob(parts[1])).sub ?? null;
    } catch {
        return null;
    }
}

export function useLogin() {
    const router = useRouter();
    const { t } = useI18n();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<LoginError | null>(null);

    async function login(email: string, password: string) {
        setLoading(true);
        setError(null);
        try {
            const { accessToken } = await authApi.login({ email, password });
            setToken(accessToken);
            const userId = extractUserId(accessToken);
            if (userId) setUserId(userId);
            router.push("/dashboard");
        } catch (err) {
            const apiErr = err as ApiError;
            const locked = apiErr?.message?.toLowerCase().includes("locked") ?? false;
            setError({
                message: locked
                    ? t("auth.lockedError")
                    : (apiErr.message ?? t("auth.loginFallback")),
                locked,
            });
        } finally {
            setLoading(false);
        }
    }

    return { login, loading, error };
}

export function useRegister() {
    const router = useRouter();
    const { language, t } = useI18n();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function register(email: string, password: string, preferredLanguage: DisplayLanguage = language) {
        setLoading(true);
        setError(null);
        try {
            await authApi.register({ email, password, preferredLanguage });
            router.push("/login?registered=1");
        } catch (err) {
            setError((err as ApiError).message ?? t("auth.registrationFallback"));
        } finally {
            setLoading(false);
        }
    }

    return { register, loading, error };
}

export function usePasswordReset() {
    const { t } = useI18n();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<"request" | "confirm" | "done">("request");

    async function requestReset(email: string) {
        setLoading(true);
        setError(null);
        try {
            await authApi.requestPasswordReset({ email });
            setStep("confirm");
        } catch (err) {
            setError((err as ApiError).message ?? t("auth.requestFallback"));
        } finally {
            setLoading(false);
        }
    }

    async function confirmReset(email: string, otp: string, newPassword: string) {
        setLoading(true);
        setError(null);
        try {
            await authApi.confirmPasswordReset({ email, otp, newPassword });
            setStep("done");
        } catch (err) {
            setError((err as ApiError).message ?? t("auth.resetFallback"));
        } finally {
            setLoading(false);
        }
    }

    function backToRequest() {
        setStep("request");
        setError(null);
    }

    return { step, loading, error, requestReset, confirmReset, backToRequest };
}

export function useLogout() {
    const router = useRouter();

    const logout = async () => {
        try {
            await authApi.logout();
        } catch {
            /* ignore */
        }
        httpModule.removeToken();
        httpModule.removeUserId();
        router.replace("/login");
    };

    return { logout };
}
