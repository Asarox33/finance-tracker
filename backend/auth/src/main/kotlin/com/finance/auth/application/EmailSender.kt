package com.finance.auth.application

interface EmailSender {
    fun send(to: String, subject: String, body: String)
}