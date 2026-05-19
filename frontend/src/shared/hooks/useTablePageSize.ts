"use client";

import { useCallback } from "react";
import { useUpdatePreferences, useUserProfile } from "@/features/user-profile/hooks/useUserProfile";
import { DEFAULT_TABLE_PAGE_SIZE, TABLE_PAGE_SIZE_OPTIONS, type TablePageSize } from "@/lib/pagination";
import type { UserProfile } from "@/shared/types";

function isTablePageSize(value: number): value is TablePageSize {
    return (TABLE_PAGE_SIZE_OPTIONS as readonly number[]).includes(value);
}

export function useTablePageSize() {
    const { profile, isLoading } = useUserProfile();
    const { update, loading: isSubmitting } = useUpdatePreferences();

    const pageSize: TablePageSize =
        profile && isTablePageSize(profile.tablePageSize) ? profile.tablePageSize : DEFAULT_TABLE_PAGE_SIZE;

    const setPageSize = useCallback(
        async (next: TablePageSize) => {
            if (!profile || next === pageSize) {
                return;
            }
            await update(buildPreferencesPayload(profile, { tablePageSize: next }));
        },
        [pageSize, profile, update]
    );

    return { pageSize, setPageSize, isLoading: isLoading || isSubmitting };
}

function buildPreferencesPayload(
    profile: UserProfile,
    overrides: Partial<Pick<UserProfile, "tablePageSize" | "sessionTimeoutMinutes">>
) {
    return {
        firstName: profile.firstName,
        lastName: profile.lastName,
        displayName: profile.displayName,
        preferredCurrency: profile.preferredCurrency,
        preferredLanguage: profile.preferredLanguage,
        birthDate: profile.birthDate,
        tablePageSize: overrides.tablePageSize ?? profile.tablePageSize,
        sessionTimeoutMinutes: overrides.sessionTimeoutMinutes ?? profile.sessionTimeoutMinutes,
    };
}

export { buildPreferencesPayload };
