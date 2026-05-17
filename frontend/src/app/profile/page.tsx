"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useUpdatePreferences, useUserProfile } from "@/features/user-profile/hooks/useUserProfile";
import { Button, Card, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import { useI18n, type TranslationKey } from "@/shared/i18n";
import type { DisplayLanguage } from "@/shared/types";
import { CURRENCIES } from "@/lib/currencies";
import styles from "./page.module.css";

const DISPLAY_LANGUAGES: DisplayLanguage[] = ["ENG", "FRA", "ESP", "ITA"];
const LANGUAGE_LABEL_KEYS: Record<DisplayLanguage, TranslationKey> = {
    ENG: "language.ENG",
    FRA: "language.FRA",
    ESP: "language.ESP",
    ITA: "language.ITA",
};

export default function ProfilePage() {
    const { t } = useI18n();
    const { profile, isLoading, error, mutate } = useUserProfile();
    const { update, loading: saving, error: saveError, success } = useUpdatePreferences();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [currency, setCurrency] = useState("EUR");
    const [language, setLanguage] = useState<DisplayLanguage>("ENG");
    const [birthDate, setBirthDate] = useState("");
    const [clientError, setClientError] = useState<string | null>(null);

    useEffect(() => {
        if (profile) {
            setFirstName(profile.firstName);
            setLastName(profile.lastName);
            setDisplayName(profile.displayName);
            setCurrency(profile.preferredCurrency);
            setLanguage(profile.preferredLanguage);
            setBirthDate(profile.birthDate ?? "");
        }
    }, [profile]);

    const hasChanges = useMemo(() => {
        if (!profile) return false;
        return (
            firstName !== profile.firstName ||
            lastName !== profile.lastName ||
            displayName !== profile.displayName ||
            currency !== profile.preferredCurrency ||
            language !== profile.preferredLanguage ||
            birthDate !== (profile.birthDate ?? "")
        );
    }, [birthDate, currency, displayName, firstName, language, lastName, profile]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setClientError(null);
        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();
        const trimmedDisplayName = displayName.trim();
        if (!trimmedFirstName) {
            setClientError(t("profile.firstNameRequired"));
            return;
        }
        if (!trimmedLastName) {
            setClientError(t("profile.lastNameRequired"));
            return;
        }
        if (!trimmedDisplayName) {
            setClientError(t("profile.displayNameRequired"));
            return;
        }
        if (birthDate && birthDate > new Date().toISOString().split("T")[0]) {
            setClientError(t("profile.birthDateFuture"));
            return;
        }
        await update(
            {
                firstName: trimmedFirstName,
                lastName: trimmedLastName,
                displayName: trimmedDisplayName,
                preferredCurrency: currency,
                preferredLanguage: language,
                birthDate: birthDate || null,
            },
            () => mutate()
        );
    }

    return (
        <div className={styles.page}>
            <PageHeader title={t("profile.title")} description={t("profile.description")} />
            <div className={styles.body}>
                {isLoading && (
                    <Card>
                        <div className={styles.skels}>
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className={styles.skel} />
                            ))}
                        </div>
                    </Card>
                )}

                {error && <ErrorState message={t("profile.loadError")} />}

                {profile && (
                    <Card>
                        <form onSubmit={handleSubmit} noValidate aria-label={t("profile.formAria")}>
                            {(clientError || saveError) && (
                                <div role="alert" className={styles.error}>
                                    {clientError ?? saveError}
                                </div>
                            )}
                            {success && (
                                <div role="status" className={styles.success}>
                                    {t("profile.updated")}
                                </div>
                            )}

                            <fieldset className={styles.fieldset}>
                                <legend className={styles.legend}>{t("profile.personalInformation")}</legend>

                                <div className={styles.row}>
                                    <div className={styles.field}>
                                        <label htmlFor="firstName">{t("profile.firstName")}</label>
                                        <input
                                            id="firstName"
                                            type="text"
                                            required
                                            aria-required="true"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            disabled={saving}
                                            autoComplete="given-name"
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label htmlFor="lastName">{t("profile.lastName")}</label>
                                        <input
                                            id="lastName"
                                            type="text"
                                            required
                                            aria-required="true"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            disabled={saving}
                                            autoComplete="family-name"
                                        />
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="displayName">{t("profile.displayName")}</label>
                                    <input
                                        id="displayName"
                                        type="text"
                                        required
                                        aria-required="true"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        disabled={saving}
                                        autoComplete="nickname"
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="birthDate">
                                        {t("profile.birthDate")}
                                        <span
                                            style={{
                                                fontWeight: 400,
                                                color: "var(--text-dim)",
                                                marginLeft: "0.5rem",
                                                textTransform: "none",
                                            }}
                                        >
                                            {t("profile.optional")}
                                        </span>
                                    </label>
                                    <input
                                        id="birthDate"
                                        type="date"
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                        disabled={saving}
                                        autoComplete="bdate"
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                </div>
                            </fieldset>

                            <fieldset className={styles.fieldset}>
                                <legend className={styles.legend}>{t("profile.preferences")}</legend>

                                <div className={styles.field}>
                                    <label htmlFor="currency">{t("profile.referenceCurrency")}</label>
                                    <select
                                        id="currency"
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        disabled={saving}
                                        aria-describedby="currency-hint"
                                    >
                                        {CURRENCIES.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                    <p id="currency-hint" className={styles.hint}>
                                        {t("profile.currencyHint")}
                                    </p>
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="language">{t("profile.displayLanguage")}</label>
                                    <select
                                        id="language"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value as DisplayLanguage)}
                                        disabled={saving}
                                        aria-describedby="language-hint"
                                    >
                                        {DISPLAY_LANGUAGES.map((displayLanguage) => (
                                            <option key={displayLanguage} value={displayLanguage}>
                                                {t(LANGUAGE_LABEL_KEYS[displayLanguage])}
                                            </option>
                                        ))}
                                    </select>
                                    <p id="language-hint" className={styles.hint}>
                                        {t("profile.languageHint")}
                                    </p>
                                </div>
                            </fieldset>

                            <div className={styles.actions}>
                                <Button type="submit" variant="primary" loading={saving} disabled={!hasChanges || saving}>
                                    {t("profile.saveChanges")}
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    );
}
