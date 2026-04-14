package com.finance.shared.error

public open class ApplicationException(message: String) : RuntimeException(message)
public class InvalidRequestException(message: String) : ApplicationException(message)
public class AuthenticationFailedException(message: String) : ApplicationException(message)
public class NotFoundException(message: String) : ApplicationException(message)