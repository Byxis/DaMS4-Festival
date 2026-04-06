package fr.ayae.festivals.data.game

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class GameDto(
    val id: Int,
    @SerialName("publisher_id")
    val publisherId: Int,
    val name: String,
    val type: String? = null,
    @SerialName("minimum_number_of_player")
    val minPlayers: Int? = null,
    @SerialName("maximum_number_of_player")
    val maxPlayers: Int? = null,
    val logo: String? = null,
    @SerialName("type_of_games_id")
    val typeOfGamesId: Int? = null
)
