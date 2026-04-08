package fr.ayae.festivals.data.Login
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)


@Serializable
data class RegisterRequest(
    @SerialName("firstName") val firstName: String? = null,
    @SerialName("lastName") val lastName: String? = null,
    @SerialName("email") val email: String,
    val password: String

)
@Serializable
data class MessageResponse(val message: String)




@Serializable
data class CreationResponse(
    val message: String,
    val user: User
)

@Serializable
data class User(
    @SerialName("id") val id: Int? = null,
    @SerialName("email") val email: String,
    @SerialName("role") val role: String,
    @SerialName("firstName") val firstName: String? = null,
    @SerialName("lastName") val lastName: String? = null

)
@Serializable
data class LoginResponse(
    val message: String,
    val user: User
)


@Serializable
data class Festival(
    val id: Int,
    val name: String,
    val location: String? = null,

    @SerialName("start_date")
    val startDate: String? = null,

    @SerialName("end_date")
    val endDate: String? = null,

    @SerialName("table_count")
    val tableCount: Int? = null,

    @SerialName("big_table_count")
    val bigTableCount: Int? = null,

    @SerialName("town_table_count")
    val townTableCount: Int? = null,

    @SerialName("table_surface")
    val tableSurface: Double? = null,

    @SerialName("big_table_surface")
    val bigTableSurface: Double? = null,

    @SerialName("town_table_surface")
    val townTableSurface: Double? = null,


    val logoUrl: String? = null
)
