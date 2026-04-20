package com.finance.auth.infrastructure

import com.finance.auth.application.CreateUserProfilePort
import com.finance.userprofile.application.CreateUserProfile
import org.springframework.stereotype.Component

@Component
class CreateUserProfileAdapter(
    private val createUserProfile: CreateUserProfile
) : CreateUserProfilePort {

    override fun execute(command: CreateUserProfilePort.Command): CreateUserProfilePort.Result {
        val result = createUserProfile.execute(
            CreateUserProfile.Command(
                id = command.id,
                firstName = command.firstName,
                lastName = command.lastName,
                displayName = command.displayName,
                preferredCurrency = command.preferredCurrency,
                birthDate = command.birthDate
            )
        )
        return CreateUserProfilePort.Result(userId = result.userId)
    }
}