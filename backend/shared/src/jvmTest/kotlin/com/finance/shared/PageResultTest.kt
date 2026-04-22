package com.finance.shared

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

class PageResultTest {

    @Test
    fun computesTotalPagesCorrectly() {
        val result = PageResult.of(listOf(1, 2, 3), 0, 3, 10L)
        assertEquals(4, result.totalPages)
    }

    @Test
    fun computesTotalPagesWhenExactlyDivisible() {
        val result = PageResult.of(listOf(1, 2), 0, 2, 4L)
        assertEquals(2, result.totalPages)
    }

    @Test
    fun returnsZeroTotalPagesWhenEmpty() {
        val result = PageResult.empty<Int>()
        assertEquals(0, result.totalPages)
        assertTrue(result.isEmpty)
    }

    @Test
    fun isFirstPageWhenPageIsZero() {
        val result = PageResult.of(listOf(1), 0, 10, 1L)
        assertTrue(result.isFirst)
    }

    @Test
    fun isLastPageWhenOnLastPage() {
        val result = PageResult.of(listOf(1), 1, 5, 10L)
        assertTrue(result.isLast)
    }

    @Test
    fun isNotLastPageWhenNotOnLastPage() {
        val result = PageResult.of(listOf(1, 2, 3), 0, 3, 10L)
        assertFalse(result.isLast)
    }

    @Test
    fun rejectsNegativePage() {
        assertThrows(IllegalArgumentException::class.java) {
            PageResult.of(listOf(1), -1, 10, 1L)
        }
    }

    @Test
    fun rejectsZeroPageSize() {
        assertThrows(IllegalArgumentException::class.java) {
            PageResult.of(listOf(1), 0, 0, 1L)
        }
    }
}