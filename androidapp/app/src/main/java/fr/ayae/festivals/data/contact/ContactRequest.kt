package fr.ayae.festivals.data.contact

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ContactRequest(
    val name: String,
    @SerialName("family_name")
    val familyName: String,
    val role: String?,
    val telephone: String?,
    val email: String?
)
