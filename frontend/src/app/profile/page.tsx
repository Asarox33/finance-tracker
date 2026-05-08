"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useUserProfile, useUpdatePreferences } from "@/features/user-profile/hooks/useUserProfile";
import { Card, Button, PageHeader, Skeleton, ErrorState } from "@/shared/components/ui";
import { CURRENCIES } from "@/lib/currencies";
import styles from "./page.module.css";

export default function ProfilePage() {
    const { profile, isLoading, error, mutate } = useUserProfile();
    const { update, loading: saving, error: saveError, success } = useUpdatePreferences();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [currency, setCurrency] = useState("EUR");
    const [birthDate, setBirthDate] = useState("");

    useEffect(() => {
        if (profile) {
            setFirstName(profile.firstName);
            setLastName(profile.lastName);
            setDisplayName(profile.displayName);
            setCurrency(profile.preferredCurrency);
            setBirthDate(profile.birthDate ?? "");
        }
    }, [profile]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        await update(
            {
                firstName,
                lastName,
                displayName,
                preferredCurrency: currency,
                birthDate: birthDate || null,
            },
            () => mutate()
        );
    }

    return (
        <div className={styles.page}>
            <PageHeader
                title="Profile"
                description="Manage your personal information and preferences"
            />
            <div className={styles.body}>
                {isLoading && (
                    <Card>
                        <div className={styles.skels}>
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className={styles.skel} />)}
                        </div>
                    </Card>
                )}

                {error && <ErrorState message="Could not load your profile" />}

                {profile && (
                    <Card>
                        <form onSubmit={handleSubmit} noValidate aria-label="Edit profile form">
                            {saveError && (
                                <div role="alert" className={styles.error}>{saveError}</div>
                            )}
                            {success && (
                                <div role="status" className={styles.success}>
                                    Profile updated successfully.
                                </div>
                            )}

                            <fieldset className={styles.fieldset}>
                                <legend className={styles.legend}>Personal information</legend>

                                <div className={styles.row}>
                                    <div className={styles.field}>
                                        <label htmlFor="firstName">First name</label>
                                        <input
                                            id="firstName" type="text" required aria-required="true"
                                            value={firstName} onChange={e => setFirstName(e.target.value)}
                                            disabled={saving} autoComplete="given-name"
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label htmlFor="lastName">Last name</label>
                                        <input
                                            id="lastName" type="text" required aria-required="true"
                                            value={lastName} onChange={e => setLastName(e.target.value)}
                                            disabled={saving} autoComplete="family-name"
                                        />
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="displayName">Display name</label>
                                    <input
                                        id="displayName" type="text" required aria-required="true"
                                        value={displayName} onChange={e => setDisplayName(e.target.value)}
                                        disabled={saving} autoComplete="nickname"
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="birthDate">
                                        Date of birth
                                        <span style={{ fontWeight: 400, color: "var(--text-dim)", marginLeft: "0.5rem", textTransform: "none" }}>
                      (optional)
                    </span>
                                    </label>
                                    <input
                                        id="birthDate" type="date"
                                        value={birthDate} onChange={e => setBirthDate(e.target.value)}
                                        disabled={saving} autoComplete="bdate"
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                </div>
                            </fieldset>

                            <fieldset className={styles.fieldset}>
                                <legend className={styles.legend}>Preferences</legend>

                                <div className={styles.field}>
                                    <label htmlFor="currency">Reference currency</label>
                                    <select
                                        id="currency"
                                        value={currency}
                                        onChange={e => setCurrency(e.target.value)}
                                        disabled={saving}
                                        aria-describedby="currency-hint"
                                    >
                                        {CURRENCIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <p id="currency-hint" className={styles.hint}>
                                        Used as reference currency in analytics and portfolio value
                                    </p>
                                </div>
                            </fieldset>

                            <div className={styles.actions}>
                                <Button type="submit" variant="primary" loading={saving}>
                                    Save changes
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    );
}