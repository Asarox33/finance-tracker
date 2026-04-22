package com.finance.auth.infrastructure

import com.finance.auth.application.EmailSender
import com.resend.Resend
import com.resend.services.emails.model.CreateEmailOptions
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("prod")
class ResendEmailSender(
    @param:Value($$"${resend.api-key}") private val apiKey: String,
    @param:Value($$"${resend.from}") private val from: String
) : EmailSender {

    private val log = LoggerFactory.getLogger(ResendEmailSender::class.java)

    override fun send(to: String, subject: String, body: String) {
        try {
            val resend = Resend(apiKey)
            val params = CreateEmailOptions.builder()
                .from(from)
                .to(to)
                .subject(subject)
                .text(body)
                .build()
            resend.emails().send(params)
            log.info("Email sent via Resend to={} subject={}", to, subject)
        } catch (ex: Exception) {
            log.error("Failed to send email via Resend to={} subject={}: {}", to, subject, ex.message)
            throw ex
        }
    }
}