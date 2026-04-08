package fr.ayae.festivals.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import fr.ayae.festivals.R

enum class GameType(val labelRes: Int) {
    ALL_AUDIENCES(R.string.game_type_all_audiences),
    PARTY_GAME(R.string.game_type_party_game),
    EXPERTS(R.string.game_type_experts),
    CHILDREN(R.string.game_type_children),
    CLASSICS(R.string.game_type_classics),
    INITIATES(R.string.game_type_initiates),
    ROLE_PLAYING(R.string.game_type_role_playing),
    UNKNOWN(R.string.game_type_unknown)
}

@Entity(tableName = "games")
data class Game(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val logoUrl: String? = null,
    val name: String,
    val editor_name: String? = null,
    val publisher_id: Int? = null,
    val type: GameType,
    val minimum_number_of_player: Int,
    val maximum_number_of_player: Int
)
