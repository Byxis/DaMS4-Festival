package fr.ayae.festivals.data
import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)
@Serializable
data class MessageResponse(val message: String)



@Serializable
data class UserResponse(
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: String
)

@Serializable
data class LoginResponse(
    val message: String,
    val user: UserResponse
)