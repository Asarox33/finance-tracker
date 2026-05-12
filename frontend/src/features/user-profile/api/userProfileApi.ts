import {http} from "@/lib/http";
import type {UserProfile} from "@/shared/types";

export interface UpdatePreferencesRequest {
    firstName: string;
    lastName: string;
    displayName: string;
    preferredCurrency: string;
    birthDate: string | null;
}

export const userProfileApi = {
    getMe: () =>
        http.get<UserProfile>("/users/me"),

    updatePreferences: (body: UpdatePreferencesRequest) =>
        http.put<UserProfile>("/users/me/preferences", body),
};