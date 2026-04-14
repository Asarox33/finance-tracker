package com.finance.shared.error

public open class DomainException(message: String) : RuntimeException(message)
public class BusinessRuleViolationException(message: String) : DomainException(message)