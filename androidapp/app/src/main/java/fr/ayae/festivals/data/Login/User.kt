package fr.ayae.festivals.data.Login
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)
@Serializable
data class MessageResponse(val message: String)


@Serializable
data class UserProfile(
    @SerialName("id") val id: Int,
    @SerialName("email") val email: String,
    @SerialName("role") val role: String
)
@Serializable
data class UserResponse(
    @SerialName("email") val email: String,
    @SerialName("role") val role: String
)

@Serializable
data class LoginResponse(
    val message: String,
    val user: UserResponse
)