export function isPickerCommitted(value: string, selectedLabel: string | null, query: string, open: boolean): boolean {
    return Boolean(value && selectedLabel && !open && query.trim() === selectedLabel.trim());
}
