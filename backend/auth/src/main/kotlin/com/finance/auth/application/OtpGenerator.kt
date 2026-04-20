package com.finance.auth.application

interface OtpGenerator {
    fun generate(): String
}