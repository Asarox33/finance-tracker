package com.finance.shared

public data class PageResult<T>(
    val items: List<T>,
    val page: Int,
    val pageSize: Int,
    val totalItems: Long
) {
    public val totalPages: Int get() =
        if (totalItems == 0L) 0
        else ((totalItems + pageSize - 1) / pageSize).toInt()

    public val isEmpty: Boolean get() = items.isEmpty()
    public val isFirst: Boolean get() = page == 0
    public val isLast: Boolean get() = page >= totalPages - 1

    init {
        require(page >= 0) { "Page must be non-negative, got: $page" }
        require(pageSize > 0) { "Page size must be positive, got: $pageSize" }
        require(totalItems >= 0) { "Total items must be non-negative, got: $totalItems" }
    }

    public companion object {
        public fun <T> of(
            items: List<T>,
            page: Int,
            pageSize: Int,
            totalItems: Long
        ): PageResult<T> = PageResult(
            items = items,
            page = page,
            pageSize = pageSize,
            totalItems = totalItems
        )

        public fun <T> empty(page: Int = 0, pageSize: Int = 20): PageResult<T> =
            PageResult(
                items = emptyList(),
                page = page,
                pageSize = pageSize,
                totalItems = 0L
            )
    }
}