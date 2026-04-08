package fr.ayae.festivals.data.game

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class GameCreationRequest(
    val name: String,
    @SerialName("publisher_id")
    val publisherId: Int,
    val type: String,
    @SerialName("minimum_number_of_player")
    val minPlayers: Int?,
    @SerialName("maximum_number_of_player")
    val maxPlayers: Int?,
    val logo: String? = null
)
