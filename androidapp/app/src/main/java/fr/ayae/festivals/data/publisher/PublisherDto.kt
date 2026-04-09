package fr.ayae.festivals.data.publisher

import fr.ayae.festivals.data.contact.ContactDto
import fr.ayae.festivals.data.game.GameDto
import kotlinx.serialization.Serializable



@Serializable
data class PublisherDto(
    val id: Int,
    val name: String,
    val logo: String? = null,
    val contacts: List<ContactDto> = emptyList(),
    val games: List<GameDto> = emptyList()
)