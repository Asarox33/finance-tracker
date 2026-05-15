"use client";

import { useUserProfile } from "@/features/user-profile/hooks/useUserProfile";

export function useReferenceCurrency() {
    const { profile, isLoading } = useUserProfile();
    return {
        referenceCurrency: profile?.preferredCurrency ?? "EUR",
        isLoading,
    };
}
