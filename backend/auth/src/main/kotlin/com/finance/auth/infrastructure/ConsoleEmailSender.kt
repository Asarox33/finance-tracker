package com.finance.auth.infrastructure

import com.finance.auth.application.EmailSender
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("dev")
class ConsoleEmailSender : EmailSender {
    private val log = LoggerFactory.getLogger(ConsoleEmailSender::class.java)

    override fun send(to: String, subject: String, body: String) {
        log.info("EMAIL to={} subject={} body={}", to, subject, body)
    }
}