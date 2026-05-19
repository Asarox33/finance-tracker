import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InstitutionPicker from "@/features/accounts/components/InstitutionPicker";
import { I18nProvider } from "@/shared/i18n";
import type { Institution } from "@/shared/types";

const mockInstitution: Institution = {
    id: "inst-1",
    name: "BNP Paribas",
    country: "FR",
    type: "BANK",
    bic: null,
};

const mockUseInstitutionSearch = jest.fn();

jest.mock("@/features/institutions/hooks/useInstitutionSearch", () => ({
    useInstitutionSearch: (query: string) => mockUseInstitutionSearch(query),
}));

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

function defaultSearchResult(overrides: Record<string, unknown> = {}) {
    return {
        institutions: [],
        totalItems: 0,
        isLoading: false,
        error: undefined,
        canSearch: false,
        ...overrides,
    };
}

function renderPicker(
    props: Partial<React.ComponentProps<typeof InstitutionPicker>> = {},
    searchOverrides: Record<string, unknown> = {}
) {
    mockUseInstitutionSearch.mockReturnValue(defaultSearchResult(searchOverrides));
    const onChange = jest.fn();
    const onClear = jest.fn();
    render(
        <I18nProvider language="ENG">
            <InstitutionPicker value="" selectedLabel={null} onChange={onChange} onClear={onClear} {...props} />
        </I18nProvider>
    );
    return { onChange, onClear };
}

describe("InstitutionPicker", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("shows search hint when query is too short", () => {
        renderPicker();
        expect(screen.getByText("Type at least 3 characters to search institutions")).toBeInTheDocument();
    });

    it("shows loading state while searching", () => {
        renderPicker({}, { canSearch: true, isLoading: true });
        expect(screen.getByText("Searching institutions…")).toBeInTheDocument();
    });

    it("shows error state when search fails", () => {
        renderPicker({}, { canSearch: true, error: new Error("network") });
        expect(screen.getByRole("alert")).toHaveTextContent("Could not load institutions");
    });

    it("shows empty results with link to institutions page", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        renderPicker({}, { canSearch: true, institutions: [], totalItems: 0 });

        const input = screen.getByRole("combobox");
        await user.click(input);
        await user.type(input, "zzz");

        expect(screen.getByText(/No institutions match your search/)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Go to Institutions" })).toHaveAttribute("href", "/institutions");
    });

    it("selects an institution from the list", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const { onChange } = renderPicker({}, { canSearch: true, institutions: [mockInstitution], totalItems: 1 });

        const input = screen.getByRole("combobox");
        await user.click(input);
        await user.type(input, "BNP");
        await user.click(screen.getByRole("option", { name: /BNP Paribas/ }));

        expect(onChange).toHaveBeenCalledWith("inst-1", mockInstitution);
    });

    it("moves active option with ArrowUp and ArrowDown", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const second: Institution = {
            id: "inst-2",
            name: "Credit Agricole",
            country: "FR",
            type: "BANK",
            bic: null,
        };
        renderPicker({}, { canSearch: true, institutions: [mockInstitution, second], totalItems: 2 });

        const input = screen.getByRole("combobox");
        await user.click(input);
        await user.type(input, "bank");
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "ArrowUp" });

        expect(screen.getByRole("option", { name: /BNP Paribas/ })).toHaveAttribute("aria-selected", "true");
    });

    it("selects active option on Enter after ArrowDown", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const second: Institution = {
            id: "inst-2",
            name: "Credit Agricole",
            country: "FR",
            type: "BANK",
            bic: null,
        };
        const { onChange } = renderPicker(
            {},
            { canSearch: true, institutions: [mockInstitution, second], totalItems: 2 }
        );

        const input = screen.getByRole("combobox");
        await user.click(input);
        await user.type(input, "bank");
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "Enter" });

        expect(onChange).toHaveBeenCalledWith("inst-2", second);
    });

    it("closes list on Escape", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        renderPicker({}, { canSearch: true, institutions: [mockInstitution], totalItems: 1 });

        const input = screen.getByRole("combobox");
        await user.click(input);
        await user.type(input, "BNP");
        expect(screen.getByRole("listbox")).toBeInTheDocument();

        fireEvent.keyDown(input, { key: "Escape" });
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("calls onClear when input is emptied", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const { onClear } = renderPicker({ value: "inst-1", selectedLabel: "BNP Paribas" });

        await user.clear(screen.getByRole("combobox"));
        expect(onClear).toHaveBeenCalled();
    });

    it("shows selected institution row and clear button", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const { onClear } = renderPicker({ value: "inst-1", selectedLabel: "BNP Paribas" });

        expect(screen.getByText("Selected: BNP Paribas")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Clear selection" }));
        expect(onClear).toHaveBeenCalled();
    });

    it("shows refine hint when more results exist than displayed", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        renderPicker({}, { canSearch: true, institutions: [mockInstitution], totalItems: 50 });

        const input = screen.getByRole("combobox");
        await user.click(input);
        await user.type(input, "BNP");

        expect(screen.getByText("More matches exist — refine your search")).toBeInTheDocument();
    });

    it("syncs query when selectedLabel changes", () => {
        const { rerender } = render(
            <I18nProvider language="ENG">
                <InstitutionPicker value="inst-1" selectedLabel="Initial" onChange={jest.fn()} onClear={jest.fn()} />
            </I18nProvider>
        );
        mockUseInstitutionSearch.mockReturnValue(defaultSearchResult());

        rerender(
            <I18nProvider language="ENG">
                <InstitutionPicker
                    value="inst-1"
                    selectedLabel="Updated Bank"
                    onChange={jest.fn()}
                    onClear={jest.fn()}
                />
            </I18nProvider>
        );

        expect(screen.getByRole("combobox")).toHaveValue("Updated Bank");
    });
});
