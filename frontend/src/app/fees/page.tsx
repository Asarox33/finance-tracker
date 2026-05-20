"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useFees } from "@/features/fees/hooks/useFees";
import ListPagination from "@/shared/components/ListPagination";
import { useTablePageSize } from "@/shared/hooks/useTablePageSize";
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from "@/shared/components/ui";
import { useFormatters, useI18n, type TranslationKey } from "@/shared/i18n";
import {
    feeAmountMajorFromRate,
    formatMajorForInput,
    type FeeAccrualPeriod,
} from "@/lib/feeAmountFromRate";
import type { AccountType, FeeType } from "@/shared/types";
import styles from "./page.module.css";

const QUOTE_CURRENCIES = ["EUR", "USD", "GBP", "CHF"] as const;
const FEE_TYPES: FeeType[] = [
    "BROKERAGE",
    "MANAGEMENT",
    "CUSTODY",
    "TRANSACTION",
    "SUBSCRIPTION",
    "WITHDRAWAL",
    "OTHER",
];
const ACCOUNT_PICKER_PAGE_SIZE = 200;
const PER_LIKE_ACCOUNT_TYPES: AccountType[] = ["RETIREMENT", "OTHER"];

const ACCRUAL_PERIODS: FeeAccrualPeriod[] = ["annual", "quarterly", "monthly"];

function feeTypeLabelKey(type: FeeType): TranslationKey {
    return `feeType.${type}` as TranslationKey;
}

function defaultFeeTypeForAccount(accountType: AccountType): FeeType {
    if (PER_LIKE_ACCOUNT_TYPES.includes(accountType)) return "MANAGEMENT";
    if (accountType === "BROKERAGE") return "BROKERAGE";
    return "MANAGEMENT";
}

function sanitizeAmountInput(value: string): string {
    const normalized = value.replace(",", ".");
    let result = "";
    let hasSeparator = false;
    for (const char of normalized) {
        if (char >= "0" && char <= "9") {
            result += char;
            continue;
        }
        if (char === "." && !hasSeparator) {
            result += char;
            hasSeparator = true;
        }
    }
    return result;
}

function sanitizeRateInput(value: string): string {
    const normalized = value.replace(",", ".");
    let result = "";
    let hasSeparator = false;
    for (const char of normalized) {
        if (char >= "0" && char <= "9") {
            result += char;
            continue;
        }
        if (char === "." && !hasSeparator) {
            result += char;
            hasSeparator = true;
        }
    }
    return result;
}

export default function FeesPage() {
    const { t } = useI18n();
    const searchParams = useSearchParams();
    const { formatMoney, formatDate } = useFormatters();
    const { data: accounts, isLoading: accountsLoading } = useAccounts(0, false, undefined, ACCOUNT_PICKER_PAGE_SIZE);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [page, setPage] = useState(0);
    const { pageSize, setPageSize } = useTablePageSize();
    const { data: feesPage, error: listError, isLoading: listLoading, record } = useFees(
        selectedAccount,
        page,
        pageSize
    );

    const [type, setType] = useState<FeeType>("MANAGEMENT");
    const [label, setLabel] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [currency, setCurrency] = useState("EUR");
    const [amountInput, setAmountInput] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState(false);

    const [ratePercentInput, setRatePercentInput] = useState("");
    const [baseMajorInput, setBaseMajorInput] = useState("");
    const [accrualPeriod, setAccrualPeriod] = useState<FeeAccrualPeriod>("annual");

    const activeAccounts = useMemo(
        () => accounts?.items.filter((account) => account.status === "ACTIVE") ?? [],
        [accounts]
    );

    const amountMinor = useMemo(() => {
        const n = parseFloat(amountInput);
        if (!Number.isFinite(n) || n <= 0) return null;
        return Math.round(n * 100);
    }, [amountInput]);

    const selectedAccountRecord = activeAccounts.find((a) => a.id === selectedAccount);

    const calculatedMajor = useMemo(() => {
        const base = parseFloat(baseMajorInput);
        const rate = parseFloat(ratePercentInput);
        return feeAmountMajorFromRate(base, rate, accrualPeriod);
    }, [baseMajorInput, ratePercentInput, accrualPeriod]);

    useEffect(() => {
        const accountId = searchParams.get("accountId") ?? "";
        if (accountId) setSelectedAccount(accountId);
    }, [searchParams]);

    const prevAccountRef = useRef("");

    useEffect(() => {
        setPage(0);
        prevAccountRef.current = selectedAccount;
    }, [selectedAccount, pageSize]);

    useEffect(() => {
        if (!selectedAccount && activeAccounts.length === 1) {
            setSelectedAccount(activeAccounts[0].id);
        }
    }, [activeAccounts, selectedAccount]);

    useEffect(() => {
        if (!selectedAccountRecord) return;
        setCurrency(selectedAccountRecord.currency);
        setType(defaultFeeTypeForAccount(selectedAccountRecord.type));
    }, [selectedAccountRecord?.id]);

    function applyCalculatedAmount() {
        if (calculatedMajor == null) return;
        setAmountInput(formatMajorForInput(calculatedMajor));
        if (!label.trim() && ratePercentInput) {
            setLabel(
                t("fees.suggestedLabel", {
                    rate: ratePercentInput,
                    period: t(`fees.period.${accrualPeriod}` as TranslationKey),
                })
            );
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(false);
        if (!selectedAccount) {
            setFormError(t("fees.accountRequired"));
            return;
        }
        if (!label.trim()) {
            setFormError(t("fees.labelRequired"));
            return;
        }
        if (amountMinor == null) {
            setFormError(t("fees.validation"));
            return;
        }
        setSubmitting(true);
        try {
            await record({
                accountId: selectedAccount,
                type,
                amount: amountMinor,
                currency,
                date,
                label: label.trim(),
            });
            setFormSuccess(true);
            setLabel("");
            setAmountInput("");
        } catch {
            setFormError(t("fees.error"));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className={styles.page}>
            <PageHeader title={t("fees.title")} />
            <div className={styles.body}>
                <p className={styles.description}>{t("fees.description")}</p>
                <aside className={styles.callout} role="note">
                    <p>{t("fees.vsTransactionNote")}</p>
                    <p>{t("fees.perUseCaseNote")}</p>
                </aside>

                <Card>
                    <div className={styles.accountBar}>
                        <div className={styles.field}>
                            <label htmlFor="fees-account">{t("fees.account")}</label>
                            <select
                                id="fees-account"
                                value={selectedAccount}
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                disabled={accountsLoading || submitting}
                            >
                                <option value="">{t("fees.selectAccount")}</option>
                                {activeAccounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.name} ({account.currency})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className={styles.sectionTitle}>{t("fees.rateCalculatorTitle")}</h2>
                    <p className={styles.sectionHint}>{t("fees.rateCalculatorHint")}</p>
                    <div className={styles.calculatorGrid}>
                        <div className={styles.field}>
                            <label htmlFor="fees-base">{t("fees.rateBase")}</label>
                            <input
                                id="fees-base"
                                type="text"
                                inputMode="decimal"
                                value={baseMajorInput}
                                onChange={(e) => setBaseMajorInput(sanitizeAmountInput(e.target.value))}
                                placeholder="100000"
                                disabled={!selectedAccount}
                            />
                            <p className={styles.hint}>{t("fees.rateBaseHint")}</p>
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="fees-rate">{t("fees.ratePercent")}</label>
                            <input
                                id="fees-rate"
                                type="text"
                                inputMode="decimal"
                                value={ratePercentInput}
                                onChange={(e) => setRatePercentInput(sanitizeRateInput(e.target.value))}
                                placeholder="0.2"
                                disabled={!selectedAccount}
                            />
                            <p className={styles.hint}>{t("fees.ratePercentHint")}</p>
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="fees-period">{t("fees.ratePeriod")}</label>
                            <select
                                id="fees-period"
                                value={accrualPeriod}
                                onChange={(e) => setAccrualPeriod(e.target.value as FeeAccrualPeriod)}
                                disabled={!selectedAccount}
                            >
                                {ACCRUAL_PERIODS.map((p) => (
                                    <option key={p} value={p}>
                                        {t(`fees.period.${p}` as TranslationKey)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {calculatedMajor != null && selectedAccountRecord && (
                        <p className={styles.calculatedPreview}>
                            {t("fees.ratePreview", {
                                amount: formatMoney(Math.round(calculatedMajor * 100), selectedAccountRecord.currency),
                                period: t(`fees.period.${accrualPeriod}` as TranslationKey),
                            })}
                        </p>
                    )}
                    <div className={styles.calculatorActions}>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={calculatedMajor == null || !selectedAccount}
                            onClick={applyCalculatedAmount}
                        >
                            {t("fees.rateApply")}
                        </Button>
                    </div>
                </Card>

                <Card>
                    <h2 className={styles.sectionTitle}>{t("fees.formTitle")}</h2>
                    <form onSubmit={handleSubmit} className={styles.formGrid} aria-label={t("fees.formAria")}>
                        <div className={styles.field}>
                            <label htmlFor="fees-type">{t("fees.type")}</label>
                            <select
                                id="fees-type"
                                value={type}
                                onChange={(e) => setType(e.target.value as FeeType)}
                                disabled={submitting || !selectedAccount}
                            >
                                {FEE_TYPES.map((feeType) => (
                                    <option key={feeType} value={feeType}>
                                        {t(feeTypeLabelKey(feeType))}
                                    </option>
                                ))}
                            </select>
                            <p className={styles.hint}>{t("fees.typeHint")}</p>
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="fees-label">{t("fees.label")}</label>
                            <input
                                id="fees-label"
                                type="text"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                maxLength={255}
                                required
                                disabled={submitting || !selectedAccount}
                                placeholder={t("fees.labelPlaceholder")}
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="fees-date">{t("fees.date")}</label>
                            <input
                                id="fees-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                disabled={submitting || !selectedAccount}
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="fees-currency">{t("fees.currency")}</label>
                            <select
                                id="fees-currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                disabled={submitting || !selectedAccount}
                            >
                                {QUOTE_CURRENCIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                            {selectedAccountRecord && currency !== selectedAccountRecord.currency && (
                                <p className={styles.hint}>{t("fees.currencyMismatch")}</p>
                            )}
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="fees-amount">{t("fees.amount")}</label>
                            <input
                                id="fees-amount"
                                type="text"
                                inputMode="decimal"
                                value={amountInput}
                                onChange={(e) => setAmountInput(sanitizeAmountInput(e.target.value))}
                                placeholder="1.99"
                                required
                                disabled={submitting || !selectedAccount}
                                style={{ fontFamily: "var(--font-mono)" }}
                            />
                            <p className={styles.hint}>{t("fees.amountHint")}</p>
                        </div>
                        {formError && (
                            <div role="alert" className={`${styles.alert} ${styles.alertError}`}>
                                {formError}
                            </div>
                        )}
                        {formSuccess && (
                            <div role="status" className={`${styles.alert} ${styles.alertSuccess}`}>
                                {t("fees.success")}
                            </div>
                        )}
                        <div className={styles.actions}>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={submitting}
                                disabled={!selectedAccount}
                            >
                                {t("fees.submit")}
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card>
                    <h2 className={styles.sectionTitle}>{t("fees.listTitle")}</h2>
                    {!selectedAccount ? (
                        <EmptyState title={t("fees.selectAccount")} description={t("fees.listEmptyHint")} />
                    ) : listError ? (
                        <ErrorState message={t("fees.listError")} />
                    ) : listLoading ? (
                        <Skeleton className={styles.formGrid} />
                    ) : feesPage?.isEmpty ? (
                        <EmptyState
                            title={t("fees.listEmpty")}
                            description={
                                selectedAccountRecord
                                    ? t("fees.listEmptyForAccount", { name: selectedAccountRecord.name })
                                    : undefined
                            }
                        />
                    ) : (
                        <>
                            <table className={styles.feeTable}>
                                <thead>
                                    <tr>
                                        <th scope="col">{t("fees.colDate")}</th>
                                        <th scope="col">{t("fees.colLabel")}</th>
                                        <th scope="col">{t("fees.colType")}</th>
                                        <th scope="col">{t("fees.colLinked")}</th>
                                        <th scope="col" className={styles.amount}>
                                            {t("fees.colAmount")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feesPage?.items.map((fee) => (
                                        <tr key={fee.id}>
                                            <td>{formatDate(fee.date)}</td>
                                            <td>{fee.label}</td>
                                            <td>
                                                <Badge variant="default">{t(feeTypeLabelKey(fee.type))}</Badge>
                                            </td>
                                            <td>
                                                {fee.transactionId ? (
                                                    <span className={styles.linkedTx} title={fee.transactionId}>
                                                        {t("fees.linkedYes")}
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td className={styles.amount}>
                                                {formatMoney(fee.amount, fee.currency)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {feesPage && feesPage.totalItems > 0 && (
                                <ListPagination
                                    page={page}
                                    pageSize={pageSize}
                                    totalItems={feesPage.totalItems}
                                    onPageChange={setPage}
                                    onPageSizeChange={(size) => {
                                        void setPageSize(size);
                                        setPage(0);
                                    }}
                                    ariaLabel={t("fees.pagesAria")}
                                />
                            )}
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
