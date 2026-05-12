"use client";

import useSWR from "swr";
import {useState} from "react";
import {type UpdatePreferencesRequest, userProfileApi} from "../api/userProfileApi";
import type {ApiError} from "@/shared/types";

export function useUserProfile() {
    const {data, error, isLoading, mutate} = useSWR(
        "user-profile-me",
        () => userProfileApi.getMe()
    );
    return {profile: data, error, isLoading, mutate};
}

export function useUpdatePreferences() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function update(data: UpdatePreferencesRequest, onSuccess?: () => void) {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await userProfileApi.updatePreferences(data);
            setSuccess(true);
            onSuccess?.();
        } catch (err) {
            setError((err as ApiError).message ?? "Failed to update preferences");
        } finally {
            setLoading(false);
        }
    }

    return {update, loading, error, success};
}