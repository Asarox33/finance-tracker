package com.finance.account.infrastructure

import com.finance.account.domain.AccountStatus
import com.finance.account.domain.AccountType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface JpaAccountSpringRepository : JpaRepository<JpaAccountEntity, UUID> {
    @Query(
        """
        select account from JpaAccountEntity account
        where account.userId = :userId
          and (:status is null or account.status = :status)
          and (:type is null or account.type = :type)
        """
    )
    fun search(
        @Param("userId") userId: UUID,
        @Param("status") status: AccountStatus?,
        @Param("type") type: AccountType?,
        pageable: Pageable
    ): Page<JpaAccountEntity>

    @Query(
        """
        select count(account) from JpaAccountEntity account
        where account.userId = :userId
          and (:status is null or account.status = :status)
          and (:type is null or account.type = :type)
        """
    )
    fun countSearch(
        @Param("userId") userId: UUID,
        @Param("status") status: AccountStatus?,
        @Param("type") type: AccountType?
    ): Long
}