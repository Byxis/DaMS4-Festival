package fr.ayae.festivals.data.game

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class GameDto(
    val id: Int,
    val name: String,
    @SerialName("minimum_number_of_player")
    val minPlayers: Int?,
    @SerialName("maximum_number_of_player")
    val maxPlayers: Int?,
    @SerialName("publisher_id")
    val publisherId: Int,
    @SerialName("type_of_games_id")
    val typeOfGamesId: Int?,
    val logo: String?,
    @SerialName("editor_name")
    val editorName: String,
    val type: String?,
    // MODIFICATION : Rendre le champ optionnel avec une valeur par défaut null
    val logoUrl: String? = null
)