package fr.ayae.festivals.data
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
data class UserResponse(
    val id: Int? = 0,
    val email: String? = "",
    @SerialName("firstName")
    val prenom: String? = "",
    @SerialName("lastName")
    val nom: String? = "",
    val role: String? = ""
)

@Serializable
data class LoginResponse(
    val message: String,
    val user: UserResponse
)