import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AssetPicker from "@/features/assets/components/AssetPicker";
import { I18nProvider } from "@/shared/i18n";
import type { Asset } from "@/shared/types";

const mockAsset: Asset = {
    id: "asset-1",
    name: "Apple Inc.",
    type: "STOCK",
    currency: "USD",
    isin: "US0378331005",
    ticker: "AAPL",
    createdByUserId: "user-1",
};

const mockUseAssetSearch = jest.fn();

jest.mock("@/features/assets/hooks/useAssetSearch", () => ({
    useAssetSearch: (query: string) => mockUseAssetSearch(query),
}));

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

function defaultSearchResult(overrides: Record<string, unknown> = {}) {
    return {
        assets: [],
        totalItems: 0,
        isLoading: false,
        error: undefined,
        canSearch: false,
        ...overrides,
    };
}

function renderPicker(
    props: Partial<React.ComponentProps<typeof AssetPicker>> = {},
    searchOverrides: Record<string, unknown> = {}
) {
    mockUseAssetSearch.mockReturnValue(defaultSearchResult(searchOverrides));
    const onChange = jest.fn();
    const onClear = jest.fn();
    render(
        <I18nProvider language="ENG">
            <AssetPicker value="" selectedLabel={null} onChange={onChange} onClear={onClear} {...props} />
        </I18nProvider>
    );
    return { onChange, onClear };
}

describe("AssetPicker", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("shows search hint when query is too short", () => {
        renderPicker();
        expect(screen.getByText("Type at least 3 characters to search assets")).toBeInTheDocument();
    });

    it("selects an asset from the list", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const { onChange } = renderPicker({}, { canSearch: true, assets: [mockAsset], totalItems: 1 });

        const input = screen.getByRole("combobox");
        await user.click(input);
        await user.type(input, "Apple");
        await user.click(screen.getByRole("option", { name: /Apple Inc\. \(AAPL\)/i }));

        expect(onChange).toHaveBeenCalledWith("asset-1", mockAsset);
    });

    it("shows selected asset card after selection", () => {
        renderPicker({ value: "asset-1", selectedLabel: "Apple Inc. (AAPL)" });
        expect(screen.getByText("Apple Inc. (AAPL)")).toBeInTheDocument();
        expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
        expect(screen.queryByText("No assets match your search")).not.toBeInTheDocument();
    });
});
