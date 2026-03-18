package fr.ayae.festivals.data.Administration

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class UserAdminPage(
    val id: Int,
    val email: String,
    @SerialName("firstName") val firstName: String?,
    @SerialName("lastName") val lastName: String?,
    val role: String
)