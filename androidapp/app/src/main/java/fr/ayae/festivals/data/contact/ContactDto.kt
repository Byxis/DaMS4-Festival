package fr.ayae.festivals.data.contact

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


@Serializable
data class ContactDto(
    val id: Int,
    @SerialName("entity_id")
    val entityId: Int,
    val name: String,
    @SerialName("family_name")
    val familyName: String,
    val role: String? = null,
    val telephone: String? = null,
    val email: String? = null
)
